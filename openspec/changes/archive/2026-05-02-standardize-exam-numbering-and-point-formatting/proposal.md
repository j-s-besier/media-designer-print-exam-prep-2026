## Why

Generated exam packages currently use descriptive season- or practice-exam names such as `mediengestalter-printmedien-sommer-2026`, while the learner-facing gallery repeats those descriptive titles. Future generated exams should be simple numbered entries so the app can grow a clean ordered set without inventing separate names.

Point values are also exposed inconsistently: internal PB4 point values can appear as long floating-point numbers, while result summaries use mixed integer and decimal formatting. Learners should see points rounded to one decimal place everywhere points are displayed.

## What Changes

- Standardize generated exam package identity to sequential IDs like `mgdp-1`, `mgdp-2`, and `mgdp-3`, with display labels like `MgDp-1`.
- Update the exam creation skill and default sample generator so future exam packages do not invent descriptive exam names.
- Keep generated `manifest.title` and `exam.title` aligned to the numbered display label rather than season/practice wording.
- Preserve lowercase route/schema-safe package IDs unless the schema is explicitly changed later.
- Format learner-facing point values, score percentages, and result point totals to one decimal place.
- Keep precise internal numeric scoring where needed so PB4 totals remain mathematically stable.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `exam-package-model`: generated package identity and titles use sequential `mgdp-<n>` IDs with numbered display labels instead of descriptive names.
- `exam-gallery`: gallery cards display numbered exam labels and one-decimal score/point totals.
- `exam-taking-flow`: task and subtask point values shown during the exam are rounded to one decimal place.
- `exam-grading-workflow`: stored grading output and display-ready grading totals are rounded consistently to one decimal place.

## Impact

- `.codex/skills/create-ihk-printmedien-exam/SKILL.md`
- `scripts/seedSampleExam.ts`
- Existing exam package metadata and generated package directories under `data/exams/` and `data/private/solutions/`
- Numeric helpers in `src/lib/examLogic.ts`
- Gallery, runner, and result displays in `src/App.tsx`
- Grading aggregation in `server/grading.ts`
- Validation and regression tests in `tests/examSystem.test.ts`
