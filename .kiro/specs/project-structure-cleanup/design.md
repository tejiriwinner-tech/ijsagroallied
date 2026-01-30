# Design Document: Project Structure Cleanup

## Overview

This design outlines the reorganization of the current project structure to achieve professional separation between frontend and backend code. The current structure suffers from duplication (both `my-app/` and `frontend/my-app/`), mixed concerns (PHP API in frontend folder), and unclear boundaries that hinder maintainability and collaboration.

The solution implements a clean monorepo structure with clear separation of concerns, following industry best practices for full-stack applications. The design ensures zero functionality loss while establishing a professional, scalable project organization.

## Architecture

### Current State Analysis

The existing structure has several issues:
- **Duplication**: Both `my-app/` and `frontend/my-app/` contain Next.js applications
- **Mixed Concerns**: PHP API located in `frontend/php-api/` instead of backend
- **Scattered Configuration**: Multiple package.json files and Git repositories
- **Unclear Boundaries**: No clear separation between client and server code

### Target Architecture

The new structure follows a clean monorepo pattern with two primary domains:

```
project-root/
├── frontend/           # All client-side code
│   ├── app/           # Next.js application routes
│   ├── components/    # React components
│   ├── public/        # Static assets
│   ├── lib/           # Frontend utilities
│   ├── hooks/         # Custom React hooks
│   ├── context/       # React context providers
│   └── styles/        # CSS and styling
├── backend/           # All server-side code
│   ├── api/           # API endpoints (moved from frontend/php-api)
│   ├── config/        # Server configuration
│   ├── database/      # Database schemas and migrations
│   └── docs/          # API documentation
├── docs/              # Project documentation
├── scripts/           # Build and deployment scripts
└── .vscode/           # IDE configuration
```

### Migration Strategy

The migration follows a three-phase approach:

1. **Analysis Phase**: Identify active codebase and dependencies
2. **Consolidation Phase**: Remove duplicates and organize code
3. **Integration Phase**: Update references and validate functionality

## Components and Interfaces

### File Migration Component

**Purpose**: Handles the physical movement of files and directories during reorganization.

**Key Operations**:
- `identifyActiveBranch()`: Determines which version of duplicated code is current
- `moveDirectory(source, target)`: Safely moves directories with conflict resolution
- `removeDirectory(path)`: Removes duplicate or obsolete directories
- `preserveGitHistory()`: Maintains version control history during moves

**Interface**:
```typescript
interface FileMigrator {
  analyzeStructure(): StructureAnalysis
  consolidateNextJsApp(): void
  movePhpApiToBackend(): void
  cleanupDuplicates(): void
  validateMigration(): MigrationResult
}
```

### Reference Updater Component

**Purpose**: Updates all file references, imports, and configuration paths to reflect the new structure.

**Key Operations**:
- `updateImportStatements()`: Fixes React component imports
- `updateConfigurationPaths()`: Updates build and deployment configs
- `updateApiEndpoints()`: Adjusts frontend API calls if needed
- `updatePackageScripts()`: Modifies npm/yarn scripts

**Interface**:
```typescript
interface ReferenceUpdater {
  scanForReferences(pattern: string): Reference[]
  updateReactImports(): void
  updateConfigFiles(): void
  updateBuildScripts(): void
  validateReferences(): ValidationResult
}
```

### Structure Validator Component

**Purpose**: Ensures the new structure maintains all functionality and follows best practices.

**Key Operations**:
- `validateFrontendStructure()`: Checks Next.js app organization
- `validateBackendStructure()`: Verifies API and database organization
- `validateDependencies()`: Ensures no broken dependencies
- `validateBuildProcess()`: Confirms build and deployment still work

**Interface**:
```typescript
interface StructureValidator {
  validateStructure(): ValidationReport
  checkDependencies(): DependencyReport
  testBuildProcess(): BuildResult
  generateMigrationReport(): MigrationReport
}
```

## Data Models

### Project Structure Model

```typescript
interface ProjectStructure {
  root: string
  frontend: FrontendStructure
  backend: BackendStructure
  shared: SharedResources
}

interface FrontendStructure {
  app: string           // Next.js app directory
  components: string    // React components
  public: string        // Static assets
  lib: string          // Utilities and helpers
  hooks: string        // Custom React hooks
  context: string      // React context providers
  styles: string       // CSS and styling
  config: ConfigFiles  // Frontend-specific config
}

interface BackendStructure {
  api: string          // API endpoints
  config: string       // Server configuration
  database: string     // Database schemas
  docs: string         // API documentation
}

interface ConfigFiles {
  packageJson: string
  nextConfig: string
  tailwindConfig: string
  eslintConfig: string
  tsConfig: string
}
```

### Migration Plan Model

```typescript
interface MigrationPlan {
  phase: MigrationPhase
  operations: MigrationOperation[]
  dependencies: string[]
  rollbackPlan: RollbackOperation[]
}

interface MigrationOperation {
  type: 'move' | 'copy' | 'delete' | 'update'
  source: string
  target?: string
  description: string
  dependencies: string[]
}

enum MigrationPhase {
  ANALYSIS = 'analysis',
  CONSOLIDATION = 'consolidation', 
  INTEGRATION = 'integration',
  VALIDATION = 'validation'
}
```

### Validation Report Model

```typescript
interface ValidationReport {
  structureValid: boolean
  dependenciesValid: boolean
  buildSuccessful: boolean
  issues: ValidationIssue[]
  recommendations: string[]
}

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  component: string
  description: string
  suggestedFix: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Duplication Elimination
*For any* project structure after migration, there should be exactly one Next.js application instance and exactly one Git repository in the project root.
**Validates: Requirements 1.1, 1.4**

### Property 2: Active Version Preservation  
*For any* duplicate code comparison, the system should always preserve the version with the most recent modifications and complete file set.
**Validates: Requirements 1.2, 1.3**

### Property 3: Domain Separation
*For any* file in the project, it should be located in the correct domain folder (frontend for client code, backend for server code) based on its type and purpose.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3**

### Property 4: Dependency Isolation
*For any* package.json file in the project, it should contain only dependencies relevant to its domain and no conflicting versions across domains.
**Validates: Requirements 1.5, 2.6**

### Property 5: Reference Integrity
*For any* import statement or file reference in the codebase, it should resolve to an existing file in the new structure.
**Validates: Requirements 4.2, 5.1, 5.2, 5.3**

### Property 6: Configuration Consistency
*For any* configuration file, all path references should point to existing files or directories in the new structure.
**Validates: Requirements 4.4, 5.4, 5.5**

### Property 7: API Endpoint Preservation
*For any* API endpoint that existed before migration, it should remain accessible with the same functionality after migration.
**Validates: Requirements 3.4, 4.3**

### Property 8: Root Directory Cleanliness
*For any* folder in the project root, it should be one of the allowed essential folders (frontend, backend, docs, scripts, .vscode).
**Validates: Requirements 6.1**

### Property 9: Workflow Script Preservation
*For any* npm/yarn script that existed before migration, an equivalent script should exist after migration with updated paths.
**Validates: Requirements 7.2, 7.4**

### Property 10: Environment Configuration Preservation
*For any* environment variable or configuration setting that existed before migration, it should be preserved with the same value after migration.
**Validates: Requirements 4.5**

## Error Handling

### Migration Conflicts
- **Duplicate File Names**: When files with identical names exist in both locations, the system compares timestamps and content to determine the authoritative version
- **Broken Dependencies**: If migration breaks dependencies, the system provides detailed error messages with suggested fixes
- **Configuration Conflicts**: When configuration files conflict, the system merges compatible settings and flags incompatible ones for manual resolution

### Rollback Mechanism
- **Backup Creation**: Before any migration operation, create complete backup of current structure
- **Operation Logging**: Log all file operations for potential rollback
- **Validation Checkpoints**: Validate structure at each phase and rollback if validation fails
- **Manual Intervention Points**: Provide clear stopping points where manual review is required

### Validation Failures
- **Structure Validation**: If the new structure doesn't meet requirements, provide detailed report of issues
- **Build Validation**: If builds fail after migration, provide specific error locations and suggested fixes
- **Reference Validation**: If broken references are detected, provide list of all broken links with suggested corrections

## Testing Strategy

### Dual Testing Approach
The testing strategy combines unit tests for specific scenarios with property-based tests for comprehensive validation:

**Unit Tests** focus on:
- Specific file migration scenarios (moving PHP API, consolidating Next.js apps)
- Edge cases (conflicting file names, missing dependencies)
- Error conditions (invalid paths, permission issues)
- Integration points between migration phases

**Property Tests** focus on:
- Universal properties that hold across all migration scenarios
- Comprehensive input coverage through randomized project structures
- Validation of correctness properties across different starting configurations

### Property-Based Testing Configuration
- **Testing Framework**: Use appropriate property testing library for the implementation language
- **Test Iterations**: Minimum 100 iterations per property test to ensure thorough coverage
- **Test Data Generation**: Generate varied project structures with different duplication patterns
- **Property Validation**: Each property test references its corresponding design document property

**Property Test Tags**:
- **Feature: project-structure-cleanup, Property 1**: Duplication Elimination
- **Feature: project-structure-cleanup, Property 2**: Active Version Preservation
- **Feature: project-structure-cleanup, Property 3**: Domain Separation
- **Feature: project-structure-cleanup, Property 4**: Dependency Isolation
- **Feature: project-structure-cleanup, Property 5**: Reference Integrity
- **Feature: project-structure-cleanup, Property 6**: Configuration Consistency
- **Feature: project-structure-cleanup, Property 7**: API Endpoint Preservation
- **Feature: project-structure-cleanup, Property 8**: Root Directory Cleanliness
- **Feature: project-structure-cleanup, Property 9**: Workflow Script Preservation
- **Feature: project-structure-cleanup, Property 10**: Environment Configuration Preservation

### Testing Phases
1. **Pre-Migration Testing**: Validate current structure analysis and migration plan generation
2. **Migration Testing**: Test each migration operation in isolation and combination
3. **Post-Migration Testing**: Validate final structure meets all requirements and properties
4. **Integration Testing**: Ensure frontend and backend can still be built and run independently
5. **Regression Testing**: Verify no existing functionality is lost during reorganization