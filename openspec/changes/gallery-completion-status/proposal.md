## Why

The gallery status currently describes workflow state such as not started, ready for grading, or graded. Candidates need a simpler completion outcome signal: pending work/result, failed, or passed, with the IHK-style 50 percent written score threshold used for pass/fail.

## What Changes

- Change the visible gallery status model to `ToDo`, `Nicht bestanden`, and `Bestanden`.
- Derive `Bestanden` when `weightedWrittenPercentage >= 50`; derive `Nicht bestanden` when a result exists below 50.
- Derive `ToDo` when no result exists yet, including fresh exams, ignored in-progress records, and submitted attempts awaiting grading.
- Color the status value blue for `ToDo`, red for `Nicht bestanden`, and green for `Bestanden`.
- Keep gallery actions independent from visible completion status:
  - no result and no submitted attempt -> `Pruefen`
  - submitted attempt without result -> `Prompt kopieren`
  - result exists -> `Ergebnis anzeigen`
- Display `-` for unavailable `Bewertung` and point totals instead of `offen` or `-/-`.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `exam-gallery`: Replace workflow-state status display with completion-status display and define pass/fail threshold behavior.

## Impact

- `src/lib/examTypes.ts`: Update gallery status values to completion-oriented states.
- `src/lib/examLogic.ts`: Derive completion status from result availability and the 50 percent threshold while preserving action derivation.
- `src/App.tsx`: Render new labels, unavailable values, and status-specific classes.
- `src/styles.css`: Add compact blue/red/green status badge styling.
- `tests/examSystem.test.ts`: Update gallery derivation tests for ToDo, failed, and passed states.
- OpenSpec `exam-gallery` delta spec.
