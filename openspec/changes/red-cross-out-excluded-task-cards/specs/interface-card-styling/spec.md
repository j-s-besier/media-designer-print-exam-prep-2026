## MODIFIED Requirements

### Requirement: Card spacing uses named repeatable values
The system SHALL use a small set of named spacing values for card padding, compact card padding, card gaps, and compact card gaps instead of unrelated one-off values.

#### Scenario: Standard cards render
- **WHEN** a standard-density card-like surface renders
- **THEN** its padding and internal gap come from the standard card spacing values

#### Scenario: Compact cards render
- **WHEN** a compact-density card-like surface renders
- **THEN** its padding and internal gap come from the compact card spacing values

#### Scenario: Excluded task card semantic state renders
- **WHEN** a task card is marked as excluded
- **THEN** the excluded state preserves the shared card spacing contract
- **AND** the task card may use a semantic red border and card-level diagonal strike overlay without changing its padding or internal gap values
