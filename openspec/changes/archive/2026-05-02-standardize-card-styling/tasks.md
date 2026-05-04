## 1. Styling Foundation

- [x] 1.1 Add CSS custom properties for repeated surface colors, borders, radius, shadow, shell spacing, layout gaps, card padding, compact card padding, card gaps, and compact card gaps.
- [x] 1.2 Introduce shared card/surface CSS classes that own the common background, border, radius, and shadow treatment.
- [x] 1.3 Define standard and compact card spacing variants using the new spacing properties.

## 2. Apply Card System

- [x] 2.1 Apply the shared surface and standard spacing classes to gallery exam cards and preserve existing heading, metadata, status, and action behavior.
- [x] 2.2 Apply the shared surface and spacing classes to paper headers, instruction bands, task blocks, and task cards while preserving the excluded task state.
- [x] 2.3 Apply the shared surface and spacing classes to result summary and paper result cards.
- [x] 2.4 Remove obsolete duplicated surface, padding, and gap declarations after the shared classes cover the affected surfaces.

## 3. Responsive Behavior

- [x] 3.1 Update the gallery grid column sizing so cards fit within narrow mobile content widths without horizontal overflow.
- [x] 3.2 Review the mobile media query to ensure topbar, paper header, block header, task title row, and sticky actions still stack cleanly with the standardized spacing.

## 4. Verification

- [x] 4.1 Run `npm run build` to verify TypeScript and production bundling still pass.
- [x] 4.2 Run `npm test` to confirm existing exam logic behavior is unchanged.
- [x] 4.3 Inspect the gallery, exam runner, and result view styling for consistent card spacing and mobile-safe layout.
