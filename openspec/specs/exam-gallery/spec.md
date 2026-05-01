# exam-gallery Specification

## Purpose
TBD - created by archiving change build-fillable-exam-system. Update Purpose after archive.
## Requirements
### Requirement: Gallery lists available exams
The system SHALL provide a main gallery that lists all available exam packages using manifest and attempt/result state.

#### Scenario: Exam has no attempt
- **WHEN** the gallery loads an exam with no matching attempt
- **THEN** the card shows the exam ID, status `ToDo`, no score, and a `Pruefen` action

#### Scenario: Exam has an in-progress attempt
- **WHEN** the gallery loads an exam with an attempt that is not fully submitted
- **THEN** the card does not show a `Fortsetzen` action
- **AND** the card shows status `ToDo`, no score, and a `Pruefen` action

### Requirement: Gallery cards show grading summary
The system SHALL show the weighted written percentage and point totals on gallery cards when a result exists for an exam attempt.

#### Scenario: Graded result exists
- **WHEN** the gallery loads an exam with a graded result
- **THEN** the card shows the weighted written percentage score
- **AND** the card shows awarded points and possible points in `.../...` format

### Requirement: Gallery actions reflect exam state
The system SHALL derive the primary gallery card action from the latest attempt and result state independently from the visible completion status.

#### Scenario: Submitted attempt is ready for grading
- **WHEN** an exam attempt has status `submitted` and no result
- **THEN** the card shows status `ToDo`
- **AND** the card shows a `Prompt kopieren` action
- **AND** activating the action copies a Codex prompt that references the grading skill and the saved attempt data

#### Scenario: Grading prompt is copied
- **WHEN** the user copies the grading prompt
- **THEN** the app gives visible feedback that copying succeeded
- **AND** the prompt instructs Codex to use the private grading workflow without exposing `solution.json` in the client

#### Scenario: Result exists
- **WHEN** an exam attempt has a result
- **THEN** the card shows an `Ergebnis anzeigen` action
- **AND** the visible status is derived from the result percentage

### Requirement: Gallery does not expose private solutions
The gallery SHALL NOT load, bundle, link, route, or expose private `solution.json`.

#### Scenario: Gallery renders cards
- **WHEN** the gallery renders available exams
- **THEN** it reads manifest, attempt, and result metadata only
- **AND** it does not request or display private solution content

#### Scenario: Public exam packages are served
- **WHEN** exam package assets are available to the gallery
- **THEN** private solution files are not present in those public routes or client bundles

### Requirement: Gallery status shows completion outcome
The gallery SHALL display completion-oriented status labels instead of workflow-state labels.

#### Scenario: No result exists
- **WHEN** the gallery card has no result data
- **THEN** the visible status is `ToDo`
- **AND** the visible status is styled blue

#### Scenario: Result is below pass threshold
- **WHEN** the gallery card has a result with `weightedWrittenPercentage` below 50
- **THEN** the visible status is `Nicht bestanden`
- **AND** the visible status is styled red

#### Scenario: Result meets pass threshold
- **WHEN** the gallery card has a result with `weightedWrittenPercentage` greater than or equal to 50
- **THEN** the visible status is `Bestanden`
- **AND** the visible status is styled green

### Requirement: Unavailable gallery statistics use placeholders
The gallery SHALL display `-` for score and point statistics that are not available yet.

#### Scenario: Exam has not been graded
- **WHEN** the gallery card has no result data
- **THEN** the `Bewertung` value is `-`
- **AND** the `Punkte` value is `-`

