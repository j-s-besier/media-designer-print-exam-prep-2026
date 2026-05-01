import type { Attempt, PaperId } from "../src/lib/examTypes";
import { nextPaperId, validatePaperSubmission } from "../src/lib/examLogic";
import { loadExam, saveAttempt } from "./storage";
import { validateAttemptSchema } from "./validation";

export class AttemptSubmissionError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: { messages?: string[]; issues?: unknown }
  ) {
    super(message);
    this.name = "AttemptSubmissionError";
  }
}

export async function submitAttemptPaper(
  attempt: Attempt,
  paperId: PaperId
): Promise<{ attempt: Attempt; nextPaperId: PaperId | null }> {
  const issues = await validateAttemptSchema(attempt);
  if (issues.some((issue) => issue.severity === "error")) {
    throw new AttemptSubmissionError("Invalid attempt.", 400, { issues });
  }

  if (attempt.status !== "in-progress") {
    throw new AttemptSubmissionError("Attempt is already submitted.", 409);
  }

  if (attempt.currentPaperId !== paperId) {
    throw new AttemptSubmissionError("Paper is not the current paper.", 409);
  }

  const exam = await loadExam(attempt.examId);
  const paper = exam.papers.find((item) => item.id === paperId);
  const submission = attempt.paperSubmissions.find((item) => item.paperId === paperId);
  if (!paper || !submission) {
    throw new AttemptSubmissionError("Paper or submission not found.", 404);
  }

  if (submission.status === "submitted") {
    throw new AttemptSubmissionError("Paper is already submitted.", 409);
  }

  const validation = validatePaperSubmission(paper, submission);
  if (!validation.valid) {
    throw new AttemptSubmissionError("Invalid paper selection.", 400, { messages: validation.messages });
  }

  const now = new Date().toISOString();
  submission.status = "submitted";
  submission.submittedAt = now;

  const next = nextPaperId(exam, paperId);
  attempt.currentPaperId = next;
  if (next) {
    const nextSubmission = attempt.paperSubmissions.find((item) => item.paperId === next);
    if (nextSubmission && nextSubmission.status === "not-started") {
      nextSubmission.status = "in-progress";
      nextSubmission.startedAt = now;
    }
  } else {
    attempt.status = "submitted";
    attempt.submittedAt = now;
    await saveAttempt(attempt);
  }

  return { attempt, nextPaperId: next };
}
