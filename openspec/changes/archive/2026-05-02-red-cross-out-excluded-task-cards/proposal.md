## Why

Excluded task cards are currently marked with a subtle single strike line and only the task title receives text strikethrough. Candidates need a clearer visual signal that the whole task has been struck out, including its content, while the card remains visible for review.

## What Changes

- Render the excluded task card with a red border.
- Apply strikethrough treatment to the task card text content, not only the title.
- Remove card-level cross overlays so only the text and card state communicate the exclusion.
- Keep excluded task content visible and answer fields disabled.
- Preserve the existing exclusion state model, validation rules, persistence behavior, and card spacing contract.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `exam-taking-flow`: clarify the required visual treatment for excluded task cards in the exam runner.
- `interface-card-styling`: preserve shared card spacing while allowing the excluded task card to use a red semantic border.

## Impact

- Affected code: `src/styles.css` task-card excluded state, with possible small markup adjustments in `src/App.tsx` only if CSS alone cannot target the required text safely.
- No API, data model, exam validation, grading, or dependency changes.
- Visual verification should cover desktop and narrow mobile card layouts.
