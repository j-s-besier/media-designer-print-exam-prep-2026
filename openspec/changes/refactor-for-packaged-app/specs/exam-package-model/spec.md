## ADDED Requirements

### Requirement: Packaged public resources are read-only
The system SHALL treat packaged public exam resources, schemas, and templates as read-only runtime resources.

#### Scenario: Packaged gallery reads public resources
- **WHEN** the packaged app lists available exams
- **THEN** it reads public manifests and exam metadata from the packaged resource directory
- **AND** it does not write to the packaged resource directory

#### Scenario: Runtime validation output is produced
- **WHEN** the packaged runtime validates an exam package
- **THEN** it returns validation output without modifying packaged public resources
- **AND** any persisted runtime validation output is written under the writable user-data directory

### Requirement: Packaged attempts and results use writable user data
The system SHALL store packaged-mode attempts, results, and uploads in writable user data instead of bundled resources.

#### Scenario: Final exam submission is saved in packaged mode
- **WHEN** a candidate submits the final configured paper in the packaged app
- **THEN** the durable attempt record is written under the writable user-data directory
- **AND** the packaged public exam resource remains unchanged

#### Scenario: Upload is saved in packaged mode
- **WHEN** a candidate uploads a file for an answer field in the packaged app
- **THEN** the uploaded binary is written under the writable user-data directory
- **AND** the upload metadata stored in the attempt references that writable uploaded file

#### Scenario: Result is saved in packaged mode
- **WHEN** a trusted packaged grading run produces a result
- **THEN** the result file is written under the writable user-data directory
- **AND** no result file is written into packaged public resources

### Requirement: Private solutions are excluded from student packages
The system SHALL exclude private solution files from student-facing packaged resources and public routes.

#### Scenario: Student package is built
- **WHEN** a student-facing package is created
- **THEN** `solution.json` files are not included under packaged public exam resources
- **AND** private solution directories are not exposed through frontend assets or public API asset routes

#### Scenario: Private solution storage is configured for trusted mode
- **WHEN** a trusted runtime is configured with a private solution directory
- **THEN** grading workflows may read matching `solution.json` files from that trusted directory
- **AND** public exam package routes still do not expose those files
