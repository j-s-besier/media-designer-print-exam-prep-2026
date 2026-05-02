## ADDED Requirements

### Requirement: Generated exam packages use numbered identity
The exam creation workflow SHALL assign newly generated Mediengestalter Printmedien exam packages a lowercase sequential package ID in the form `mgdp-<number>` and a display label in the form `MgDp-<number>`.

#### Scenario: New exam package is created
- **WHEN** the creation workflow creates a new exam package
- **THEN** the public package directory uses the lowercase `mgdp-<number>` ID
- **AND** `manifest.id`, `exam.id`, and private `solution.examId` use that same lowercase ID
- **AND** `manifest.title` and `exam.title` use the matching `MgDp-<number>` display label

#### Scenario: Next numbered exam is selected
- **WHEN** existing generated packages include numbered IDs
- **THEN** the creation workflow chooses the next highest unused `mgdp-<number>` ID
- **AND** it does not create season-, date-, or practice-name-based package IDs for new generated exams

### Requirement: Exam packages preserve scoring precision
The exam package model SHALL allow precise numeric point values needed for correct scoring, while learner-facing displays apply rounded presentation formatting.

#### Scenario: Fractional PB4 point value is required
- **WHEN** a PB4 task needs a fractional maximum point value to maintain the configured paper total
- **THEN** `exam.json` may store the precise numeric value
- **AND** validation continues to use the precise value for scoring consistency
- **AND** learner-facing screens display the value rounded to one decimal place

