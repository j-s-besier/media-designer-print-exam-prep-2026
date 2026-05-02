## Context

Task exclusion is already represented in the exam runner state by applying an `excluded` class to the task card. The current presentation is CSS-driven: excluded cards get muted colors, disabled inputs, a single near-horizontal overlay line, and text decoration only on the task title.

The requested behavior is stronger and more literal: the card should look crossed out from both diagonals, the card border should turn red, and the visible task text should be struck through. The implementation should remain a presentation change around the existing exclusion state.

## Goals / Non-Goals

**Goals:**

- Make excluded task cards immediately recognizable with two red diagonal strokes across the full card.
- Use a red card border for the excluded state.
- Apply text strikethrough broadly across task copy, prompts, subtasks, table text, labels, and visible answer text.
- Keep the excluded task content visible for review and keep answer fields disabled.
- Preserve existing card spacing, validation, grading, persistence, and selection behavior.

**Non-Goals:**

- Do not change how tasks are selected, stored, submitted, or graded.
- Do not remove hidden or visible task content from excluded cards.
- Do not introduce a new UI library, dependency, or component abstraction.
- Do not change gallery cards or result cards.

## Decisions

1. Keep the implementation state-driven through the existing `task-card excluded` class.

   The React runner already computes the correct excluded state. CSS can express the red border, diagonal card overlay, muted controls, and text decoration without changing data flow or validation.

2. Use two pseudo-elements for the card-level diagonals.

   The current implementation uses one `::after` line. The new state should use both available pseudo-elements, positioned absolutely over the task card with `pointer-events: none`, so the overlay does not block the existing `Streichen` action or read-only review interactions.

3. Apply text strikethrough with scoped selectors inside excluded task cards.

   Broadly targeting textual descendants inside `.task-card.excluded` keeps the behavior localized and avoids changing shared typography. Inputs and textareas should keep their disabled behavior and muted background while their visible values are also text-decorated where browser support allows it.

4. Keep form controls usable enough to reverse the exclusion before submission.

   The `Streichen` button must remain clickable while the paper is editable. Its text may receive the same visual treatment if required by the global excluded-card selector, but the button must remain readable and visually identifiable as the control for toggling the state.

## Risks / Trade-offs

- Red diagonal overlays can reduce readability -> use controlled opacity and line thickness while keeping the content visible.
- Pseudo-element diagonals can clip or miss corners on cards with dynamic height -> calculate the diagonal length relative to card dimensions and verify long and narrow cards.
- Browser support for `text-decoration` on form values can be inconsistent -> cover labels and surrounding text explicitly, and keep disabled answer fields visually muted even if a browser does not decorate input values.
- Mobile cards stack controls and content differently -> verify the overlay and text decoration on a narrow viewport before finishing implementation.
