## Context

The current flow persists `data/attempts/<attemptId>/attempt.json` immediately when the frontend calls `POST /api/exams/:examId/attempts`. The exam runner then keeps a manual `Speichern` button that sends the whole attempt to `PUT /api/attempts/:attemptId`, and paper submission calls that save path before submitting the paper.

The desired flow treats in-progress work as session-local. Starting an exam may allocate an attempt id, but it must not create a durable attempt record. The only durable attempt record for a normal solve path is the final submitted attempt used by the grading prompt. Quitting remains destructive and should clean up any server-side upload directory that may have been created during the session.

```
Start exam
  |
  v
Transient attempt in browser state
  |
  +--> Browser closes/crashes --------> no attempt.json is written
  |
  +--> Beenden confirmed -------------> DELETE cleans attempt dir if present
  |
  +--> Intermediate paper submit -----> API validates/advances state, returns JSON, no attempt.json
  |
  +--> Final paper submit ------------> API marks submitted and writes attempt.json
```

## Goals / Non-Goals

**Goals:**

- Remove the manual save action from the exam runner.
- Keep started and partially solved attempts out of `data/attempts` unless the whole exam is submitted.
- Preserve sequential paper validation and read-only submitted-paper behavior within the active browser session.
- Ensure a completed exam is saved as a submitted attempt so the existing gallery grading prompt and grading workflow keep working.
- Let `Pruefung beenden` succeed for both saved in-progress attempts and transient attempts that only have an upload directory or no server data.

**Non-Goals:**

- No browser localStorage/sessionStorage recovery.
- No autosave, crash recovery, or resume workflow.
- No new authentication or ownership checks.
- No redesign of file upload storage beyond cleanup on explicit quit.

## Decisions

1. Create transient attempts on start.

   `POST /api/exams/:examId/attempts` will return a freshly created attempt object without writing `attempt.json`. This keeps the UI contract simple while satisfying the requirement that browser close/crash leaves no saved attempt record.

   Alternative considered: create an attempt record and delete it on unload. That cannot handle crashes reliably and still writes data while solving.

2. Remove the generic attempt update route from the active UI.

   The frontend will no longer call `PUT /api/attempts/:attemptId`, and the save button will be removed. Paper submission will send the current in-memory attempt in the request body to the submit endpoint, making that endpoint the only normal path that can persist exam-runner data.

   Alternative considered: keep the PUT route but hide the button. That leaves an unnecessary write path for in-progress attempts and makes the persistence rule easier to violate later.

3. Persist only on final paper submission.

   The paper-submit endpoint will validate and advance the attempt in memory for intermediate papers, then return the advanced attempt without saving it. When there is no next paper, the endpoint marks the attempt `submitted`, sets `submittedAt`, writes `attempt.json`, and returns the submitted attempt.

   Alternative considered: save after each paper submission. That would create a partially solved attempt record and contradict the stricter "only saved on completion" behavior.

4. Make quit deletion tolerant of transient attempts.

   `deleteInProgressAttempt` will still reject saved `submitted` and `graded` attempts, but it will treat a missing `attempt.json` as transient server data and remove the attempt directory if one exists. If there is no directory, deletion is a no-op success for the current session.

   Alternative considered: return 404 for transient attempts. That would show an error when the user quits an unsaved attempt, even though the desired result is simply "nothing remains saved."

## Risks / Trade-offs

- Uploaded files are still written before final completion when file upload fields are used -> confirmed quit removes them; a browser crash can leave an orphan upload directory without `attempt.json`, which gallery and grading ignore.
- Removing the generic update route can break stale clients -> the app is local and versioned with the server; tests will exercise the current client/server contract.
- Keeping intermediate submitted-paper state only in memory means refresh loses progress -> this is intentional exam-mode behavior.
- Existing saved in-progress attempts from older versions may remain on disk -> gallery already treats in-progress attempts as fresh-start cards, and explicit delete still removes them when targeted.

## Migration Plan

1. Change attempt creation to return an unsaved attempt.
2. Remove the frontend save action and save-before-submit call.
3. Change paper submission to accept the client attempt payload and save only on final completion.
4. Make quit deletion tolerate transient/missing attempt records while preserving submitted/graded rejection.
5. Add focused tests for transient start, final-only persistence, and transient quit cleanup.

Rollback restores the previous `createAttempt` save call, reintroduces the save button and PUT route, and reverts submit handling to load and save the server-side attempt.

## Open Questions

- Should a later cleanup command remove orphan upload directories that have no `attempt.json` after crashes? It is not needed for attempt visibility or grading, but it could keep `data/attempts` tidier over time.
