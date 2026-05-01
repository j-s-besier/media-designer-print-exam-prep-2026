## Why

Card-like surfaces in the app currently share the same general look but use different padding, gap, and surface definitions across gallery cards, task cards, result cards, and exam sections. This makes the UI feel slightly uneven and makes future card additions harder to keep consistent.

## What Changes

- Introduce a repeatable card/surface styling system for the React app.
- Standardize spacing tokens for shell padding, layout gaps, card padding, compact card padding, and inner content gaps.
- Apply the shared card/surface baseline to gallery cards, exam task cards, paper sections, instruction sections, result summaries, and paper result cards.
- Keep semantic visual variants, such as excluded task cards and status badges, while aligning their spacing with the shared system.
- Improve narrow mobile behavior so gallery cards do not overflow small viewports.

## Capabilities

### New Capabilities
- `interface-card-styling`: Covers reusable card and surface styling rules for the exam trainer UI.

### Modified Capabilities

## Impact

- Affected code: `src/styles.css`, with possible low-risk class name adjustments in `src/App.tsx` if needed to apply shared card/surface classes cleanly.
- No API, data model, exam package, grading, or persistence changes.
- No new runtime dependencies expected.
