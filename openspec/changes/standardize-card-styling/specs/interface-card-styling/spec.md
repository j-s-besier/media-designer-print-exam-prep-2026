## ADDED Requirements

### Requirement: Card surfaces use a shared visual baseline
The system SHALL render card-like UI surfaces with a repeatable baseline for background, border, border radius, and shadow.

#### Scenario: Gallery card surface renders
- **WHEN** the gallery renders an exam card
- **THEN** the card uses the shared card surface baseline

#### Scenario: Exam runner surfaces render
- **WHEN** the exam runner renders paper headers, instruction sections, task blocks, or task cards
- **THEN** each card-like surface uses the shared card surface baseline

#### Scenario: Result surfaces render
- **WHEN** the result view renders its summary or paper result cards
- **THEN** each card-like surface uses the shared card surface baseline

### Requirement: Card spacing uses named repeatable values
The system SHALL use a small set of named spacing values for card padding, compact card padding, card gaps, and compact card gaps instead of unrelated one-off values.

#### Scenario: Standard cards render
- **WHEN** a standard-density card-like surface renders
- **THEN** its padding and internal gap come from the standard card spacing values

#### Scenario: Compact cards render
- **WHEN** a compact-density card-like surface renders
- **THEN** its padding and internal gap come from the compact card spacing values

#### Scenario: Semantic card state renders
- **WHEN** a task card is marked as excluded
- **THEN** the excluded state preserves its semantic visual treatment without changing the shared card spacing contract

### Requirement: Gallery cards remain mobile-safe
The system SHALL size gallery card columns so cards do not horizontally overflow narrow mobile viewports.

#### Scenario: Narrow viewport displays gallery
- **WHEN** the gallery is displayed on a narrow mobile viewport
- **THEN** each gallery card fits within the available content width
- **AND** the page does not require horizontal scrolling because of the gallery card minimum width

#### Scenario: Wider viewport displays gallery
- **WHEN** the gallery is displayed on a tablet or desktop viewport
- **THEN** gallery cards continue to arrange into responsive columns with a readable card width
