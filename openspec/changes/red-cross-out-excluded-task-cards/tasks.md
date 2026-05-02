## 1. Excluded Card Styling

- [ ] 1.1 Update `.task-card.excluded` so excluded cards use a red border while preserving shared card padding and gap values.
- [ ] 1.2 Replace the current single card strike with two red diagonal pseudo-element strikes spanning corner-to-corner across the task card.
- [ ] 1.3 Scope the diagonal overlays so they do not block pointer events or prevent the `Streichen` action from toggling the card state.

## 2. Text and Control Treatment

- [ ] 2.1 Apply strikethrough treatment to visible text content inside excluded task cards, including prompts, subtasks, lists, table text, labels, and code.
- [ ] 2.2 Keep excluded answer fields visible, disabled, and visually muted while preserving their layout.
- [ ] 2.3 Ensure clearing the exclusion removes the red border, diagonal strikes, and strikethrough treatment.

## 3. Verification

- [ ] 3.1 Run the existing test suite or relevant checks.
- [ ] 3.2 Verify an excluded task card visually on desktop width.
- [ ] 3.3 Verify an excluded task card visually on a narrow mobile width.
- [ ] 3.4 Run OpenSpec validation for `red-cross-out-excluded-task-cards`.
