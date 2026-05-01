## Why

In-progress exam attempts are currently written to disk as soon as an exam starts and can be manually saved while solving. That conflicts with the intended exam-mode behavior: a candidate's work should either become a saved submitted attempt through the normal completion flow or disappear when they quit, close the browser, or crash before completion.

## What Changes

- Remove the visible `Speichern` action from the exam runner.
- Stop exposing a general in-progress attempt update path from the frontend.
- Keep answer and selection changes only in the active browser session while a paper is being solved.
- Persist attempt data only when the full exam is completed, with final exam completion leaving a saved submitted attempt for grading.
- Ensure closing or crashing the browser during an in-progress attempt does not save the local unsent work.
- Keep `Pruefung beenden` destructive: confirmed quit deletes any server-side data created for the active in-progress attempt.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `exam-taking-flow`: Remove manual save behavior and define submit-only persistence for active exam attempts.
- `exam-package-model`: Clarify that in-progress answer data is session-local until paper submission and that durable attempt records are created by submission/completion, not by typing or browser lifecycle events.

## Impact

- `src/App.tsx`: Remove the save button, remove manual save calls, and send the current in-memory attempt as part of paper submission.
- `server/index.ts`: Replace the generic client-side attempt update route with final-completion persistence logic.
- `server/storage.ts`: Support transient attempt creation and deletion of active attempt directories even before an attempt record exists.
- `src/lib/examLogic.ts`: Provide a reusable way to create an unsaved attempt id from loaded exam data.
- `tests/examSystem.test.ts`: Add coverage for transient start, submit-time persistence, and delete behavior without relying on manual saves.
- OpenSpec specs for `exam-taking-flow` and `exam-package-model`.
