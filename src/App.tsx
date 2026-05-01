import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, ClipboardCheck, Copy, FilePenLine, Loader2, LogOut, Upload } from "lucide-react";
import { createRoot } from "react-dom/client";
import type {
  Answer,
  AnswerField,
  Attempt,
  ContentBlock,
  Exam,
  ExamPaper,
  GalleryCardModel,
  Manifest,
  PaperId,
  Result,
  UploadFile
} from "./lib/examTypes";
import { buildGradingPrompt, deriveGalleryCard, requiredExclusions, validatePaperSubmission } from "./lib/examLogic";
import "./styles.css";

type ExamSummary = {
  manifest: Manifest;
  latestAttempt: Attempt | null;
  latestResult: Result | null;
};

type ExamPayload = {
  manifest: Manifest;
  exam: Exam;
  latestAttempt: Attempt | null;
  latestResult: Result | null;
};

type View =
  | { name: "gallery" }
  | { name: "exam"; exam: Exam; manifest: Manifest; attempt: Attempt }
  | { name: "result"; result: Result };

function App() {
  const [view, setView] = useState<View>({ name: "gallery" });
  const [summaries, setSummaries] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeKind, setNoticeKind] = useState<"info" | "success" | "error">("info");
  const [copiedAttemptId, setCopiedAttemptId] = useState<string | null>(null);

  async function loadGallery() {
    setLoading(true);
    try {
      const response = await fetch("/api/exams");
      const data = (await response.json()) as { exams: ExamSummary[] };
      setSummaries(data.exams);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGallery();
  }, []);

  const cards = useMemo(
    () =>
      summaries.map((summary) =>
        deriveGalleryCard(summary.manifest, summary.latestAttempt, summary.latestResult)
      ),
    [summaries]
  );

  async function openExam(card: GalleryCardModel) {
    setLoading(true);
    try {
      if (card.action === "Prompt kopieren" && card.attemptId) {
        await copyTextToClipboard(buildGradingPrompt(card.examId, card.attemptId));
        setCopiedAttemptId(card.attemptId);
        showNotice("Auswertungsprompt kopiert. Fuege ihn in Codex ein, um den Grading-Skill auszufuehren.", "success");
        return;
      }

      if (card.action === "Ergebnis anzeigen" && card.attemptId) {
        const response = await fetch(`/api/results/${card.attemptId}`);
        const data = (await response.json()) as { result: Result };
        setView({ name: "result", result: data.result });
        return;
      }

      const response = await fetch(`/api/exams/${card.examId}`);
      const data = (await response.json()) as ExamPayload;
      const attempt = await createAttempt(card.examId);
      setView({ name: "exam", exam: data.exam, manifest: data.manifest, attempt });
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Aktion fehlgeschlagen.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function createAttempt(examId: string) {
    const response = await fetch(`/api/exams/${examId}/attempts`, { method: "POST" });
    const data = (await response.json()) as { attempt: Attempt };
    return data.attempt;
  }

  async function returnToGallery(message?: string) {
    setView({ name: "gallery" });
    if (message) {
      showNotice(message, "success");
    }
    await loadGallery();
  }

  function showNotice(message: string, kind: "info" | "success" | "error" = "info") {
    setNoticeKind(kind);
    setNotice(message);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Mediengestalter Digital und Print</p>
          <h1>Pruefungstrainer Printmedien</h1>
        </div>
        {view.name === "result" ? (
          <button className="ghost-button" onClick={() => void returnToGallery()}>
            Zurueck
          </button>
        ) : null}
      </header>

      {notice ? (
        <div className={`notice ${noticeKind}`} role="status">
          {noticeKind === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{notice}</span>
          <button onClick={() => setNotice(null)}>Schliessen</button>
        </div>
      ) : null}

      {loading ? (
        <div className="loading">
          <Loader2 className="spin" size={22} />
          <span>Lade Daten...</span>
        </div>
      ) : null}

      {view.name === "gallery" ? (
        <Gallery cards={cards} copiedAttemptId={copiedAttemptId} onOpen={openExam} />
      ) : null}
      {view.name === "exam" ? (
        <ExamRunner
          exam={view.exam}
          manifest={view.manifest}
          attempt={view.attempt}
          setAttempt={(attempt) => setView({ ...view, attempt })}
          onFinished={() =>
            void returnToGallery("Pruefung abgegeben. Der Auswertungsprompt kann jetzt in der Galerie kopiert werden.")
          }
          onQuit={() => void returnToGallery("Pruefungsversuch geloescht.")}
          onError={(message) => showNotice(message, "error")}
        />
      ) : null}
      {view.name === "result" ? <ResultView result={view.result} /> : null}
    </main>
  );
}

function Gallery({
  cards,
  copiedAttemptId,
  onOpen
}: {
  cards: GalleryCardModel[];
  copiedAttemptId: string | null;
  onOpen: (card: GalleryCardModel) => void;
}) {
  return (
    <section className="gallery-grid">
      {cards.map((card) => {
        const copied = card.action === "Prompt kopieren" && card.attemptId === copiedAttemptId;
        return (
          <article className="surface surface-standard surface-stack exam-card" key={card.examId}>
            <div className="card-heading">
              <ClipboardCheck size={22} />
              <div>
                <h2>{card.title}</h2>
                <p>{card.examId}</p>
              </div>
            </div>
            <dl className="meta-grid">
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={`status-badge ${statusClassName(card.status)}`}>{statusLabel(card.status)}</span>
                </dd>
              </div>
              <div>
                <dt>Bewertung</dt>
                <dd>{card.weightedWrittenPercentage === null ? "-" : `${card.weightedWrittenPercentage}%`}</dd>
              </div>
              <div>
                <dt>Punkte</dt>
                <dd>{card.pointsLabel ?? "-"}</dd>
              </div>
            </dl>
            <button className="primary-button" onClick={() => void onOpen(card)}>
              {copied ? <Check size={18} /> : card.action === "Prompt kopieren" ? <Copy size={18} /> : <FilePenLine size={18} />}
              {copied ? "Kopiert" : card.action}
            </button>
          </article>
        );
      })}
    </section>
  );
}

function ExamRunner({
  exam,
  manifest,
  attempt,
  setAttempt,
  onFinished,
  onQuit,
  onError
}: {
  exam: Exam;
  manifest: Manifest;
  attempt: Attempt;
  setAttempt: (attempt: Attempt) => void;
  onFinished: () => void;
  onQuit: () => void;
  onError: (message: string) => void;
}) {
  const paper = exam.papers.find((item) => item.id === attempt.currentPaperId) ?? exam.papers[0];
  const submission = attempt.paperSubmissions.find((item) => item.paperId === paper.id);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMessages([]);
  }, [paper.id]);

  if (!submission) {
    return <p>Kein Attempt fuer diesen Pruefungsteil gefunden.</p>;
  }

  const currentSubmission = submission;
  const readOnly = submission.status === "submitted";
  const selectionValidation = validatePaperSubmission(paper, currentSubmission);

  function updateAttempt(next: Attempt) {
    setAttempt(next);
  }

  function updateSubmission(mutator: (draft: Attempt) => void) {
    const draft = structuredClone(attempt) as Attempt;
    mutator(draft);
    updateAttempt(draft);
  }

  async function submitPaper() {
    setMessages([]);
    const validation = validatePaperSubmission(paper, currentSubmission);
    if (!validation.valid) {
      setMessages(validation.messages);
      return;
    }
    const response = await fetch(`/api/attempts/${attempt.id}/papers/${paper.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attempt })
    });
    const data = (await response.json()) as { attempt?: Attempt; nextPaperId?: PaperId | null; error?: string; messages?: string[] };
    if (!response.ok || !data.attempt) {
      setMessages(data.messages ?? [data.error ?? "Abgabe fehlgeschlagen."]);
      return;
    }
    setAttempt(data.attempt);
    if (!data.nextPaperId) {
      onFinished();
    }
  }

  async function quitAttempt() {
    const confirmed = window.confirm(
      "Pruefung wirklich beenden? Der aktuelle Versuch wird geloescht. Deine Antworten koennen nicht fortgesetzt werden."
    );
    if (!confirmed) {
      return;
    }

    setMessages([]);
    const response = await fetch(`/api/attempts/${attempt.id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      onError(data.error ?? "Pruefungsversuch konnte nicht geloescht werden.");
      return;
    }

    onQuit();
  }

  return (
    <section className="exam-runner">
      <div className="surface surface-standard surface-inline paper-header">
        <div>
          <p className="eyebrow">{manifest.title}</p>
          <h2>
            {paper.id}: {paper.title}
          </h2>
        </div>
        <div className="paper-meta">
          <span>{paper.durationMinutes} min</span>
          <span>{paper.weightPercent}% Gewicht</span>
        </div>
      </div>

      <div className="surface surface-standard surface-stack-compact instruction-band">
        {paper.instructions.map((block, index) => (
          <Content key={index} block={block} />
        ))}
      </div>

      {messages.length ? (
        <div className="error-list">
          {messages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      {paper.blocks.map((block) => {
        const selection = currentSubmission.blockSelections.find((item) => item.blockId === block.id);
        const excludedIds = selection?.excludedTaskIds ?? [];
        const required = requiredExclusions(block);
        return (
          <section className="surface surface-standard surface-stack-compact task-block" key={block.id}>
            <div className="block-header">
              <div>
                <h3>{block.title}</h3>
                <p>
                  {block.questionRange ?? block.id}: {block.requiredCount} von {block.offeredCount} bearbeiten,
                  {required} streichen
                </p>
              </div>
              <span>{excludedIds.length}/{required} gestrichen</span>
            </div>

            {block.tasks.map((task) => {
              const excluded = excludedIds.includes(task.id);
              return (
                <article className={`surface surface-compact surface-stack-compact task-card ${excluded ? "excluded" : ""}`} key={task.id}>
                  <div className="task-title-row">
                    <div>
                      <h4>
                        {task.number} {task.title}
                      </h4>
                      <p>{task.maxPoints} Punkte</p>
                    </div>
                    {required > 0 ? (
                      <button
                        className={excluded ? "secondary-button active" : "secondary-button"}
                        disabled={readOnly}
                        onClick={() =>
                          updateSubmission((draft) => {
                            const draftSubmission = draft.paperSubmissions.find((item) => item.paperId === paper.id);
                            const draftSelection = draftSubmission?.blockSelections.find((item) => item.blockId === block.id);
                            if (!draftSelection) return;
                            if (draftSelection.excludedTaskIds.includes(task.id)) {
                              draftSelection.excludedTaskIds = draftSelection.excludedTaskIds.filter((id) => id !== task.id);
                            } else if (draftSelection.excludedTaskIds.length < required) {
                              draftSelection.excludedTaskIds.push(task.id);
                            }
                          })
                        }
                      >
                        {excluded ? <Check size={16} /> : null}
                        Streichen
                      </button>
                    ) : null}
                  </div>
                  {task.prompt.map((blockItem, index) => (
                    <Content key={index} block={blockItem} />
                  ))}
                  {task.subtasks.map((subtask) => (
                    <div className="subtask" key={subtask.id}>
                      <strong>
                        {subtask.label}) {subtask.maxPoints} P
                      </strong>
                      {subtask.prompt.map((blockItem, index) => (
                        <Content key={index} block={blockItem} />
                      ))}
                      {subtask.answerFields.map((field) => (
                        <AnswerInput
                          key={field.id}
                          field={field}
                          answer={currentSubmission.answers.find((answer) => answer.fieldId === field.id)}
                          disabled={readOnly || excluded}
                          attemptId={attempt.id}
                          onChange={(answer) =>
                            updateSubmission((draft) => {
                              const draftSubmission = draft.paperSubmissions.find((item) => item.paperId === paper.id);
                              if (!draftSubmission) return;
                              draftSubmission.answers = [
                                ...draftSubmission.answers.filter((item) => item.fieldId !== answer.fieldId),
                                answer
                              ];
                            })
                          }
                          onError={onError}
                        />
                      ))}
                    </div>
                  ))}
                </article>
              );
            })}
          </section>
        );
      })}

      <div className="sticky-actions">
        {!selectionValidation.valid ? (
          <div className="sticky-validation" role="status">
            <AlertCircle size={18} />
            <span>{selectionValidation.messages.join(" ")}</span>
          </div>
        ) : (
          <div className="sticky-validation ok" role="status">
            <Check size={18} />
            <span>Streichregeln fuer diesen Pruefungsteil sind erfuellt.</span>
          </div>
        )}
        <button className="danger-button" disabled={readOnly} onClick={() => void quitAttempt()}>
          <LogOut size={18} />
          Pruefung beenden
        </button>
        <button className="primary-button" disabled={readOnly || !selectionValidation.valid} onClick={() => void submitPaper()}>
          <Check size={18} />
          Pruefungsteil abgeben
        </button>
      </div>
    </section>
  );
}

function AnswerInput({
  field,
  answer,
  disabled,
  attemptId,
  onChange,
  onError
}: {
  field: AnswerField;
  answer?: Answer;
  disabled: boolean;
  attemptId: string;
  onChange: (answer: Answer) => void;
  onError: (message: string) => void;
}) {
  const base = { fieldId: field.id, type: field.type };

  if (field.type === "singleChoice" || field.type === "multipleChoice") {
    const value = Array.isArray(answer?.value) ? (answer.value as string[]) : [];
    return (
      <div className="choice-list">
        {(field.options ?? []).map((option) => {
          const checked = value.includes(option.id);
          return (
            <label key={option.id}>
              <input
                type={field.type === "singleChoice" ? "radio" : "checkbox"}
                name={field.id}
                disabled={disabled}
                checked={checked}
                onChange={() => {
                  const next =
                    field.type === "singleChoice"
                      ? [option.id]
                      : checked
                        ? value.filter((id) => id !== option.id)
                        : [...value, option.id].slice(0, field.maxSelect ?? 99);
                  onChange({ ...base, value: next });
                }}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    );
  }

  if (field.type === "shortTextList") {
    const values = Array.isArray(answer?.value) ? (answer.value as string[]) : Array(field.items ?? 3).fill("");
    return (
      <div className="list-input">
        {values.map((value, index) => (
          <input
            key={index}
            disabled={disabled}
            value={value}
            placeholder={`${index + 1}.`}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value;
              onChange({ ...base, value: next });
            }}
          />
        ))}
      </div>
    );
  }

  if (field.type === "table") {
    const rows = Array.isArray(answer?.value) ? (answer.value as Record<string, string>[]) : [];
    const rowCount = field.rows ?? 3;
    const columns = field.columns ?? [];
    return (
      <table className="answer-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.id}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column.id}>
                  <input
                    disabled={disabled}
                    value={rows[rowIndex]?.[column.id] ?? ""}
                    onChange={(event) => {
                      const next = Array.from({ length: rowCount }, (_, index) => ({ ...(rows[index] ?? {}) }));
                      next[rowIndex][column.id] = event.target.value;
                      onChange({ ...base, value: next });
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (field.type === "fileUpload" || field.type === "drawingUpload") {
    const files = answer?.files ?? [];
    return (
      <div className="upload-field">
        <label className="upload-button">
          <Upload size={16} />
          Datei anhaengen
          <input
            type="file"
            disabled={disabled}
            accept={field.acceptedMimeTypes?.join(",")}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void uploadFile(attemptId, field.id, file)
                .then((uploaded) =>
                  onChange({
                    ...base,
                    value: [...files.map((item) => item.name), uploaded.name],
                    files: [...files, uploaded]
                  })
                )
                .catch((error) => onError(error instanceof Error ? error.message : "Upload fehlgeschlagen."));
            }}
          />
        </label>
        {files.length ? <p>{files.map((file) => file.name).join(", ")}</p> : null}
      </div>
    );
  }

  if (field.type === "calculation") {
    return (
      <textarea
        disabled={disabled}
        rows={field.showWorkArea ? 5 : 2}
        value={String(answer?.value ?? "")}
        placeholder={field.unit ? `Rechenweg und Ergebnis in ${field.unit}` : "Rechenweg und Ergebnis"}
        onChange={(event) => onChange({ ...base, value: event.target.value })}
      />
    );
  }

  return (
    <textarea
      disabled={disabled}
      rows={field.type === "shortText" ? 2 : field.minLines ?? 5}
      value={String(answer?.value ?? "")}
      onChange={(event) => onChange({ ...base, value: event.target.value })}
    />
  );
}

function Content({ block }: { block: ContentBlock }) {
  if (block.type === "paragraph") return <p>{block.text}</p>;
  if (block.type === "list") {
    const List = block.ordered ? "ol" : "ul";
    return <List>{block.items.map((item) => <li key={item}>{item}</li>)}</List>;
  }
  if (block.type === "table") {
    return (
      <table className="content-table">
        <thead>
          <tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
      </table>
    );
  }
  if (block.type === "formula") return <code>{block.text}</code>;
  if (block.type === "pageBreak") return <hr />;
  return null;
}

function ResultView({ result }: { result: Result }) {
  return (
    <section className="result-view">
      <div className="surface surface-standard surface-stack-compact result-summary">
        <h2>Auswertung</h2>
        <p>{result.examId}</p>
        <strong>{result.weightedWrittenPercentage}%</strong>
        <span>
          {result.rawWrittenPointsAwarded}/{result.rawWrittenPointsPossible} Rohpunkte
        </span>
      </div>
      <div className="paper-results">
        {result.papers.map((paper) => (
          <article className="surface surface-compact surface-stack-compact paper-result" key={paper.paperId}>
            <h3>{paper.paperId}</h3>
            <p>
              {paper.pointsAwarded}/{paper.pointsPossible} Punkte, {paper.rawPercentage}%
            </p>
          </article>
        ))}
      </div>
      {result.needsManualReview ? (
        <div className="notice inline">
          <AlertCircle size={18} />
          Einige Bewertungen sollten manuell geprueft werden.
        </div>
      ) : null}
    </section>
  );
}

async function uploadFile(attemptId: string, fieldId: string, file: File): Promise<UploadFile> {
  const buffer = await file.arrayBuffer();
  const dataBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const response = await fetch(`/api/attempts/${attemptId}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fieldId, name: file.name, mimeType: file.type, dataBase64 })
  });
  const data = (await response.json()) as { file?: UploadFile; error?: string };
  if (!response.ok || !data.file) {
    throw new Error(data.error ?? "Upload fehlgeschlagen.");
  }
  return data.file;
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function statusLabel(status: GalleryCardModel["status"]) {
  const labels: Record<GalleryCardModel["status"], string> = {
    todo: "ToDo",
    failed: "Nicht bestanden",
    passed: "Bestanden"
  };
  return labels[status];
}

function statusClassName(status: GalleryCardModel["status"]) {
  return `status-${status}`;
}

createRoot(document.getElementById("root")!).render(<App />);
