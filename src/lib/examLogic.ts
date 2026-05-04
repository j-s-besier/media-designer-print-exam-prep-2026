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

export type BlockExclusionProgress = {
  blockId: string;
  label: string;
  excluded: number;
  required: number;
  missing: number;
  over: number;
};

export type PaperExclusionProgress = {
  blocks: BlockExclusionProgress[];
  excluded: number;
  required: number;
  missing: number;
  over: number;
  valid: boolean;
};

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

export function derivePaperExclusionProgress(
  paper: ExamPaper,
  submission: PaperSubmission
): PaperExclusionProgress {
  const blocks = paper.blocks
    .map((block) => {
      const required = requiredExclusions(block);
      const selection = submission.blockSelections.find((item) => item.blockId === block.id);
      const excluded = selection?.excludedTaskIds.length ?? 0;
      return {
        blockId: block.id,
        label: shortBlockLabel(block.title),
        excluded,
        required,
        missing: Math.max(required - excluded, 0),
        over: Math.max(excluded - required, 0)
      };
    })
    .filter((block) => block.required > 0);
  const required = blocks.reduce((sum, block) => sum + block.required, 0);
  const excluded = blocks.reduce((sum, block) => sum + block.excluded, 0);
  const missing = blocks.reduce((sum, block) => sum + block.missing, 0);
  const over = blocks.reduce((sum, block) => sum + block.over, 0);

  return {
    blocks,
    excluded,
    required,
    missing,
    over,
    valid: missing === 0 && over === 0
  };
}

export function formatExclusionProgress(progress: PaperExclusionProgress): string {
  if (progress.blocks.length === 0) {
    return "Keine Streichung erforderlich";
  }

  return progress.blocks.map((block) => `${block.label} ${block.excluded}/${block.required}`).join(" | ");
}

export function formatStickyExclusionMessage(progress: PaperExclusionProgress): string {
  const summary = formatExclusionProgress(progress);
  if (progress.blocks.length === 0) {
    return summary;
  }
  if (progress.valid) {
    return `Gestrichen: ${summary}`;
  }
  if (progress.missing > 0 && progress.over === 0) {
    return `Noch ${progress.missing} streichen: ${summary}`;
  }
  return `Streichungen pruefen: ${summary}`;
}

export function shortBlockLabel(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("ungebundene")) {
    return "Ungebunden";
  }
  if (lowerTitle.includes("gebundene")) {
    return "Gebunden";
  }
  if (lowerTitle.includes("print")) {
    return "Print";
  }
  if (lowerTitle.includes("allgemein")) {
    return "Allgemein";
  }
  return title.replace(/aufgaben/gi, "").trim() || title;
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
    const passed = latestResult.weightedWrittenPercentage >= 50;
    return {
      examId: manifest.id,
      title: manifest.title,
      status: passed ? "passed" : "failed",
      action: "Ergebnis anzeigen",
      weightedWrittenPercentage: round(latestResult.weightedWrittenPercentage),
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
      status: "todo",
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
      status: "todo",
      action: "Prompt kopieren",
      weightedWrittenPercentage: null,
      pointsLabel: null,
      attemptId: latestAttempt.id
    };
  }

  return {
    examId: manifest.id,
    title: manifest.title,
    status: "todo",
    action: "Pruefen",
    weightedWrittenPercentage: null,
    pointsLabel: null,
    attemptId: null
  };
}

export function formatNumber(value: number): string {
  return round(value).toFixed(1);
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
  return Math.round((value + Number.EPSILON) * 10) / 10;
}
