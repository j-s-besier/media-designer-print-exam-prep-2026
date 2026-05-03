import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const rootDir = path.resolve(__dirname, "..");
const defaultDataDir = path.join(rootDir, "data");
const defaultFrontendDistDir = path.join(rootDir, "dist");

export type RuntimeMode = "development" | "packaged";

export type RuntimePathConfig = {
  runtimeMode?: RuntimeMode;
  resourceDir?: string;
  userDataDir?: string;
  privateSolutionsDir?: string | null;
  frontendDistDir?: string | null;
  host?: string;
  port?: number;
  writeValidationReportsToResourceDir?: boolean;
};

export type ResolvedRuntimeConfig = {
  runtimeMode: RuntimeMode;
  resourceDir: string;
  userDataDir: string;
  privateSolutionsDir: string | null;
  frontendDistDir: string | null;
  host: string;
  port: number;
  writeValidationReportsToResourceDir: boolean;
};

export let runtimeConfig: ResolvedRuntimeConfig;
export let dataDir: string;
export let resourceDir: string;
export let userDataDir: string;
export let frontendDistDir: string | null;
export let privateSolutionsDir: string | null;
export let examsDir: string;
export let attemptsDir: string;
export let resultsDir: string;
export let schemasDir: string;
export let templatesDir: string;
export let validationReportsDir: string;

export function configureRuntime(config: RuntimePathConfig = {}): ResolvedRuntimeConfig {
  runtimeConfig = resolveRuntimeConfig(config);
  dataDir = runtimeConfig.resourceDir;
  resourceDir = runtimeConfig.resourceDir;
  userDataDir = runtimeConfig.userDataDir;
  frontendDistDir = runtimeConfig.frontendDistDir;
  privateSolutionsDir = runtimeConfig.privateSolutionsDir;
  examsDir = path.join(resourceDir, "exams");
  attemptsDir = path.join(userDataDir, "attempts");
  resultsDir = path.join(userDataDir, "results");
  schemasDir = path.join(resourceDir, "schemas");
  templatesDir = path.join(resourceDir, "templates");
  validationReportsDir = path.join(userDataDir, "validation-reports");
  return runtimeConfig;
}

export function getRuntimeConfig(): ResolvedRuntimeConfig {
  return runtimeConfig;
}

export function resetRuntimeConfig(): ResolvedRuntimeConfig {
  return configureRuntime();
}

export function resolveRuntimeConfig(config: RuntimePathConfig = {}): ResolvedRuntimeConfig {
  const runtimeMode = config.runtimeMode ?? envRuntimeMode() ?? "development";
  const resourceDir = path.resolve(config.resourceDir ?? process.env.APP_RESOURCE_DIR ?? defaultDataDir);
  const userDataDir = path.resolve(config.userDataDir ?? process.env.APP_USER_DATA_DIR ?? defaultDataDir);
  const envPrivateSolutionsDir = normalizeOptionalPath(process.env.APP_PRIVATE_SOLUTIONS_DIR);
  const privateSolutionsCandidate =
    config.privateSolutionsDir === null
      ? null
      : config.privateSolutionsDir ??
        envPrivateSolutionsDir ??
        (runtimeMode === "development" ? path.join(defaultDataDir, "private", "solutions") : null);
  const privateSolutions = privateSolutionsCandidate ? path.resolve(privateSolutionsCandidate) : null;
  const frontendDist =
    config.frontendDistDir === null
      ? null
      : path.resolve(config.frontendDistDir ?? process.env.APP_FRONTEND_DIST_DIR ?? defaultFrontendDistDir);
  const envWritesValidationReportsToResource = process.env.APP_WRITE_VALIDATION_REPORTS_TO_RESOURCE === "1";

  return {
    runtimeMode,
    resourceDir,
    userDataDir,
    privateSolutionsDir: privateSolutions,
    frontendDistDir: frontendDist,
    host: config.host ?? process.env.APP_HOST ?? "127.0.0.1",
    port: config.port ?? numberFromEnv(process.env.API_PORT) ?? 4173,
    writeValidationReportsToResourceDir:
      config.writeValidationReportsToResourceDir ??
      (runtimeMode === "development" ? true : envWritesValidationReportsToResource)
  };
}

export function examPackageDir(examId: string): string {
  return path.join(examsDir, examId);
}

export function solutionDir(examId: string): string {
  return path.join(privateSolutionsDir ?? path.join(userDataDir, "private", "solutions"), examId);
}

export function attemptDir(attemptId: string): string {
  return path.join(attemptsDir, attemptId);
}

export function resultPath(attemptId: string): string {
  return path.join(resultsDir, `${attemptId}.result.json`);
}

export function validationReportPath(examId: string): string {
  if (runtimeConfig.writeValidationReportsToResourceDir) {
    return path.join(examPackageDir(examId), "validation-report.json");
  }
  return path.join(validationReportsDir, examId, "validation-report.json");
}

function envRuntimeMode(): RuntimeMode | undefined {
  if (process.env.APP_RUNTIME_MODE === "packaged") return "packaged";
  if (process.env.APP_RUNTIME_MODE === "development") return "development";
  return undefined;
}

function normalizeOptionalPath(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  return value;
}

function numberFromEnv(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

configureRuntime();
