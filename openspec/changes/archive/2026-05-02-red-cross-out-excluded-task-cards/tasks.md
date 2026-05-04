## 1. Excluded Card Styling

- [x] 1.1 Update `.task-card.excluded` so excluded cards use a red border while preserving shared card padding and gap values.
- [x] 1.2 Remove card-level diagonal strike overlays from excluded task cards.
- [x] 1.3 Keep the `Streichen` action unobstructed and able to toggle the card state.

## 2. Text and Control Treatment

- [x] 2.1 Apply strikethrough treatment to visible text content inside excluded task cards, including prompts, subtasks, lists, table text, labels, and code.
- [x] 2.2 Keep excluded answer fields visible, disabled, and visually muted while preserving their layout.
- [x] 2.3 Ensure clearing the exclusion removes the red border and strikethrough treatment.

## 3. Verification

- [x] 3.1 Run the existing test suite or relevant checks.
- [x] 3.2 Verify an excluded task card visually on desktop width.
- [x] 3.3 Verify an excluded task card visually on a narrow mobile width.
- [x] 3.4 Run OpenSpec validation for `red-cross-out-excluded-task-cards`.
