## Context

The app is a compact React/Vite exam trainer with most visible UI implemented in `src/App.tsx` and `src/styles.css`. Card-like surfaces already share a white background, border, radius, and light shadow in some places, but the same concept is repeated separately for gallery cards, paper headers, instruction bands, task blocks, task cards, result summaries, and paper result cards.

The current CSS mixes several nearby spacing values: card padding uses 16, 18, 20, and 22px, while internal gaps use 8, 12, 14, and 18px. The result is visually close but not systematic. The gallery grid also uses a 320px minimum column width, which can overflow narrow mobile screens once shell padding is applied.

## Goals / Non-Goals

**Goals:**

- Establish reusable CSS tokens for repeated surface and spacing values.
- Give all card-like surfaces a common baseline for background, border, radius, and shadow.
- Use a small set of named card spacing variants instead of one-off padding and gap values.
- Preserve existing semantic states, labels, colors, icons, and exam behavior.
- Make the gallery grid responsive down to small mobile widths without horizontal overflow.

**Non-Goals:**

- Redesign the application visual identity or color palette.
- Introduce a component library, CSS preprocessor, design-token build pipeline, or new dependency.
- Change exam data, grading behavior, persistence behavior, or API routes.
- Add new navigation or alter task/exam workflows.

## Decisions

1. Use CSS custom properties in `:root` for spacing and surface tokens.

   Rationale: The project already uses plain CSS and has a small frontend. CSS variables keep the change local, readable, and easy to apply without adding a build step.

   Alternative considered: introduce a TypeScript theme object or CSS module layer. That would add indirection without solving a current scaling problem.

2. Define reusable surface classes for card-like containers.

   Rationale: A shared `.surface` or equivalent class makes the white bordered card treatment repeatable across gallery, exam, and result views. Existing semantic class names can remain for layout-specific rules.

   Alternative considered: keep grouping selectors only, such as `.exam-card, .task-card, ...`. Grouping selectors reduce duplication but do not provide a reusable class for new cards and tend to grow harder to scan.

3. Separate surface chrome from density.

   Rationale: Gallery cards, task cards, and compact result cards may reasonably need different density, but those differences should come from named variants such as standard and compact rather than ad hoc values.

   Alternative considered: force every card to use exactly the same padding and gap. That would be simple, but it would likely make dense exam-task content feel too loose or gallery cards feel too cramped.

4. Fix gallery responsiveness with a mobile-safe grid column definition.

   Rationale: The current `minmax(320px, 1fr)` can exceed the available content width on narrow screens. Using a lower minimum or `minmax(min(100%, ...), 1fr)` keeps cards inside the viewport while preserving larger desktop columns.

   Alternative considered: add a mobile media query only. A safer grid expression works across breakpoints and reduces special-case behavior.

## Risks / Trade-offs

- Minor visual shift across many surfaces -> Mitigate by keeping the existing palette, border radius, and shadow strength while changing only repeated spacing and class structure.
- Shared classes could hide semantic intent -> Mitigate by preserving semantic class names such as `.exam-card`, `.task-card`, and `.result-summary` for layout-specific rules.
- Card density could become too uniform for long exam content -> Mitigate with explicit standard and compact variants instead of one global card size.
- Mobile fix could make cards narrower than intended on desktop-like layouts -> Mitigate by preserving the current approximate desktop column width while allowing the minimum to shrink only when the viewport requires it.
