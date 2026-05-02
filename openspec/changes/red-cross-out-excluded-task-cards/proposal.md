## Why

Excluded task cards are currently marked with a subtle single strike line and only the task title receives text strikethrough. Candidates need a clearer, exam-like visual signal that a whole task has been crossed out, including its content, while the card remains visible for review.

## What Changes

- Replace the current single middle strike with two prominent red diagonal strikes across the excluded task card.
- Render the excluded task card with a red border.
- Apply strikethrough treatment to the task card text content, not only the title.
- Keep excluded task content visible and answer fields disabled.
- Preserve the existing exclusion state model, validation rules, persistence behavior, and card spacing contract.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `exam-taking-flow`: clarify the required visual treatment for excluded task cards in the exam runner.
- `interface-card-styling`: preserve shared card spacing while allowing the excluded task card to use a red semantic border and diagonal strike overlay.

## Impact

- Affected code: `src/styles.css` task-card excluded state, with possible small markup adjustments in `src/App.tsx` only if CSS alone cannot target the required text safely.
- No API, data model, exam validation, grading, or dependency changes.
- Visual verification should cover desktop and narrow mobile card layouts.
