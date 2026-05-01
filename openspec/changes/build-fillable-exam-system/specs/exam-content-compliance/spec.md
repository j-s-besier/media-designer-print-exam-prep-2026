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

### Requirement: Task and asset provenance is machine-checkable
The system SHALL record provenance metadata for generated tasks, generated assets, and user-provided materials.

#### Scenario: Generated task is stored
- **WHEN** a generated task is written to `exam.json`
- **THEN** the task records provenance as `original-generated`
- **AND** the task records that it was generated from public structure and topic guidance, not protected original exam content

#### Scenario: User-provided material is stored
- **WHEN** a user-provided material is included
- **THEN** the material records provenance as `user-provided`
- **AND** the material records rights status and whether manual rights review is required

### Requirement: Compliance validation is operational and conservative
The validation workflow SHALL use explicit provenance metadata, forbidden source flags, public-data checks, and optional similarity checks to flag compliance risk without claiming to prove legal originality.

#### Scenario: Missing rights metadata
- **WHEN** an asset lacks required rights metadata
- **THEN** validation marks the package as non-compliant or requiring license review

#### Scenario: Forbidden protected-source provenance
- **WHEN** a task or asset records that it was copied from, extracted from, or closely paraphrased from protected original exam material
- **THEN** validation fails the package

#### Scenario: Public exam contains rubric content
- **WHEN** `exam.json` contains rubric or model-answer fields
- **THEN** validation fails the package

#### Scenario: Similarity check is configured
- **WHEN** a configured similarity check flags task text as too close to protected source material
- **THEN** validation marks the package as requiring manual rights review

#### Scenario: Provenance is uncertain
- **WHEN** validation cannot determine whether a material has sufficient rights metadata
- **THEN** validation marks the package as `requiresManualRightsReview`
