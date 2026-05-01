## ADDED Requirements

### Requirement: Exam packages are stored independently
The system SHALL store each exam as an independent package directory containing a public manifest, a public exam definition, a private solution definition, optional assets, and validation output.

#### Scenario: Exam package is available
- **WHEN** an exam package is created
- **THEN** the package contains `manifest.json`, `exam.json`, and `solution.json`
- **AND** the package MAY contain `assets/` and `validation-report.json`

#### Scenario: Gallery reads lightweight metadata
- **WHEN** the gallery lists available exams
- **THEN** it can read `manifest.json` without loading `exam.json` or `solution.json`

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
The `solution.json` file SHALL store model answers, rubrics, alternative correct answers, scoring criteria, and grading guidance using IDs that reference existing papers, tasks, subtasks, and answer fields in `exam.json`.

#### Scenario: Solution references exam structure
- **WHEN** `solution.json` is validated
- **THEN** every rubric entry references an existing subtask ID from `exam.json`
- **AND** every rubric entry defines a maximum point value that does not exceed the referenced subtask maximum

### Requirement: Attempt data is separate from exam packages
The system SHALL store per-user or per-run answers, excluded tasks, uploads, progress, and submission timestamps in attempt data separate from `exam.json`.

#### Scenario: Student enters an answer
- **WHEN** a student saves text for an answer field
- **THEN** the value is stored in an attempt record keyed by the answer field ID
- **AND** `exam.json` remains unchanged

### Requirement: Result data is derived from grading
The system SHALL store grading output in result data separate from exam, solution, and attempt data.

#### Scenario: Attempt is graded
- **WHEN** grading completes for a submitted attempt
- **THEN** the system writes a result containing paper totals, task totals, subtask scores, feedback, confidence, and total percentage
- **AND** the attempt answers remain unchanged
