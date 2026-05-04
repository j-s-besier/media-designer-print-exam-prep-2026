import fs from "node:fs/promises";
import path from "node:path";
import type { Attempt, Exam, Manifest, Result } from "../src/lib/examTypes";
import { createEmptyAttempt } from "../src/lib/examLogic";
import { attemptDir, attemptsDir, examPackageDir, examsDir, resultPath, resultsDir } from "./paths";
import { listDirectories, listFiles, pathExists, readJson, writeJson } from "./jsonStore";

export class AttemptDeletionError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "AttemptDeletionError";
  }
}

export async function listExamIds(): Promise<string[]> {
  return listDirectories(examsDir);
}

export async function loadManifest(examId: string): Promise<Manifest> {
  return readJson<Manifest>(path.join(examPackageDir(examId), "manifest.json"));
}

export async function loadExam(examId: string): Promise<Exam> {
  return readJson<Exam>(path.join(examPackageDir(examId), "exam.json"));
}

export async function createAttempt(examId: string): Promise<Attempt> {
  const exam = await loadExam(examId);
  return createEmptyAttempt(exam);
}

export async function saveAttempt(attempt: Attempt): Promise<void> {
  await writeJson(path.join(attemptDir(attempt.id), "attempt.json"), attempt);
}

export async function loadAttempt(attemptId: string): Promise<Attempt> {
  return readJson<Attempt>(path.join(attemptDir(attemptId), "attempt.json"));
}

export async function deleteInProgressAttempt(attemptId: string): Promise<void> {
  const targetDir = safeAttemptDir(attemptId);
  const filePath = path.join(targetDir, "attempt.json");
  if (!(await pathExists(filePath))) {
    await fs.rm(targetDir, { recursive: true, force: true });
    return;
  }

  const attempt = await readJson<Attempt>(filePath);
  if (attempt.status !== "in-progress") {
    throw new AttemptDeletionError("Nur laufende Pruefungsversuche koennen geloescht werden.", 409);
  }

  await fs.rm(targetDir, { recursive: true, force: true });
}

export async function listAttempts(): Promise<Attempt[]> {
  const ids = await listDirectories(attemptsDir);
  const attempts: Attempt[] = [];
  for (const id of ids) {
    const filePath = path.join(attemptDir(id), "attempt.json");
    if (await pathExists(filePath)) {
      attempts.push(await readJson<Attempt>(filePath));
    }
  }
  return attempts;
}

export async function latestAttemptForExam(examId: string): Promise<Attempt | null> {
  const attempts = (await listAttempts()).filter((attempt) => attempt.examId === examId);
  attempts.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  return attempts[0] ?? null;
}

export async function saveResult(result: Result): Promise<void> {
  await writeJson(resultPath(result.attemptId), result);
}

export async function loadResult(attemptId: string): Promise<Result | null> {
  const filePath = resultPath(attemptId);
  if (!(await pathExists(filePath))) {
    return null;
  }
  return readJson<Result>(filePath);
}

export async function latestResultForExam(examId: string): Promise<Result | null> {
  const files = await listFiles(resultsDir, ".result.json");
  const results: Result[] = [];
  for (const file of files) {
    const result = await readJson<Result>(path.join(resultsDir, file));
    if (result.examId === examId) {
      results.push(result);
    }
  }
  results.sort((a, b) => b.gradedAt.localeCompare(a.gradedAt));
  return results[0] ?? null;
}

export async function saveUpload(args: {
  attemptId: string;
  fieldId: string;
  name: string;
  mimeType: string;
  dataBase64: string;
}): Promise<{ id: string; name: string; path: string; mimeType: string; size: number }> {
  const uploadId = `upload-${Date.now()}`;
  const safeName = args.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uploadDir = path.join(attemptDir(args.attemptId), "uploads");
  const filePath = path.join(uploadDir, `${args.fieldId}-${uploadId}-${safeName}`);
  const buffer = Buffer.from(args.dataBase64, "base64");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(filePath, buffer);
  return {
    id: uploadId,
    name: args.name,
    path: path.relative(attemptDir(args.attemptId), filePath),
    mimeType: args.mimeType,
    size: buffer.length
  };
}

function safeAttemptDir(attemptId: string): string {
  if (!/^[a-zA-Z0-9._-]+$/.test(attemptId) || attemptId === "." || attemptId === "..") {
    throw new AttemptDeletionError("Ungueltige Versuch-ID.", 400);
  }
  return attemptDir(attemptId);
}
