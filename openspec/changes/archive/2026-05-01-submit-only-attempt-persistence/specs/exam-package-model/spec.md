## MODIFIED Requirements

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
