# Daily Planning

## Overview
This is an Angular 19 application using Nx workspace for daily planning functionality. The app uses PrimeNG for UI components and connects to external APIs for salary capture and daily planning services.

## Project Architecture
- **Framework**: Angular 19 with Nx monorepo
- **UI Library**: PrimeNG 19, Angular CDK, NG-Bootstrap
- **State Management**: NGXS
- **Mapping**: Leaflet with ngx-leaflet
- **Build System**: Nx with webpack
- **Styling**: SCSS

## Project Structure
```
/
├── src/                     # Main application source
│   ├── app/                 # Angular app components
│   ├── assets/              # Static assets
│   └── environment.ts       # Environment configuration
├── core-ui-admin-library/   # Admin UI library
├── core-ui-daily-planning-library/  # Daily planning library
├── project.json             # Nx project configuration
├── nx.json                  # Nx workspace configuration
└── package.json             # NPM dependencies
```

## Development
- **Dev Server**: `npm start` - Runs on port 4200
- **Build**: `npm run build` - Production build
- **Build (Test)**: `npm run build-test`
- **Build (QA)**: `npm run build-qa`

## Environment Variables
The app uses env-cmd to manage environment-specific API URLs:
- `NX_BASE_DP_URL`: Salary capture API endpoint
- `NX_BASE_DPS_URL`: Daily planning API endpoint

## Recent Changes
- 2026-01-28: Configured for Replit environment with dev server on port 4200
- 2026-01-28: Removed unused files and folders:
  - core-ui-admin-library/src/lib/core/domain/models/DailyJobs
  - core-ui-admin-library/src/lib/core/domain/models/Salary
  - core-ui-admin-library/src/lib/core/domain/models/SalaryLine
  - core-ui-admin-library/src/lib/presentation/settings/deadline-periods
  - core-ui-admin-library/src/lib/presentation/settings/syncing
  - core-ui-admin-library/src/lib/data/repositories/daily-jobs
