## 1. Backend Attempt Deletion

- [ ] 1.1 Add a storage helper that recursively deletes `data/attempts/<attemptId>` including uploads.
- [ ] 1.2 Add `DELETE /api/attempts/:attemptId` and reject deletion unless the attempt status is `in-progress`.
- [ ] 1.3 Return German-facing-safe error messages from the client path when deletion fails.

## 2. Gallery No-Resume Behavior

- [ ] 2.1 Update gallery card types and derivation so in-progress attempts no longer produce `Fortsetzen`.
- [ ] 2.2 Ensure opening a card with no submitted result starts a fresh attempt via the existing create-attempt route.
- [ ] 2.3 Preserve `Prompt kopieren` for submitted attempts and `Ergebnis anzeigen` for graded results.

## 3. Exam Runner Quit Flow

- [ ] 3.1 Add a `Pruefung beenden` action to the exam runner UI.
- [ ] 3.2 Show a German confirmation popup warning that the current attempt will be erased.
- [ ] 3.3 On cancel, keep the candidate in the current attempt without deleting or saving.
- [ ] 3.4 On confirm, delete the attempt without calling the save path first, return to gallery, and show German feedback.

## 4. Verification

- [ ] 4.1 Add tests for gallery derivation showing `Pruefen` instead of `Fortsetzen` for in-progress attempts.
- [ ] 4.2 Add tests for deleting in-progress attempts and rejecting deletion of submitted or graded attempts.
- [ ] 4.3 Run the project test suite and OpenSpec validation/status checks.
