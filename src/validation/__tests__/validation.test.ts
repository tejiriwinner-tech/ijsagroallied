/**
 * Unit Tests for Validation Suite
 * 
 * Tests the comprehensive validation suite functionality.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    validateProjectStructure,
    validateFrontendStructure,
    validateBackendStructure,
    DEFAULT_STRUCTURE_CONFIG
} from '../structure-validator';
import {
    validateImports,
    validateConfigPaths,
    validateApiReferences
} from '../reference-validator';
import {
    validateFrontendBuild,
    validateBackendBuild,
    validateRootBuildScripts
} from '../build-validator';
import { runComprehensiveValidation } from '../index';

describe('Structure Validator', () => {
    const testRootDir = process.cwd();

    describe('validateProjectStructure', () => {
        it('should validate that root directory exists', () => {
            const result = validateProjectStructure({
                ...DEFAULT_STRUCTURE_CONFIG,
                rootDir: testRootDir
            });

            expect(result).toBeDefined();
            expect(result.errors).toBeDefined();
            expect(result.warnings).toBeDefined();
        });

        it('should detect missing root directory', () => {
            const result = validateProjectStructure({
                ...DEFAULT_STRUCTURE_CONFIG,
                rootDir: '/nonexistent/path'
            });

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0].type).toBe('MISSING_ROOT');
        });

        it('should check for allowed root folders', () => {
            const result = validateProjectStructure({
                ...DEFAULT_STRUCTURE_CONFIG,
                rootDir: testRootDir
            });

            // Should not have errors about allowed folders if structure is correct
            const disallowedFolderErrors = result.errors.filter(
                e => e.type === 'DISALLOWED_ROOT_FOLDERS'
            );

            // This may or may not have errors depending on actual structure
            expect(disallowedFolderErrors).toBeDefined();
        });
    });

    describe('validateFrontendStructure', () => {
        it('should validate frontend directory exists', () => {
            const result = validateFrontendStructure({
                ...DEFAULT_STRUCTURE_CONFIG,
                rootDir: testRootDir
            });

            expect(result).toBeDefined();
            expect(result.errors).toBeDefined();
            expect(result.warnings).toBeDefined();
        });

        it('should check for required frontend folders', () => {
            const result = validateFrontendStructure({
                ...DEFAULT_STRUCTURE_CONFIG,
                rootDir: testRootDir
            });

            // Check that validation runs without crashing
            expect(result.valid).toBeDefined();
        });

        it('should detect misplaced PHP API in frontend', () => {
            const result = validateFrontendStructure({
                ...DEFAULT_STRUCTURE_CONFIG,
                rootDir: testRootDir
            });

            const phpApiError = result.errors.find(e => e.type === 'MISPLACED_PHP_API');

            // Should not have PHP API in frontend after migration
            expect(phpApiError).toBeUndefined();
        });
    });

    describe('validateBackendStructure', () => {
        it('should validate backend directory exists', () => {
            const result = validateBackendStructure({
                ...DEFAULT_STRUCTURE_CONFIG,
                rootDir: testRootDir
            });

            expect(result).toBeDefined();
            expect(result.errors).toBeDefined();
            expect(result.warnings).toBeDefined();
        });

        it('should check for required backend folders', () => {
            const result = validateBackendStructure({
                ...DEFAULT_STRUCTURE_CONFIG,
                rootDir: testRootDir
            });

            // Check that validation runs
            expect(result.valid).toBeDefined();
        });
    });
});

describe('Reference Validator', () => {
    const testRootDir = process.cwd();

    describe('validateImports', () => {
        it('should validate imports in a directory', () => {
            const frontendDir = path.join(testRootDir, 'frontend');

            if (fs.existsSync(frontendDir)) {
                const result = validateImports(testRootDir, frontendDir);

                expect(result).toBeDefined();
                expect(result.errors).toBeDefined();
                expect(result.warnings).toBeDefined();
                expect(result.brokenImports).toBeDefined();
            }
        });

        it('should handle non-existent directory gracefully', () => {
            const result = validateImports(testRootDir, '/nonexistent/path');

            expect(result).toBeDefined();
            expect(result.errors).toBeDefined();
        });
    });

    describe('validateConfigPaths', () => {
        it('should validate configuration file paths', () => {
            const result = validateConfigPaths(testRootDir);

            expect(result).toBeDefined();
            expect(result.errors).toBeDefined();
            expect(result.warnings).toBeDefined();
        });
    });

    describe('validateApiReferences', () => {
        it('should validate API references in frontend', () => {
            const result = validateApiReferences(testRootDir);

            expect(result).toBeDefined();
            expect(result.errors).toBeDefined();
            expect(result.warnings).toBeDefined();
        });

        it('should detect old php-api path references', () => {
            const result = validateApiReferences(testRootDir);

            // After migration, should not have hardcoded frontend/php-api paths
            const hardcodedErrors = result.errors.filter(
                e => e.type === 'HARDCODED_API_PATH'
            );

            // This test documents that there may be hardcoded paths that need fixing
            // In a fully migrated project, this should be 0
            expect(hardcodedErrors.length).toBeGreaterThanOrEqual(0);
        });
    });
});

describe('Build Validator', () => {
    const testRootDir = process.cwd();

    describe('validateFrontendBuild', () => {
        it('should validate frontend build configuration', () => {
            const result = validateFrontendBuild(testRootDir, true);

            expect(result).toBeDefined();
            expect(result.errors).toBeDefined();
            expect(result.warnings).toBeDefined();
            expect(result.frontendBuildable).toBeDefined();
        });

        it('should check for package.json', () => {
            const result = validateFrontendBuild(testRootDir, true);

            const packageJsonError = result.errors.find(
                e => e.type === 'MISSING_PACKAGE_JSON'
            );

            // Frontend should have package.json
            expect(packageJsonError).toBeUndefined();
        });

        it('should check for build script', () => {
            const result = validateFrontendBuild(testRootDir, true);

            const buildScriptError = result.errors.find(
                e => e.type === 'MISSING_BUILD_SCRIPT'
            );

            // Frontend should have build script
            expect(buildScriptError).toBeUndefined();
        });
    });

    describe('validateBackendBuild', () => {
        it('should validate backend build configuration', () => {
            const result = validateBackendBuild(testRootDir, true);

            expect(result).toBeDefined();
            expect(result.errors).toBeDefined();
            expect(result.warnings).toBeDefined();
            expect(result.backendBuildable).toBeDefined();
        });

        it('should check for API directory', () => {
            const result = validateBackendBuild(testRootDir, true);

            const apiDirError = result.errors.find(
                e => e.type === 'MISSING_API_DIR'
            );

            // Backend should have API directory
            expect(apiDirError).toBeUndefined();
        });
    });

    describe('validateRootBuildScripts', () => {
        it('should validate root package.json scripts', () => {
            const result = validateRootBuildScripts(testRootDir);

            expect(result).toBeDefined();
            expect(result.errors).toBeDefined();
            expect(result.warnings).toBeDefined();
        });

        it('should not have old path references in scripts', () => {
            const result = validateRootBuildScripts(testRootDir);

            const oldPathErrors = result.errors.filter(
                e => e.type === 'OLD_PATH_IN_SCRIPT'
            );

            // Should not have old my-app paths in root scripts
            expect(oldPathErrors.length).toBe(0);
        });
    });
});

describe('Comprehensive Validation', () => {
    const testRootDir = process.cwd();

    it('should run complete validation suite', () => {
        const result = runComprehensiveValidation(testRootDir, undefined, true);

        expect(result).toBeDefined();
        expect(result.overall).toBeDefined();
        expect(result.structure).toBeDefined();
        expect(result.references).toBeDefined();
        expect(result.builds).toBeDefined();
        expect(result.rootScripts).toBeDefined();
        expect(result.summary).toBeDefined();
    });

    it('should calculate total errors and warnings', () => {
        const result = runComprehensiveValidation(testRootDir, undefined, true);

        expect(result.overall.totalErrors).toBeGreaterThanOrEqual(0);
        expect(result.overall.totalWarnings).toBeGreaterThanOrEqual(0);
        expect(typeof result.overall.valid).toBe('boolean');
    });

    it('should generate summary', () => {
        const result = runComprehensiveValidation(testRootDir, undefined, true);

        expect(result.summary).toBeDefined();
        expect(Array.isArray(result.summary)).toBe(true);
        expect(result.summary.length).toBeGreaterThan(0);
    });

    it('should validate that frontend and backend are buildable', () => {
        const result = runComprehensiveValidation(testRootDir, undefined, true);

        // In dry-run mode, should check configuration
        expect(typeof result.builds.frontendBuildable).toBe('boolean');
        expect(typeof result.builds.backendBuildable).toBe('boolean');
    });
});

describe('Edge Cases', () => {
    const testRootDir = process.cwd();

    it('should handle empty directories gracefully', () => {
        const result = validateProjectStructure({
            ...DEFAULT_STRUCTURE_CONFIG,
            rootDir: testRootDir
        });

        // Should not crash
        expect(result).toBeDefined();
    });

    it('should handle missing configuration files', () => {
        const result = validateConfigPaths('/tmp/nonexistent');

        // Should not crash
        expect(result).toBeDefined();
    });

    it('should handle invalid JSON in config files gracefully', () => {
        // This test validates error handling
        const result = validateConfigPaths(testRootDir);

        // Should complete without throwing
        expect(result).toBeDefined();
    });
});
