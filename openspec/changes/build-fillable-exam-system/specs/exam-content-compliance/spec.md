## ADDED Requirements

### Requirement: Generated exams use original content
The exam creation workflow SHALL generate original exam-like tasks and SHALL NOT copy, closely paraphrase, or redistribute protected original IHK, ZFA, Christiani, or other third-party exam material without confirmed rights.

#### Scenario: Exam is generated from public structure and topics
- **WHEN** the creation workflow creates a new exam package
- **THEN** it may use public exam structure, timing, task counts, topic lists, operators, and point distribution
- **AND** it must create new task wording, scenarios, values, and assets

### Requirement: Protected source material is not stored by default
The system SHALL NOT store protected original exam PDFs, images, layouts, answer keys, or extracted task text in generated exam packages by default.

#### Scenario: Protected material is available online or locally
- **WHEN** protected source material is discovered
- **THEN** the creation workflow does not copy it into `exam.json`, `solution.json`, or `assets/`

### Requirement: User-provided materials require rights metadata
The system SHALL require explicit rights metadata for user-provided materials before including them in an exam package.

#### Scenario: User provides an asset
- **WHEN** a user-provided image, PDF, or text excerpt is added to an exam package
- **THEN** the package records the material as user-provided
- **AND** the package records whether usage rights are user-confirmed

### Requirement: Compliance metadata is included in exam packages
The system SHALL include content-policy metadata in each generated exam package manifest.

#### Scenario: Generated package is compliant
- **WHEN** an exam package is generated from original content
- **THEN** the manifest records `sourceType` as `original-generated`
- **AND** the manifest records that it is not derived from protected original exam material

### Requirement: Compliance validation flags risk
The validation workflow SHALL flag exam packages that appear to contain copied original exam material, missing asset rights metadata, or solution content in public exam data.

#### Scenario: Missing rights metadata
- **WHEN** an asset lacks required rights metadata
- **THEN** validation marks the package as non-compliant or requiring license review

#### Scenario: Public exam contains rubric content
- **WHEN** `exam.json` contains rubric or model-answer fields
- **THEN** validation fails the package
