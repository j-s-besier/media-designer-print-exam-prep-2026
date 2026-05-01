## Why

The project needs a structured way to create, render, complete, and evaluate written exam simulations for Mediengestalter Digital und Print, Fachrichtung Printmedien, without copying protected IHK/ZFA/Christiani material. A JSON-based exam package plus separate attempt and grading data will make each exam reusable in an app while preserving the real written exam flow, task-selection rules, and point structure.

## What Changes

- Add a structured exam package format for individual written exams, including `manifest.json`, `exam.json`, private `solution.json`, assets, and validation output.
- Add a gallery-oriented app model that lists available exams with ID, status, percentage result, point result, and action button state.
- Add an exam-taking flow that renders PB4, PB2, and PB3 sequentially, stores answers separately from exam content, enforces block-level task exclusion limits, and supports file uploads for sketch/drawing tasks.
- Add a grading workflow that uses `exam.json`, `solution.json`, and `attempt.json` to produce a separate `result.json`.
- Add guardrails so generated exams follow the researched IHK/ZFA-like structure while using original, legally safe content rather than copied protected tasks or assets.

## Capabilities

### New Capabilities

- `exam-package-model`: Defines the JSON package structure for exams, private solutions, manifests, assets, validation reports, attempts, and results.
- `exam-gallery`: Defines how available exams and their attempt/result state are shown on the main page.
- `exam-taking-flow`: Defines sequential rendering, answer capture, task exclusion, upload handling, and paper submission behavior.
- `exam-grading-workflow`: Defines how a Codex-based grading workflow evaluates attempts against private rubrics and emits results.
- `exam-content-compliance`: Defines legal/content-safety requirements for generated exam content and user-provided materials.

### Modified Capabilities

- None.

## Impact

- New data schemas and templates for exam packages, attempts, solutions, and results.
- New app surfaces for exam gallery, paper-by-paper exam taking, submission confirmation, and result display.
- New Codex skills/workflows for creating legally safe exam packages, validating package structure, and grading submitted attempts.
- New validation rules based on the researched written exam structure: PB4, PB2, PB3; PB2/PB3 with U1-U8 general tasks, U9-U12 Printmedien tasks, 7+3 task selection, 10 points per task, and no PB1 in the written exam flow.
