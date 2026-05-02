## 1. Header And Paper Metadata

- [x] 1.1 Update the trainer shell header copy to show `Pruefungstrainer`, `Mediengestalter Digital und Print`, and `Bereich: Printmedien`.
- [x] 1.2 Adjust header layout and responsive styling so the three-line hierarchy fits cleanly on gallery and exam views.
- [x] 1.3 Change paper weight metadata from `Gewicht` to `Gewichtung`.

## 2. Exclusion Progress And Validation Feedback

- [x] 2.1 Add a concise current-paper exclusion summary derived from block selections and requirements.
- [x] 2.2 Keep that exclusion summary visible in or near the sticky action area while scrolling.
- [x] 2.3 Replace long sticky validation text with compact missing-exclusion wording.
- [x] 2.4 Preserve detailed block-level validation where needed for submission blocking or tests.

## 3. Excluded Task Visual State

- [x] 3.1 Strengthen the excluded task card visual treatment so the whole task reads as struck/excluded.
- [x] 3.2 Keep excluded task content visible and readable after exclusion.
- [x] 3.3 Ensure answer controls remain disabled for excluded tasks.
- [x] 3.4 Verify toggling exclusion on/off restores the active task visual state.

## 4. Sticky Action Controls

- [x] 4.1 Change the quit action in the sticky bar to an icon-only destructive button.
- [x] 4.2 Add accessible name and tooltip/title text for the icon-only quit action.
- [x] 4.3 Preserve the existing German destructive confirmation behavior.
- [x] 4.4 Check mobile and desktop sticky action layout for text fit and overlap.

## 5. Verification

- [x] 5.1 Add or update tests for concise validation summaries and exclusion progress derivation.
- [x] 5.2 Run `npm test`.
- [x] 5.3 Run `npm run build`.
- [x] 5.4 Verify the annotated gallery and exam-runner screens in the in-app browser.
