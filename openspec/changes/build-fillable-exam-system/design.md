## Context

The workspace currently contains research notes for the written Mediengestalter Digital und Print, Fachrichtung Printmedien exam structure. The target system needs to turn that structure into app-renderable exam packages while keeping legally protected original IHK/ZFA/Christiani content out of generated data.

The written exam flow is PB4, PB2, then PB3. PB1 is practical and is not part of this written app flow. PB2 and PB3 each contain U1-U8 general tasks and U9-U12 Printmedien tasks, with 7 of 8 general tasks and 3 of 4 specialization tasks to be evaluated. The app must store attempts separately so per-user exclusions, text answers, and uploads do not mutate the exam definition.

## Goals / Non-Goals

**Goals:**

- Store each exam as an individual JSON-based package.
- Provide a reusable schema/template that guides future exam creation.
- Render available exams in a gallery with status and grading summary.
- Guide a candidate through PB4, PB2, and PB3 one paper at a time.
- Enforce allowed task exclusions during the exam attempt.
- Store text answers and sketch/file uploads outside the exam definition.
- Generate a private solution/rubric file for each generated exam in server-only/skill-only storage.
- Grade submitted attempts using exam, solution, and attempt data and produce a result file.
- Preserve legal guardrails by generating original exam-like content, not copied protected exam material.

**Non-Goals:**

- Importing or distributing copyrighted original IHK/ZFA/Christiani exams.
- Implementing PB1 practical exam workflows.
- Guaranteeing official IHK Rheinhessen grading equivalence; the workflow aims for a close, transparent simulation.
- Building a full LMS, user management system, or multi-user synchronization layer.
- Supporting real-time collaborative exam taking.

## Decisions

### Use exam package directories

Each public exam will live in its own directory, while the private solution is stored outside the public package:

```text
data/exams/mediengestalter-printmedien-sommer-2026/
  manifest.json
  exam.json
  assets/
  validation-report.json

data/private/solutions/mediengestalter-printmedien-sommer-2026/
  solution.json
```

Rationale: A public directory package keeps renderable exam data and assets together without forcing every app view to load the full exam. The solution package is version-linked by exam ID but kept outside static/client-served exam data. A single large JSON file would simplify transport but would make access control and gallery loading unsafe.

### Separate exam, solution, attempt, and result data

The system will use four distinct data types:

- `exam.json`: public renderable exam structure and prompts.
- `solution.json`: private rubric and expected answer guidance in server-only/skill-only storage.
- `attempt.json`: user-specific exclusions, answers, uploads, and submission status.
- `result.json`: derived grading output.

Rationale: This avoids leaking solutions into the student-facing app and keeps attempts immutable against the source exam. It also allows repeated attempts against the same exam package.

### Keep solutions out of client and public asset paths

`solution.json` must never be served through public asset routes, bundled into the client app, or referenced by gallery/exam-rendering routes. Only exam authoring, package validation, and grading workflows may read private solution data.

Rationale: Storing the private solution near public exam data is not sufficient protection if the app later serves `data/exams/` statically. The architecture must make solution access impossible from normal student-facing code paths.

### Treat task exclusions as attempt state

The exam definition stores selection rules. The attempt stores the user's excluded task IDs per paper/block.

Rationale: Exclusions are not properties of the exam. They are user choices that determine which tasks are evaluated. Storing them blockwise makes the PB2/PB3 7+3 rule enforceable and auditable.

### Use structured content blocks and answer fields

Prompts will be represented as structured content blocks rather than one Markdown string. Answer areas will be represented as field definitions such as `singleChoice`, `multipleChoice`, `longText`, `shortTextList`, `table`, `calculation`, `fileUpload`, and `drawingUpload`.

Rationale: Real exam tasks include paragraphs, lists, tables, images, attachments, calculations, and sketch uploads. Structured blocks make rendering, validation, and later grading more reliable.

### Generate and validate with Codex skills plus schemas

The desired workflow is:

```text
create-exam skill -> public exam package + private solution package
                  -> validate package
                  -> app attempt
                  -> grade skill
                  -> result
```

Rationale: A creation skill can enforce domain-specific structure and legal guardrails, while JSON Schemas and validation reports make the output deterministic enough for an app to trust.

### Grade per subtask and rubric criterion

The grading workflow should evaluate each submitted subtask against private `solution.json`, then aggregate task, paper, raw written totals, and weighted written totals. Each evaluated subtask should include awarded points, max points, brief feedback, confidence, and a manual-review flag.

Rationale: Open written tasks are not reliably graded by a single holistic score. Criterion-level scoring gives traceability and makes uncertain grading visible. Weighting must remain explicit because PB4, PB2, and PB3 do not contribute equally to the overall written exam result.

### Enforce content compliance as data and workflow

Exam packages will include content-policy metadata and asset rights metadata. The creation skill must generate original content from structure and topics rather than copying or closely paraphrasing protected source material.

Rationale: The project can imitate public structure, timing, topic distribution, operators, and point logic, but must not ship protected original tasks, images, layouts, or answer keys without confirmed rights. Compliance validation is metadata-driven and can flag risk; it cannot prove legal originality by itself.

## Risks / Trade-offs

- Official grading is not public -> Mitigation: store transparent rubrics, confidence, and manual-review flags instead of claiming exact official equivalence.
- JSON can become verbose -> Mitigation: keep templates and schemas strict, and use `manifest.json` for lightweight gallery reads.
- File uploads complicate storage -> Mitigation: store upload metadata in attempts and keep binary files in attempt-specific upload directories.
- Student-facing app could accidentally load `solution.json` -> Mitigation: store solutions outside public exam packages, exclude them from client bundles and static routes, never reference them from normal rendering routes, and validate that `exam.json` contains no solution/rubric fields.
- Generated tasks may drift from exam style -> Mitigation: creation skill uses the research files, schema checks, and validation rules for PB4/PB2/PB3 structure and point totals.
- User-provided protected material may be added -> Mitigation: require explicit rights metadata and mark packages requiring license review when user-provided content is used.
