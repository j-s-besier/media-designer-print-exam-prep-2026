## ADDED Requirements

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
