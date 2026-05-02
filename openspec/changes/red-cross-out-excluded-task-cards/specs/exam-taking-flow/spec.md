## ADDED Requirements

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
