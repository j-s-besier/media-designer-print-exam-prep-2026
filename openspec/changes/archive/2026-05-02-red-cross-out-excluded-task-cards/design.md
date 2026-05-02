## Context

Task exclusion is already represented in the exam runner state by applying an `excluded` class to the task card. The current presentation is CSS-driven: excluded cards get muted colors, disabled inputs, a single near-horizontal overlay line, and text decoration only on the task title.

The requested behavior is stronger than the original subtle state but should not use card-level cross overlays. The card border should turn red and the visible task text should be struck through. The implementation should remain a presentation change around the existing exclusion state.

## Goals / Non-Goals

**Goals:**

- Use a red card border for the excluded state.
- Apply text strikethrough broadly across task copy, prompts, subtasks, table text, labels, and visible answer text.
- Keep the excluded task content visible for review and keep answer fields disabled.
- Remove the large card-level cross overlays while preserving the rest of the excluded visual state.
- Preserve existing card spacing, validation, grading, persistence, and selection behavior.

**Non-Goals:**

- Do not change how tasks are selected, stored, submitted, or graded.
- Do not remove hidden or visible task content from excluded cards.
- Do not introduce a new UI library, dependency, or component abstraction.
- Do not change gallery cards or result cards.

## Decisions

1. Keep the implementation state-driven through the existing `task-card excluded` class.

   The React runner already computes the correct excluded state. CSS can express the red border, muted controls, and text decoration without changing data flow or validation.

2. Avoid card-level diagonal pseudo-elements.

   The excluded state should not draw large overlay crosses. This keeps the card content and sticky footer unobstructed and leaves the exclusion signal to the red border, muted field styling, and text strikethrough.

3. Apply text strikethrough with scoped selectors inside excluded task cards.

   Broadly targeting textual descendants inside `.task-card.excluded` keeps the behavior localized and avoids changing shared typography. Inputs and textareas should keep their disabled behavior and muted background while their visible values are also text-decorated where browser support allows it.

4. Keep form controls usable enough to reverse the exclusion before submission.

   The `Streichen` button must remain clickable while the paper is editable. Its text may receive the same visual treatment if required by the global excluded-card selector, but the button must remain readable and visually identifiable as the control for toggling the state.

## Risks / Trade-offs

- Browser support for `text-decoration` on form values can be inconsistent -> cover labels and surrounding text explicitly, and keep disabled answer fields visually muted even if a browser does not decorate input values.
- Mobile cards stack controls and content differently -> verify the border, text decoration, and sticky footer on a narrow viewport before finishing implementation.
