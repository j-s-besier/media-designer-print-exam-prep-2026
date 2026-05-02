## Context

The current app shell uses a compact eyebrow plus large title. The browser annotation asks for clearer hierarchy: the product name first, then profession and print specialization. The exam runner also has long pages, especially PB4, where candidates can scroll far away from the block header and lose track of how many tasks still need to be excluded.

The sticky action bar already exists and can carry compact feedback, but it currently shows long validation sentences and a text-heavy destructive quit button. Excluded tasks already receive a class, but the visual treatment is too subtle because the full task remains visually similar to active tasks.

## Goals / Non-Goals

**Goals:**

- Make header copy match the requested three-line wording and hierarchy.
- Use `Gewichtung` as the paper metadata label.
- Keep exclusion progress visible while candidates scroll through a block.
- Make excluded tasks visibly struck/excluded without removing any task content.
- Make sticky validation feedback shorter and easier to scan.
- Make the quit action icon-only while preserving accessibility and the existing confirmation behavior.

**Non-Goals:**

- Do not change exam data, scoring, validation, selection rules, or persistence behavior.
- Do not remove excluded tasks from the page.
- Do not remove the destructive quit confirmation.
- Do not introduce a new UI component library.

## Decisions

1. Treat this as UI presentation and interaction feedback only.

   Existing attempt data and block-selection logic are already correct. The implementation should keep the current state model and adjust copy, layout, and CSS around it.

2. Use accessible visual compactness.

   The quit action should visually show only the icon in the sticky bar, but it must keep an `aria-label` and tooltip/title such as `Pruefung beenden`. This preserves keyboard/screen-reader meaning while reducing visual clutter.

3. Make exclusion progress visible near the sticky controls.

   Block headers can still show local counts, but the sticky area should include a concise always-visible summary of outstanding exclusions for the current paper. This avoids relying on `position: sticky` inside each block, which can be fragile with nested cards and long content.

4. Strike the entire excluded task at the card level.

   Use a clear excluded state on the task card: muted foreground, tinted background, disabled inputs, and a visible strike or overlay treatment that affects the full task content. The card remains readable and present for auditability.

## Risks / Trade-offs

- Sticky summary can become crowded on narrow screens -> keep wording short and allow wrapping before action buttons.
- A strong strikethrough can reduce readability -> combine muted styling with a controlled strike treatment and keep contrast acceptable.
- Icon-only destructive action can be unclear -> keep tooltip/title and use destructive color plus existing confirmation dialog.
- Header wording changes may affect gallery and runner layouts -> verify both desktop and mobile screenshots after implementation.

