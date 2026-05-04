## Context

Exam packages are currently identified by descriptive IDs and titles, for example `mediengestalter-printmedien-sommer-2026`. The package ID is used as the public package directory name, private solution directory name, route parameter, `exam.id`, `manifest.id`, `solution.examId`, and attempt/result `examId`.

The existing JSON schemas only allow lowercase IDs matching `^[a-z0-9-]+$`, while the desired learner-facing label is mixed case, for example `MgDp-1`. Point values are also a mixed concern: the PB4 bound-task model currently uses exact fractional values such as `40 / 15`, which are correct for scoring but poor for display.

## Goals / Non-Goals

**Goals:**

- Make future generated exams use simple numbered package IDs: `mgdp-1`, `mgdp-2`, `mgdp-3`, and so on.
- Make learner-facing exam labels use the matching display form: `MgDp-1`, `MgDp-2`, `MgDp-3`.
- Update the exam creation skill and sample generator so they stop creating descriptive names.
- Format learner-facing point values and grading summaries to exactly one decimal place.
- Keep exact numeric values available where needed for correct scoring and aggregation.

**Non-Goals:**

- Do not loosen the ID schema to allow uppercase IDs.
- Do not change the written exam structure, PB sequence, task counts, selection rules, or legal provenance requirements.
- Do not attempt to prove legal originality beyond the existing provenance and validation checks.
- Do not change PB1 handling; PB1 remains outside the written exam flow.

## Decisions

1. Store lowercase IDs and display mixed-case labels.

   Use `mgdp-<n>` as the stable ID everywhere the system needs a route-safe, schema-safe identifier. Use `MgDp-<n>` for `manifest.title`, `exam.title`, and visible labels. This avoids a schema migration and keeps existing file/URL conventions predictable.

   Alternative considered: allow uppercase IDs like `MgDp-1` in schemas and paths. That would create case-sensitivity risks across filesystems and routes for no functional benefit.

2. Treat exam numbering as creation-time behavior.

   The creation skill and default generator should choose the next available `mgdp-<n>` package ID by inspecting existing generated package IDs. Existing descriptive fixtures can be migrated once during implementation so the app starts from the numbered convention.

   Alternative considered: keep descriptive package IDs and only hide them in the UI. That would leave future grading prompts, data paths, and support/debug output using the old naming scheme.

3. Preserve precise model values; round presentation and grading outputs.

   The exam definition may keep values like `40 / 15` internally so selected PB4 bound tasks still total exactly 40 points before aggregation. UI labels and stored result totals should be rounded after calculation to one decimal place.

   Alternative considered: round all `exam.json` values to one decimal. For PB4, `2.7 * 15 = 40.5`, so rounding the source values would change the scoring model.

4. Centralize one-decimal formatting.

   Replace ad hoc point display with a shared helper for one-decimal labels. Use it in gallery cards, exam runner task/subtask point labels, result views, and grading prompt-visible summaries. Use a one-decimal numeric rounding helper for stored grading result totals.

   Alternative considered: call `.toFixed(1)` inline in each component. That would duplicate formatting and make regressions likely.

## Risks / Trade-offs

- Existing attempts/results may reference descriptive exam IDs -> migrate any durable local attempts/results if present, or document that the current clean development data set has no attempt/result migration.
- Renaming package directories touches public exam data and private solution data together -> update both sides in the same implementation step and validate every package afterward.
- One-decimal stored result rounding can hide tiny scoring differences -> perform calculations first, then round only final persisted result fields and displayed labels.
- Numbering based on existing directories can skip numbers after archived/deleted packages -> prefer monotonic next-highest numbering over reusing IDs.

## Migration Plan

1. Rename existing generated package directories to the numbered convention and update all internal IDs and titles.
2. Rename matching private solution directories and update `solution.examId`.
3. Update tests and fixture constants to use the new IDs.
4. Update the creation skill and sample generator so future packages use numbered IDs and display labels.
5. Update formatting and grading helpers for one-decimal output.
6. Run package validation and the test suite.
7. If local attempts/results exist outside the test fixtures, update their `examId` references or remove stale development attempts before delivery.

