## ADDED Requirements

### Requirement: Gallery lists available exams
The system SHALL provide a main gallery that lists all available exam packages using manifest and attempt/result state.

#### Scenario: Exam has no attempt
- **WHEN** the gallery loads an exam with no matching attempt
- **THEN** the card shows the exam ID, status `not-started`, no score, and a `Pruefen` action

#### Scenario: Exam has an in-progress attempt
- **WHEN** the gallery loads an exam with an attempt that is not fully submitted
- **THEN** the card shows status `in-progress` and a `Fortsetzen` action

### Requirement: Gallery cards show grading summary
The system SHALL show percentage and point totals on gallery cards when a result exists for an exam attempt.

#### Scenario: Graded result exists
- **WHEN** the gallery loads an exam with a graded result
- **THEN** the card shows the percentage score
- **AND** the card shows awarded points and possible points in `.../...` format

### Requirement: Gallery actions reflect exam state
The system SHALL derive the primary gallery card action from the latest attempt and result state.

#### Scenario: Submitted attempt is ready for grading
- **WHEN** an exam attempt has status `submitted` and no result
- **THEN** the card shows an `Auswerten` action

#### Scenario: Result exists
- **WHEN** an exam attempt has a result
- **THEN** the card shows an `Ergebnis anzeigen` action

### Requirement: Gallery does not expose private solutions
The gallery SHALL NOT load or expose `solution.json`.

#### Scenario: Gallery renders cards
- **WHEN** the gallery renders available exams
- **THEN** it reads manifest, attempt, and result metadata only
- **AND** it does not request or display private solution content
