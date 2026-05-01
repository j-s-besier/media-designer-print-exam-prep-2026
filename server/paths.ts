import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const rootDir = path.resolve(__dirname, "..");
export const dataDir = path.join(rootDir, "data");
export const examsDir = path.join(dataDir, "exams");
export const privateSolutionsDir = path.join(dataDir, "private", "solutions");
export const attemptsDir = path.join(dataDir, "attempts");
export const resultsDir = path.join(dataDir, "results");
export const schemasDir = path.join(dataDir, "schemas");

export function examPackageDir(examId: string): string {
  return path.join(examsDir, examId);
}

export function solutionDir(examId: string): string {
  return path.join(privateSolutionsDir, examId);
}

export function attemptDir(attemptId: string): string {
  return path.join(attemptsDir, attemptId);
}

export function resultPath(attemptId: string): string {
  return path.join(resultsDir, `${attemptId}.result.json`);
}
