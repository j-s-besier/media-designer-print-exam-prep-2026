## Context

The app currently creates and persists an attempt as soon as a candidate starts an exam. While working, the frontend can save the attempt through `PUT /api/attempts/:attemptId`, and the gallery derives an in-progress card with the `Fortsetzen` action from the latest saved attempt.

The requested exam-mode behavior is stricter: an in-progress attempt must not be resumed later. If the candidate chooses to quit, the app must warn in German that the current attempt will be erased, then remove the saved attempt and attachments instead of saving the current work.

## Goals / Non-Goals

**Goals:**

- Provide a deliberate quit flow in the exam runner.
- Use German user-facing copy for the quit confirmation, deletion success, and deletion errors.
- Delete the attempt directory, including uploaded files, when quitting is confirmed.
- Remove `Fortsetzen` from gallery behavior for in-progress attempts.
- Preserve submitted and graded attempt flows for grading prompts and result display.

**Non-Goals:**

- No autosave redesign.
- No multi-user ownership model.
- No archival or recovery flow for erased attempts.
- No global German copy rewrite outside the touched quit/gallery paths.

## Decisions

1. Use a destructive delete endpoint for quitting.

   The backend will expose `DELETE /api/attempts/:attemptId`, backed by a storage helper that removes `data/attempts/<attemptId>` recursively. This keeps deletion authoritative on the server and naturally removes uploads stored under the same directory.

   Alternative considered: mark attempts as abandoned. That would preserve data but contradicts the requirement that quitting erases the current attempt.

2. Do not save before quitting.

   The quit handler will call the delete endpoint directly after confirmation. It will not call the existing save path first, so unsaved local answers are discarded and the persisted attempt directory is removed.

   Alternative considered: save then delete. That adds unnecessary I/O and briefly writes data that is supposed to be erased.

3. Treat in-progress attempts as not resumable in gallery card derivation.

   `deriveGalleryCard` will no longer return `Fortsetzen`. If the latest attempt is in progress and there is no result, the gallery should present a fresh `Pruefen` action rather than a continuation action. Submitted attempts still expose `Prompt kopieren`; results still expose `Ergebnis anzeigen`.

   Alternative considered: show a separate `Verwerfen` action in the gallery. The request scopes quitting to the active exam, and adding multi-action cards would broaden the UI change.

4. Use the existing dialog pattern unless a custom modal is needed.

   A native confirmation popup is enough for the requested confirmation behavior and keeps implementation small. The confirmation text must be German and explicit that the current attempt will be erased. The app's current visible copy uses ASCII transliteration (`Pruefung`, `geloescht`), so the new text should match that style unless a broader copy pass changes it.

   Alternative considered: build a custom modal. That gives more styling control but adds more UI surface for the same behavior.

## Risks / Trade-offs

- Existing saved in-progress attempts may remain on disk after deployment -> Gallery ignores them for continuation; candidates can start a fresh attempt, and quitting any active attempt deletes it.
- Accidental deletion after confirmation cannot be undone -> Confirmation text must clearly warn that the attempt and answers will be erased.
- Deleting a submitted or graded attempt through the API would break grading/result flows -> The delete endpoint should reject attempts whose status is not `in-progress`.
- Upload cleanup depends on uploads staying under the attempt directory -> Keep storage deletion scoped to `attemptDir(attemptId)` and avoid deleting result files.

## Migration Plan

1. Add the backend deletion helper and API route.
2. Update gallery derivation and type definitions to remove the resume action.
3. Add the exam runner quit control and German confirmation flow.
4. Add tests for gallery no-resume behavior and in-progress attempt deletion.

Rollback is straightforward: remove the delete route/control and restore `Fortsetzen` derivation for in-progress attempts.

## Open Questions

- Should the project later switch all visible German copy from ASCII transliteration to proper umlauts? This change will match the current application style unless that broader decision is made separately.
