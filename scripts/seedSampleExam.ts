import fs from "node:fs/promises";
import path from "node:path";
import type { AnswerField, Exam, ExamPaper, Manifest, QuestionBlock, Rubric, Solution, Subtask, Task } from "../src/lib/examTypes";
import { dataDir, examPackageDir, solutionDir } from "../server/paths";
import { writeJson } from "../server/jsonStore";
import { validateExamPackage } from "../server/validation";

const examId = "mediengestalter-printmedien-sommer-2026";
const generatedBasis =
  "Generated from public ZFA/IHK-like structure, public topic list, and local research notes; not copied from protected original exam material.";

const pb2General = [
  ["Corporate Design Beratung", ["corporate-design", "beratung"], "Eine regionale Druckerei moechte ihr Erscheinungsbild vereinheitlichen."],
  ["Zielgruppenanalyse", ["zielgruppe", "analyse"], "Ein Kulturverein plant eine Informationskampagne fuer junge Erwachsene."],
  ["Logo-Entwurf", ["logo", "marke"], "Ein Start-up bittet um eine fachliche Einschaetzung zu einem neuen Logo."],
  ["Webseiten-Gestaltung", ["web", "gestaltung"], "Eine Landingpage wirkt unruhig und soll besser fuehren."],
  ["Flyer-Gestaltung", ["flyer", "layout"], "Ein zweiseitiger Veranstaltungsflyer soll lesbarer werden."],
  ["Schutzrechte", ["recht", "schutzrechte"], "Ein Kunde liefert Bild- und Schriftdaten fuer eine Kampagne."],
  ["Korrekturen durchfuehren", ["korrektur", "abstimmung"], "Ein Korrekturlauf enthaelt widerspruechliche Kundenanmerkungen."],
  ["Protokolle", ["protokoll", "kommunikation"], "Nach einer Entwurfsbesprechung soll ein Ergebnisprotokoll erstellt werden."]
] as const;

const pb2Print = [
  ["Gestaltungsraster", ["printmedien", "gestaltungsraster"], "Eine Magazin-Doppelseite benoetigt ein belastbares Gestaltungsraster."],
  ["Gestaltungsgrundsaetze anwenden", ["printmedien", "gestaltungsgrundsaetze"], "Eine Anzeige hat viele gleich starke Elemente und kaum Lesefuehrung."],
  ["Visuelle Zeichen", ["printmedien", "zeichen"], "Fuer ein Leitsystem sollen Piktogramme und Wortmarken kombiniert werden."],
  ["Gestaltung beurteilen", ["printmedien", "beurteilung"], "Ein Plakatentwurf soll fachlich beurteilt und verbessert werden."]
] as const;

const pb3General = [
  ["Feedback", ["feedback", "workflow"], "Ein Produktionsteam gibt Rueckmeldung zu fehlerhaften Layoutdaten."],
  ["HTML/CSS-Syntax", ["html", "css"], "Ein einfacher HTML/CSS-Ausschnitt fuer eine Produktseite enthaelt Fehler."],
  ["Druckverfahren", ["druckverfahren"], "Ein Kunde muss zwischen mehreren Druckverfahren entscheiden."],
  ["KI", ["ki", "produktion"], "Ein Bildmotiv wurde mit KI erstellt und soll in einer Kampagne genutzt werden."],
  ["Bildbeurteilung", ["bilddaten", "qualitaet"], "Mehrere Bilddaten sollen fuer Ausgabequalitaet beurteilt werden."],
  ["Medienneutrale Daten", ["daten", "medienneutral"], "Produktdaten sollen fuer Print und Web aus einer Quelle genutzt werden."],
  ["Englischsprachige Informationsquellen", ["englisch", "dokumentation"], "Ein technisches Datenblatt liegt nur auf Englisch vor."],
  ["Arbeitsdokumentation", ["dokumentation", "workflow"], "Ein Produktionsablauf soll nachvollziehbar dokumentiert werden."]
] as const;

const pb3Print = [
  ["Produktionsdaten aufbereiten", ["printmedien", "produktionsdaten"], "Eine Druckerei meldet Probleme in einer gelieferten PDF-Datei."],
  ["Druckbogen-Berechnung", ["printmedien", "druckbogen"], "Ein Falzprodukt soll mit Nutzen und Bogenzahl geplant werden."],
  ["Farbmanagement", ["printmedien", "farbmanagement"], "Daten aus RGB-Quellen sollen fuer den Offsetdruck vorbereitet werden."],
  ["Automatisierung", ["printmedien", "automatisierung"], "Wiederkehrende Preflight-Schritte sollen automatisiert werden."]
] as const;

async function main() {
  const manifest = createManifest();
  const exam = createExam();
  const solution = createSolution(exam);

  await fs.mkdir(path.join(examPackageDir(examId), "assets"), { recursive: true });
  await writeJson(path.join(examPackageDir(examId), "manifest.json"), manifest);
  await writeJson(path.join(examPackageDir(examId), "exam.json"), exam);
  await writeJson(path.join(solutionDir(examId), "solution.json"), solution);
  await writeJson(path.join(dataDir, "templates", "written-exam-template.json"), createExamTemplate());
  await writeJson(path.join(dataDir, "templates", "solution-template.json"), createSolutionTemplate());

  const report = await validateExamPackage(examId, true);
  if (!report.valid) {
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  }
}

function createManifest(): Manifest {
  return {
    schemaVersion: "1.0",
    id: examId,
    title: "Mediengestalter Printmedien Sommer 2026",
    type: "written-exam",
    profession: "mediengestalter-digital-print",
    specialization: "printmedien",
    status: "available",
    examVersion: "1.0.0",
    createdAt: "2026-05-01T00:00:00.000Z",
    examDate: "2026-05-06",
    summary: "Pruefungsnahe, original generierte schriftliche Uebungspruefung fuer PB4, PB2 und PB3.",
    contentPolicy: {
      sourceType: "original-generated",
      copyrightSafe: true,
      notDerivedFromProtectedExam: true,
      requiresManualRightsReview: false,
      notes:
        "Alle Aufgaben wurden neu erstellt und orientieren sich nur an oeffentlicher Struktur, Themenliste, Operatoren und Punkteformat."
    }
  };
}

function createExam(): Exam {
  return {
    schemaVersion: "1.0",
    id: examId,
    title: "Abschlusspruefung Uebung Sommer 2026 - Printmedien",
    profession: "mediengestalter-digital-print",
    specialization: "printmedien",
    ordinance: "2023-05-15",
    examDate: "2026-05-06",
    language: "de-DE",
    sources: [
      {
        label: "ZFA Pruefungsthemen Sommer 2026",
        url: "https://zfamedien.de/pruefungen/mediengestalter-digital-und-print-2023/pruefungsthemen-ap/"
      }
    ],
    papers: [createPb4(), createPb2(), createPb3()]
  };
}

function createPb4(): ExamPaper {
  const boundTasks = Array.from({ length: 18 }, (_, index) => {
    const taskNumber = index + 1;
    const fieldType = index % 3 === 0 ? "multipleChoice" : "singleChoice";
    return createChoiceTask({
      paperId: "PB4",
      blockId: "PB4-bound",
      number: `W${taskNumber}`,
      title: [
        "Ausbildungsvertrag",
        "Sozialversicherung",
        "Tarifvertrag",
        "Arbeitsschutz",
        "Mitbestimmung",
        "Markt und Preisbildung"
      ][index % 6],
      maxPoints: 40 / 15,
      fieldType,
      prompt:
        "Waehlen Sie die fachlich passende Antwort fuer die beschriebene betriebliche Situation aus."
    });
  });

  const openTasks = Array.from({ length: 6 }, (_, index) => {
    const number = index + 19;
    return createOpenTask({
      paperId: "PB4",
      number: `W${number}`,
      title: [
        "Rechte und Pflichten",
        "Kuendigungsschutz",
        "Wirtschaftskreislauf",
        "Nachhaltigkeit",
        "Steuern und Abgaben",
        "Betriebliche Organisation"
      ][index],
      maxPoints: 12,
      prompt:
        "Beschreiben Sie die wesentlichen Punkte der Situation und leiten Sie eine begruendete Handlungsempfehlung ab.",
      answerFieldType: "longText"
    });
  });

  return {
    id: "PB4",
    title: "Wirtschafts- und Sozialkunde",
    durationMinutes: 60,
    weightPercent: 10,
    order: 1,
    maxPoints: 100,
    schedule: { startsAt: "08:00", endsAt: "09:00" },
    allowedAids: ["eventuell mitgelieferte Gesetzesauszuege"],
    instructions: [
      { type: "paragraph", text: "Bearbeiten Sie 15 der gebundenen Aufgaben und 5 der offenen Aufgaben." }
    ],
    blocks: [
      {
        id: "PB4-bound",
        title: "Gebundene Aufgaben",
        scope: "wiso-bound",
        offeredCount: 18,
        requiredCount: 15,
        defaultDropPolicy: "last-if-unclear",
        tasks: boundTasks
      },
      {
        id: "PB4-open",
        title: "Ungebundene Aufgaben",
        scope: "wiso-open",
        offeredCount: 6,
        requiredCount: 5,
        defaultDropPolicy: "last-if-unclear",
        tasks: openTasks
      }
    ]
  };
}

function createPb2(): ExamPaper {
  return createStructuredPaper(
    "PB2",
    "Medien konzipieren, gestalten und praesentieren",
    2,
    "09:15",
    "11:15",
    pb2General,
    pb2Print,
    "Beurteilen Sie die Situation aus gestalterischer und konzeptioneller Sicht.",
    "drawingUpload"
  );
}

function createPb3(): ExamPaper {
  return createStructuredPaper(
    "PB3",
    "Medien produzieren",
    3,
    "11:45",
    "13:45",
    pb3General,
    pb3Print,
    "Analysieren Sie die Produktionssituation und beschreiben Sie geeignete technische Massnahmen.",
    "fileUpload"
  );
}

function createStructuredPaper(
  paperId: "PB2" | "PB3",
  title: string,
  order: number,
  startsAt: string,
  endsAt: string,
  generalTopics: readonly (readonly [string, readonly string[], string])[],
  specializationTopics: readonly (readonly [string, readonly string[], string])[],
  instruction: string,
  uploadType: "fileUpload" | "drawingUpload"
): ExamPaper {
  const generalTasks = generalTopics.map(([taskTitle, tags, scenario], index) =>
    createTenPointTask({
      paperId,
      number: `U${index + 1}`,
      title: taskTitle,
      tags: [...tags],
      scenario,
      uploadField: false
    })
  );
  const specializationTasks = specializationTopics.map(([taskTitle, tags, scenario], index) =>
    createTenPointTask({
      paperId,
      number: `U${index + 9}`,
      title: taskTitle,
      tags: [...tags],
      scenario,
      uploadField: index === 0,
      uploadType
    })
  );

  return {
    id: paperId,
    title,
    durationMinutes: 120,
    weightPercent: 20,
    order,
    maxPoints: 100,
    schedule: { startsAt, endsAt },
    allowedAids: [
      "nicht programmierter, netzunabhaengiger Taschenrechner",
      "Rechtschreib-Nachschlagewerk",
      "Woerterbuch Englisch-Deutsch / Deutsch-Englisch"
    ],
    instructions: [
      {
        type: "paragraph",
        text:
          "Bearbeiten Sie 7 Aufgaben aus U1 bis U8 und 3 Aufgaben aus U9 bis U12. Streichen Sie je Block genau eine Aufgabe."
      },
      { type: "paragraph", text: instruction }
    ],
    blocks: [
      {
        id: `${paperId}-general`,
        title: "Fachrichtungsuebergreifende Aufgaben",
        scope: "general",
        questionRange: "U1-U8",
        offeredCount: 8,
        requiredCount: 7,
        defaultDropPolicy: "last-if-unclear",
        tasks: generalTasks
      },
      {
        id: `${paperId}-printmedien`,
        title: "Fachrichtungsspezifische Aufgaben Printmedien",
        scope: "specialization",
        questionRange: "U9-U12",
        offeredCount: 4,
        requiredCount: 3,
        defaultDropPolicy: "last-if-unclear",
        tasks: specializationTasks
      }
    ]
  };
}

function createChoiceTask(args: {
  paperId: "PB4";
  blockId: string;
  number: string;
  title: string;
  maxPoints: number;
  fieldType: "singleChoice" | "multipleChoice";
  prompt: string;
}): Task {
  const id = `${args.paperId}-${args.number}`;
  return {
    id,
    number: args.number,
    title: args.title,
    topicTags: ["wiso", slug(args.title)],
    maxPoints: args.maxPoints,
    estimatedMinutes: 2,
    prompt: [
      { type: "paragraph", text: `Situation: ${args.title} im Ausbildungsbetrieb.` },
      { type: "paragraph", text: args.prompt }
    ],
    subtasks: [
      {
        id: `${id}-a`,
        label: "a",
        operator: "auswaehlen",
        prompt: [{ type: "paragraph", text: "Waehlen Sie die zutreffende Aussage aus." }],
        maxPoints: args.maxPoints,
        answerFields: [
          {
            id: `${id}-a-answer`,
            type: args.fieldType,
            options: [
              { id: "a", label: "Die Entscheidung richtet sich nach betrieblichen und rechtlichen Vorgaben." },
              { id: "b", label: "Der Betrieb kann gesetzliche Schutzvorschriften beliebig aussetzen." },
              { id: "c", label: "Die Regelung gilt nur, wenn sie nicht schriftlich dokumentiert wurde." },
              { id: "d", label: "Private Absprachen ersetzen grundsaetzlich gesetzliche Pflichten." }
            ],
            minSelect: args.fieldType === "multipleChoice" ? 1 : undefined,
            maxSelect: args.fieldType === "multipleChoice" ? 2 : undefined
          }
        ]
      }
    ],
    provenance: provenance()
  };
}

function createOpenTask(args: {
  paperId: "PB4";
  number: string;
  title: string;
  maxPoints: number;
  prompt: string;
  answerFieldType: "longText";
}): Task {
  const id = `${args.paperId}-${args.number}`;
  return {
    id,
    number: args.number,
    title: args.title,
    topicTags: ["wiso", slug(args.title)],
    maxPoints: args.maxPoints,
    estimatedMinutes: 8,
    prompt: [
      { type: "paragraph", text: `Eine Auszubildende fragt nach einer Einschaetzung zum Thema ${args.title}.` },
      { type: "paragraph", text: args.prompt }
    ],
    subtasks: [
      {
        id: `${id}-a`,
        label: "a",
        operator: "erlaeutern",
        prompt: [{ type: "paragraph", text: "Erlauetern Sie Ihre Antwort mit Bezug zur betrieblichen Praxis." }],
        maxPoints: args.maxPoints,
        answerFields: [{ id: `${id}-a-answer`, type: args.answerFieldType, minLines: 5, maxLines: 12 }]
      }
    ],
    provenance: provenance()
  };
}

function createTenPointTask(args: {
  paperId: "PB2" | "PB3";
  number: string;
  title: string;
  tags: string[];
  scenario: string;
  uploadField: boolean;
  uploadType?: "fileUpload" | "drawingUpload";
}): Task {
  const id = `${args.paperId}-${args.number}`;
  const uploadField: AnswerField = {
    id: `${id}-b-upload`,
    type: args.uploadType ?? "fileUpload",
    acceptedMimeTypes: ["image/png", "image/jpeg", "application/pdf"]
  };
  const bFields: AnswerField[] = args.uploadField
    ? [
        { id: `${id}-b-answer`, type: "longText", minLines: 4, maxLines: 10 },
        uploadField
      ]
    : [{ id: `${id}-b-answer`, type: "longText", minLines: 4, maxLines: 10 }];

  return {
    id,
    number: args.number,
    title: args.title,
    topicTags: args.tags,
    maxPoints: 10,
    estimatedMinutes: 12,
    prompt: [
      { type: "paragraph", text: args.scenario },
      {
        type: "paragraph",
        text: "Bearbeiten Sie die Teilaufgaben vollstaendig und begruenden Sie fachliche Entscheidungen nachvollziehbar."
      }
    ],
    subtasks: [
      {
        id: `${id}-a`,
        label: "a",
        operator: "nennen",
        prompt: [{ type: "paragraph", text: "Nennen Sie vier relevante fachliche Kriterien oder Pruefpunkte. (4 Punkte)" }],
        maxPoints: 4,
        answerFields: [{ id: `${id}-a-answer`, type: "shortTextList", items: 4 }]
      },
      {
        id: `${id}-b`,
        label: "b",
        operator: args.paperId === "PB2" ? "beurteilen" : "beschreiben",
        prompt: [
          {
            type: "paragraph",
            text:
              args.paperId === "PB2"
                ? "Beurteilen Sie die Situation und formulieren Sie zwei begruendete Verbesserungen. (6 Punkte)"
                : "Beschreiben Sie geeignete technische Massnahmen und begruenden Sie diese. (6 Punkte)"
          }
        ],
        maxPoints: 6,
        answerFields: bFields
      }
    ],
    provenance: provenance()
  };
}

function createSolution(exam: Exam): Solution {
  const rubrics: Rubric[] = [];
  for (const paper of exam.papers) {
    for (const block of paper.blocks) {
      for (const task of block.tasks) {
        for (const subtask of task.subtasks) {
          rubrics.push(createRubric(task.title, subtask));
        }
      }
    }
  }
  return {
    schemaVersion: "1.0",
    examId: exam.id,
    visibility: "private",
    gradingMode: "criteria-keyword-assisted",
    rubrics
  };
}

function createRubric(taskTitle: string, subtask: Subtask): Rubric {
  if (subtask.operator === "auswaehlen") {
    return {
      subtaskId: subtask.id,
      maxPoints: subtask.maxPoints,
      modelAnswer: "Option a ist fachlich passend.",
      criteria: [
        {
          id: "c1",
          points: subtask.maxPoints,
          description: "Die zutreffende Antwortoption wurde gewaehlt.",
          keywords: ["a"]
        }
      ]
    };
  }
  const baseKeywords = [
    slug(taskTitle).replaceAll("-", " "),
    "zielgruppe",
    "begruendung",
    "workflow",
    "recht",
    "druck",
    "farbe",
    "layout",
    "daten",
    "qualitaet"
  ];
  if (subtask.maxPoints <= 3) {
    return {
      subtaskId: subtask.id,
      maxPoints: subtask.maxPoints,
      modelAnswer: `Fachlich passende Antwort zu ${taskTitle}.`,
      criteria: [
        {
          id: "c1",
          points: subtask.maxPoints,
          description: "Die Antwort trifft die fachliche Kernaussage.",
          keywords: baseKeywords
        }
      ]
    };
  }
  return {
    subtaskId: subtask.id,
    maxPoints: subtask.maxPoints,
    modelAnswer: `Eine vollstaendige Antwort nennt passende Aspekte zu ${taskTitle}, wendet sie auf die Situation an und begruendet die Entscheidung.`,
    alternativeCorrectAnswers: ["sinngemaesse fachlich korrekte Begruendung"],
    gradingNotes: "Keine Original-IHK-Loesung. Kriterien dienen einer transparenten Uebungsbewertung.",
    criteria: [
      {
        id: "c1",
        points: Math.round(subtask.maxPoints * 0.4 * 100) / 100,
        description: "Fachbegriffe und Kriterien sind korrekt genannt.",
        keywords: baseKeywords
      },
      {
        id: "c2",
        points: Math.round(subtask.maxPoints * 0.35 * 100) / 100,
        description: "Die Antwort wird auf die berufliche Situation angewendet.",
        keywords: ["kunde", "betrieb", "produkt", "situation", "daten", "entwurf", "produktion"]
      },
      {
        id: "c3",
        points: Math.round(subtask.maxPoints * 0.25 * 100) / 100,
        description: "Die Entscheidung oder Massnahme wird nachvollziehbar begruendet.",
        keywords: ["weil", "dadurch", "deshalb", "begruendung", "wirkung", "vermeiden", "sicherstellen"],
        manualReviewIfMissing: true
      }
    ]
  };
}

function createExamTemplate() {
  return {
    schemaVersion: "1.0",
    id: "mediengestalter-printmedien-<season>",
    title: "Abschlusspruefung Uebung <season> - Printmedien",
    profession: "mediengestalter-digital-print",
    specialization: "printmedien",
    ordinance: "2023-05-15",
    language: "de-DE",
    papers: [
      { id: "PB4", title: "Wirtschafts- und Sozialkunde", durationMinutes: 60, weightPercent: 10, order: 1, instructions: [], blocks: [] },
      { id: "PB2", title: "Medien konzipieren, gestalten und praesentieren", durationMinutes: 120, weightPercent: 20, order: 2, instructions: [], blocks: [] },
      { id: "PB3", title: "Medien produzieren", durationMinutes: 120, weightPercent: 20, order: 3, instructions: [], blocks: [] }
    ]
  };
}

function createSolutionTemplate() {
  return {
    schemaVersion: "1.0",
    examId: "mediengestalter-printmedien-<season>",
    visibility: "private",
    gradingMode: "criteria-keyword-assisted",
    rubrics: []
  };
}

function provenance() {
  return {
    sourceType: "original-generated" as const,
    basis: generatedBasis,
    notDerivedFromProtectedExam: true,
    rightsStatus: "generated" as const,
    requiresManualRightsReview: false
  };
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
