## Why

The application currently runs as a development setup: Vite serves the frontend, `tsx` runs the Express API, and both bundled exam content and writable attempts/results live under the repo-local `data/` tree. To ship a runnable packaged app, the runtime needs explicit production entry points, configurable resource/user-data locations, and packaging boundaries that keep private solutions out of student-facing bundles.

## What Changes

- Add a packaged runtime path that can launch the local API, serve the built frontend, and run without Vite or `tsx`.
- Split runtime configuration into read-only bundled resources, writable user data, and optional trusted private solution storage.
- Keep public exam packages and schemas available in packaged mode while writing attempts, results, and uploads to an OS/user-data location.
- Add package/build scripts and smoke checks that verify the packaged runtime can boot, serve `/api/health`, load the gallery, and persist a completed attempt.
- Define the private-solution behavior for packaged distributions: student-facing packages must not include private solutions; trusted grading may be enabled only when a private solution directory is supplied.
- Preserve the existing browser/API behavior in development mode.

## Capabilities

### New Capabilities
- `packaged-app-runtime`: Defines the packaged desktop/local runtime, production startup behavior, static frontend serving, runtime configuration, writable data location, and package verification.

### Modified Capabilities
- `exam-package-model`: Clarifies how public exam resources, schemas, templates, attempts, results, uploads, and private solutions are separated in packaged mode.
- `exam-grading-workflow`: Clarifies trusted packaged grading behavior when private solutions are supplied or absent.

## Impact

- Affected frontend/backend boundary: Vite proxy assumptions, `/api` fetches, and production static serving.
- Affected server modules: API app construction, server startup, path resolution, storage, grading, validation, and upload persistence.
- Affected scripts/build tooling: TypeScript server build, package scripts, smoke tests, and likely an Electron or equivalent desktop wrapper.
- Affected data layout: public exam packages and schemas become read-only packaged resources; attempts, results, and uploads move to writable runtime storage; private solutions remain outside student-facing bundles.
