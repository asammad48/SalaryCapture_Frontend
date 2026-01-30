# replit.md

## Overview

Daily Planning is an enterprise Angular monorepo application built with Nx workspace tooling. The project serves as a workforce management platform with two main functional modules: a salary capture/admin system and a daily planning system. The application follows a clean architecture pattern with clear separation between core domain logic, data access, and presentation layers across multiple publishable Angular libraries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The project uses Nx to manage a monorepo containing:
- **Main Application** (`src/`): The host Angular application that bootstraps and routes to library modules
- **core-ui-admin-library**: Shared admin/authentication library with user management, access control, and common UI components
- **core-ui-daily-planning-library**: Daily planning specific features and components

### Clean Architecture Pattern
Each library follows a three-layer architecture:
1. **Core Layer** (`core/`): Domain models, repository abstractions, and business logic utilities
2. **Data Layer** (`data/`): API clients (auto-generated via NSwag), repository implementations, and data services
3. **Presentation Layer** (`presentation/`): Angular components, routes, guards, and interceptors

### State Management
- Uses NGXS for state management with plugins for routing, forms, storage, logging, and WebSocket integration
- State is organized around feature modules

### API Integration
- API clients are auto-generated from OpenAPI/Swagger specs using NSwag
- Environment-specific API URLs are managed through `env-cmd` with `.env-cmdrc.json` configuration
- HTTP interceptors handle authentication tokens, tenant headers, loading states, and error handling

### Authentication & Authorization
- JWT-based authentication using `@auth0/angular-jwt`
- Azure AD/MSAL integration for enterprise SSO (`@azure/msal-browser`)
- Role-based access control with guards protecting routes
- Token and tenant interceptors inject auth headers on requests

### UI Framework
- PrimeNG component library with Aura theme (`@primeng/themes`)
- Bootstrap integration via `@ng-bootstrap/ng-bootstrap`
- Custom Cubivue CSS framework loaded from CDN
- Leaflet for map functionality
- FullCalendar for scheduling views

### Build & Development
- Angular 19.x with standalone components
- Webpack with custom configuration for environment variable injection
- Jest for unit testing with Angular preset
- ESLint with Nx-specific rules for module boundary enforcement

## External Dependencies

### Backend APIs
- **Daily Planning API**: Configurable per environment via `NX_BASE_DPS_URL`
  - Development/Test: Azure Container Apps (West Europe)
  - QA/Production: Separate Azure Container Apps instances

### Third-Party Services
- **Azure AD/MSAL**: Enterprise authentication
- **DAWA Autocomplete**: Danish address lookup service
- **Cubivue CDN**: UI assets and styling (`saas-ui-assets.cubivue.com`)

### Key NPM Dependencies
- **Angular 19.2.14**: Core framework
- **NGXS 19.x**: State management
- **PrimeNG 19.x**: UI components
- **Luxon**: Date/time handling
- **Leaflet/ngx-leaflet**: Mapping
- **FullCalendar**: Calendar/scheduling
- **NSwag**: API client generation from OpenAPI specs