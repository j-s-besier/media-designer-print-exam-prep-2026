## 1. Backend Persistence

- [ ] 1.1 Return new exam attempts without writing `attempt.json` on start.
- [ ] 1.2 Remove the generic in-progress attempt update route from the normal API surface.
- [ ] 1.3 Update paper submission to accept the active attempt payload, advance it in memory, and write `attempt.json` only after the final paper.
- [ ] 1.4 Make quit deletion succeed for transient attempts while still rejecting saved submitted or graded attempts.

## 2. Frontend Flow

- [ ] 2.1 Remove the `Speichern` button, save indicator, and manual save handler from the exam runner.
- [ ] 2.2 Submit the current in-memory attempt with each paper submission and keep intermediate progress in React state only.

## 3. Verification

- [ ] 3.1 Add or update tests for transient start, final-only attempt persistence, and transient quit cleanup.
- [ ] 3.2 Run the project test/build checks and OpenSpec validation for the change.
