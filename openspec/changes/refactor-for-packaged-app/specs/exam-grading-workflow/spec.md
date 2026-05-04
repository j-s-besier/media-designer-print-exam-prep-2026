## ADDED Requirements

### Requirement: Packaged grading requires trusted private solutions
The packaged runtime SHALL perform local grading only when a trusted private solution directory is configured and contains the matching solution for the submitted attempt.

#### Scenario: Trusted packaged grading succeeds
- **WHEN** a submitted attempt is graded in packaged mode
- **AND** the runtime is configured with a trusted private solution directory containing the matching `solution.json`
- **THEN** the grading workflow loads the public exam definition, private solution definition, and submitted attempt
- **AND** it writes the result under writable user data

#### Scenario: Private solutions are absent
- **WHEN** a grading request is made in packaged mode
- **AND** no trusted private solution directory is configured
- **THEN** the system rejects the request with a clear grading-unavailable error
- **AND** it does not write a result file

#### Scenario: Matching private solution is absent
- **WHEN** a grading request is made in packaged mode
- **AND** the trusted private solution directory does not contain a matching solution for the attempt exam ID
- **THEN** the system rejects the request with a clear missing-solution error
- **AND** it does not write a result file
