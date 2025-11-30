# Salary Calculation Application

## Overview
This is an Angular 19 NX workspace application for salary calculation and daily planning. The application is a client-side single-page application (SPA) that connects to external backend APIs hosted on Azure Container Apps.

## Project Structure
- **Framework**: Angular 19.2.14 with NX workspace (v21.1.2)
- **Build System**: NX with Angular CLI
- **Package Manager**: npm
- **Frontend**: Angular SPA with PrimeNG UI components, Leaflet maps, FullCalendar
- **State Management**: NGXS
- **Environment Management**: env-cmd for environment-specific configurations

## Key Directories
- `src/` - Main application source code
- `core-ui-salary-calculation-library/` - Shared salary calculation library
- `core-ui-daily-planning-library/` - Shared daily planning library
- `dist/salary-calculation` - Production build output

## Development Setup

### Environment Variables
The application uses `.env-cmdrc.json` for environment-specific configurations:
- **development**: Points to localhost backend APIs (for local development)
- **test**: Points to test environment Azure Container Apps
- **qa**: Points to QA environment Azure Container Apps
- **production**: Points to production environment Azure Container Apps

### Running the Application
- **Development Server**: `npm start` - Runs on http://0.0.0.0:5000
- **Build**: `npm run build` - Production build
- **Test Build**: `npm run build-test` - Test environment build
- **QA Build**: `npm run build-qa` - QA environment build

## Replit Configuration

### Workflow
The Angular dev server is configured to run on port 5000 with:
- Host: `0.0.0.0` (required for Replit)
- Port: `5000` (required for Replit webview)
- `disableHostCheck: true` (required for Replit proxy compatibility)

### Deployment
Configured as a static deployment:
- **Build command**: `npm run build`
- **Output directory**: `dist/salary-calculation`
- **Type**: Static (client-side SPA)

## External Dependencies
- **Backend APIs**: Hosted on Azure Container Apps
  - Daily Planning API: `NX_BASE_DP_URL`
  - Daily Planning Service: `NX_BASE_DPS_URL`

## Recent Changes (2025-11-30)
- Imported from GitHub to Replit
- Configured Angular dev server for Replit environment (port 5000, host 0.0.0.0)
- Set up deployment configuration for static hosting
- Verified application runs successfully with login page displaying correctly

## Library Build Configuration

### Cross-Library Dependencies (Fixed)
The libraries use a buildable-library pattern with proper package-based imports:

1. **Build Order**: NX builds `core-ui-salary-calculation-library` first, then `core-ui-daily-planning-library`
2. **Import Pattern**: Cross-library imports use the package alias `@embrace-it/salary-calculation-library` instead of relative paths
3. **Dependency Resolution**: The built salary-calculation-library is symlinked to `node_modules/@embrace-it/salary-calculation-library` to allow ng-packagr to resolve it during compilation

### Building Libraries
```bash
# Build both libraries (NX handles dependency order)
npx nx build core-ui-daily-planning-library

# Or build individually
npx nx build core-ui-salary-calculation-library
npx nx build core-ui-daily-planning-library
```

### Technical Details
- **Root Cause (Fixed)**: TypeScript 5.8 compiler bug triggered when deep relative imports reach outside the compilation root
- **Solution**: Use package-based imports (`@embrace-it/salary-calculation-library`) that resolve to compiled `.d.ts` files instead of raw source files
- **Key Files Modified**:
  - `core-ui-daily-planning-library/src/lib/data/data.module.ts` - Uses package imports
  - `core-ui-daily-planning-library/src/lib/presentation/dps.component.ts` - Uses package imports
  - `core-ui-salary-calculation-library/src/index.ts` - Exports required symbols

## Notes
- This is a frontend-only application; backend services are external
- The application uses authentication via Auth0 JWT tokens
- Map functionality uses Leaflet with custom layers
- Calendar functionality uses FullCalendar with resource timeline
