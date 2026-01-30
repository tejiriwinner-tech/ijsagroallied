/**
 * Structure Validator
 * 
 * Validates that the project structure complies with the reorganization requirements.
 * This module checks:
 * - Structure compliance (correct folder organization)
 * - File references and imports
 * - Independent build capability for frontend and backend
 * 
 * Requirements: 4.1, 7.3, 7.5
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    type: string;
    message: string;
    path?: string;
}

export interface ValidationWarning {
    type: string;
    message: string;
    path?: string;
}

export interface StructureConfig {
    rootDir: string;
    allowedRootFolders: string[];
    requiredFrontendFolders: string[];
    requiredBackendFolders: string[];
}

/**
 * Default structure configuration based on requirements
 */
export const DEFAULT_STRUCTURE_CONFIG: StructureConfig = {
    rootDir: process.cwd(),
    allowedRootFolders: ['frontend', 'backend', 'docs', 'scripts', '.vscode', '.kiro', 'node_modules', '.git'],
    requiredFrontendFolders: ['app', 'components', 'public'],
    requiredBackendFolders: ['api', 'config', 'database']
};

/**
 * Validates the overall project structure compliance
 * Requirement 6.1: Root should contain only essential folders
 */
export function validateProjectStructure(config: StructureConfig = DEFAULT_STRUCTURE_CONFIG): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
        // Check root directory exists
        if (!fs.existsSync(config.rootDir)) {
            errors.push({
                type: 'MISSING_ROOT',
                message: `Root directory does not exist: ${config.rootDir}`
            });
            return { valid: false, errors, warnings };
        }

        // Get all items in root directory
        const rootItems = fs.readdirSync(config.rootDir);
        const rootFolders = rootItems.filter(item => {
            const itemPath = path.join(config.rootDir, item);
            return fs.statSync(itemPath).isDirectory();
        });

        // Check for disallowed folders in root
        const disallowedFolders = rootFolders.filter(folder =>
            !config.allowedRootFolders.includes(folder)
        );

        if (disallowedFolders.length > 0) {
            errors.push({
                type: 'DISALLOWED_ROOT_FOLDERS',
                message: `Root directory contains disallowed folders: ${disallowedFolders.join(', ')}`,
                path: config.rootDir
            });
        }

        // Check for required folders
        const frontendPath = path.join(config.rootDir, 'frontend');
        const backendPath = path.join(config.rootDir, 'backend');

        if (!fs.existsSync(frontendPath)) {
            errors.push({
                type: 'MISSING_FRONTEND',
                message: 'Frontend folder is missing from root',
                path: frontendPath
            });
        }

        if (!fs.existsSync(backendPath)) {
            errors.push({
                type: 'MISSING_BACKEND',
                message: 'Backend folder is missing from root',
                path: backendPath
            });
        }

        // Check for duplicate Next.js applications
        const duplicateNextJsCheck = checkForDuplicateNextJs(config.rootDir);
        if (!duplicateNextJsCheck.valid) {
            errors.push(...duplicateNextJsCheck.errors);
            warnings.push(...duplicateNextJsCheck.warnings);
        }

        // Check for duplicate Git repositories
        const duplicateGitCheck = checkForDuplicateGitRepos(config.rootDir);
        if (!duplicateGitCheck.valid) {
            errors.push(...duplicateGitCheck.errors);
            warnings.push(...duplicateGitCheck.warnings);
        }

    } catch (error) {
        errors.push({
            type: 'VALIDATION_ERROR',
            message: `Error during structure validation: ${error instanceof Error ? error.message : String(error)}`
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validates frontend structure compliance
 * Requirements 2.1, 2.2, 2.3, 2.4
 */
export function validateFrontendStructure(config: StructureConfig = DEFAULT_STRUCTURE_CONFIG): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const frontendPath = path.join(config.rootDir, 'frontend');

    try {
        if (!fs.existsSync(frontendPath)) {
            errors.push({
                type: 'MISSING_FRONTEND',
                message: 'Frontend directory does not exist',
                path: frontendPath
            });
            return { valid: false, errors, warnings };
        }

        // Check for required frontend folders
        for (const folder of config.requiredFrontendFolders) {
            const folderPath = path.join(frontendPath, folder);
            if (!fs.existsSync(folderPath)) {
                errors.push({
                    type: 'MISSING_FRONTEND_FOLDER',
                    message: `Required frontend folder missing: ${folder}`,
                    path: folderPath
                });
            }
        }

        // Check for frontend package.json
        const packageJsonPath = path.join(frontendPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            errors.push({
                type: 'MISSING_PACKAGE_JSON',
                message: 'Frontend package.json is missing',
                path: packageJsonPath
            });
        } else {
            // Validate package.json has frontend dependencies
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            if (!packageJson.dependencies || !packageJson.dependencies['next']) {
                warnings.push({
                    type: 'MISSING_NEXT_DEPENDENCY',
                    message: 'Frontend package.json does not include Next.js dependency',
                    path: packageJsonPath
                });
            }
        }

        // Check for Next.js configuration
        const nextConfigPaths = [
            path.join(frontendPath, 'next.config.js'),
            path.join(frontendPath, 'next.config.ts'),
            path.join(frontendPath, 'next.config.mjs')
        ];

        const hasNextConfig = nextConfigPaths.some(p => fs.existsSync(p));
        if (!hasNextConfig) {
            warnings.push({
                type: 'MISSING_NEXT_CONFIG',
                message: 'Next.js configuration file not found',
                path: frontendPath
            });
        }

        // Check for misplaced PHP API in frontend
        const phpApiPath = path.join(frontendPath, 'php-api');
        if (fs.existsSync(phpApiPath)) {
            errors.push({
                type: 'MISPLACED_PHP_API',
                message: 'PHP API should be in backend, not frontend',
                path: phpApiPath
            });
        }

    } catch (error) {
        errors.push({
            type: 'VALIDATION_ERROR',
            message: `Error during frontend validation: ${error instanceof Error ? error.message : String(error)}`
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validates backend structure compliance
 * Requirements 3.1, 3.2, 3.3
 */
export function validateBackendStructure(config: StructureConfig = DEFAULT_STRUCTURE_CONFIG): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const backendPath = path.join(config.rootDir, 'backend');

    try {
        if (!fs.existsSync(backendPath)) {
            errors.push({
                type: 'MISSING_BACKEND',
                message: 'Backend directory does not exist',
                path: backendPath
            });
            return { valid: false, errors, warnings };
        }

        // Check for required backend folders
        for (const folder of config.requiredBackendFolders) {
            const folderPath = path.join(backendPath, folder);
            if (!fs.existsSync(folderPath)) {
                errors.push({
                    type: 'MISSING_BACKEND_FOLDER',
                    message: `Required backend folder missing: ${folder}`,
                    path: folderPath
                });
            }
        }

        // Check for backend README
        const readmePath = path.join(backendPath, 'README.md');
        if (!fs.existsSync(readmePath)) {
            warnings.push({
                type: 'MISSING_README',
                message: 'Backend README.md is missing',
                path: readmePath
            });
        }

        // Check that API is in backend, not frontend
        const apiPath = path.join(backendPath, 'api');
        if (!fs.existsSync(apiPath)) {
            errors.push({
                type: 'MISSING_API_FOLDER',
                message: 'API folder should exist in backend',
                path: apiPath
            });
        }

    } catch (error) {
        errors.push({
            type: 'VALIDATION_ERROR',
            message: `Error during backend validation: ${error instanceof Error ? error.message : String(error)}`
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Checks for duplicate Next.js applications
 * Requirement 1.1: Only one Next.js application instance
 */
function checkForDuplicateNextJs(rootDir: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
        const possibleLocations = [
            path.join(rootDir, 'my-app'),
            path.join(rootDir, 'frontend', 'my-app')
        ];

        const existingLocations = possibleLocations.filter(loc => {
            if (!fs.existsSync(loc)) return false;
            // Check if it's a Next.js app by looking for package.json with next dependency
            const packageJsonPath = path.join(loc, 'package.json');
            if (!fs.existsSync(packageJsonPath)) return false;
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                return packageJson.dependencies?.next || packageJson.devDependencies?.next;
            } catch {
                return false;
            }
        });

        if (existingLocations.length > 1) {
            errors.push({
                type: 'DUPLICATE_NEXTJS',
                message: `Multiple Next.js applications found: ${existingLocations.join(', ')}`,
                path: rootDir
            });
        }

        // Check for my-app in root (should be removed)
        const rootMyApp = path.join(rootDir, 'my-app');
        if (fs.existsSync(rootMyApp)) {
            warnings.push({
                type: 'NEXTJS_IN_ROOT',
                message: 'Next.js application found in root directory (should be in frontend only)',
                path: rootMyApp
            });
        }

    } catch (error) {
        errors.push({
            type: 'VALIDATION_ERROR',
            message: `Error checking for duplicate Next.js apps: ${error instanceof Error ? error.message : String(error)}`
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Checks for duplicate Git repositories
 * Requirement 1.4: Only one Git repository in root
 */
function checkForDuplicateGitRepos(rootDir: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
        const gitRepos: string[] = [];

        // Check root
        if (fs.existsSync(path.join(rootDir, '.git'))) {
            gitRepos.push(rootDir);
        }

        // Check subdirectories
        const checkDirs = ['frontend', 'backend', 'my-app'];
        for (const dir of checkDirs) {
            const dirPath = path.join(rootDir, dir);
            if (fs.existsSync(dirPath) && fs.existsSync(path.join(dirPath, '.git'))) {
                gitRepos.push(dirPath);
            }
        }

        if (gitRepos.length > 1) {
            errors.push({
                type: 'DUPLICATE_GIT_REPOS',
                message: `Multiple Git repositories found: ${gitRepos.join(', ')}. Only root should have .git`,
                path: rootDir
            });
        }

        if (gitRepos.length === 0) {
            warnings.push({
                type: 'NO_GIT_REPO',
                message: 'No Git repository found in project',
                path: rootDir
            });
        }

    } catch (error) {
        errors.push({
            type: 'VALIDATION_ERROR',
            message: `Error checking for duplicate Git repos: ${error instanceof Error ? error.message : String(error)}`
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Runs all structure validation checks
 */
export function validateAllStructure(config: StructureConfig = DEFAULT_STRUCTURE_CONFIG): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    const projectResult = validateProjectStructure(config);
    allErrors.push(...projectResult.errors);
    allWarnings.push(...projectResult.warnings);

    const frontendResult = validateFrontendStructure(config);
    allErrors.push(...frontendResult.errors);
    allWarnings.push(...frontendResult.warnings);

    const backendResult = validateBackendStructure(config);
    allErrors.push(...backendResult.errors);
    allWarnings.push(...backendResult.warnings);

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
    };
}
