## Why

In-progress exam attempts can currently be saved and resumed later, which conflicts with the desired exam-mode behavior: a started exam should either be submitted through the normal sequence or explicitly quit and erased. This change makes quitting intentional, destructive, and clearly communicated in German so candidates cannot accidentally continue a stale or partially saved attempt.

## What Changes

- **BREAKING**: Remove continuation of in-progress attempts from the gallery flow.
- Add an explicit quit action in the exam runner.
- Require a German confirmation popup before quitting that warns the current attempt will be erased.
- Delete the current attempt and its uploaded files when the candidate confirms quitting.
- Return the candidate to the gallery after quitting and show German feedback.
- Keep submitted and graded attempts available for prompt copying, grading, and result review.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `exam-taking-flow`: change in-progress attempt lifecycle so a candidate can quit only by erasing the current attempt, and cannot resume an in-progress attempt later.
- `exam-gallery`: change gallery card behavior so in-progress attempts are not offered as `Fortsetzen`; candidates can start a fresh attempt instead after a quit/delete.

## Impact

- Frontend exam runner needs a quit control, confirmation dialog, delete request, and German UI copy.
- Gallery card derivation must no longer expose a resume action for in-progress attempts.
- Backend API needs an attempt deletion endpoint.
- Storage needs a safe attempt directory removal function that also removes uploaded files.
- Tests must cover gallery behavior and attempt deletion.
