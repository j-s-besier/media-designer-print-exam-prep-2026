## ADDED Requirements

### Requirement: Grading uses exam, solution, and attempt data
The grading workflow SHALL evaluate a submitted attempt using the public exam definition, private solution definition, and attempt answers.

#### Scenario: Submitted attempt is graded
- **WHEN** the grading workflow runs
- **THEN** it loads `exam.json`, `solution.json`, and the submitted attempt
- **AND** it writes a separate result output

### Requirement: Excluded tasks are not graded
The grading workflow SHALL ignore tasks that are excluded in the submitted attempt according to the applicable block selection rules.

#### Scenario: PB2 task is excluded
- **WHEN** `PB2-U8` is listed as excluded in the PB2 general block
- **THEN** the grading workflow does not award or subtract points for `PB2-U8`
- **AND** `PB2-U8` is marked as excluded in the result

### Requirement: Invalid exclusions are handled deterministically
The grading workflow SHALL validate exclusions before scoring and apply the exam package's configured fallback policy or mark the result as requiring manual review.

#### Scenario: Candidate did not exclude enough tasks
- **WHEN** a block requires one excluded task but the attempt records none
- **THEN** the grading workflow applies the configured fallback policy if available
- **AND** the result records that fallback was applied

#### Scenario: Candidate excluded too many tasks
- **WHEN** a block has more excluded tasks than allowed
- **THEN** the result is marked as requiring manual review unless a deterministic fallback is configured

### Requirement: Grading is performed at subtask level
The grading workflow SHALL score each evaluated subtask against its rubric and aggregate scores to task, paper, and exam totals.

#### Scenario: Subtask is scored
- **WHEN** an answer field for a subtask is evaluated
- **THEN** the result records awarded points, maximum points, feedback, confidence, and whether manual review is needed

#### Scenario: Paper total is calculated
- **WHEN** all evaluated subtasks in a paper are scored
- **THEN** the result records awarded points, possible points, and percentage for that paper

### Requirement: Overall result is calculated from graded papers
The grading workflow SHALL calculate total awarded points, total possible points, and overall percentage from the graded written papers.

#### Scenario: Grading completes
- **WHEN** PB4, PB2, and PB3 have been scored
- **THEN** the result records total awarded points
- **AND** the result records total possible points
- **AND** the result records the overall percentage

### Requirement: Grading does not mutate source data
The grading workflow SHALL NOT modify `exam.json`, `solution.json`, or the submitted attempt when producing `result.json`.

#### Scenario: Result is generated
- **WHEN** the grading workflow writes `result.json`
- **THEN** the source exam, solution, and attempt files remain unchanged
