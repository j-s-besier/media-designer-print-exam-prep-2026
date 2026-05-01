## ADDED Requirements

### Requirement: In-progress attempts are quit by erasure
The system SHALL let a candidate quit an in-progress exam attempt only through a confirmed destructive action that erases the current attempt data.

#### Scenario: Quit confirmation is shown
- **WHEN** the candidate selects the exam quit action during an in-progress attempt
- **THEN** the app shows a confirmation popup in German
- **AND** the popup warns that the current attempt will be erased
- **AND** the attempt is not deleted before the candidate confirms

#### Scenario: Quit is cancelled
- **WHEN** the candidate cancels the quit confirmation popup
- **THEN** the app keeps the candidate in the current exam attempt
- **AND** the current attempt is not deleted

#### Scenario: Quit is confirmed
- **WHEN** the candidate confirms the quit confirmation popup
- **THEN** the system deletes the current in-progress attempt data
- **AND** the system deletes uploaded files stored for that attempt
- **AND** the app returns the candidate to the gallery with German feedback

#### Scenario: Submitted attempt cannot be erased through quit
- **WHEN** a delete request targets an attempt whose status is `submitted` or `graded`
- **THEN** the system rejects the request
- **AND** the saved submitted or graded attempt remains available

### Requirement: Quit does not save current work
The system SHALL discard unsaved exam-runner changes when the candidate confirms quitting an in-progress attempt.

#### Scenario: Unsaved answers exist when quitting
- **WHEN** the candidate has local answer changes that were not saved
- **AND** the candidate confirms quitting the attempt
- **THEN** the app deletes the attempt without first saving those local changes
- **AND** the candidate cannot continue those answers later
