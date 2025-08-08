## LaserChess Frontend

Angular 12 app for Laser Tactics.

### Requirements
- Node 16.x (project pins 16.10.0 via Volta)
- npm

### Install
- npm install

### Run
- npm run start:dev
  - Starts dev server at http://localhost:8080 using `src/environments/environment.ts`.
- npm run start:prod
  - Starts dev server with production config using `src/environments/environment.prod.ts`.

### Build
- npm run build
  - Production build to `dist/laser-chess-frontend/`.
- npm run watch
  - Dev build in watch mode.

### Test & Quality
- npm run test
  - Unit tests (Karma).
- npm run lint
  - ESLint checks.
- npm run format
  - Prettier formatting.

### E2E (Cypress)
- Run the app first (start:dev ONLY! prod version won't work).
- npm run cypress:open
- npm run cypress:run
  - Base URL is http://localhost:8080 (see `cypress.json`).

### Environment configuration
- REST and WS endpoints come from:
  - `src/environments/environment.ts`
  - `src/environments/environment.prod.ts`
- Endpoints are composed in `src/app/api-definitions.ts`.
- Use `start:dev` vs `start:prod` to switch environments during development.
