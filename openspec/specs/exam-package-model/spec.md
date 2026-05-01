# exam-package-model Specification

## Purpose
TBD - created by archiving change build-fillable-exam-system. Update Purpose after archive.
## Requirements
### Requirement: Public exam packages are stored independently
The system SHALL store each public exam as an independent package directory containing a public manifest, a public exam definition, optional public assets, and validation output.

#### Scenario: Exam package is available
- **WHEN** an exam package is created
- **THEN** the public package contains `manifest.json` and `exam.json`
- **AND** the public package MAY contain `assets/` and `validation-report.json`
- **AND** the public package does not contain `solution.json`

#### Scenario: Gallery reads lightweight metadata
- **WHEN** the gallery lists available exams
- **THEN** it can read `manifest.json` without loading `exam.json` or `solution.json`

### Requirement: Private solutions are stored outside public exam packages
The system SHALL store `solution.json` in server-only or skill-only storage outside public exam package directories and outside client bundles.

#### Scenario: Student-facing app loads public exam data
- **WHEN** the student-facing app loads a public exam package
- **THEN** it cannot fetch `solution.json` from the package directory, public asset routes, or client bundle

#### Scenario: Grading workflow loads solution data
- **WHEN** the grading workflow evaluates a submitted attempt
- **THEN** it loads the matching private solution by exam ID from server-only or skill-only storage

### Requirement: Exam definition contains only renderable public content
The `exam.json` file SHALL contain only the public exam structure, instructions, prompts, materials, point values, selection rules, and answer field definitions required to render the fillable exam.

#### Scenario: Student opens exam
- **WHEN** the app renders an exam from `exam.json`
- **THEN** the student sees papers, tasks, subtasks, materials, point values, and answer fields
- **AND** the student does not receive rubrics, model answers, or grading criteria

#### Scenario: Public exam is validated
- **WHEN** `exam.json` is validated
- **THEN** validation fails if solution, rubric, expected-answer, or awarded-point fields are present

### Requirement: Written Printmedien exam structure is represented
The `exam.json` file SHALL represent the written exam as PB4, PB2, and PB3, excluding PB1 from the written flow.

#### Scenario: Written exam papers are loaded
- **WHEN** the app loads a Mediengestalter Printmedien written exam
- **THEN** the exam contains PB4, PB2, and PB3 in sequence
- **AND** PB1 is not included as a written paper

### Requirement: PB4 structure is explicit
The `exam.json` file SHALL define PB4 with duration, weight, maximum points, one or more question blocks, answer field definitions, and explicit selection rules for any optional tasks.

#### Scenario: PB4 paper is validated
- **WHEN** PB4 is validated
- **THEN** it defines a 60 minute duration
- **AND** it defines a 10 percent exam weight
- **AND** it defines one or more blocks with tasks and answer fields

#### Scenario: PB4 block has optional tasks
- **WHEN** a PB4 block allows candidates to leave tasks unselected
- **THEN** the block defines offered task count, required task count, and fallback behavior if the selection is unclear

#### Scenario: PB4 contains bound and open tasks
- **WHEN** PB4 contains bound and open tasks
- **THEN** the exam definition supports single-choice, multiple-choice, short-text, and long-text answer fields as needed

### Requirement: PB2 and PB3 selection blocks are explicit
The `exam.json` file SHALL define PB2 and PB3 with a general block U1-U8 requiring 7 tasks and a Printmedien block U9-U12 requiring 3 tasks.

#### Scenario: PB2 selection rules are validated
- **WHEN** PB2 is validated
- **THEN** it contains one general block with 8 offered tasks and 7 required tasks
- **AND** it contains one Printmedien block with 4 offered tasks and 3 required tasks

#### Scenario: PB3 selection rules are validated
- **WHEN** PB3 is validated
- **THEN** it contains one general block with 8 offered tasks and 7 required tasks
- **AND** it contains one Printmedien block with 4 offered tasks and 3 required tasks

### Requirement: Task points are machine-checkable
The `exam.json` file SHALL define maximum points for every task and subtask, and the sum of subtask points SHALL equal the task maximum.

#### Scenario: PB2 task is validated
- **WHEN** a PB2 task is validated
- **THEN** the task has `maxPoints` of 10
- **AND** its subtask point total equals 10

#### Scenario: PB3 task is validated
- **WHEN** a PB3 task is validated
- **THEN** the task has `maxPoints` of 10
- **AND** its subtask point total equals 10

### Requirement: Solution definition is private and references exam IDs
The private `solution.json` file SHALL store model answers, rubrics, alternative correct answers, scoring criteria, and grading guidance using IDs that reference existing papers, tasks, subtasks, and answer fields in `exam.json`.

#### Scenario: Solution references exam structure
- **WHEN** `solution.json` is validated
- **THEN** every rubric entry references an existing subtask ID from `exam.json`
- **AND** every rubric entry defines a maximum point value that does not exceed the referenced subtask maximum

### Requirement: Attempt data is separate from exam packages
The system SHALL store completed per-run answers, excluded tasks, uploads, progress, and submission timestamps in attempt data separate from `exam.json`, while in-progress work remains transient until full completion.

#### Scenario: Student enters an answer
- **WHEN** a student types text for an answer field during an in-progress attempt
- **THEN** the value is stored in the active attempt session keyed by the answer field ID
- **AND** `exam.json` remains unchanged
- **AND** the system does not write or update a durable attempt record only because the value changed

#### Scenario: Student completes the written exam
- **WHEN** the student submits the final configured paper
- **THEN** the system writes a durable attempt record containing the completed per-run answers, excluded tasks, uploads, progress, and submission timestamps
- **AND** the attempt data remains separate from `exam.json`

#### Scenario: Student leaves before completion
- **WHEN** the browser closes or crashes before the final configured paper is submitted
- **THEN** no durable attempt record is written for the in-progress answers

### Requirement: Result data is derived from grading
The system SHALL store grading output in result data separate from exam, solution, and attempt data.

#### Scenario: Attempt is graded
- **WHEN** grading completes for a submitted attempt
- **THEN** the system writes a result containing paper totals, task totals, subtask scores, feedback, confidence, raw percentages, and weighted written percentage
- **AND** the attempt answers remain unchanged

