/**
 * Reference Validator
 * 
 * Validates that all file references and imports are correct after reorganization.
 * This module checks:
 * - Import statements in TypeScript/JavaScript files
 * - Path references in configuration files
 * - API endpoint references
 * 
 * Requirements: 4.2, 5.1, 5.2, 5.3
 */

import * as fs from 'fs';
import * as path from 'path';
import { ValidationResult, ValidationError, ValidationWarning } from './structure-validator';

export interface ImportReference {
    file: string;
    line: number;
    importPath: string;
    resolvedPath?: string;
    valid: boolean;
}

export interface ReferenceValidationResult extends ValidationResult {
    brokenImports?: ImportReference[];
}

/**
 * Validates all import statements in TypeScript/JavaScript files
 * Requirements 4.2, 5.1
 */
export function validateImports(rootDir: string, targetDir: string): ReferenceValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const brokenImports: ImportReference[] = [];

    try {
        const files = findSourceFiles(targetDir);

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const imports = extractImports(content);

            for (const imp of imports) {
                // Skip external packages (not starting with . or / or @/)
                if (!imp.importPath.startsWith('.') && !imp.importPath.startsWith('/') && !imp.importPath.startsWith('@/')) {
                    continue; // External package, skip validation
                }

                const resolvedPath = resolveImportPath(file, imp.importPath, rootDir);

                if (!resolvedPath || !fs.existsSync(resolvedPath)) {
                    brokenImports.push({
                        file: path.relative(rootDir, file),
                        line: imp.line,
                        importPath: imp.importPath,
                        resolvedPath: resolvedPath || undefined,
                        valid: false
                    });

                    errors.push({
                        type: 'BROKEN_IMPORT',
                        message: `Broken import in ${path.relative(rootDir, file)}:${imp.line}: "${imp.importPath}"`,
                        path: file
                    });
                }
            }
        }

    } catch (error) {
        errors.push({
            type: 'VALIDATION_ERROR',
            message: `Error validating imports: ${error instanceof Error ? error.message : String(error)}`
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        brokenImports
    };
}

/**
 * Validates configuration file path references
 * Requirements 4.4, 5.2, 5.4, 5.5
 */
export function validateConfigPaths(rootDir: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
        // Check frontend configuration files
        const frontendConfigFiles = [
            path.join(rootDir, 'frontend', 'next.config.js'),
            path.join(rootDir, 'frontend', 'next.config.ts'),
            path.join(rootDir, 'frontend', 'tsconfig.json'),
            path.join(rootDir, 'frontend', 'package.json')
        ];

        for (const configFile of frontendConfigFiles) {
            if (fs.existsSync(configFile)) {
                const result = validateConfigFile(configFile, rootDir);
                errors.push(...result.errors);
                warnings.push(...result.warnings);
            }
        }

        // Check backend configuration files
        const backendConfigFiles = [
            path.join(rootDir, 'backend', 'package.json'),
            path.join(rootDir, 'backend', 'composer.json')
        ];

        for (const configFile of backendConfigFiles) {
            if (fs.existsSync(configFile)) {
                const result = validateConfigFile(configFile, rootDir);
                errors.push(...result.errors);
                warnings.push(...result.warnings);
            }
        }

        // Check root package.json
        const rootPackageJson = path.join(rootDir, 'package.json');
        if (fs.existsSync(rootPackageJson)) {
            const result = validatePackageJsonScripts(rootPackageJson, rootDir);
            errors.push(...result.errors);
            warnings.push(...result.warnings);
        }

    } catch (error) {
        errors.push({
            type: 'VALIDATION_ERROR',
            message: `Error validating config paths: ${error instanceof Error ? error.message : String(error)}`
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validates API endpoint references in frontend code
 * Requirement 5.3
 */
export function validateApiReferences(rootDir: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
        const frontendDir = path.join(rootDir, 'frontend');
        if (!fs.existsSync(frontendDir)) {
            warnings.push({
                type: 'MISSING_FRONTEND',
                message: 'Frontend directory not found, skipping API reference validation',
                path: frontendDir
            });
            return { valid: true, errors, warnings };
        }

        // Look for API calls in frontend code
        const sourceFiles = findSourceFiles(frontendDir);

        for (const file of sourceFiles) {
            const content = fs.readFileSync(file, 'utf-8');

            // Check for references to old php-api path
            if (content.includes('php-api') || content.includes('/php-api/')) {
                warnings.push({
                    type: 'OLD_API_PATH',
                    message: `File contains reference to old php-api path: ${path.relative(rootDir, file)}`,
                    path: file
                });
            }

            // Check for hardcoded frontend paths in API calls
            if (content.includes('frontend/php-api')) {
                errors.push({
                    type: 'HARDCODED_API_PATH',
                    message: `File contains hardcoded frontend/php-api path: ${path.relative(rootDir, file)}`,
                    path: file
                });
            }
        }

    } catch (error) {
        errors.push({
            type: 'VALIDATION_ERROR',
            message: `Error validating API references: ${error instanceof Error ? error.message : String(error)}`
        });
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Helper: Find all source files in a directory
 */
function findSourceFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip node_modules, .next, and other build directories
        if (entry.isDirectory()) {
            if (['node_modules', '.next', 'dist', 'build', '.git'].includes(entry.name)) {
                continue;
            }
            files.push(...findSourceFiles(fullPath));
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
                files.push(fullPath);
            }
        }
    }

    return files;
}

/**
 * Helper: Extract import statements from file content
 */
function extractImports(content: string): Array<{ line: number; importPath: string }> {
    const imports: Array<{ line: number; importPath: string }> = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Match ES6 imports: import ... from '...'
        const es6Match = line.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/);
        if (es6Match) {
            imports.push({ line: i + 1, importPath: es6Match[1] });
            continue;
        }

        // Match require: require('...')
        const requireMatch = line.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        if (requireMatch) {
            imports.push({ line: i + 1, importPath: requireMatch[1] });
            continue;
        }

        // Match dynamic imports: import('...')
        const dynamicMatch = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        if (dynamicMatch) {
            imports.push({ line: i + 1, importPath: dynamicMatch[1] });
        }
    }

    return imports;
}

/**
 * Helper: Resolve import path to actual file
 */
function resolveImportPath(fromFile: string, importPath: string, rootDir: string): string | null {
    // Skip external packages (not starting with . or / or @/)
    if (!importPath.startsWith('.') && !importPath.startsWith('/') && !importPath.startsWith('@/')) {
        return null; // External package, assume valid
    }

    // Handle @ alias (typically maps to src or root)
    if (importPath.startsWith('@/')) {
        // Try to resolve from frontend directory
        const fromDir = path.dirname(fromFile);
        const frontendDir = path.join(rootDir, 'frontend');

        // Check if we're in frontend
        if (fromFile.includes('frontend')) {
            const relativePath = importPath.substring(2); // Remove '@/'
            let resolvedPath = path.join(frontendDir, relativePath);

            // Try different extensions
            const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
            for (const ext of extensions) {
                const testPath = resolvedPath + ext;
                if (fs.existsSync(testPath)) {
                    return testPath;
                }
            }
            return resolvedPath; // Return unresolved for error reporting
        }
    }

    const fromDir = path.dirname(fromFile);
    let resolvedPath = path.resolve(fromDir, importPath);

    // Try different extensions
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];

    for (const ext of extensions) {
        const testPath = resolvedPath + ext;
        if (fs.existsSync(testPath)) {
            return testPath;
        }
    }

    return resolvedPath; // Return unresolved path for error reporting
}

/**
 * Helper: Validate a configuration file
 */
function validateConfigFile(configFile: string, rootDir: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
        const content = fs.readFileSync(configFile, 'utf-8');
        const ext = path.extname(configFile);

        if (ext === '.json') {
            // Parse JSON and check for path references
            const config = JSON.parse(content);
            validateJsonPaths(config, configFile, rootDir, errors, warnings);
        } else {
            // For JS/TS config files, do basic string checks
            // Check for references to old structure
            if (content.includes('my-app/') && !configFile.includes('my-app')) {
                warnings.push({
                    type: 'OLD_PATH_REFERENCE',
                    message: `Config file may contain old path references: ${path.relative(rootDir, configFile)}`,
                    path: configFile
                });
            }
        }

    } catch (error) {
        errors.push({
            type: 'CONFIG_VALIDATION_ERROR',
            message: `Error validating config file ${path.relative(rootDir, configFile)}: ${error instanceof Error ? error.message : String(error)}`,
            path: configFile
        });
    }

    return { valid: errors.length === 0, errors, warnings };
}

/**
 * Helper: Validate paths in JSON configuration
 */
function validateJsonPaths(obj: any, configFile: string, rootDir: string, errors: ValidationError[], warnings: ValidationWarning[], keyPath: string = ''): void {
    if (typeof obj !== 'object' || obj === null) {
        return;
    }

    for (const [key, value] of Object.entries(obj)) {
        const currentPath = keyPath ? `${keyPath}.${key}` : key;

        if (typeof value === 'string') {
            // Check if it looks like a file path
            if (value.includes('/') || value.includes('\\')) {
                // Check for old structure references
                if (value.includes('my-app/') || value.includes('frontend/php-api')) {
                    warnings.push({
                        type: 'OLD_PATH_IN_CONFIG',
                        message: `Config contains old path reference at ${currentPath}: "${value}"`,
                        path: configFile
                    });
                }
            }
        } else if (typeof value === 'object') {
            validateJsonPaths(value, configFile, rootDir, errors, warnings, currentPath);
        }
    }
}

/**
 * Helper: Validate package.json scripts
 */
function validatePackageJsonScripts(packageJsonPath: string, rootDir: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

        if (packageJson.scripts) {
            for (const [scriptName, scriptCommand] of Object.entries(packageJson.scripts)) {
                if (typeof scriptCommand === 'string') {
                    // Check for references to old paths
                    if (scriptCommand.includes('my-app/') && !packageJsonPath.includes('my-app')) {
                        warnings.push({
                            type: 'OLD_PATH_IN_SCRIPT',
                            message: `Script "${scriptName}" contains old path reference: ${scriptCommand}`,
                            path: packageJsonPath
                        });
                    }

                    // Check for cd commands to verify directories exist
                    const cdMatch = scriptCommand.match(/cd\s+([^\s&|;]+)/);
                    if (cdMatch) {
                        const targetDir = cdMatch[1];
                        const baseDir = path.dirname(packageJsonPath);
                        const fullPath = path.resolve(baseDir, targetDir);

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
        }

    } catch (error) {
        errors.push({
            type: 'PACKAGE_JSON_ERROR',
            message: `Error validating package.json scripts: ${error instanceof Error ? error.message : String(error)}`,
            path: packageJsonPath
        });
    }

    return { valid: errors.length === 0, errors, warnings };
}

/**
 * Runs all reference validation checks
 */
export function validateAllReferences(rootDir: string): ReferenceValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    let allBrokenImports: ImportReference[] = [];

    // Validate frontend imports
    const frontendDir = path.join(rootDir, 'frontend');
    if (fs.existsSync(frontendDir)) {
        const frontendResult = validateImports(rootDir, frontendDir);
        allErrors.push(...frontendResult.errors);
        allWarnings.push(...frontendResult.warnings);
        if (frontendResult.brokenImports) {
            allBrokenImports.push(...frontendResult.brokenImports);
        }
    }

    // Validate backend imports (if applicable)
    const backendDir = path.join(rootDir, 'backend');
    if (fs.existsSync(backendDir)) {
        const backendResult = validateImports(rootDir, backendDir);
        allErrors.push(...backendResult.errors);
        allWarnings.push(...backendResult.warnings);
        if (backendResult.brokenImports) {
            allBrokenImports.push(...backendResult.brokenImports);
        }
    }

    // Validate config paths
    const configResult = validateConfigPaths(rootDir);
    allErrors.push(...configResult.errors);
    allWarnings.push(...configResult.warnings);

    // Validate API references
    const apiResult = validateApiReferences(rootDir);
    allErrors.push(...apiResult.errors);
    allWarnings.push(...apiResult.warnings);

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        brokenImports: allBrokenImports
    };
}
