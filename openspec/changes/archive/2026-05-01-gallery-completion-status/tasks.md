## 1. Gallery Model

- [x] 1.1 Update `GalleryStatus` to use completion-oriented status values.
- [x] 1.2 Derive `ToDo`, `Nicht bestanden`, and `Bestanden` from result availability and the 50 percent threshold.
- [x] 1.3 Keep gallery action derivation independent from completion status.

## 2. Gallery UI

- [x] 2.1 Render the new status labels in the gallery meta grid.
- [x] 2.2 Render `-` for unavailable `Bewertung` and `Punkte` values.
- [x] 2.3 Add blue, red, and green status styles that work in the compact card layout.

## 3. Verification

- [x] 3.1 Update tests for ToDo, failed, passed, and submitted-awaiting-grading action behavior.
- [x] 3.2 Run OpenSpec validation and the project test/build checks.
