## ADDED Requirements

### Requirement: Excluded task cards are red-crossed in the exam runner
The exam runner SHALL mark an excluded task card with two red diagonal strikes across the full card while keeping the excluded task visible for review.

#### Scenario: Candidate excludes a task
- **WHEN** the candidate selects the `Streichen` action for a task
- **THEN** the task card shows one red diagonal strike from the top-left corner toward the bottom-right corner
- **AND** the task card shows one red diagonal strike from the top-right corner toward the bottom-left corner
- **AND** the task card border is red
- **AND** the task card text content is shown with strikethrough treatment
- **AND** the task prompt, subtasks, and answer fields remain visible
- **AND** the answer fields remain disabled for the excluded task

#### Scenario: Candidate reverses a task exclusion
- **WHEN** the candidate clears the excluded state for a previously excluded task
- **THEN** the task card no longer shows the red diagonal strikes
- **AND** the task card no longer uses the red excluded border
- **AND** the task card text content is no longer shown with strikethrough treatment
- **AND** the answer fields become editable again if the paper is otherwise editable
