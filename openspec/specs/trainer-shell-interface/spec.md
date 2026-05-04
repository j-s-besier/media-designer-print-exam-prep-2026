# trainer-shell-interface Specification

## Purpose
TBD - created by archiving change improve-exam-runner-annotation-feedback. Update Purpose after archive.
## Requirements
### Requirement: Trainer shell header uses requested hierarchy
The trainer shell SHALL present the app identity with `Pruefungstrainer` as the primary heading, followed by `Mediengestalter Digital und Print` and `Bereich: Printmedien` as supporting context.

#### Scenario: Gallery header is shown
- **WHEN** the gallery view renders
- **THEN** the header primary heading is `Pruefungstrainer`
- **AND** the header shows `Mediengestalter Digital und Print`
- **AND** the header shows `Bereich: Printmedien`

#### Scenario: Exam runner header is shown
- **WHEN** a candidate opens an exam
- **THEN** the same trainer shell header wording remains available above the exam content

