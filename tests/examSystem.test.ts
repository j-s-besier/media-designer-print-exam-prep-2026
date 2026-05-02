import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it, afterAll } from "vitest";
import type { Answer, Attempt, Exam, PaperId, PaperSubmission, Result, Solution } from "../src/lib/examTypes";
import {
  buildGradingPrompt,
  createEmptyAttempt,
  deriveGalleryCard,
  formatNumber,
  requiredExclusions,
  scoreWeightedWritten,
  validatePaperSubmission
} from "../src/lib/examLogic";
import { attemptDir, resultPath } from "../server/paths";
import { examPackageDir, solutionDir } from "../server/paths";
import { submitAttemptPaper } from "../server/attemptSubmission";
import { gradeAttempt } from "../server/grading";
import { createAttempt, deleteInProgressAttempt, loadExam, loadManifest, saveAttempt, saveUpload } from "../server/storage";
import { pathExists, readJson, writeJson } from "../server/jsonStore";
import { validateExamPackage } from "../server/validation";

const examId = "mgdp-1";
const secondaryExamId = "mgdp-2";
const testAttemptId = "attempt-test-e2e";
const deleteAttemptId = "attempt-test-delete";
const submittedDeleteAttemptId = "attempt-test-delete-submitted";
const gradedDeleteAttemptId = "attempt-test-delete-graded";
const transientDeleteAttemptId = "attempt-test-delete-transient";
const finalOnlyAttemptId = "attempt-test-final-only";
const invalidExamId = "invalid-public-solution";

afterAll(async () => {
  await fs.rm(attemptDir(testAttemptId), { recursive: true, force: true });
  await fs.rm(attemptDir(deleteAttemptId), { recursive: true, force: true });
  await fs.rm(attemptDir(submittedDeleteAttemptId), { recursive: true, force: true });
  await fs.rm(attemptDir(gradedDeleteAttemptId), { recursive: true, force: true });
  await fs.rm(attemptDir(transientDeleteAttemptId), { recursive: true, force: true });
  await fs.rm(attemptDir(finalOnlyAttemptId), { recursive: true, force: true });
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

  it("uses numbered package ids and display titles", async () => {
    const manifest = await loadManifest(examId);
    const exam = await loadExam(examId);
    const solution = await readJson<Solution>(path.join(solutionDir(examId), "solution.json"));
    const secondaryManifest = await loadManifest(secondaryExamId);

    expect(manifest.id).toBe("mgdp-1");
    expect(manifest.title).toBe("MgDp-1");
    expect(exam.id).toBe("mgdp-1");
    expect(exam.title).toBe("MgDp-1");
    expect(solution.examId).toBe("mgdp-1");
    expect(secondaryManifest.id).toBe("mgdp-2");
    expect(secondaryManifest.title).toBe("MgDp-2");
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
    expect(noAttempt.status).toBe("todo");
    expect(noAttempt.action).toBe("Pruefen");
    expect(noAttempt.weightedWrittenPercentage).toBeNull();
    expect(noAttempt.pointsLabel).toBeNull();

    const attempt = createEmptyAttempt(await loadExam(examId));
    const inProgress = deriveGalleryCard(manifest, attempt, null);
    expect(inProgress.status).toBe("todo");
    expect(inProgress.action).toBe("Pruefen");
    expect(inProgress.attemptId).toBeNull();

    attempt.status = "submitted";
    attempt.currentPaperId = null;
    const gradingReady = deriveGalleryCard(manifest, attempt, null);
    expect(gradingReady.status).toBe("todo");
    expect(gradingReady.action).toBe("Prompt kopieren");
    expect(gradingReady.attemptId).toBe(attempt.id);

    const failed = deriveGalleryCard(manifest, attempt, createResult(49.25));
    expect(failed.status).toBe("failed");
    expect(failed.action).toBe("Ergebnis anzeigen");
    expect(failed.weightedWrittenPercentage).toBe(49.3);
    expect(failed.pointsLabel).toBe("49.3/100.0");

    const passed = deriveGalleryCard(manifest, attempt, createResult(50));
    expect(passed.status).toBe("passed");
    expect(passed.action).toBe("Ergebnis anzeigen");
    expect(passed.weightedWrittenPercentage).toBe(50);
  });

  it("formats displayed point values with one decimal place", async () => {
    const exam = await loadExam(examId);
    const pb4 = exam.papers.find((paper) => paper.id === "PB4")!;
    const fractionalTask = pb4.blocks.find((block) => block.id === "PB4-bound")!.tasks[0];

    expect(fractionalTask.maxPoints).toBeCloseTo(40 / 15);
    expect(formatNumber(fractionalTask.maxPoints)).toBe("2.7");
    expect(formatNumber(10)).toBe("10.0");
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

  it("cleans transient attempt upload directories without requiring attempt.json", async () => {
    const upload = await saveUpload({
      attemptId: transientDeleteAttemptId,
      fieldId: "test-upload",
      name: "skizze.txt",
      mimeType: "text/plain",
      dataBase64: Buffer.from("testdatei", "utf8").toString("base64")
    });
    const uploadPath = path.join(attemptDir(transientDeleteAttemptId), upload.path);

    expect(await pathExists(path.join(attemptDir(transientDeleteAttemptId), "attempt.json"))).toBe(false);
    expect(await pathExists(uploadPath)).toBe(true);

    await deleteInProgressAttempt(transientDeleteAttemptId);

    expect(await pathExists(uploadPath)).toBe(false);
  });
});

describe("attempt persistence", () => {
  it("starts attempts without writing an attempt record", async () => {
    const attempt = await createAttempt(examId);

    expect(attempt.status).toBe("in-progress");
    expect(await pathExists(path.join(attemptDir(attempt.id), "attempt.json"))).toBe(false);
  });

  it("writes the attempt only after the final paper is submitted", async () => {
    const exam = await loadExam(examId);
    const attempt = createEmptyAttempt(exam, "2026-05-01T09:00:00.000Z");
    attempt.id = finalOnlyAttemptId;

    satisfyPaperSelection(exam, attempt, "PB4");
    let submission = await submitAttemptPaper(attempt, "PB4");
    expect(submission.nextPaperId).toBe("PB2");
    expect(await pathExists(path.join(attemptDir(finalOnlyAttemptId), "attempt.json"))).toBe(false);

    satisfyPaperSelection(exam, submission.attempt, "PB2");
    submission = await submitAttemptPaper(submission.attempt, "PB2");
    expect(submission.nextPaperId).toBe("PB3");
    expect(await pathExists(path.join(attemptDir(finalOnlyAttemptId), "attempt.json"))).toBe(false);

    satisfyPaperSelection(exam, submission.attempt, "PB3");
    submission = await submitAttemptPaper(submission.attempt, "PB3");
    expect(submission.nextPaperId).toBeNull();
    expect(submission.attempt.status).toBe("submitted");
    expect(await pathExists(path.join(attemptDir(finalOnlyAttemptId), "attempt.json"))).toBe(true);
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

    const pb4 = result.papers.find((paper) => paper.paperId === "PB4")!;
    const fractionalTask = pb4.tasks.find((task) => task.taskId === "PB4-W1")!;
    expect(pb4.pointsPossible).toBe(100);
    expect(fractionalTask.pointsPossible).toBe(2.7);
    expect(fractionalTask.subtasks[0].maxPoints).toBe(2.7);
    expect(decimalPlaces(result.rawWrittenPointsPossible)).toBeLessThanOrEqual(1);
    expect(decimalPlaces(result.weightedWrittenPercentage)).toBeLessThanOrEqual(1);
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

function satisfyPaperSelection(exam: Exam, attempt: Attempt, paperId: PaperId) {
  const paper = exam.papers.find((item) => item.id === paperId)!;
  const submission = attempt.paperSubmissions.find((item) => item.paperId === paperId)!;
  for (const block of paper.blocks) {
    const selection = submission.blockSelections.find((item) => item.blockId === block.id)!;
    selection.excludedTaskIds = block.tasks.slice(-requiredExclusions(block)).map((task) => task.id);
  }
}

function createResult(weightedWrittenPercentage: number): Result {
  return {
    schemaVersion: "1.0",
    id: `result-${testAttemptId}-${weightedWrittenPercentage}`,
    attemptId: testAttemptId,
    examId,
    status: "graded",
    gradedAt: "2026-05-01T14:00:00.000Z",
    pb1Included: false,
    rawWrittenPointsAwarded: weightedWrittenPercentage,
    rawWrittenPointsPossible: 100,
    weightedWrittenPercentage,
    fullExamWrittenContribution: weightedWrittenPercentage / 2,
    papers: []
  };
}

function decimalPlaces(value: number): number {
  const [, decimals = ""] = String(value).split(".");
  return decimals.length;
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
