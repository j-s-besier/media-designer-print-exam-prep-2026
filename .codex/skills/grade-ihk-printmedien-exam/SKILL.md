---
name: grade-ihk-printmedien-exam
description: Grade a submitted Mediengestalter Digital und Print Printmedien written exam attempt using public exam.json, private solution.json, and attempt.json, producing result.json with raw and weighted written scores.
---

# Grade IHK Printmedien Exam

Use this skill when asked to evaluate a submitted fillable exam attempt.

## Workflow

1. Identify the attempt ID in `data/attempts/<attempt-id>/attempt.json`.
2. Ensure the attempt status is `submitted` or `graded`.
3. Grade it with:
   ```bash
   npm run grade -- <attempt-id>
   ```
4. Review the generated `data/results/<attempt-id>.result.json`.
5. Report:
   - raw written points
   - weighted written percentage
   - full-exam written contribution excluding PB1
   - papers or subtasks requiring manual review

## Grading Inputs

- Public exam: `data/exams/<exam-id>/exam.json`
- Private solution: `data/private/solutions/<exam-id>/solution.json`
- Attempt: `data/attempts/<attempt-id>/attempt.json`

Never load private `solution.json` in the client app or expose it through public routes.

## Scoring Rules

- Excluded tasks are ignored and marked as excluded.
- Invalid exclusions apply the configured fallback policy when possible or require manual review.
- Score at subtask level against rubric criteria.
- Aggregate to task, paper, raw written totals, weighted written percentage, and written contribution toward the full exam.
- PB1 is not included in this written result.

## Limits

The result is a transparent, practice-oriented approximation. It does not claim official IHK Rheinhessen equivalence because official internal scoring keys are not public.
