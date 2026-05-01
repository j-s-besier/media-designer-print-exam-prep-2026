## 1. Data Model and Schemas

- [x] 1.1 Create the `data/` directory structure for public exam packages, private solution packages, attempts, results, schemas, templates, and assets.
- [x] 1.2 Define `exam.schema.json` for public exam metadata, PB4/PB2/PB3 papers, blocks, tasks, subtasks, content blocks, materials, selection rules, and answer fields.
- [x] 1.3 Define `solution.schema.json` for private rubrics, model-answer guidance, scoring criteria, alternative answers, confidence guidance, and manual-review rules.
- [x] 1.4 Define `attempt.schema.json` for attempt status, paper submissions, block-level excluded task IDs, answers keyed by field ID, upload references, and timestamps.
- [x] 1.5 Define `result.schema.json` for paper totals, task totals, subtask scores, feedback, confidence, manual-review flags, raw written totals, weighted written totals, and percentages.
- [x] 1.6 Define `manifest.schema.json` for gallery metadata, exam identity, versioning, status, and content-policy metadata.
- [x] 1.7 Create reusable JSON templates for a public Mediengestalter Printmedien written exam package and a private solution package.

## 2. Exam Package Validation

- [x] 2.1 Implement package validation that checks public package files `manifest.json` and `exam.json`, plus the matching private `solution.json` in server-only/skill-only storage.
- [x] 2.2 Validate that written exams contain PB4, PB2, and PB3 in sequence and do not include PB1 in the written flow.
- [x] 2.3 Validate that PB4 has explicit blocks, point totals, selection rules when optional tasks exist, and supported answer field types for bound and open tasks.
- [x] 2.4 Validate that PB2 and PB3 each contain U1-U8 general blocks requiring 7 of 8 tasks and U9-U12 Printmedien blocks requiring 3 of 4 tasks.
- [x] 2.5 Validate that every PB2/PB3 task has 10 points and that subtask points sum to the task maximum.
- [x] 2.6 Validate that every answer field ID is unique and every attempt/solution reference points to an existing exam field or subtask.
- [x] 2.7 Validate that `exam.json` contains no solution, rubric, model-answer, or awarded-point data.
- [x] 2.8 Validate content-compliance provenance metadata and flag missing rights metadata, forbidden protected-source provenance, and uncertain packages requiring manual rights review.

## 3. Exam Creation Skill

- [x] 3.1 Create the `create-ihk-printmedien-exam` Codex skill scaffold.
- [x] 3.2 Add references for the researched written exam structure and Sommer 2026 Printmedien topic list.
- [x] 3.3 Implement skill instructions to generate original exam-like tasks from public structure and topic guidance, not copied protected material.
- [x] 3.4 Implement skill instructions to generate public `manifest.json`, public `exam.json`, private `solution.json`, assets metadata, and validation output together.
- [x] 3.5 Add explicit compliance guardrails for IHK/ZFA/Christiani material and user-provided materials.
- [x] 3.6 Validate a generated sample package against all schemas and structural rules.

## 4. Gallery UI

- [x] 4.1 Implement exam discovery from package manifests.
- [x] 4.2 Implement gallery cards showing exam ID, title, status, percentage result, and awarded/possible points.
- [x] 4.3 Derive card status from latest attempt and result state: `not-started`, `in-progress`, `submitted`, `grading-ready`, and `graded`.
- [x] 4.4 Implement primary gallery actions: `Pruefen`, `Fortsetzen`, `Auswerten`, and `Ergebnis anzeigen`.
- [x] 4.5 Ensure the gallery never loads, bundles, routes, links, or exposes private `solution.json`.

## 5. Exam Taking Flow

- [x] 5.1 Implement attempt creation when a user starts an exam.
- [x] 5.2 Render PB4, PB2, and PB3 sequentially according to `exam.json`.
- [x] 5.3 Render content blocks, materials, point values, subtasks, and answer fields.
- [x] 5.4 Implement single-choice, multiple-choice, text, list, table, calculation, file upload, and drawing/sketch upload answer fields.
- [x] 5.5 Store all answers in attempt data keyed by answer field ID without modifying `exam.json`.
- [x] 5.6 Implement block-level task exclusion controls for PB2/PB3.
- [x] 5.7 Block paper submission when the user excludes too few or too many tasks for any block.
- [x] 5.8 Store excluded task IDs per paper and block in attempt data.
- [x] 5.9 Lock a paper after submission and advance to the next paper.
- [x] 5.10 Show the final completion popup after the last paper is submitted and return to the gallery.

## 6. Grading Skill and Results

- [x] 6.1 Create the `grade-ihk-printmedien-exam` Codex skill scaffold.
- [x] 6.2 Implement grading workflow instructions to load public `exam.json`, private `solution.json`, and a submitted attempt.
- [x] 6.3 Enforce excluded-task handling so excluded tasks are ignored and marked as excluded in the result.
- [x] 6.4 Implement deterministic handling for missing or invalid exclusions based on fallback policy or manual-review flagging.
- [x] 6.5 Score answers at subtask level against solution rubrics and record awarded points, feedback, confidence, and manual-review flags.
- [x] 6.6 Aggregate subtask scores into task, paper, raw written totals, weighted written percentage, and full-exam written contribution excluding PB1.
- [x] 6.7 Write `result.json` without mutating exam, solution, or attempt data.
- [x] 6.8 Ensure result data supports gallery display of weighted written percentage and awarded/possible points.

## 7. Tests and Verification

- [x] 7.1 Add schema validation tests for valid and invalid exam packages.
- [x] 7.2 Add tests for PB2/PB3 block selection enforcement and excluded-task attempt storage.
- [x] 7.3 Add tests that submitted papers become read-only in the normal exam flow.
- [x] 7.4 Add tests that gallery card state changes correctly across no attempt, in-progress, submitted, and graded states.
- [x] 7.5 Add grading tests that excluded tasks are ignored and raw/weighted totals are calculated from evaluated tasks only.
- [x] 7.6 Add compliance tests that fail packages containing solution fields in `exam.json`, public solution routes, forbidden protected-source provenance, or missing asset rights metadata.
- [x] 7.7 Add PB4 rendering and validation tests for bound and open tasks.
- [x] 7.8 Run an end-to-end sample: create exam package, render attempt, submit PB4/PB2/PB3, grade, and display result.
