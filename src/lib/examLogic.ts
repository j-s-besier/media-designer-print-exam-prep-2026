import type {
  Attempt,
  BlockSelection,
  Exam,
  ExamPaper,
  GalleryCardModel,
  Manifest,
  PaperId,
  PaperSubmission,
  QuestionBlock,
  Result
} from "./examTypes";

export function sortPapers(papers: ExamPaper[]): ExamPaper[] {
  return [...papers].sort((a, b) => a.order - b.order);
}

export function firstPaperId(exam: Exam): PaperId {
  return sortPapers(exam.papers)[0]?.id ?? "PB4";
}

export function createEmptyAttempt(exam: Exam, now = new Date().toISOString()): Attempt {
  const papers = sortPapers(exam.papers);
  return {
    schemaVersion: "1.0",
    id: `attempt-${exam.id}-${Date.now()}`,
    examId: exam.id,
    status: "in-progress",
    currentPaperId: papers[0]?.id ?? null,
    startedAt: now,
    submittedAt: null,
    paperSubmissions: papers.map((paper, index) => ({
      paperId: paper.id,
      status: index === 0 ? "in-progress" : "not-started",
      startedAt: index === 0 ? now : null,
      submittedAt: null,
      blockSelections: paper.blocks.map((block) => ({
        blockId: block.id,
        excludedTaskIds: []
      })),
      answers: []
    }))
  };
}

export function requiredExclusions(block: QuestionBlock): number {
  return Math.max(0, block.offeredCount - block.requiredCount);
}

export function validateBlockSelection(
  block: QuestionBlock,
  selection: BlockSelection | undefined
): { valid: boolean; message?: string } {
  const excluded = selection?.excludedTaskIds ?? [];
  const required = requiredExclusions(block);
  if (excluded.length !== required) {
    return {
      valid: false,
      message: `${block.title}: Es muessen genau ${required} Aufgabe(n) gestrichen werden.`
    };
  }

  const taskIds = new Set(block.tasks.map((task) => task.id));
  if (excluded.some((taskId) => !taskIds.has(taskId))) {
    return {
      valid: false,
      message: `${block.title}: Eine gestrichene Aufgabe gehoert nicht zu diesem Block.`
    };
  }

  return { valid: true };
}

export function validatePaperSubmission(
  paper: ExamPaper,
  submission: PaperSubmission
): { valid: boolean; messages: string[] } {
  const messages: string[] = [];
  for (const block of paper.blocks) {
    const selection = submission.blockSelections.find((item) => item.blockId === block.id);
    const result = validateBlockSelection(block, selection);
    if (!result.valid) {
      messages.push(result.message ?? `Ungueltige Auswahl in ${block.title}`);
    }
  }

  return { valid: messages.length === 0, messages };
}

export function getExcludedTaskIds(submission: PaperSubmission): Set<string> {
  return new Set(submission.blockSelections.flatMap((selection) => selection.excludedTaskIds));
}

export function nextPaperId(exam: Exam, currentPaperId: PaperId): PaperId | null {
  const papers = sortPapers(exam.papers);
  const index = papers.findIndex((paper) => paper.id === currentPaperId);
  return papers[index + 1]?.id ?? null;
}

export function deriveGalleryCard(
  manifest: Manifest,
  latestAttempt: Attempt | null,
  latestResult: Result | null
): GalleryCardModel {
  if (latestResult) {
    return {
      examId: manifest.id,
      title: manifest.title,
      status: "graded",
      action: "Ergebnis anzeigen",
      weightedWrittenPercentage: latestResult.weightedWrittenPercentage,
      pointsLabel: `${formatNumber(latestResult.rawWrittenPointsAwarded)}/${formatNumber(
        latestResult.rawWrittenPointsPossible
      )}`,
      attemptId: latestResult.attemptId
    };
  }

  if (!latestAttempt) {
    return {
      examId: manifest.id,
      title: manifest.title,
      status: "not-started",
      action: "Pruefen",
      weightedWrittenPercentage: null,
      pointsLabel: null,
      attemptId: null
    };
  }

  if (latestAttempt.status === "submitted") {
    return {
      examId: manifest.id,
      title: manifest.title,
      status: "grading-ready",
      action: "Prompt kopieren",
      weightedWrittenPercentage: null,
      pointsLabel: null,
      attemptId: latestAttempt.id
    };
  }

  return {
    examId: manifest.id,
    title: manifest.title,
    status: "in-progress",
    action: "Fortsetzen",
    weightedWrittenPercentage: null,
    pointsLabel: null,
    attemptId: latestAttempt.id
  };
}

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function buildGradingPrompt(examId: string, attemptId: string): string {
  return [
    "$grade-ihk-printmedien-exam",
    "",
    "Werte diesen gespeicherten Pruefungsversuch aus.",
    "",
    `Exam-ID: ${examId}`,
    `Attempt-ID: ${attemptId}`,
    `Attempt-Datei: data/attempts/${attemptId}/attempt.json`,
    `Public Exam: data/exams/${examId}/exam.json`,
    `Private Solution: data/private/solutions/${examId}/solution.json`,
    "",
    "Bitte:",
    `1. Nutze den Skill grade-ihk-printmedien-exam fuer Attempt ${attemptId}.`,
    "2. Bewerte offene Antworten nach Rubric-Kriterien und fachlichem Sinn, nicht als 1:1-Musterloesungsvergleich.",
    "3. Beachte gestrichene Aufgaben aus dem Attempt; diese duerfen nicht bewertet werden.",
    "4. Markiere unsichere Bewertungen, Skizzen/Uploads und unklare Antworten als manuelle Pruefung.",
    `5. Speichere das Ergebnis als data/results/${attemptId}.result.json und fasse Rohpunkte, gewichtete schriftliche Prozentzahl und manuelle Pruefpunkte zusammen.`
  ].join("\n");
}

export function scoreWeightedWritten(papers: Array<{ rawPercentage: number; weightPercent: number }>) {
  const totalWeight = papers.reduce((sum, paper) => sum + paper.weightPercent, 0);
  const weightedWrittenPercentage =
    totalWeight === 0
      ? 0
      : papers.reduce((sum, paper) => sum + paper.rawPercentage * paper.weightPercent, 0) / totalWeight;
  const fullExamWrittenContribution = (weightedWrittenPercentage * totalWeight) / 100;
  return {
    weightedWrittenPercentage: round(weightedWrittenPercentage),
    fullExamWrittenContribution: round(fullExamWrittenContribution)
  };
}

export function round(value: number): number {
  return Math.round(value * 100) / 100;
}
