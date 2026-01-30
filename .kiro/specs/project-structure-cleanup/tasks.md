# Implementation Plan: Project Structure Cleanup

## Overview

This implementation plan converts the project structure cleanup design into discrete coding tasks. The approach follows a three-phase migration strategy: analysis, consolidation, and integration. Each task builds incrementally to ensure safe reorganization without functionality loss.

## Tasks

- [-] 1. Create project analysis and migration utilities
  - [x] 1.1 Create structure analysis module
    - Implement TypeScript module to scan and analyze current project structure
    - Create functions to detect Next.js applications, PHP APIs, and duplicate directories
    - Add logic to identify active development branches based on timestamps and completeness
    - _Requirements: 1.2, 1.3_

  - [ ]* 1.2 Write property test for structure analysis
    - **Property 1: Duplication Elimination**
    - **Validates: Requirements 1.1, 1.4**

  - [x] 1.3 Create file migration utilities
    - Implement safe file and directory movement functions with conflict resolution
    - Add backup creation and rollback mechanisms for migration operations
    - Create validation functions to ensure migration integrity
    - _Requirements: 4.1, 4.2_

  - [ ]* 1.4 Write property test for file migration
    - **Property 2: Active Version Preservation**
    - **Validates: Requirements 1.2, 1.3**

- [ ] 2. Implement Next.js application consolidation
  - [x] 2.1 Analyze and identify active Next.js application
    - Compare `my-app/` and `frontend/my-app/` to determine which is the active development version
    - Check Git history, file timestamps, and completeness to make determination
    - Generate consolidation plan for merging or removing duplicate
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Consolidate Next.js applications
    - Move the active Next.js application to `frontend/` as the primary structure
    - Remove duplicate Next.js application and associated files
    - Preserve all components, pages, and configuration from active version
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.3 Write property test for domain separation
    - **Property 3: Domain Separation**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3**

- [x] 3. Checkpoint - Validate Next.js consolidation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement backend organization
  - [x] 4.1 Move PHP API to backend structure
    - Relocate `frontend/php-api/` to `backend/api/`
    - Preserve all API endpoints, database configurations, and documentation
    - Maintain existing directory structure within the API
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 4.2 Organize backend configuration and documentation
    - Move database schemas and configurations to `backend/database/`
    - Create backend-specific README with API documentation
    - Set up backend configuration files for deployment
    - _Requirements: 3.2, 3.5, 3.6_

  - [ ]* 4.3 Write property test for API endpoint preservation
    - **Property 7: API Endpoint Preservation**
    - **Validates: Requirements 3.4, 4.3**

- [ ] 5. Update dependencies and package management
  - [x] 5.1 Create separate package.json files for frontend and backend
    - Split dependencies between frontend and backend domains
    - Ensure frontend package.json contains only UI-related dependencies
    - Create backend package.json with server-related dependencies
    - _Requirements: 1.5, 2.6_

  - [x] 5.2 Update development and build scripts
    - Modify npm/yarn scripts to work with new structure
    - Create scripts for independent frontend and backend development
    - Update build and deployment scripts with correct paths
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ]* 5.3 Write property test for dependency isolation
    - **Property 4: Dependency Isolation**
    - **Validates: Requirements 1.5, 2.6**

- [ ] 6. Update all file references and imports
  - [x] 6.1 Update React component imports
    - Scan all React components for import statements
    - Update import paths to reflect new frontend structure
    - Ensure all component references resolve correctly
    - _Requirements: 4.2, 5.1_

  - [x] 6.2 Update configuration file paths
    - Update Next.js, Tailwind, ESLint, and TypeScript configurations
    - Modify all relative path references in configuration files
    - Update build tool configurations to use new structure
    - _Requirements: 4.4, 5.2, 5.4, 5.5_

  - [x] 6.3 Update API endpoint references (if any)
    - Scan frontend code for API calls to PHP endpoints
    - Update any hardcoded API paths to reflect backend structure
    - Ensure API communication still works after migration
    - _Requirements: 5.3_

  - [ ]* 6.4 Write property test for reference integrity
    - **Property 5: Reference Integrity**
    - **Validates: Requirements 4.2, 5.1, 5.2, 5.3**

  - [ ]* 6.5 Write property test for configuration consistency
    - **Property 6: Configuration Consistency**
    - **Validates: Requirements 4.4, 5.4, 5.5**

- [ ] 7. Clean up project root and establish professional structure
  - [x] 7.1 Remove duplicate Git repositories and unnecessary files
    - Remove `.git` directories from subdirectories (keep only root)
    - Clean up duplicate configuration files and build artifacts
    - Remove any orphaned or obsolete directories
    - _Requirements: 1.4, 6.1_

  - [x] 7.2 Organize root directory structure
    - Ensure root contains only essential folders: frontend/, backend/, docs/, scripts/
    - Move or remove any misplaced files from project root
    - Create appropriate .gitignore files for frontend and backend
    - _Requirements: 6.1, 6.3, 6.5_

  - [x] 7.3 Create comprehensive project documentation
    - Generate root-level README explaining new project structure
    - Document development workflow for frontend and backend
    - Create migration guide documenting all changes made
    - _Requirements: 6.2, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 7.4 Write property test for root directory cleanliness
    - **Property 8: Root Directory Cleanliness**
    - **Validates: Requirements 6.1**

- [ ] 8. Validate and test complete migration
  - [x] 8.1 Implement comprehensive validation suite
    - Create validation functions to check structure compliance
    - Validate all file references and imports are correct
    - Check that frontend and backend can be built independently
    - _Requirements: 4.1, 7.3, 7.5_

  - [x] 8.2 Test development workflow preservation
    - Verify frontend development server starts correctly
    - Verify backend API can be started independently
    - Test that all npm/yarn scripts work with new structure
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ]* 8.3 Write property test for workflow script preservation
    - **Property 9: Workflow Script Preservation**
    - **Validates: Requirements 7.2, 7.4**

  - [ ]* 8.4 Write property test for environment configuration preservation
    - **Property 10: Environment Configuration Preservation**
    - **Validates: Requirements 4.5**

- [ ] 9. Final checkpoint and migration completion
  - [x] 9.1 Run complete validation suite
    - Execute all property tests and unit tests
    - Validate project structure meets all requirements
    - Generate final migration report with before/after comparison
    - _Requirements: 8.1, 8.3_

  - [x] 9.2 Create migration completion documentation
    - Document any manual steps required after migration
    - Provide troubleshooting guide for common issues
    - Create checklist for team members to update their local environments
    - _Requirements: 8.2, 8.4, 8.5_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout the process
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The migration preserves all existing functionality while establishing clean organization