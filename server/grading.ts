import path from "node:path";
import type { Answer, Attempt, Exam, PaperResult, Result, Rubric, Solution, SubtaskResult, TaskResult } from "../src/lib/examTypes";
import { getExcludedTaskIds, round, scoreWeightedWritten, validateBlockSelection } from "../src/lib/examLogic";
import { privateSolutionsDir, solutionDir } from "./paths";
import { pathExists, readJson } from "./jsonStore";
import { loadExam, saveAttempt, saveResult } from "./storage";

type ScoredSubtask = SubtaskResult & {
  precisePointsAwarded: number;
  preciseMaxPoints: number;
};

export class GradingConfigurationError extends Error {
  constructor(
    public readonly code: "grading-unavailable" | "missing-solution",
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "GradingConfigurationError";
  }
}

export async function gradeAttempt(attempt: Attempt): Promise<Result> {
  const exam = await loadExam(attempt.examId);
  const solution = await loadPrivateSolution(attempt.examId);
  const rubricMap = new Map(solution.rubrics.map((rubric) => [rubric.subtaskId, rubric]));
  const validationNotes: string[] = [];
  let needsManualReview = false;

  const papers: PaperResult[] = [];
  const precisePaperScores: Array<{ pointsAwarded: number; pointsPossible: number; rawPercentage: number; weightPercent: number }> = [];
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
    let precisePaperAwarded = 0;
    let precisePaperPossible = 0;
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
        const scoredSubtasks = task.subtasks.map((subtask) =>
          scoreSubtask(subtask.id, subtask.maxPoints, submission.answers, rubricMap.get(subtask.id))
        );
        if (scoredSubtasks.some((result) => result.needsManualReview)) {
          needsManualReview = true;
        }
        const preciseTaskAwarded = scoredSubtasks.reduce((sum, result) => sum + result.precisePointsAwarded, 0);
        const preciseTaskPossible = scoredSubtasks.reduce((sum, result) => sum + result.preciseMaxPoints, 0);
        precisePaperAwarded += preciseTaskAwarded;
        precisePaperPossible += preciseTaskPossible;
        taskResults.push({
          taskId: task.id,
          status: "graded",
          pointsAwarded: round(preciseTaskAwarded),
          pointsPossible: round(preciseTaskPossible),
          subtasks: scoredSubtasks.map(toSubtaskResult)
        });
      }
    }

    const pointsAwarded = round(precisePaperAwarded);
    const pointsPossible = round(precisePaperPossible);
    const preciseRawPercentage = precisePaperPossible === 0 ? 0 : (precisePaperAwarded / precisePaperPossible) * 100;
    const rawPercentage = round(preciseRawPercentage);
    precisePaperScores.push({
      pointsAwarded: precisePaperAwarded,
      pointsPossible: precisePaperPossible,
      rawPercentage: preciseRawPercentage,
      weightPercent: paper.weightPercent
    });
    papers.push({
      paperId: paper.id,
      pointsAwarded,
      pointsPossible,
      rawPercentage,
      weightPercent: paper.weightPercent,
      weightedContribution: round((preciseRawPercentage * paper.weightPercent) / 100),
      tasks: taskResults
    });
  }

  const rawWrittenPointsAwarded = round(precisePaperScores.reduce((sum, paper) => sum + paper.pointsAwarded, 0));
  const rawWrittenPointsPossible = round(precisePaperScores.reduce((sum, paper) => sum + paper.pointsPossible, 0));
  const weighted = scoreWeightedWritten(precisePaperScores);
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

async function loadPrivateSolution(examId: string): Promise<Solution> {
  if (!privateSolutionsDir) {
    throw new GradingConfigurationError(
      "grading-unavailable",
      "Trusted private solution storage is not configured for this runtime.",
      503
    );
  }

  const solutionPath = path.join(solutionDir(examId), "solution.json");
  if (!(await pathExists(solutionPath))) {
    throw new GradingConfigurationError(
      "missing-solution",
      `No private solution is available for exam '${examId}'.`,
      404
    );
  }

  return readJson<Solution>(solutionPath);
}

function scoreSubtask(
  subtaskId: string,
  maxPoints: number,
  answers: Answer[],
  rubric: Rubric | undefined
): ScoredSubtask {
  const answerText = normalizeAnswerText(answers.filter((answer) => answer.fieldId.startsWith(`${subtaskId}-`)));
  if (!rubric) {
    return {
      subtaskId,
      pointsAwarded: 0,
      maxPoints: round(maxPoints),
      feedback: "Keine Rubric fuer diese Teilaufgabe gefunden.",
      confidence: 0.2,
      needsManualReview: true,
      precisePointsAwarded: 0,
      preciseMaxPoints: maxPoints
    };
  }

  if (!answerText.trim()) {
    return {
      subtaskId,
      pointsAwarded: 0,
      maxPoints: round(maxPoints),
      feedback: "Keine Antwort eingereicht.",
      confidence: 0.95,
      needsManualReview: false,
      precisePointsAwarded: 0,
      preciseMaxPoints: maxPoints
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

  const capped = Math.min(maxPoints, awarded);
  const confidence = missingManualCriteria.length > 0 ? 0.62 : 0.78;
  return {
    subtaskId,
    pointsAwarded: round(capped),
    maxPoints: round(maxPoints),
    feedback:
      missingManualCriteria.length > 0
        ? `Automatisch bewertet; Kriterium ${missingManualCriteria.join(", ")} sollte manuell geprueft werden.`
        : "Automatisch anhand der hinterlegten Rubric bewertet.",
    confidence,
    needsManualReview: missingManualCriteria.length > 0,
    precisePointsAwarded: capped,
    preciseMaxPoints: maxPoints
  };
}

function toSubtaskResult(scored: ScoredSubtask): SubtaskResult {
  const { precisePointsAwarded: _precisePointsAwarded, preciseMaxPoints: _preciseMaxPoints, ...result } = scored;
  return result;
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
