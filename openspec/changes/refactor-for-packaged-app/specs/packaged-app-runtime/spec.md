## ADDED Requirements

### Requirement: Packaged runtime starts without development tooling
The system SHALL provide a packaged runtime that launches the application without requiring Vite, `tsx`, or repository-local development commands.

#### Scenario: Packaged app is launched
- **WHEN** a user launches the packaged app
- **THEN** the app starts a local API bound to loopback
- **AND** the app serves the built frontend
- **AND** the app does not require the user to run `npm run dev`, Vite, or `tsx`

#### Scenario: Runtime health is checked
- **WHEN** the packaged runtime has started
- **THEN** `GET /api/health` returns a successful JSON response
- **AND** the frontend can be loaded from the same runtime

### Requirement: Production frontend and API share one local origin
The packaged runtime SHALL serve the built frontend and API from one local origin so existing relative `/api` browser requests work without a Vite proxy.

#### Scenario: Gallery loads in packaged mode
- **WHEN** the packaged frontend requests `/api/exams`
- **THEN** the request reaches the packaged local API
- **AND** the gallery receives exam summaries from packaged public resources and writable runtime state

#### Scenario: Built frontend asset is requested
- **WHEN** the packaged frontend requests a built JavaScript or CSS asset
- **THEN** the runtime serves that asset from the production frontend build output

### Requirement: Runtime paths are configurable
The packaged runtime SHALL resolve separate paths for read-only resources, writable user data, and optional trusted private solutions.

#### Scenario: Packaged path configuration is resolved
- **WHEN** the packaged runtime starts
- **THEN** it resolves a resource directory for public exams, schemas, and templates
- **AND** it resolves a writable user-data directory for attempts, results, uploads, and runtime-generated outputs
- **AND** it treats the private solution directory as optional trusted configuration

#### Scenario: Writable directories are missing
- **WHEN** the packaged runtime needs to write attempts, results, or uploads
- **AND** the writable user-data directory does not yet contain the required subdirectories
- **THEN** the system creates those writable subdirectories before writing the data

### Requirement: Desktop wrapper owns local API lifecycle
The packaged desktop wrapper SHALL start and stop the local API as part of the app lifecycle.

#### Scenario: Preferred port is unavailable
- **WHEN** the packaged app starts and the preferred API port is unavailable
- **THEN** the runtime selects an available loopback port
- **AND** the frontend loads from the selected local origin

#### Scenario: Packaged app exits
- **WHEN** the user exits the packaged desktop app
- **THEN** the wrapper shuts down the local API it started

### Requirement: Packaged runtime is smoke-tested
The system SHALL include a package verification path that exercises packaged-mode startup, API health, gallery loading, and writable persistence.

#### Scenario: Package smoke check runs
- **WHEN** the package smoke check runs
- **THEN** it starts the packaged runtime using fixture resources and a temporary writable user-data directory
- **AND** it verifies `/api/health`
- **AND** it verifies that `/api/exams` returns public exam summaries
- **AND** it verifies that a completed attempt can be persisted under the writable user-data directory

### Requirement: Development workflow remains available
The system SHALL preserve the existing development workflow while adding packaged runtime behavior.

#### Scenario: Developer starts dev mode
- **WHEN** a developer runs the development command
- **THEN** Vite continues to serve the frontend with `/api` proxied to the local API
- **AND** the default development data paths remain compatible with the repo-local `data/` tree
