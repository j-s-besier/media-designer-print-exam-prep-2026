## Why

The browser annotations identify usability issues in the trainer shell and exam runner: the header copy should be clearer, exclusion progress should remain visible while scrolling, excluded tasks need stronger visual feedback, and sticky action controls should be more compact. Addressing these now keeps the exam flow readable during long PB4/PB2/PB3 pages where candidates otherwise lose orientation.

## What Changes

- Update the global header wording to show:
  - `Pruefungstrainer`
  - `Mediengestalter Digital und Print`
  - `Bereich: Printmedien`
- Rename the paper metadata label from `Gewicht` to `Gewichtung`.
- Keep each block's exclusion progress visible while the candidate scrolls within long task lists.
- When a candidate marks a task as excluded, visually mark the entire task as struck/excluded while still showing the full task content.
- Shorten the sticky validation message so it communicates missing exclusions without repeating full sentence-length errors.
- Change the destructive quit action in the sticky action bar to an icon-only button with an accessible label/tooltip.

## Capabilities

### New Capabilities

- `trainer-shell-interface`: global trainer shell wording and header presentation.

### Modified Capabilities

- `exam-taking-flow`: exam runner metadata wording, exclusion progress visibility, excluded-task visual state, concise validation feedback, and compact quit control behavior.

## Impact

- `src/App.tsx`
- `src/styles.css`
- Existing exam-taking-flow tests in `tests/examSystem.test.ts`
- Browser verification of gallery and exam-runner states on desktop/mobile-sized viewports
