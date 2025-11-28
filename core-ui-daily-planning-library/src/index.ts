// Routes
export * from './lib/lib.routes';

// Presentation Components
export * from './lib/presentation/dps.component';

// Core Layer - Domain & Repositories
export * from './lib/core/core.module';
export * from './lib/core/domain/models';
export * from './lib/core/domain/requests';
export * from './lib/core/utils/date.helper';
export * from './lib/core/utils/with-loader.operator';

// Data Layer - API Clients & Repository Implementations
export * from './lib/data/data.module';
export * from './lib/data/api-clients';
export * from './lib/data/repositories/access/daily-planning-access.service';
export * from './lib/data/shared/loader.service';
// Note: API_BASE_URL is exported from api-clients

// Presentation Layer - Shared Components
export * from './lib/presentation/shared/components/progress-loading/progress-loading.component';
