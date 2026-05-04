import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Attempt, Exam, PaperId } from "../src/lib/examTypes";
import { requiredExclusions } from "../src/lib/examLogic";
import { startServer } from "../server/index";

type HealthResponse = { ok: boolean };
type ExamsResponse = { exams: Array<{ manifest: { id: string } }> };
type ExamResponse = { exam: Exam };
type AttemptResponse = { attempt: Attempt };
type SubmitResponse = { attempt: Attempt; nextPaperId: PaperId | null };

const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "mgdp-package-smoke-"));
const resourceDir = path.join(tempRoot, "resources", "data");
const userDataDir = path.join(tempRoot, "user-data");

try {
  await copyPublicResources(resourceDir);
  await assertNoPrivateSolutions(resourceDir);

  const server = await startServer({
    runtimeMode: "packaged",
    resourceDir,
    userDataDir,
    privateSolutionsDir: null,
    frontendDistDir: path.resolve("dist"),
    port: 0,
    writeValidationReportsToResourceDir: false
  });

  try {
    const health = await getJson<HealthResponse>(`${server.url}/api/health`);
    assert(health.ok, "Health endpoint did not return ok=true.");

    const html = await getText(server.url);
    assert(html.includes("<div id=\"root\"></div>"), "Built frontend index was not served.");

    const exams = await getJson<ExamsResponse>(`${server.url}/api/exams`);
    assert(exams.exams.length > 0, "No packaged public exams were returned.");

    const examId = exams.exams[0].manifest.id;
    const { exam } = await getJson<ExamResponse>(`${server.url}/api/exams/${examId}`);
    let { attempt } = await postJson<AttemptResponse>(`${server.url}/api/exams/${examId}/attempts`, {});

    while (attempt.currentPaperId) {
      const paper = exam.papers.find((item) => item.id === attempt.currentPaperId);
      assert(paper, `Paper ${attempt.currentPaperId} was not found.`);
      satisfyPaperSelection(exam, attempt, attempt.currentPaperId);
      const submission = await postJson<SubmitResponse>(
        `${server.url}/api/attempts/${attempt.id}/papers/${attempt.currentPaperId}/submit`,
        { attempt }
      );
      attempt = submission.attempt;
    }

    assert(attempt.status === "submitted", "Completed smoke attempt was not submitted.");
    await fs.access(path.join(userDataDir, "attempts", attempt.id, "attempt.json"));
    console.log(`Package smoke passed at ${server.url}; attempt persisted under ${userDataDir}`);
  } finally {
    await server.close();
  }
} finally {
  await fs.rm(tempRoot, { recursive: true, force: true });
}

async function copyPublicResources(targetDataDir: string) {
  await fs.mkdir(targetDataDir, { recursive: true });
  await fs.cp(path.resolve("data", "exams"), path.join(targetDataDir, "exams"), {
    recursive: true,
    filter: (source) => path.basename(source) !== "solution.json"
  });
  await fs.cp(path.resolve("data", "schemas"), path.join(targetDataDir, "schemas"), { recursive: true });
  await fs.cp(path.resolve("data", "templates"), path.join(targetDataDir, "templates"), { recursive: true });
}

async function assertNoPrivateSolutions(dirPath: string) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await assertNoPrivateSolutions(entryPath);
    } else if (entry.name === "solution.json") {
      throw new Error(`Private solution leaked into packaged resources: ${entryPath}`);
    }
  }
}

function satisfyPaperSelection(exam: Exam, attempt: Attempt, paperId: PaperId) {
  const paper = exam.papers.find((item) => item.id === paperId);
  assert(paper, `Paper ${paperId} was not found.`);
  const submission = attempt.paperSubmissions.find((item) => item.paperId === paperId);
  assert(submission, `Submission ${paperId} was not found.`);
  for (const block of paper.blocks) {
    const selection = submission.blockSelections.find((item) => item.blockId === block.id);
    assert(selection, `Selection ${block.id} was not found.`);
    selection.excludedTaskIds = block.tasks.slice(-requiredExclusions(block)).map((task) => task.id);
  }
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  assert(response.ok, `${url} returned ${response.status}.`);
  return (await response.json()) as T;
}

async function getText(url: string): Promise<string> {
  const response = await fetch(url);
  assert(response.ok, `${url} returned ${response.status}.`);
  return response.text();
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as T;
}

function assert(value: unknown, message: string): asserts value {
  if (!value) {
    throw new Error(message);
  }
}
