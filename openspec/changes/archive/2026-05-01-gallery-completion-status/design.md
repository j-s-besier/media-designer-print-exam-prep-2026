## Context

The gallery currently derives a single `GalleryStatus` from attempt/result workflow state. That status is rendered as copy such as `nicht gestartet`, `bereit zur Auswertung`, or `bewertet`. The primary action is also derived from the same card model, but the action already carries the workflow need: `Pruefen`, `Prompt kopieren`, or `Ergebnis anzeigen`.

The requested UI separates those concepts. The visible status should communicate completion outcome, while the action should keep communicating what the user can do next.

```
Inputs                         Visible status        Action
────────────────────────────────────────────────────────────────
No result                      ToDo                 Pruefen or Prompt kopieren
Result < 50%                   Nicht bestanden      Ergebnis anzeigen
Result >= 50%                  Bestanden            Ergebnis anzeigen
```

## Goals / Non-Goals

**Goals:**

- Use `weightedWrittenPercentage >= 50` as the pass threshold.
- Show only `ToDo`, `Nicht bestanden`, or `Bestanden` in the gallery status field.
- Color the status value blue, red, and green respectively.
- Preserve existing action behavior, including `Prompt kopieren` for submitted attempts awaiting grading.
- Use `-` for unavailable `Bewertung` and `Punkte` values.

**Non-Goals:**

- No full IHK final-grade calculation including PB1.
- No change to the grading algorithm or result schema.
- No icon-only unavailable-state design.
- No broader German copy or umlaut conversion pass.

## Decisions

1. Treat 50 percent weighted written score as passed.

   The app currently stores and displays `weightedWrittenPercentage` for the written PB4/PB2/PB3 flow. The status will derive `Bestanden` when that value is greater than or equal to 50, and `Nicht bestanden` below 50.

   Alternative considered: use `fullExamWrittenContribution`. That value is capped at the written exam's 50 percent contribution and would make the threshold less direct for the current written-only trainer.

2. Keep action and status separate.

   A submitted attempt without result remains actionable as `Prompt kopieren`, but its visible completion status remains `ToDo` because no evaluation exists yet. This avoids overloading the status label with workflow phrases.

   Alternative considered: keep `bereit zur Auswertung` as a status. That conflicts with the requested completion-oriented labels.

3. Use dashes for unavailable numbers.

   The current card already uses compact text values. `-` is more stable than introducing icons for missing score and point values, and it avoids adding tooltips or visual ambiguity.

   Alternative considered: use an icon for missing statistics. That is more decorative but less explicit in the current three-column meta grid.

## Risks / Trade-offs

- Written-only pass status may be mistaken for full final exam status -> The label derives from the app's existing written `weightedWrittenPercentage`; PB1 remains out of scope.
- Multiple active gallery changes touch related behavior -> Apply/archive should preserve the completed no-resume behavior from `quit-exam-deletes-attempt`.
- Color alone is not enough for accessibility -> The labels remain textual, and color only reinforces the state.

## Migration Plan

1. Update gallery status types and derivation logic.
2. Update gallery rendering for status classes and unavailable value dashes.
3. Add blue/red/green status badge styles.
4. Update tests for ToDo, failed, passed, and unchanged actions.

Rollback restores the workflow-oriented status labels and previous unavailable score copy.

## Open Questions

- None. The pass threshold is set to 50 percent as requested.
