export type PaperId = "PB4" | "PB2" | "PB3";

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "image"; assetId: string; caption?: string }
  | { type: "formula"; text: string }
  | { type: "pageBreak" };

export type AnswerFieldType =
  | "singleChoice"
  | "multipleChoice"
  | "shortText"
  | "longText"
  | "shortTextList"
  | "table"
  | "calculation"
  | "fileUpload"
  | "drawingUpload";

export type AnswerField = {
  id: string;
  type: AnswerFieldType;
  minLines?: number;
  maxLines?: number;
  items?: number;
  rows?: number;
  columns?: Array<{ id: string; label: string }>;
  options?: Array<{ id: string; label: string }>;
  minSelect?: number;
  maxSelect?: number;
  showWorkArea?: boolean;
  unit?: string;
  acceptedMimeTypes?: string[];
};

export type Provenance = {
  sourceType: "original-generated" | "user-provided";
  basis: string;
  notDerivedFromProtectedExam: boolean;
  rightsStatus?: "generated" | "user-confirmed" | "requires-review";
  requiresManualRightsReview?: boolean;
};

export type Subtask = {
  id: string;
  label: string;
  operator?: string;
  prompt: ContentBlock[];
  maxPoints: number;
  answerFields: AnswerField[];
};

export type Task = {
  id: string;
  number: string;
  title: string;
  topicTags: string[];
  maxPoints: number;
  estimatedMinutes?: number;
  prompt: ContentBlock[];
  materials?: Array<{ materialId: string; usage: string }>;
  subtasks: Subtask[];
  provenance: Provenance;
};

export type QuestionBlock = {
  id: string;
  title: string;
  scope: "general" | "specialization" | "wiso-bound" | "wiso-open";
  questionRange?: string;
  offeredCount: number;
  requiredCount: number;
  defaultDropPolicy?: "last-if-unclear" | "manual-review";
  tasks: Task[];
};

export type ExamPaper = {
  id: PaperId;
  title: string;
  durationMinutes: number;
  weightPercent: number;
  order: number;
  maxPoints?: number;
  schedule?: { startsAt: string; endsAt: string };
  instructions: ContentBlock[];
  allowedAids?: string[];
  blocks: QuestionBlock[];
};

export type Exam = {
  schemaVersion: string;
  id: string;
  title: string;
  profession: string;
  specialization: string;
  ordinance: string;
  examDate?: string;
  language: string;
  sources?: Array<{ label: string; url: string }>;
  papers: ExamPaper[];
};

export type Manifest = {
  schemaVersion: string;
  id: string;
  title: string;
  type: "written-exam";
  profession: string;
  specialization: string;
  status: "available" | "draft" | "archived";
  examVersion: string;
  createdAt?: string;
  examDate?: string;
  summary?: string;
  contentPolicy: {
    sourceType: "original-generated" | "user-provided" | "mixed";
    copyrightSafe: boolean;
    notDerivedFromProtectedExam: boolean;
    requiresManualRightsReview?: boolean;
    notes?: string;
  };
};

export type Solution = {
  schemaVersion: string;
  examId: string;
  visibility: "private";
  gradingMode?: string;
  rubrics: Rubric[];
};

export type Rubric = {
  subtaskId: string;
  maxPoints: number;
  modelAnswer?: string;
  alternativeCorrectAnswers?: string[];
  gradingNotes?: string;
  criteria: RubricCriterion[];
};

export type RubricCriterion = {
  id: string;
  points: number;
  description: string;
  keywords?: string[];
  manualReviewIfMissing?: boolean;
};

export type AttemptStatus = "in-progress" | "submitted" | "graded";
export type PaperSubmissionStatus = "not-started" | "in-progress" | "submitted";

export type Attempt = {
  schemaVersion: string;
  id: string;
  examId: string;
  userId?: string;
  status: AttemptStatus;
  currentPaperId: PaperId | null;
  startedAt: string;
  submittedAt: string | null;
  paperSubmissions: PaperSubmission[];
};

export type PaperSubmission = {
  paperId: PaperId;
  status: PaperSubmissionStatus;
  startedAt?: string | null;
  submittedAt?: string | null;
  blockSelections: BlockSelection[];
  answers: Answer[];
};

export type BlockSelection = {
  blockId: string;
  excludedTaskIds: string[];
};

export type UploadFile = {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  size?: number;
};

export type Answer = {
  fieldId: string;
  type: AnswerFieldType | string;
  value: unknown;
  files?: UploadFile[];
};

export type Result = {
  schemaVersion: string;
  id: string;
  attemptId: string;
  examId: string;
  status: "graded" | "requires-manual-review";
  gradedAt: string;
  pb1Included: boolean;
  rawWrittenPointsAwarded: number;
  rawWrittenPointsPossible: number;
  weightedWrittenPercentage: number;
  fullExamWrittenContribution: number;
  needsManualReview?: boolean;
  papers: PaperResult[];
  validationNotes?: string[];
};

export type PaperResult = {
  paperId: PaperId;
  pointsAwarded: number;
  pointsPossible: number;
  rawPercentage: number;
  weightPercent: number;
  weightedContribution?: number;
  tasks: TaskResult[];
};

export type TaskResult = {
  taskId: string;
  status: "graded" | "excluded";
  pointsAwarded: number;
  pointsPossible: number;
  subtasks: SubtaskResult[];
};

export type SubtaskResult = {
  subtaskId: string;
  pointsAwarded: number;
  maxPoints: number;
  feedback: string;
  confidence: number;
  needsManualReview: boolean;
};

export type GalleryStatus =
  | "not-started"
  | "in-progress"
  | "submitted"
  | "grading-ready"
  | "graded";

export type GalleryCardModel = {
  examId: string;
  title: string;
  status: GalleryStatus;
  action: "Pruefen" | "Fortsetzen" | "Prompt kopieren" | "Ergebnis anzeigen";
  weightedWrittenPercentage: number | null;
  pointsLabel: string | null;
  attemptId: string | null;
};
