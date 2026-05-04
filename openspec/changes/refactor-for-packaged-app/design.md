## Context

The current application is optimized for local development. `npm run dev` starts Vite and an Express API through `tsx`, while Vite proxies `/api` to `127.0.0.1:4173`. The production build only creates static frontend assets in `dist/`; there is no compiled server entry point, no production static serving path, and no desktop wrapper. Server path resolution uses the source tree as the root, so public exam content, private solutions, schemas, attempts, results, uploads, and generated validation reports all sit under repo-local `data/`.

That shape is workable for Codex-driven development, but it is not a packaged runtime boundary. Installed apps should treat bundled resources as read-only, write user state to an OS/user-data location, and avoid shipping private grading solutions in student-facing distributions.

## Goals / Non-Goals

**Goals:**
- Produce a runnable packaged desktop/local app that does not require users to run Vite, `tsx`, or repository scripts.
- Preserve the existing React UI and Express API contract, including relative `/api` requests from the frontend.
- Separate read-only public resources from writable user data and optional trusted private solution storage.
- Keep development mode working with the existing repo data layout.
- Add verification that exercises the packaged runtime startup and persistence path.

**Non-Goals:**
- Code signing, notarization, auto-update, app icons, and store distribution.
- Cloud sync, multi-user storage, or remote grading.
- Rewriting the grading engine or exam package format beyond path/runtime separation.
- Import/export tooling for migrating existing local attempt folders into a packaged app profile.

## Decisions

### Use an Electron-first desktop package

Use Electron as the first packaging target because the application already has a Node/Express backend and local filesystem storage. Electron can own the app lifecycle, start the local API inside the desktop process or as a child process, and point the BrowserWindow at the local runtime URL.

Alternatives considered:
- Tauri with a sidecar: viable later, but requires bundling a Node/server binary or rewriting backend logic in Rust.
- Static Vite output only: insufficient because the app needs API endpoints, filesystem writes, uploads, and trusted grading.

### Extract the API from server startup

Refactor `server/index.ts` into an app factory and separate entry point:
- `createApiApp(config)` constructs Express routes and static serving.
- `startServer(config)` binds to `127.0.0.1` on a configured or available port.
- Dev scripts continue to run the server entry point.
- Packaged runtime imports the factory or starts the compiled server without `tsx`.

This keeps route behavior testable without binding a port and lets packaging own lifecycle details separately from API behavior.

### Introduce explicit runtime path configuration

Replace `__dirname/../data` assumptions with a runtime configuration object:
- `resourceDir`: read-only packaged resources, including public exams, schemas, and templates.
- `userDataDir`: writable attempts, results, uploads, runtime validation output, and logs if added later.
- `privateSolutionsDir`: optional trusted private solution directory, absent in student-facing packages.

Development defaults can still resolve to the current repo `data/` tree to avoid disrupting existing scripts and tests. Packaged defaults should use the wrapper-provided resource path and the OS app-data path.

### Serve frontend and API from the same local origin in production

In production, Express should serve the built Vite frontend and API on the same local origin. The React app can keep using relative `/api` URLs, and the packaged runtime avoids depending on a Vite proxy. Unknown non-API frontend routes should fall back to `index.html` if client routing is introduced later.

### Compile server code for production

Add a server build target that emits runnable JavaScript for API, scripts needed by packaging, and the desktop wrapper. `tsx` remains a development convenience, not a packaged dependency path. Build/package scripts should run typecheck, frontend build, server build, and package smoke checks in order.

### Keep grading trusted-mode only in packaged distributions

The standard packaged app must not include `data/private/solutions`. If a trusted maintainer wants local packaged grading, the runtime may accept an explicit private solution directory. When that directory is absent, grading endpoints or commands should fail with a clear unavailable response and must not write partial result files.

## Risks / Trade-offs

- Private solutions accidentally included in the app bundle -> Use explicit packaging include rules and a smoke test that scans packaged resources for `solution.json` under public/student distributions.
- Installed app cannot write beside bundled resources -> All attempts, results, uploads, and runtime reports write through `userDataDir`; tests run against read-only fixture resources.
- Electron increases bundle size -> Accept for the first package because it minimizes backend rewrite risk; revisit Tauri after the runtime boundary is clean.
- Port collision or orphaned local server -> Bind only to loopback, prefer an available ephemeral port, and shut down the API when the desktop app exits.
- Existing dev scripts and tests may depend on repo-local paths -> Keep development defaults and add packaged-mode tests before changing callers broadly.

## Migration Plan

1. Add runtime path/config types and update storage, validation, and grading to use injected paths while preserving repo defaults.
2. Split Express app construction from server startup and add production static serving.
3. Add a compiled server build and update scripts to distinguish dev, build, serve, and package flows.
4. Add packaged-mode tests with temporary read-only resources and writable user-data directories.
5. Add the Electron wrapper and packaging configuration.
6. Add a package smoke command that launches the packaged runtime, checks `/api/health`, loads exam summaries, submits a sample attempt, and verifies user-data writes.

Rollback is straightforward while development defaults remain intact: disable the package scripts/wrapper and keep using `npm run dev` plus the repo-local `data/` layout.

## Open Questions

- Which operating systems are required for the first runnable package: macOS only, or macOS/Windows/Linux?
- Should trusted grading be available in the desktop app at all, or should grading remain exclusively through Codex/private workflow prompts?
- What final application name, icon, and distribution format should be used once the runtime package works?
