/**
 * Build Validator
 * 
 * Validates that frontend and backend can be built independently.
 * This module checks:
 * - Frontend build process works correctly
 * - Backend can be started independently
 * - All dependencies are properly installed
 * - Build scripts are correctly configured
 * 
 * Requirements: 4.1, 7.3, 7.5
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { ValidationResult, ValidationError, ValidationWarning } from './structure-validator';

export interface BuildValidationResult extends ValidationResult {
    frontendBuildable: boolean;
    backendBuildable: boolean;
    buildOutput?: string;
}

/**
 * Validates that frontend can be built independently
 * Requirements 7.3, 7.5
 */
export function validateFrontendBuild(rootDir: string, dryRun: boolean = true): BuildValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const frontendDir = path.join(rootDir, 'frontend');

    try {
        // Check frontend directory exists
        if (!fs.existsSync(frontendDir)) {
            errors.push({
                type: 'MISSING_FRONTEND',
                message: 'Frontend directory does not exist',
                path: frontendDir
            });
            return {
                valid: false,
                errors,
                warnings,
                frontendBuildable: false,
                backendBuildable: false
            };
        }

        // Check package.json exists
        const packageJsonPath = path.join(frontendDir, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            errors.push({
                type: 'MISSING_PACKAGE_JSON',
                message: 'Frontend package.json not found',
                path: packageJsonPath
            });
            return {
                valid: false,
                errors,
                warnings,
                frontendBuildable: false,
                backendBuildable: false
            };
        }

        // Check package.json has build script
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (!packageJson.scripts || !packageJson.scripts.build) {
            errors.push({
                type: 'MISSING_BUILD_SCRIPT',
                message: 'Frontend package.json does not have a build script',
                path: packageJsonPath
            });
            return {
                valid: false,
                errors,
                warnings,
                frontendBuildable: false,
                backendBuildable: false
            };
        }

        // Check node_modules exists
        const nodeModulesPath = path.join(frontendDir, 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
            warnings.push({
                type: 'MISSING_NODE_MODULES',
                message: 'Frontend node_modules not found. Run npm install first.',
                path: nodeModulesPath
            });
        }

        // Check Next.js dependencies
        if (!packageJson.dependencies || !packageJson.dependencies.next) {
            errors.push({
                type: 'MISSING_NEXT_DEPENDENCY',
                message: 'Frontend package.json does not include Next.js dependency',
                path: packageJsonPath
            });
        }

        // Check for Next.js configuration
        const nextConfigPaths = [
            path.join(frontendDir, 'next.config.js'),
            path.join(frontendDir, 'next.config.ts'),
            path.join(frontendDir, 'next.config.mjs')
        ];

        const hasNextConfig = nextConfigPaths.some(p => fs.existsSync(p));
        if (!hasNextConfig) {
            warnings.push({
                type: 'MISSING_NEXT_CONFIG',
                message: 'Next.js configuration file not found',
                path: frontendDir
            });
        }

        // If not dry run, attempt to build
        let buildOutput = '';
        if (!dryRun) {
            try {
                buildOutput = execSync('npm run build', {
                    cwd: frontendDir,
                    encoding: 'utf-8',
                    timeout: 300000 // 5 minutes timeout
                });
            } catch (error: any) {
                errors.push({
                    type: 'BUILD_FAILED',
                    message: `Frontend build failed: ${error.message}`,
                    path: frontendDir
                });
                return {
                    valid: false,
                    errors,
                    warnings,
                    frontendBuildable: false,
                    backendBuildable: false,
                    buildOutput: error.stdout || error.stderr || error.message
                };
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            frontendBuildable: true,
            backendBuildable: false,
            buildOutput
        };

    } catch (error) {
        errors.push({
            type: 'VALIDATION_ERROR',
            message: `Error validating frontend build: ${error instanceof Error ? error.message : String(error)}`
        });
        return {
            valid: false,
            errors,
            warnings,
            frontendBuildable: false,
            backendBuildable: false
        };
    }
}

/**
 * Validates that backend can be started independently
 * Requirements 7.3, 7.5
 */
export function validateBackendBuild(rootDir: string, dryRun: boolean = true): BuildValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const backendDir = path.join(rootDir, 'backend');

    try {
        // Check backend directory exists
        if (!fs.existsSync(backendDir)) {
            errors.push({
                type: 'MISSING_BACKEND',
                message: 'Backend directory does not exist',
                path: backendDir
            });
            return {
                valid: false,
                errors,
                warnings,
                frontendBuildable: false,
                backendBuildable: false
            };
        }

        // Check API directory exists
        const apiDir = path.join(backendDir, 'api');
        if (!fs.existsSync(apiDir)) {
            errors.push({
                type: 'MISSING_API_DIR',
                message: 'Backend API directory does not exist',
                path: apiDir
            });
            return {
                valid: false,
                errors,
                warnings,
                frontendBuildable: false,
                backendBuildable: false
            };
        }

        // Check package.json exists
        const packageJsonPath = path.join(backendDir, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            warnings.push({
                type: 'MISSING_PACKAGE_JSON',
                message: 'Backend package.json not found',
                path: packageJsonPath
            });
        } else {
            // Check package.json has serve script
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            if (!packageJson.scripts || !packageJson.scripts.serve) {
                warnings.push({
                    type: 'MISSING_SERVE_SCRIPT',
                    message: 'Backend package.json does not have a serve script',
                    path: packageJsonPath
                });
            }
        }

        // Check for PHP files in API directory
        const apiFiles = fs.readdirSync(apiDir);
        const phpFiles = apiFiles.filter(file => file.endsWith('.php'));

        if (phpFiles.length === 0) {
            warnings.push({
                type: 'NO_PHP_FILES',
                message: 'No PHP files found in backend API directory',
                path: apiDir
            });
        }

        // Check for database configuration
        const dbDir = path.join(backendDir, 'database');
        if (!fs.existsSync(dbDir)) {
            warnings.push({
                type: 'MISSING_DATABASE_DIR',
                message: 'Backend database directory not found',
                path: dbDir
            });
        }

        // Check for composer.json (PHP dependency management)
        const composerJsonPath = path.join(backendDir, 'composer.json');
        if (!fs.existsSync(composerJsonPath)) {
            warnings.push({
                type: 'MISSING_COMPOSER_JSON',
                message: 'Backend composer.json not found',
                path: composerJsonPath
            });
        }

        // If not dry run, check if PHP is available
        if (!dryRun) {
            try {
                execSync('php --version', { encoding: 'utf-8' });
            } catch (error) {
                errors.push({
                    type: 'PHP_NOT_AVAILABLE',
                    message: 'PHP is not available in the system PATH',
                    path: backendDir
                });
                return {
                    valid: false,
                    errors,
                    warnings,
                    frontendBuildable: false,
                    backendBuildable: false
                };
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            frontendBuildable: false,
            backendBuildable: true
        };

    } catch (error) {
        errors.push({
            type: 'VALIDATION_ERROR',
            message: `Error validating backend build: ${error instanceof Error ? error.message : String(error)}`
        });
        return {
            valid: false,
            errors,
            warnings,
            frontendBuildable: false,
            backendBuildable: false
        };
    }
}

/**
 * Validates that both frontend and backend can be built/started independently
 * Requirements 4.1, 7.3, 7.5
 */
export function validateIndependentBuilds(rootDir: string, dryRun: boolean = true): BuildValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    // Validate frontend
    const frontendResult = validateFrontendBuild(rootDir, dryRun);
    allErrors.push(...frontendResult.errors);
    allWarnings.push(...frontendResult.warnings);

    // Validate backend
    const backendResult = validateBackendBuild(rootDir, dryRun);
    allErrors.push(...backendResult.errors);
    allWarnings.push(...backendResult.warnings);

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        frontendBuildable: frontendResult.frontendBuildable,
        backendBuildable: backendResult.backendBuildable,
        buildOutput: frontendResult.buildOutput
    };
}

/**
 * Validates root-level build scripts
 * Requirement 7.2, 7.4
 */
export function validateRootBuildScripts(rootDir: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
        const packageJsonPath = path.join(rootDir, 'package.json');

        if (!fs.existsSync(packageJsonPath)) {
            warnings.push({
                type: 'MISSING_ROOT_PACKAGE_JSON',
                message: 'Root package.json not found',
                path: packageJsonPath
            });
            return { valid: true, errors, warnings };
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        if (!packageJson.scripts) {
            warnings.push({
                type: 'NO_SCRIPTS',
                message: 'Root package.json has no scripts defined',
                path: packageJsonPath
            });
            return { valid: true, errors, warnings };
        }

        // Check for essential scripts
        const essentialScripts = [
            'dev:frontend',
            'dev:backend',
            'build:frontend',
            'test:frontend',
            'test:backend'
        ];

        for (const script of essentialScripts) {
            if (!packageJson.scripts[script]) {
                warnings.push({
                    type: 'MISSING_SCRIPT',
                    message: `Root package.json missing recommended script: ${script}`,
                    path: packageJsonPath
                });
            }
        }

        // Validate script paths
        for (const [scriptName, scriptCommand] of Object.entries(packageJson.scripts)) {
            if (typeof scriptCommand === 'string') {
                // Check for references to old paths
                if (scriptCommand.includes('my-app/') && !scriptCommand.includes('frontend/my-app')) {
                    errors.push({
                        type: 'OLD_PATH_IN_SCRIPT',
                        message: `Script "${scriptName}" contains reference to old my-app path: ${scriptCommand}`,
                        path: packageJsonPath
                    });
                }

                // Check for cd commands to verify directories exist
                const cdMatch = scriptCommand.match(/cd\s+([^\s&|;]+)/);
                if (cdMatch) {
                    const targetDir = cdMatch[1];
                    const fullPath = path.resolve(rootDir, targetDir);

                    if (!fs.existsSync(fullPath)) {
                        errors.push({
                            type: 'INVALID_SCRIPT_PATH',
                            message: `Script "${scriptName}" references non-existent directory: ${targetDir}`,
                            path: packageJsonPath
                        });
                    }
                }
            }
        }

    } catch (error) {
        errors.push({
            type: 'VALIDATION_ERROR',
            message: `Error validating root build scripts: ${error instanceof Error ? error.message : String(error)}`
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}
