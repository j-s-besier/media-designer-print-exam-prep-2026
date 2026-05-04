## ADDED Requirements

### Requirement: Grading results use one-decimal numeric precision
The grading workflow SHALL calculate scores from precise source values and SHALL round persisted result totals, percentages, weighted contributions, and subtask scores to one decimal place after aggregation.

#### Scenario: Grading produces fractional totals
- **WHEN** grading produces a fractional awarded point total or percentage
- **THEN** the stored result value is rounded to one decimal place
- **AND** the calculation does not pre-round source task or subtask maximum point values before aggregation

## MODIFIED Requirements

### Requirement: Overall result is calculated from graded papers
The grading workflow SHALL calculate total raw points, weighted written percentage, written contribution toward the full exam, and display-ready point totals from the graded written papers using one-decimal result precision.

#### Scenario: Grading completes
- **WHEN** PB4, PB2, and PB3 have been scored
- **THEN** the result records total raw points awarded rounded to one decimal place
- **AND** the result records total raw points possible rounded to one decimal place
- **AND** the result records weighted written percentage rounded to one decimal place
- **AND** the result records the written contribution excluding PB1 rounded to one decimal place
