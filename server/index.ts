import fs from "node:fs";
import http from "node:http";
import express from "express";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Attempt, PaperId } from "../src/lib/examTypes";
import { GradingConfigurationError, gradeAttempt } from "./grading";
import { AttemptSubmissionError, submitAttemptPaper } from "./attemptSubmission";
import {
  AttemptDeletionError,
  createAttempt,
  deleteInProgressAttempt,
  latestAttemptForExam,
  latestResultForExam,
  listExamIds,
  loadAttempt,
  loadExam,
  loadManifest,
  loadResult,
  saveUpload
} from "./storage";
import { validateExamPackage } from "./validation";
import {
  configureRuntime,
  examPackageDir,
  getRuntimeConfig,
  type ResolvedRuntimeConfig,
  type RuntimePathConfig
} from "./paths";

export type StartedServer = {
  app: express.Express;
  server: http.Server;
  host: string;
  port: number;
  url: string;
  runtimeConfig: ResolvedRuntimeConfig;
  close: () => Promise<void>;
};

export function createApiApp(config: RuntimePathConfig = {}): express.Express {
  const runtime = configureRuntime(config);
  const app = express();

  app.use(express.json({ limit: "20mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/exams", async (_req, res, next) => {
    try {
      const examIds = await listExamIds();
      const exams = await Promise.all(
        examIds.map(async (examId) => {
          const [manifest, latestAttempt, latestResult] = await Promise.all([
            loadManifest(examId),
            latestAttemptForExam(examId),
            latestResultForExam(examId)
          ]);
          return { manifest, latestAttempt, latestResult };
        })
      );
      res.json({ exams });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/exams/:examId", async (req, res, next) => {
    try {
      const exam = await loadExam(req.params.examId);
      const manifest = await loadManifest(req.params.examId);
      const latestAttempt = await latestAttemptForExam(req.params.examId);
      const latestResult = latestAttempt ? await loadResult(latestAttempt.id) : null;
      res.json({ manifest, exam, latestAttempt, latestResult });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/exams/:examId/assets/:assetName", (req, res) => {
    const safeName = req.params.assetName.replace(/[^a-zA-Z0-9._-]/g, "");
    res.sendFile(path.join(examPackageDir(req.params.examId), "assets", safeName));
  });

  app.post("/api/exams/:examId/attempts", async (req, res, next) => {
    try {
      const attempt = await createAttempt(req.params.examId);
      res.status(201).json({ attempt });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/attempts/:attemptId", async (req, res, next) => {
    try {
      const attempt = await loadAttempt(req.params.attemptId);
      const result = await loadResult(req.params.attemptId);
      res.json({ attempt, result });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/attempts/:attemptId", async (req, res, next) => {
    try {
      await deleteInProgressAttempt(req.params.attemptId);
      res.status(204).send();
    } catch (error) {
      if (error instanceof AttemptDeletionError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      next(error);
    }
  });

  app.post("/api/attempts/:attemptId/uploads", async (req, res, next) => {
    try {
      const file = await saveUpload({
        attemptId: req.params.attemptId,
        fieldId: req.body.fieldId,
        name: req.body.name,
        mimeType: req.body.mimeType,
        dataBase64: req.body.dataBase64
      });
      res.status(201).json({ file });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/attempts/:attemptId/papers/:paperId/submit", async (req, res, next) => {
    try {
      const attempt = req.body.attempt as Attempt | undefined;
      if (!attempt || attempt.id !== req.params.attemptId) {
        res.status(400).json({ error: "Attempt id mismatch." });
        return;
      }

      const paperId = req.params.paperId as PaperId;
      const result = await submitAttemptPaper(attempt, paperId);
      res.json(result);
    } catch (error) {
      if (error instanceof AttemptSubmissionError) {
        res.status(error.statusCode).json({ error: error.message, ...error.details });
        return;
      }
      next(error);
    }
  });

  app.post("/api/attempts/:attemptId/grade", async (req, res, next) => {
    try {
      const attempt = await loadAttempt(req.params.attemptId);
      if (attempt.status !== "submitted" && attempt.status !== "graded") {
        res.status(409).json({ error: "Attempt must be submitted before grading." });
        return;
      }
      const result = await gradeAttempt(attempt);
      res.json({ result });
    } catch (error) {
      if (error instanceof GradingConfigurationError) {
        res.status(error.statusCode).json({ error: error.message, code: error.code });
        return;
      }
      next(error);
    }
  });

  app.get("/api/results/:attemptId", async (req, res, next) => {
    try {
      const result = await loadResult(req.params.attemptId);
      if (!result) {
        res.status(404).json({ error: "Result not found." });
        return;
      }
      res.json({ result });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/exams/:examId/validate", async (req, res, next) => {
    try {
      const report = await validateExamPackage(req.params.examId, true);
      res.json({ report });
    } catch (error) {
      next(error);
    }
  });

  if (runtime.frontendDistDir && fs.existsSync(path.join(runtime.frontendDistDir, "index.html"))) {
    app.use(express.static(runtime.frontendDistDir));
    app.use((req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api")) {
        next();
        return;
      }
      res.sendFile(path.join(runtime.frontendDistDir!, "index.html"));
    });
  }

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    res.status(500).json({ error: message });
  });

  return app;
}

export async function startServer(config: RuntimePathConfig = {}): Promise<StartedServer> {
  const app = createApiApp(config);
  const runtime = getRuntimeConfig();
  const server = http.createServer(app);

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(runtime.port, runtime.host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : runtime.port;
  const url = `http://${runtime.host}:${port}`;
  const runtimeConfig = { ...runtime, port };

  return {
    app,
    server,
    host: runtime.host,
    port,
    url,
    runtimeConfig,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      })
  };
}

if (isDirectRun()) {
  const started = await startServer();
  console.log(`API listening on ${started.url}`);

  const shutdown = async () => {
    await started.close();
    process.exit(0);
  };
  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
}

function isDirectRun(): boolean {
  const entry = process.argv[1];
  if (!entry || import.meta.url !== pathToFileURL(entry).href) {
    return false;
  }
  return path.basename(path.dirname(entry)) === "server" && ["index.ts", "index.js"].includes(path.basename(entry));
}
