import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import type { Attempt, Exam, ExamPaper, Manifest, QuestionBlock, Solution, Subtask } from "../src/lib/examTypes";
import { requiredExclusions, sortPapers } from "../src/lib/examLogic";
import { examPackageDir, privateSolutionsDir, schemasDir, solutionDir, validationReportPath } from "./paths";
import { pathExists, readJson, writeJson } from "./jsonStore";

type ValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type ValidationReport = {
  examId: string;
  valid: boolean;
  requiresManualRightsReview: boolean;
  issues: ValidationIssue[];
};

const forbiddenPublicKeys = new Set([
  "solution",
  "solutions",
  "rubric",
  "rubrics",
  "modelAnswer",
  "expectedAnswer",
  "expectedAnswers",
  "awardedPoints",
  "correctOptionIds"
]);

export async function validateExamPackage(examId: string, writeReport = true): Promise<ValidationReport> {
  const issues: ValidationIssue[] = [];
  const publicDir = examPackageDir(examId);
  const privateDir = solutionDir(examId);
  const manifestPath = path.join(publicDir, "manifest.json");
  const examPath = path.join(publicDir, "exam.json");
  const publicSolutionPath = path.join(publicDir, "solution.json");
  const solutionPath = path.join(privateDir, "solution.json");

  await requireFile(manifestPath, "missing-manifest", issues);
  await requireFile(examPath, "missing-exam", issues);
  if (privateSolutionsDir) {
    await requireFile(solutionPath, "missing-private-solution", issues);
  } else {
    issues.push({
      severity: "warning",
      code: "private-solution-unconfigured",
      message: "Private solution storage is not configured for this runtime."
    });
  }
  if (await pathExists(publicSolutionPath)) {
    issues.push({
      severity: "error",
      code: "public-solution",
      message: "solution.json must not exist in the public exam package."
    });
  }

  let manifest: Manifest | null = null;
  let exam: Exam | null = null;
  let solution: Solution | null = null;

  try {
    if (await pathExists(manifestPath)) {
      manifest = await readJson<Manifest>(manifestPath);
      await validateSchema("manifest.schema.json", manifest, issues);
    }
    if (await pathExists(examPath)) {
      exam = await readJson<Exam>(examPath);
      await validateSchema("exam.schema.json", exam, issues);
      scanForbiddenPublicKeys(exam, issues);
    }
    if (privateSolutionsDir && (await pathExists(solutionPath))) {
      solution = await readJson<Solution>(solutionPath);
      await validateSchema("solution.schema.json", solution, issues);
    }
  } catch (error) {
    issues.push({
      severity: "error",
      code: "json-read",
      message: error instanceof Error ? error.message : "Failed to read JSON."
    });
  }

  if (manifest && manifest.id !== examId) {
    issues.push({
      severity: "error",
      code: "manifest-id-mismatch",
      message: `Manifest id '${manifest.id}' does not match package id '${examId}'.`
    });
  }

  if (exam) {
    validateExamStructure(exam, issues);
    validateTaskProvenance(exam, issues);
  }

  if (exam && solution) {
    if (solution.examId !== exam.id) {
      issues.push({
        severity: "error",
        code: "solution-exam-mismatch",
        message: `Solution examId '${solution.examId}' does not match exam id '${exam.id}'.`
      });
    }
    validateSolutionReferences(exam, solution, issues);
  }

  if (manifest) {
    validateComplianceMetadata(manifest, issues);
  }

  const requiresManualRightsReview = issues.some(
    (issue) => issue.code === "requires-manual-rights-review" || issue.code === "missing-rights-metadata"
  );
  const valid = !issues.some((issue) => issue.severity === "error");
  const report = { examId, valid, requiresManualRightsReview, issues };

  if (writeReport && (await pathExists(publicDir))) {
    await writeJson(validationReportPath(examId), report);
  }

  return report;
}

export async function validateAttemptSchema(attempt: Attempt): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  await validateSchema("attempt.schema.json", attempt, issues);
  return issues;
}

async function requireFile(filePath: string, code: string, issues: ValidationIssue[]) {
  if (!(await pathExists(filePath))) {
    issues.push({
      severity: "error",
      code,
      message: `Required file is missing: ${filePath}`
    });
  }
}

async function validateSchema(schemaFileName: string, value: unknown, issues: ValidationIssue[]) {
  const schema = await readJson<Record<string, unknown>>(path.join(schemasDir, schemaFileName));
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);
  if (!validate(value)) {
    for (const error of validate.errors ?? []) {
      issues.push({
        severity: "error",
        code: `schema-${schemaFileName}`,
        message: `${error.instancePath || "/"} ${error.message ?? "is invalid"}`
      });
    }
  }
}

function validateExamStructure(exam: Exam, issues: ValidationIssue[]) {
  const papers = sortPapers(exam.papers);
  const paperIds = papers.map((paper) => paper.id);
  if (paperIds.join(",") !== "PB4,PB2,PB3") {
    issues.push({
      severity: "error",
      code: "paper-sequence",
      message: `Written exam paper sequence must be PB4,PB2,PB3. Got ${paperIds.join(",")}.`
    });
  }
  if (paperIds.includes("PB1" as never)) {
    issues.push({ severity: "error", code: "pb1-written-flow", message: "PB1 must not be in written flow." });
  }

  const pb4 = exam.papers.find((paper) => paper.id === "PB4");
  if (pb4) {
    validatePb4(pb4, issues);
  }

  for (const paperId of ["PB2", "PB3"] as const) {
    const paper = exam.papers.find((item) => item.id === paperId);
    if (!paper) {
      continue;
    }
    validatePb2Pb3(paper, issues);
  }
}

function validatePb4(paper: ExamPaper, issues: ValidationIssue[]) {
  if (paper.durationMinutes !== 60) {
    issues.push({ severity: "error", code: "pb4-duration", message: "PB4 duration must be 60 minutes." });
  }
  if (paper.weightPercent !== 10) {
    issues.push({ severity: "error", code: "pb4-weight", message: "PB4 weight must be 10 percent." });
  }
  if (paper.blocks.length === 0) {
    issues.push({ severity: "error", code: "pb4-blocks", message: "PB4 must define at least one block." });
  }
  for (const block of paper.blocks) {
    validateBlockCounts(block, issues);
    if (requiredExclusions(block) > 0 && !block.defaultDropPolicy) {
      issues.push({
        severity: "error",
        code: "pb4-selection-policy",
        message: `${block.id} must define fallback behavior when optional tasks exist.`
      });
    }
  }
}

function validatePb2Pb3(paper: ExamPaper, issues: ValidationIssue[]) {
  if (paper.durationMinutes !== 120) {
    issues.push({ severity: "error", code: `${paper.id}-duration`, message: `${paper.id} duration must be 120 minutes.` });
  }

  const general = paper.blocks.find((block) => block.scope === "general");
  const specialization = paper.blocks.find((block) => block.scope === "specialization");
  validateBlockShape(paper.id, general, 8, 7, "general", issues);
  validateBlockShape(paper.id, specialization, 4, 3, "specialization", issues);

  for (const block of paper.blocks) {
    for (const task of block.tasks) {
      if (task.maxPoints !== 10) {
        issues.push({
          severity: "error",
          code: "task-points",
          message: `${task.id} must have maxPoints 10.`
        });
      }
      validateSubtaskSum(task.id, task.maxPoints, task.subtasks, issues);
    }
  }
}

function validateBlockShape(
  paperId: string,
  block: QuestionBlock | undefined,
  offeredCount: number,
  requiredCount: number,
  scope: string,
  issues: ValidationIssue[]
) {
  if (!block) {
    issues.push({ severity: "error", code: `${paperId}-${scope}-block`, message: `${paperId} is missing ${scope} block.` });
    return;
  }
  if (block.offeredCount !== offeredCount || block.requiredCount !== requiredCount || block.tasks.length !== offeredCount) {
    issues.push({
      severity: "error",
      code: `${paperId}-${scope}-counts`,
      message: `${paperId} ${scope} block must offer ${offeredCount} tasks and require ${requiredCount}.`
    });
  }
}

function validateBlockCounts(block: QuestionBlock, issues: ValidationIssue[]) {
  if (block.tasks.length !== block.offeredCount) {
    issues.push({
      severity: "error",
      code: "block-offered-count",
      message: `${block.id} offeredCount must equal task count.`
    });
  }
  if (block.requiredCount > block.offeredCount) {
    issues.push({
      severity: "error",
      code: "block-required-count",
      message: `${block.id} requiredCount cannot exceed offeredCount.`
    });
  }
}

function validateSubtaskSum(taskId: string, taskMaxPoints: number, subtasks: Subtask[], issues: ValidationIssue[]) {
  const sum = subtasks.reduce((total, subtask) => total + subtask.maxPoints, 0);
  if (Math.abs(sum - taskMaxPoints) > 0.001) {
    issues.push({
      severity: "error",
      code: "subtask-point-sum",
      message: `${taskId} subtask points ${sum} do not equal task max ${taskMaxPoints}.`
    });
  }
}

function validateSolutionReferences(exam: Exam, solution: Solution, issues: ValidationIssue[]) {
  const subtaskPoints = new Map<string, number>();
  for (const paper of exam.papers) {
    for (const block of paper.blocks) {
      for (const task of block.tasks) {
        for (const subtask of task.subtasks) {
          subtaskPoints.set(subtask.id, subtask.maxPoints);
        }
      }
    }
  }

  for (const rubric of solution.rubrics) {
    const maxPoints = subtaskPoints.get(rubric.subtaskId);
    if (maxPoints === undefined) {
      issues.push({
        severity: "error",
        code: "rubric-subtask-reference",
        message: `Rubric references unknown subtask ${rubric.subtaskId}.`
      });
      continue;
    }
    if (rubric.maxPoints > maxPoints) {
      issues.push({
        severity: "error",
        code: "rubric-max-points",
        message: `Rubric ${rubric.subtaskId} exceeds subtask max points.`
      });
    }
  }
}

function validateTaskProvenance(exam: Exam, issues: ValidationIssue[]) {
  for (const paper of exam.papers) {
    for (const block of paper.blocks) {
      for (const task of block.tasks) {
        if (!task.provenance.notDerivedFromProtectedExam) {
          issues.push({
            severity: "error",
            code: "forbidden-protected-source",
            message: `${task.id} is marked as derived from protected exam material.`
          });
        }
        if (task.provenance.sourceType === "user-provided" && task.provenance.rightsStatus !== "user-confirmed") {
          issues.push({
            severity: "warning",
            code: "requires-manual-rights-review",
            message: `${task.id} user-provided provenance requires manual rights review.`
          });
        }
      }
    }
  }
}

function validateComplianceMetadata(manifest: Manifest, issues: ValidationIssue[]) {
  if (!manifest.contentPolicy.notDerivedFromProtectedExam) {
    issues.push({
      severity: "error",
      code: "manifest-protected-source",
      message: "Manifest content policy must state that content is not derived from protected original exams."
    });
  }
  if (manifest.contentPolicy.requiresManualRightsReview) {
    issues.push({
      severity: "warning",
      code: "requires-manual-rights-review",
      message: "Manifest marks this package as requiring manual rights review."
    });
  }
}

function scanForbiddenPublicKeys(value: unknown, issues: ValidationIssue[], trail: string[] = []) {
  if (!value || typeof value !== "object") {
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForbiddenPublicKeys(item, issues, [...trail, String(index)]));
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (forbiddenPublicKeys.has(key)) {
      issues.push({
        severity: "error",
        code: "public-solution-data",
        message: `Forbidden solution-like key '${key}' found in public exam at ${[...trail, key].join(".")}.`
      });
    }
    scanForbiddenPublicKeys(child, issues, [...trail, key]);
  }
}
