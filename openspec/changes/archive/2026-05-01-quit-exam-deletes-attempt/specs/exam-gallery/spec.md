## MODIFIED Requirements

### Requirement: Gallery lists available exams
The system SHALL provide a main gallery that lists all available exam packages using manifest and attempt/result state.

#### Scenario: Exam has no attempt
- **WHEN** the gallery loads an exam with no matching attempt
- **THEN** the card shows the exam ID, status `not-started`, no score, and a `Pruefen` action

#### Scenario: Exam has an in-progress attempt
- **WHEN** the gallery loads an exam with an attempt that is not fully submitted
- **THEN** the card does not show a `Fortsetzen` action
- **AND** the card shows status `not-started`, no score, and a `Pruefen` action
