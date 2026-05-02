## ADDED Requirements

### Requirement: Gallery cards use numbered exam labels
The gallery SHALL present generated exams using their numbered display label and SHALL keep the lowercase package ID available for actions, prompts, and data lookup.

#### Scenario: Numbered exam appears in gallery
- **WHEN** the gallery loads a generated exam whose manifest has `id` `mgdp-1` and title `MgDp-1`
- **THEN** the card heading displays `MgDp-1`
- **AND** gallery actions continue to use `mgdp-1` as the exam ID

## MODIFIED Requirements

### Requirement: Gallery cards show grading summary
The system SHALL show the weighted written percentage and point totals on gallery cards when a result exists for an exam attempt, formatted to one decimal place.

#### Scenario: Graded result exists
- **WHEN** the gallery loads an exam with a graded result
- **THEN** the card shows the weighted written percentage score rounded to one decimal place
- **AND** the card shows awarded points and possible points in one-decimal `.../...` format

