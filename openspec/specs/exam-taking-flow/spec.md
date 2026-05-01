# exam-taking-flow Specification

## Purpose
TBD - created by archiving change build-fillable-exam-system. Update Purpose after archive.
## Requirements
### Requirement: Exam papers are completed sequentially
The system SHALL guide the candidate through the written exam papers one at a time in the configured order.

#### Scenario: New attempt begins
- **WHEN** a candidate starts a written exam
- **THEN** the app opens the first configured paper
- **AND** the candidate cannot submit a later paper before submitting the current paper

#### Scenario: Paper is submitted
- **WHEN** the candidate submits the current paper
- **THEN** the app locks that paper for editing
- **AND** the app opens the next configured paper if one exists

### Requirement: Final submission returns candidate to gallery
The system SHALL show a completion popup after the final paper is submitted and then return the candidate to the gallery.

#### Scenario: Last paper is submitted
- **WHEN** the candidate submits the final configured paper
- **THEN** the app shows a popup stating that the exam can now be evaluated
- **AND** the app returns to the main gallery after the popup is dismissed

### Requirement: Task exclusions are enforced per block
The system SHALL enforce each paper block's allowed number of excluded tasks before paper submission.

#### Scenario: PB2 general block has too many exclusions
- **WHEN** the candidate tries to submit PB2 with more than one excluded task in U1-U8
- **THEN** submission is blocked
- **AND** the app explains that only one task may be excluded from that block

#### Scenario: PB2 Printmedien block has valid exclusion
- **WHEN** the candidate excludes exactly one task from U9-U12 in PB2
- **THEN** the block selection is valid

#### Scenario: PB3 blocks are valid
- **WHEN** the candidate excludes one U1-U8 task and one U9-U12 task in PB3
- **THEN** PB3 can be submitted if all other required validation passes

### Requirement: Excluded tasks remain auditable
The system SHALL store excluded task IDs in the attempt data by paper and block.

#### Scenario: Candidate excludes a task
- **WHEN** the candidate marks a task as excluded
- **THEN** the attempt stores the excluded task ID under the corresponding paper and block selection

### Requirement: Answers are stored by answer field
The system SHALL store candidate answers separately from the exam definition using the answer field IDs from `exam.json`.

#### Scenario: Candidate writes text answer
- **WHEN** the candidate types into a text answer field
- **THEN** the attempt stores the answer value keyed by that field ID
- **AND** the exam definition is not modified

### Requirement: Supported answer field types are renderable
The system SHALL render supported answer field types from `exam.json`, including single-choice, multiple-choice, short-text, long-text, list, table, calculation, file-upload, and drawing-upload fields.

#### Scenario: Bound PB4 task is rendered
- **WHEN** a PB4 task defines a single-choice or multiple-choice answer field
- **THEN** the app renders selectable options
- **AND** the selected option IDs are stored in the attempt data

#### Scenario: Open task is rendered
- **WHEN** a task defines a short-text, long-text, list, table, or calculation answer field
- **THEN** the app renders the matching fillable input
- **AND** the saved value is stored by answer field ID

### Requirement: File uploads are supported for sketch tasks
The system SHALL allow answer fields of type `fileUpload` or `drawingUpload` to store candidate-uploaded files as attempt attachments.

#### Scenario: Candidate uploads a sketch
- **WHEN** the candidate uploads a sketch file for a drawing answer field
- **THEN** the attempt stores file metadata and a path/reference to the uploaded file
- **AND** the uploaded binary is stored outside `exam.json`

### Requirement: Submitted papers are immutable in normal exam flow
The system SHALL prevent editing a paper after the candidate submits it in the exam flow.

#### Scenario: Candidate returns to submitted paper
- **WHEN** a candidate navigates to a submitted paper
- **THEN** the app displays it as read-only
- **AND** the app does not allow answer or exclusion changes through the normal exam flow

