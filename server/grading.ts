import path from "node:path";
import type { Answer, Attempt, Exam, PaperResult, Result, Rubric, Solution, SubtaskResult, TaskResult } from "../src/lib/examTypes";
import { getExcludedTaskIds, round, scoreWeightedWritten, validateBlockSelection } from "../src/lib/examLogic";
import { solutionDir } from "./paths";
import { readJson } from "./jsonStore";
import { loadExam, saveAttempt, saveResult } from "./storage";

export async function gradeAttempt(attempt: Attempt): Promise<Result> {
  const exam = await loadExam(attempt.examId);
  const solution = await readJson<Solution>(path.join(solutionDir(attempt.examId), "solution.json"));
  const rubricMap = new Map(solution.rubrics.map((rubric) => [rubric.subtaskId, rubric]));
  const validationNotes: string[] = [];
  let needsManualReview = false;

  const papers: PaperResult[] = [];
  for (const paper of exam.papers) {
    const submission = attempt.paperSubmissions.find((item) => item.paperId === paper.id);
    if (!submission) {
      validationNotes.push(`${paper.id}: missing submission`);
      needsManualReview = true;
      continue;
    }

    for (const block of paper.blocks) {
      const selection = submission.blockSelections.find((item) => item.blockId === block.id);
      const blockValidation = validateBlockSelection(block, selection);
      if (!blockValidation.valid) {
        needsManualReview = true;
        validationNotes.push(`${paper.id}/${block.id}: ${blockValidation.message}`);
        if (block.defaultDropPolicy === "last-if-unclear" && selection) {
          const missing = Math.max(0, block.offeredCount - block.requiredCount - selection.excludedTaskIds.length);
          const fallbackTaskIds = block.tasks
            .map((task) => task.id)
            .filter((taskId) => !selection.excludedTaskIds.includes(taskId))
            .slice(-missing);
          selection.excludedTaskIds.push(...fallbackTaskIds);
          validationNotes.push(`${paper.id}/${block.id}: fallback excluded ${fallbackTaskIds.join(", ")}`);
        }
      }
    }

    const excludedTaskIds = getExcludedTaskIds(submission);
    const taskResults: TaskResult[] = [];
    for (const block of paper.blocks) {
      for (const task of block.tasks) {
        if (excludedTaskIds.has(task.id)) {
          taskResults.push({
            taskId: task.id,
            status: "excluded",
            pointsAwarded: 0,
            pointsPossible: 0,
            subtasks: []
          });
          continue;
        }
        const subtaskResults: SubtaskResult[] = task.subtasks.map((subtask) =>
          scoreSubtask(subtask.id, subtask.maxPoints, submission.answers, rubricMap.get(subtask.id))
        );
        if (subtaskResults.some((result) => result.needsManualReview)) {
          needsManualReview = true;
        }
        taskResults.push({
          taskId: task.id,
          status: "graded",
          pointsAwarded: round(subtaskResults.reduce((sum, result) => sum + result.pointsAwarded, 0)),
          pointsPossible: round(subtaskResults.reduce((sum, result) => sum + result.maxPoints, 0)),
          subtasks: subtaskResults
        });
      }
    }

    const pointsAwarded = round(taskResults.reduce((sum, task) => sum + task.pointsAwarded, 0));
    const pointsPossible = round(taskResults.reduce((sum, task) => sum + task.pointsPossible, 0));
    const rawPercentage = pointsPossible === 0 ? 0 : round((pointsAwarded / pointsPossible) * 100);
    papers.push({
      paperId: paper.id,
      pointsAwarded,
      pointsPossible,
      rawPercentage,
      weightPercent: paper.weightPercent,
      weightedContribution: round((rawPercentage * paper.weightPercent) / 100),
      tasks: taskResults
    });
  }

  const rawWrittenPointsAwarded = round(papers.reduce((sum, paper) => sum + paper.pointsAwarded, 0));
  const rawWrittenPointsPossible = round(papers.reduce((sum, paper) => sum + paper.pointsPossible, 0));
  const weighted = scoreWeightedWritten(papers);
  const result: Result = {
    schemaVersion: "1.0",
    id: `result-${attempt.id}`,
    attemptId: attempt.id,
    examId: attempt.examId,
    status: needsManualReview ? "requires-manual-review" : "graded",
    gradedAt: new Date().toISOString(),
    pb1Included: false,
    rawWrittenPointsAwarded,
    rawWrittenPointsPossible,
    weightedWrittenPercentage: weighted.weightedWrittenPercentage,
    fullExamWrittenContribution: weighted.fullExamWrittenContribution,
    needsManualReview,
    papers,
    validationNotes
  };

  attempt.status = "graded";
  await saveAttempt(attempt);
  await saveResult(result);
  return result;
}

function scoreSubtask(
  subtaskId: string,
  maxPoints: number,
  answers: Answer[],
  rubric: Rubric | undefined
): SubtaskResult {
  const answerText = normalizeAnswerText(answers.filter((answer) => answer.fieldId.startsWith(`${subtaskId}-`)));
  if (!rubric) {
    return {
      subtaskId,
      pointsAwarded: 0,
      maxPoints,
      feedback: "Keine Rubric fuer diese Teilaufgabe gefunden.",
      confidence: 0.2,
      needsManualReview: true
    };
  }

  if (!answerText.trim()) {
    return {
      subtaskId,
      pointsAwarded: 0,
      maxPoints,
      feedback: "Keine Antwort eingereicht.",
      confidence: 0.95,
      needsManualReview: false
    };
  }

  let awarded = 0;
  const missingManualCriteria: string[] = [];
  for (const criterion of rubric.criteria) {
    const keywords = criterion.keywords ?? [];
    const matched = keywords.length === 0 || keywords.some((keyword) => answerText.includes(keyword.toLowerCase()));
    if (matched) {
      awarded += criterion.points;
    } else if (criterion.manualReviewIfMissing) {
      missingManualCriteria.push(criterion.id);
    }
  }

  const capped = Math.min(maxPoints, round(awarded));
  const confidence = missingManualCriteria.length > 0 ? 0.62 : 0.78;
  return {
    subtaskId,
    pointsAwarded: capped,
    maxPoints,
    feedback:
      missingManualCriteria.length > 0
        ? `Automatisch bewertet; Kriterium ${missingManualCriteria.join(", ")} sollte manuell geprueft werden.`
        : "Automatisch anhand der hinterlegten Rubric bewertet.",
    confidence,
    needsManualReview: missingManualCriteria.length > 0
  };
}

function normalizeAnswerText(answers: Answer[]): string {
  return answers
    .map((answer) => {
      if (Array.isArray(answer.value)) {
        return answer.value.join(" ");
      }
      if (answer.value && typeof answer.value === "object") {
        return JSON.stringify(answer.value);
      }
      return String(answer.value ?? "");
    })
    .join(" ")
    .toLowerCase();
}
