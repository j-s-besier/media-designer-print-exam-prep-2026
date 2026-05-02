## ADDED Requirements

### Requirement: Point labels use one-decimal formatting
The exam runner SHALL display task and subtask point values rounded to one decimal place without exposing extended floating-point precision.

#### Scenario: Task point value is fractional
- **WHEN** a rendered task has a fractional `maxPoints` value such as `2.6666666666666665`
- **THEN** the task point label displays `2.7 Punkte`
- **AND** it does not display the unrounded internal numeric value

#### Scenario: Subtask point value is fractional
- **WHEN** a rendered subtask has a fractional `maxPoints` value
- **THEN** the subtask point label displays the value rounded to one decimal place followed by `P`

