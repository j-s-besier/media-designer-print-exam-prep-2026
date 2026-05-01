## 1. Package Identity Migration

- [ ] 1.1 Choose the final mapping for existing generated packages to numbered IDs, starting with `mgdp-1`.
- [ ] 1.2 Rename public exam package directories under `data/exams/` to the selected numbered IDs.
- [ ] 1.3 Rename matching private solution directories under `data/private/solutions/`.
- [ ] 1.4 Update `manifest.id`, `exam.id`, `solution.examId`, `manifest.title`, and `exam.title` for every migrated package.
- [ ] 1.5 Update tests and fixture constants that reference old descriptive exam IDs.

## 2. Creation Workflow

- [ ] 2.1 Update `.codex/skills/create-ihk-printmedien-exam/SKILL.md` to require `mgdp-<n>` package IDs and `MgDp-<n>` display labels.
- [ ] 2.2 Update `scripts/seedSampleExam.ts` so generated packages use numbered IDs and no descriptive titles.
- [ ] 2.3 Ensure the generator selects the next highest unused `mgdp-<n>` ID when creating future packages.
- [ ] 2.4 Update generated templates in `data/templates/` to show the numbered ID/title convention.

## 3. Point Formatting And Grading Precision

- [ ] 3.1 Add or update a shared one-decimal point formatting helper in `src/lib/examLogic.ts`.
- [ ] 3.2 Use one-decimal formatting for gallery score and point labels.
- [ ] 3.3 Use one-decimal formatting for exam-runner task and subtask point labels.
- [ ] 3.4 Use one-decimal formatting for result summary and per-paper result views.
- [ ] 3.5 Change grading result rounding so persisted awarded points, possible points, percentages, weighted contributions, and subtask scores use one decimal place after aggregation.
- [ ] 3.6 Preserve precise internal exam point values where exact scoring totals depend on them.

## 4. Validation And Regression Coverage

- [ ] 4.1 Update package validation expectations for numbered IDs and titles.
- [ ] 4.2 Add regression coverage for one-decimal display labels, including fractional PB4 point values.
- [ ] 4.3 Add grading regression coverage that verifies one-decimal stored result precision.
- [ ] 4.4 Run `npm run validate:exam -- <exam-id>` for each migrated package.
- [ ] 4.5 Run the full test suite.
