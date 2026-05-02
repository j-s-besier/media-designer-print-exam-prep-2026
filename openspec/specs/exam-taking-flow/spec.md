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
The system SHALL keep candidate answers separately from the exam definition using the answer field IDs from `exam.json`, with in-progress answers held only in the active attempt session until final completion.

#### Scenario: Candidate writes text answer
- **WHEN** the candidate types into a text answer field
- **THEN** the active attempt session stores the answer value keyed by that field ID
- **AND** the exam definition is not modified
- **AND** no durable attempt record is written solely because the candidate typed the answer

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

### Requirement: In-progress attempts are quit by erasure
The system SHALL let a candidate quit an in-progress exam attempt only through a confirmed destructive action that erases the current attempt data.

#### Scenario: Quit confirmation is shown
- **WHEN** the candidate selects the exam quit action during an in-progress attempt
- **THEN** the app shows a confirmation popup in German
- **AND** the popup warns that the current attempt will be erased
- **AND** the attempt is not deleted before the candidate confirms

#### Scenario: Quit is cancelled
- **WHEN** the candidate cancels the quit confirmation popup
- **THEN** the app keeps the candidate in the current exam attempt
- **AND** the current attempt is not deleted

#### Scenario: Quit is confirmed
- **WHEN** the candidate confirms the quit confirmation popup
- **THEN** the system deletes the current in-progress attempt data
- **AND** the system deletes uploaded files stored for that attempt
- **AND** the app returns the candidate to the gallery with German feedback

#### Scenario: Submitted attempt cannot be erased through quit
- **WHEN** a delete request targets an attempt whose status is `submitted` or `graded`
- **THEN** the system rejects the request
- **AND** the saved submitted or graded attempt remains available

### Requirement: Quit does not save current work
The system SHALL discard unsaved exam-runner changes when the candidate confirms quitting an in-progress attempt.

#### Scenario: Unsaved answers exist when quitting
- **WHEN** the candidate has local answer changes that were not saved
- **AND** the candidate confirms quitting the attempt
- **THEN** the app deletes the attempt without first saving those local changes
- **AND** the candidate cannot continue those answers later

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

### Requirement: Paper metadata uses clear weighting wording
The exam runner SHALL label paper weight metadata as `Gewichtung`.

#### Scenario: Candidate opens PB4
- **WHEN** the PB4 paper header is rendered
- **THEN** the duration metadata remains visible
- **AND** the paper weight metadata is labeled `Gewichtung`

### Requirement: Exclusion progress remains visible during scrolling
The exam runner SHALL keep the current paper's exclusion progress visible while the candidate scrolls through long task lists.

#### Scenario: Candidate scrolls within a task block
- **WHEN** the candidate scrolls past the block header
- **THEN** the interface still shows how many tasks have been excluded and how many are required for the current paper
- **AND** the candidate does not need to scroll back to the block header to check exclusion progress

### Requirement: Excluded tasks are visibly marked but still shown
The exam runner SHALL apply a clear full-card excluded visual state when a candidate marks a task as excluded, while keeping the task content visible for review.

#### Scenario: Candidate excludes a task
- **WHEN** the candidate selects the `Streichen` action for a task
- **THEN** the entire task card is visually marked as excluded
- **AND** the task prompt, subtasks, and answer fields remain visible
- **AND** the answer fields remain disabled for the excluded task

### Requirement: Sticky validation feedback is concise
The exam runner SHALL summarize missing exclusion requirements in short sticky feedback instead of showing full sentence-length validation errors.

#### Scenario: Exclusions are incomplete
- **WHEN** one or more blocks do not yet have the required number of excluded tasks
- **THEN** the sticky validation area shows a concise summary of what is still missing
- **AND** it avoids repeating long messages such as `Es muessen genau ... Aufgabe(n) gestrichen werden` for every block

### Requirement: Quit action is compact and accessible
The exam runner SHALL render the sticky quit action as an icon-only destructive button with an accessible name.

#### Scenario: In-progress exam shows sticky actions
- **WHEN** the candidate is working on an in-progress paper
- **THEN** the quit action shows only the quit icon visually
- **AND** the button has an accessible name equivalent to `Pruefung beenden`
- **AND** activating it still opens the existing destructive confirmation flow

### Requirement: Point labels use one-decimal formatting
The exam runner SHALL display task and subtask point values rounded to one decimal place without exposing extended floating-point precision.

#### Scenario: Task point value is fractional
- **WHEN** a rendered task has a fractional `maxPoints` value such as `2.6666666666666665`
- **THEN** the task point label displays `2.7 Punkte`
- **AND** it does not display the unrounded internal numeric value

#### Scenario: Subtask point value is fractional
- **WHEN** a rendered subtask has a fractional `maxPoints` value
- **THEN** the subtask point label displays the value rounded to one decimal place followed by `P`

### Requirement: Excluded task cards are clearly struck in the exam runner
The exam runner SHALL mark an excluded task card with a red card border and strikethrough text while keeping the excluded task visible for review.

#### Scenario: Candidate excludes a task
- **WHEN** the candidate selects the `Streichen` action for a task
- **THEN** the task card border is red
- **AND** the task card text content is shown with strikethrough treatment
- **AND** the task card does not show large card-level diagonal cross overlays
- **AND** the task prompt, subtasks, and answer fields remain visible
- **AND** the answer fields remain disabled for the excluded task

#### Scenario: Candidate reverses a task exclusion
- **WHEN** the candidate clears the excluded state for a previously excluded task
- **THEN** the task card no longer uses the red excluded border
- **AND** the task card text content is no longer shown with strikethrough treatment
- **AND** the answer fields become editable again if the paper is otherwise editable

