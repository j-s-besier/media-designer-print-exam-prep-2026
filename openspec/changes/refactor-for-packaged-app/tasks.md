## 1. Runtime Configuration

- [ ] 1.1 Add runtime path/config types for `resourceDir`, `userDataDir`, optional `privateSolutionsDir`, frontend build path, host, and port.
- [ ] 1.2 Update path resolution so development defaults still use repo-local `data/`.
- [ ] 1.3 Update storage paths so attempts, results, and uploads can write under configured writable user data.
- [ ] 1.4 Update validation paths so packaged-mode validation does not write into read-only public resources.
- [ ] 1.5 Update grading paths so private solutions are loaded only from configured trusted storage.

## 2. Server Production Runtime

- [ ] 2.1 Split Express app construction from `listen()` startup with a `createApiApp(config)` entry point.
- [ ] 2.2 Add production static serving for the Vite build output on the same local origin as `/api`.
- [ ] 2.3 Add startup behavior that binds to loopback and supports an available dynamic port.
- [ ] 2.4 Add graceful shutdown behavior for the local API.
- [ ] 2.5 Preserve existing `npm run dev` behavior with Vite proxy and API watch mode.

## 3. Packaged Grading Boundary

- [ ] 3.1 Make packaged grading return a clear unavailable error when no trusted private solution directory is configured.
- [ ] 3.2 Make packaged grading return a clear missing-solution error when the configured trusted directory lacks the matching solution.
- [ ] 3.3 Verify failed packaged grading does not write result files.
- [ ] 3.4 Ensure student-facing public routes and packaged resources do not expose private `solution.json` files.

## 4. Build And Desktop Packaging

- [ ] 4.1 Add a server build target that emits runnable JavaScript without relying on `tsx`.
- [ ] 4.2 Add production `build`, `serve`, and package scripts that run frontend build, server build, and package preparation in order.
- [ ] 4.3 Add an Electron wrapper that launches the local runtime and loads the selected local origin.
- [ ] 4.4 Configure package resource inclusion for public exams, schemas, templates, built frontend, and compiled server output.
- [ ] 4.5 Configure package exclusions for attempts, results, logs, development-only files, and private solutions in student-facing packages.

## 5. Verification

- [ ] 5.1 Add tests for configurable runtime paths using read-only resource fixtures and temporary writable user-data directories.
- [ ] 5.2 Add API tests for production same-origin frontend/API behavior.
- [ ] 5.3 Add packaged-mode tests for attempt persistence, uploads, and result writes under user data.
- [ ] 5.4 Add a smoke command that starts the packaged runtime, checks `/api/health`, loads `/api/exams`, persists a completed attempt, and verifies the write location.
- [ ] 5.5 Run `npm test`, `npm run build`, and the packaged runtime smoke command.
