---
name: create-ihk-printmedien-exam
description: Create a legally safe, original, IHK/ZFA-like written Mediengestalter Digital und Print exam package for Fachrichtung Printmedien. Use when asked to generate exam.json, private solution.json, manifest.json, assets metadata, or a complete fillable exam package from public structure and topic guidance.
---

# Create IHK Printmedien Exam

Use this skill to create a new original written exam package for the app.

## Workflow

1. Read `openspec/research/research.md` and `openspec/research/themen_printmedien_ap_sommer_2026.md`.
2. Choose the next numbered exam identity:
   - Package ID: lowercase `mgdp-<n>` such as `mgdp-1`
   - Display label: matching `MgDp-<n>` such as `MgDp-1`
   - Use the next highest unused number from existing `data/exams/mgdp-*` packages.
   - Do not create season-, date-, topic-, or practice-name-based exam IDs or titles.
3. Create a public package under `data/exams/<exam-id>/`:
   - `manifest.json`
   - `exam.json`
   - optional `assets/`
   - `validation-report.json`
4. Create the private solution under `data/private/solutions/<exam-id>/solution.json`.
5. Keep `solution.json` out of public exam directories and out of client app code.
6. Validate the package:
   ```bash
   npm run validate:exam -- <exam-id>
   ```
7. If generating the default sample package, run:
   ```bash
   npx tsx scripts/seedSampleExam.ts
   ```

## Naming Rules

- Store the package identity as lowercase `mgdp-<n>` everywhere an ID is required:
  - public package directory
  - private solution directory
  - `manifest.id`
  - `exam.id`
  - `solution.examId`
- Use the matching display label `MgDp-<n>` for `manifest.title` and `exam.title`.
- Do not invent separate descriptive exam names. Keep season/topic context in summaries, sources, prompts, or provenance only when useful.

## Required Structure

- Written flow only: PB4, PB2, PB3.
- PB1 is not part of the written exam package.
- PB4: 60 minutes, 10 percent weight, explicit blocks and answer fields.
- PB2: 120 minutes, 20 percent weight.
- PB3: 120 minutes, 20 percent weight.
- PB2/PB3:
  - U1-U8 general block, 8 offered, 7 required.
  - U9-U12 Printmedien block, 4 offered, 3 required.
  - Every PB2/PB3 task has 10 points.
  - Subtask point totals must equal task max points.

## Legal Guardrails

Do not copy, closely paraphrase, extract, or redistribute original IHK, ZFA, Christiani, or other protected exam tasks, PDFs, answer keys, images, or layouts.

Allowed:
- Public structure, timing, task counts, operators, topic lists, and point logic.
- Newly written scenarios, values, prompts, and rubrics.
- User-provided assets only when rights metadata is present.

Every generated task must include provenance:

```json
{
  "sourceType": "original-generated",
  "basis": "Generated from public structure and topic guidance; not copied from protected original exam material.",
  "notDerivedFromProtectedExam": true,
  "rightsStatus": "generated",
  "requiresManualRightsReview": false
}
```

## Output Rules

- `exam.json` contains only renderable public content.
- `solution.json` contains rubrics, model-answer guidance, criteria, keywords, and manual-review hints.
- Do not place solution/rubric/model answer fields in `exam.json`.
- Learner-facing point labels must be rounded to one decimal place. Keep precise internal numeric values where exact scoring totals depend on them.
- Run validation before finishing.
