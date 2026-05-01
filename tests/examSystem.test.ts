import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it, afterAll } from "vitest";
import type { Answer, Attempt, Exam, PaperSubmission } from "../src/lib/examTypes";
import {
  buildGradingPrompt,
  createEmptyAttempt,
  deriveGalleryCard,
  requiredExclusions,
  scoreWeightedWritten,
  validatePaperSubmission
} from "../src/lib/examLogic";
import { attemptDir, resultPath } from "../server/paths";
import { examPackageDir, solutionDir } from "../server/paths";
import { gradeAttempt } from "../server/grading";
import { deleteInProgressAttempt, loadExam, loadManifest, saveAttempt, saveUpload } from "../server/storage";
import { pathExists, writeJson } from "../server/jsonStore";
import { validateExamPackage } from "../server/validation";

const examId = "mediengestalter-printmedien-sommer-2026";
const testAttemptId = "attempt-test-e2e";
const deleteAttemptId = "attempt-test-delete";
const submittedDeleteAttemptId = "attempt-test-delete-submitted";
const gradedDeleteAttemptId = "attempt-test-delete-graded";
const invalidExamId = "invalid-public-solution";

afterAll(async () => {
  await fs.rm(attemptDir(testAttemptId), { recursive: true, force: true });
  await fs.rm(attemptDir(deleteAttemptId), { recursive: true, force: true });
  await fs.rm(attemptDir(submittedDeleteAttemptId), { recursive: true, force: true });
  await fs.rm(attemptDir(gradedDeleteAttemptId), { recursive: true, force: true });
  await fs.rm(resultPath(testAttemptId), { force: true });
  await fs.rm(examPackageDir(invalidExamId), { recursive: true, force: true });
  await fs.rm(solutionDir(invalidExamId), { recursive: true, force: true });
});

describe("exam package validation", () => {
  it("validates the generated public package and private solution", async () => {
    const report = await validateExamPackage(examId, true);
    expect(report.valid).toBe(true);
    expect(report.issues).toEqual([]);
  });

  it("contains explicit PB4 blocks and PB2/PB3 selection blocks", async () => {
    const exam = await loadExam(examId);
    const pb4 = exam.papers.find((paper) => paper.id === "PB4");
    const pb2 = exam.papers.find((paper) => paper.id === "PB2");
    const pb3 = exam.papers.find((paper) => paper.id === "PB3");

    expect(pb4?.durationMinutes).toBe(60);
    expect(pb4?.blocks.length).toBeGreaterThanOrEqual(2);
    expect(pb2?.blocks.map((block) => [block.offeredCount, block.requiredCount])).toEqual([
      [8, 7],
      [4, 3]
    ]);
    expect(pb3?.blocks.map((block) => [block.offeredCount, block.requiredCount])).toEqual([
      [8, 7],
      [4, 3]
    ]);
  });

  it("fails packages that expose private solutions or solution-like public data", async () => {
    const manifest = { ...(await loadManifest(examId)), id: invalidExamId };
    const exam = { ...(await loadExam(examId)), id: invalidExamId, solution: "forbidden public data" };
    const solution = {
      schemaVersion: "1.0",
      examId: invalidExamId,
      visibility: "private",
      rubrics: []
    };

    await writeJson(`${examPackageDir(invalidExamId)}/manifest.json`, manifest);
    await writeJson(`${examPackageDir(invalidExamId)}/exam.json`, exam);
    await writeJson(`${examPackageDir(invalidExamId)}/solution.json`, solution);
    await writeJson(`${solutionDir(invalidExamId)}/solution.json`, solution);

    const report = await validateExamPackage(invalidExamId, false);
    expect(report.valid).toBe(false);
    expect(report.issues.map((issue) => issue.code)).toContain("public-solution");
    expect(report.issues.map((issue) => issue.code)).toContain("public-solution-data");
  });
});

describe("selection and gallery logic", () => {
  it("enforces block-level excluded task counts", async () => {
    const exam = await loadExam(examId);
    const pb2 = exam.papers.find((paper) => paper.id === "PB2")!;
    const attempt = createEmptyAttempt(exam);
    const submission = attempt.paperSubmissions.find((paper) => paper.paperId === "PB2")!;

    expect(validatePaperSubmission(pb2, submission).valid).toBe(false);

    for (const block of pb2.blocks) {
      const selection = submission.blockSelections.find((item) => item.blockId === block.id)!;
      selection.excludedTaskIds = block.tasks.slice(-requiredExclusions(block)).map((task) => task.id);
    }

    expect(validatePaperSubmission(pb2, submission).valid).toBe(true);
  });

  it("derives gallery card states from attempt and result", async () => {
    const manifest = await loadManifest(examId);
    const noAttempt = deriveGalleryCard(manifest, null, null);
    expect(noAttempt.status).toBe("not-started");
    expect(noAttempt.action).toBe("Pruefen");

    const attempt = createEmptyAttempt(await loadExam(examId));
    const inProgress = deriveGalleryCard(manifest, attempt, null);
    expect(inProgress.status).toBe("not-started");
    expect(inProgress.action).toBe("Pruefen");
    expect(inProgress.attemptId).toBeNull();

    attempt.status = "submitted";
    attempt.currentPaperId = null;
    const gradingReady = deriveGalleryCard(manifest, attempt, null);
    expect(gradingReady.status).toBe("grading-ready");
    expect(gradingReady.action).toBe("Prompt kopieren");
    expect(gradingReady.attemptId).toBe(attempt.id);
  });

  it("builds a Codex grading prompt for submitted attempts", () => {
    const prompt = buildGradingPrompt(examId, testAttemptId);
    expect(prompt).toContain("$grade-ihk-printmedien-exam");
    expect(prompt).toContain(`data/attempts/${testAttemptId}/attempt.json`);
    expect(prompt).toContain("nicht als 1:1-Musterloesungsvergleich");
  });
});

describe("attempt deletion", () => {
  it("deletes in-progress attempts with uploads", async () => {
    const exam = await loadExam(examId);
    const attempt = createEmptyAttempt(exam, "2026-05-01T11:00:00.000Z");
    attempt.id = deleteAttemptId;
    await saveAttempt(attempt);
    const upload = await saveUpload({
      attemptId: deleteAttemptId,
      fieldId: "test-upload",
      name: "skizze.txt",
      mimeType: "text/plain",
      dataBase64: Buffer.from("testdatei", "utf8").toString("base64")
    });
    const uploadPath = path.join(attemptDir(deleteAttemptId), upload.path);

    expect(await pathExists(path.join(attemptDir(deleteAttemptId), "attempt.json"))).toBe(true);
    expect(await pathExists(uploadPath)).toBe(true);

    await deleteInProgressAttempt(deleteAttemptId);

    expect(await pathExists(path.join(attemptDir(deleteAttemptId), "attempt.json"))).toBe(false);
    expect(await pathExists(uploadPath)).toBe(false);
  });

  it("rejects deletion of submitted and graded attempts", async () => {
    const exam = await loadExam(examId);
    const submittedAttempt = createSubmittedAttempt(exam);
    submittedAttempt.id = submittedDeleteAttemptId;
    await saveAttempt(submittedAttempt);

    const gradedAttempt = createSubmittedAttempt(exam);
    gradedAttempt.id = gradedDeleteAttemptId;
    gradedAttempt.status = "graded";
    await saveAttempt(gradedAttempt);

    await expect(deleteInProgressAttempt(submittedDeleteAttemptId)).rejects.toMatchObject({ statusCode: 409 });
    await expect(deleteInProgressAttempt(gradedDeleteAttemptId)).rejects.toMatchObject({ statusCode: 409 });
    expect(await pathExists(path.join(attemptDir(submittedDeleteAttemptId), "attempt.json"))).toBe(true);
    expect(await pathExists(path.join(attemptDir(gradedDeleteAttemptId), "attempt.json"))).toBe(true);
  });
});

describe("grading", () => {
  it("grades submitted attempts with exclusions and weighted written percentage", async () => {
    const exam = await loadExam(examId);
    const attempt = createSubmittedAttempt(exam);
    await saveAttempt(attempt);

    const result = await gradeAttempt(attempt);

    expect(result.rawWrittenPointsPossible).toBeGreaterThan(0);
    expect(result.weightedWrittenPercentage).toBeGreaterThan(0);
    expect(result.pb1Included).toBe(false);
    expect(result.fullExamWrittenContribution).toBeLessThanOrEqual(50);
    expect(result.papers.some((paper) => paper.tasks.some((task) => task.status === "excluded"))).toBe(true);
  });

  it("calculates weighted written score from paper weights", () => {
    const weighted = scoreWeightedWritten([
      { rawPercentage: 80, weightPercent: 10 },
      { rawPercentage: 70, weightPercent: 20 },
      { rawPercentage: 90, weightPercent: 20 }
    ]);
    expect(weighted.weightedWrittenPercentage).toBe(80);
    expect(weighted.fullExamWrittenContribution).toBe(40);
  });
});

function createSubmittedAttempt(exam: Exam): Attempt {
  const attempt = createEmptyAttempt(exam, "2026-05-01T10:00:00.000Z");
  attempt.id = testAttemptId;
  attempt.status = "submitted";
  attempt.currentPaperId = null;
  attempt.submittedAt = "2026-05-01T13:30:00.000Z";

  for (const submission of attempt.paperSubmissions) {
    const paper = exam.papers.find((item) => item.id === submission.paperId)!;
    submission.status = "submitted";
    submission.startedAt = "2026-05-01T10:00:00.000Z";
    submission.submittedAt = "2026-05-01T13:30:00.000Z";
    for (const block of paper.blocks) {
      const selection = submission.blockSelections.find((item) => item.blockId === block.id)!;
      selection.excludedTaskIds = block.tasks.slice(-requiredExclusions(block)).map((task) => task.id);
    }
    submission.answers = answersForSubmission(paper, submission);
  }

  return attempt;
}

function answersForSubmission(paper: Exam["papers"][number], submission: PaperSubmission): Answer[] {
  const excluded = new Set(submission.blockSelections.flatMap((selection) => selection.excludedTaskIds));
  const answers: Answer[] = [];
  for (const block of paper.blocks) {
    for (const task of block.tasks) {
      if (excluded.has(task.id)) continue;
      for (const subtask of task.subtasks) {
        for (const field of subtask.answerFields) {
          if (field.type === "singleChoice" || field.type === "multipleChoice") {
            answers.push({ fieldId: field.id, type: field.type, value: ["a"] });
          } else if (field.type === "shortTextList") {
            answers.push({
              fieldId: field.id,
              type: field.type,
              value: ["zielgruppe", "layout", "daten", "qualitaet"]
            });
          } else if (field.type === "fileUpload" || field.type === "drawingUpload") {
            answers.push({ fieldId: field.id, type: field.type, value: [], files: [] });
          } else {
            answers.push({
              fieldId: field.id,
              type: field.type,
              value:
                "Die Antwort nennt zielgruppe, layout, daten, workflow, druck, farbe und qualitaet. Sie begruendet die Massnahme, weil dadurch Fehler vermieden und die Produktion sichergestellt wird."
            });
          }
        }
      }
    }
  }
  return answers;
}
