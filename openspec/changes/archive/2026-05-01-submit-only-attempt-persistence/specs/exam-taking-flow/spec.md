## ADDED Requirements

### Requirement: Manual in-progress saves are not available
The system SHALL NOT provide a candidate-facing action that saves an in-progress attempt while the candidate is solving the exam.

#### Scenario: Candidate solves an active paper
- **WHEN** the candidate is working in the exam runner
- **THEN** the visible actions do not include a `Speichern` button
- **AND** the candidate can only continue by submitting the current paper or quitting the attempt

### Requirement: Attempt persistence happens only on full completion
The system SHALL write a durable attempt record only when the candidate completes the full written exam flow.

#### Scenario: Intermediate paper is submitted
- **WHEN** the candidate submits a paper and another configured paper remains
- **THEN** the app advances to the next paper in the active browser session
- **AND** the system does not write a durable submitted attempt record

#### Scenario: Final paper is submitted
- **WHEN** the candidate submits the final configured paper
- **THEN** the system writes the completed attempt data as a submitted attempt record
- **AND** the saved attempt is available for the grading prompt workflow

#### Scenario: Browser closes before full completion
- **WHEN** the browser closes or crashes before the final paper is submitted
- **THEN** the system does not save the candidate's in-progress attempt answers
- **AND** the gallery cannot continue those answers later

## MODIFIED Requirements

### Requirement: Answers are stored by answer field
The system SHALL keep candidate answers separately from the exam definition using the answer field IDs from `exam.json`, with in-progress answers held only in the active attempt session until final completion.

#### Scenario: Candidate writes text answer
- **WHEN** the candidate types into a text answer field
- **THEN** the active attempt session stores the answer value keyed by that field ID
- **AND** the exam definition is not modified
- **AND** no durable attempt record is written solely because the candidate typed the answer
