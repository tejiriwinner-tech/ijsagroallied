/**
 * Comprehensive Validation Suite
 * 
 * Main entry point for validating the project structure reorganization.
 * Combines structure, reference, and build validation into a single suite.
 * 
 * Requirements: 4.1, 7.3, 7.5
 */

import {
    validateAllStructure,
    validateProjectStructure,
    validateFrontendStructure,
    validateBackendStructure,
    ValidationResult,
    ValidationError,
    ValidationWarning,
    StructureConfig,
    DEFAULT_STRUCTURE_CONFIG
} from './structure-validator';

import {
    validateAllReferences,
    validateImports,
    validateConfigPaths,
    validateApiReferences,
    ReferenceValidationResult
} from './reference-validator';

import {
    validateIndependentBuilds,
    validateFrontendBuild,
    validateBackendBuild,
    validateRootBuildScripts,
    BuildValidationResult
} from './build-validator';

export interface ComprehensiveValidationResult {
    overall: {
        valid: boolean;
        totalErrors: number;
        totalWarnings: number;
    };
    structure: ValidationResult;
    references: ReferenceValidationResult;
    builds: BuildValidationResult;
    rootScripts: ValidationResult;
    summary: string[];
}

/**
 * Runs the complete validation suite
 * 
 * @param rootDir - Root directory of the project
 * @param config - Optional structure configuration
 * @param dryRun - If true, skips actual build attempts (default: true)
 * @returns Comprehensive validation results
 */
export function runComprehensiveValidation(
    rootDir: string = process.cwd(),
    config: StructureConfig = DEFAULT_STRUCTURE_CONFIG,
    dryRun: boolean = true
): ComprehensiveValidationResult {
    console.log('🔍 Running comprehensive validation suite...\n');

    // Run structure validation
    console.log('📁 Validating project structure...');
    const structureResult = validateAllStructure({ ...config, rootDir });
    console.log(`   ${structureResult.valid ? '✅' : '❌'} Structure validation ${structureResult.valid ? 'passed' : 'failed'}`);
    console.log(`   Errors: ${structureResult.errors.length}, Warnings: ${structureResult.warnings.length}\n`);

    // Run reference validation
    console.log('🔗 Validating file references and imports...');
    const referencesResult = validateAllReferences(rootDir);
    console.log(`   ${referencesResult.valid ? '✅' : '❌'} Reference validation ${referencesResult.valid ? 'passed' : 'failed'}`);
    console.log(`   Errors: ${referencesResult.errors.length}, Warnings: ${referencesResult.warnings.length}`);
    if (referencesResult.brokenImports && referencesResult.brokenImports.length > 0) {
        console.log(`   Broken imports: ${referencesResult.brokenImports.length}`);
    }
    console.log();

    // Run build validation
    console.log('🔨 Validating build configuration...');
    const buildsResult = validateIndependentBuilds(rootDir, dryRun);
    console.log(`   ${buildsResult.valid ? '✅' : '❌'} Build validation ${buildsResult.valid ? 'passed' : 'failed'}`);
    console.log(`   Frontend buildable: ${buildsResult.frontendBuildable ? '✅' : '❌'}`);
    console.log(`   Backend buildable: ${buildsResult.backendBuildable ? '✅' : '❌'}`);
    console.log(`   Errors: ${buildsResult.errors.length}, Warnings: ${buildsResult.warnings.length}\n`);

    // Run root scripts validation
    console.log('📜 Validating root build scripts...');
    const rootScriptsResult = validateRootBuildScripts(rootDir);
    console.log(`   ${rootScriptsResult.valid ? '✅' : '❌'} Root scripts validation ${rootScriptsResult.valid ? 'passed' : 'failed'}`);
    console.log(`   Errors: ${rootScriptsResult.errors.length}, Warnings: ${rootScriptsResult.warnings.length}\n`);

    // Calculate totals
    const totalErrors =
        structureResult.errors.length +
        referencesResult.errors.length +
        buildsResult.errors.length +
        rootScriptsResult.errors.length;

    const totalWarnings =
        structureResult.warnings.length +
        referencesResult.warnings.length +
        buildsResult.warnings.length +
        rootScriptsResult.warnings.length;

    const overallValid = totalErrors === 0;

    // Generate summary
    const summary = generateSummary({
        structure: structureResult,
        references: referencesResult,
        builds: buildsResult,
        rootScripts: rootScriptsResult,
        totalErrors,
        totalWarnings,
        overallValid
    });

    return {
        overall: {
            valid: overallValid,
            totalErrors,
            totalWarnings
        },
        structure: structureResult,
        references: referencesResult,
        builds: buildsResult,
        rootScripts: rootScriptsResult,
        summary
    };
}

/**
 * Generates a human-readable summary of validation results
 */
function generateSummary(results: {
    structure: ValidationResult;
    references: ReferenceValidationResult;
    builds: BuildValidationResult;
    rootScripts: ValidationResult;
    totalErrors: number;
    totalWarnings: number;
    overallValid: boolean;
}): string[] {
    const summary: string[] = [];

    summary.push('='.repeat(60));
    summary.push('VALIDATION SUMMARY');
    summary.push('='.repeat(60));
    summary.push('');

    // Overall status
    if (results.overallValid) {
        summary.push('✅ OVERALL STATUS: PASSED');
        summary.push('   All validation checks passed successfully!');
    } else {
        summary.push('❌ OVERALL STATUS: FAILED');
        summary.push(`   Found ${results.totalErrors} error(s) that need to be fixed.`);
    }
    summary.push('');

    // Statistics
    summary.push('📊 STATISTICS:');
    summary.push(`   Total Errors:   ${results.totalErrors}`);
    summary.push(`   Total Warnings: ${results.totalWarnings}`);
    summary.push('');

    // Detailed results
    summary.push('📋 DETAILED RESULTS:');
    summary.push('');

    // Structure
    summary.push(`   Structure Validation: ${results.structure.valid ? '✅ PASSED' : '❌ FAILED'}`);
    if (results.structure.errors.length > 0) {
        summary.push(`      Errors: ${results.structure.errors.length}`);
        results.structure.errors.slice(0, 3).forEach(err => {
            summary.push(`      - ${err.type}: ${err.message}`);
        });
        if (results.structure.errors.length > 3) {
            summary.push(`      ... and ${results.structure.errors.length - 3} more`);
        }
    }
    if (results.structure.warnings.length > 0) {
        summary.push(`      Warnings: ${results.structure.warnings.length}`);
    }
    summary.push('');

    // References
    summary.push(`   Reference Validation: ${results.references.valid ? '✅ PASSED' : '❌ FAILED'}`);
    if (results.references.errors.length > 0) {
        summary.push(`      Errors: ${results.references.errors.length}`);
        results.references.errors.slice(0, 3).forEach(err => {
            summary.push(`      - ${err.type}: ${err.message}`);
        });
        if (results.references.errors.length > 3) {
            summary.push(`      ... and ${results.references.errors.length - 3} more`);
        }
    }
    if (results.references.brokenImports && results.references.brokenImports.length > 0) {
        summary.push(`      Broken imports: ${results.references.brokenImports.length}`);
    }
    if (results.references.warnings.length > 0) {
        summary.push(`      Warnings: ${results.references.warnings.length}`);
    }
    summary.push('');

    // Builds
    summary.push(`   Build Validation: ${results.builds.valid ? '✅ PASSED' : '❌ FAILED'}`);
    summary.push(`      Frontend: ${results.builds.frontendBuildable ? '✅ Buildable' : '❌ Not buildable'}`);
    summary.push(`      Backend:  ${results.builds.backendBuildable ? '✅ Buildable' : '❌ Not buildable'}`);
    if (results.builds.errors.length > 0) {
        summary.push(`      Errors: ${results.builds.errors.length}`);
        results.builds.errors.slice(0, 3).forEach(err => {
            summary.push(`      - ${err.type}: ${err.message}`);
        });
        if (results.builds.errors.length > 3) {
            summary.push(`      ... and ${results.builds.errors.length - 3} more`);
        }
    }
    if (results.builds.warnings.length > 0) {
        summary.push(`      Warnings: ${results.builds.warnings.length}`);
    }
    summary.push('');

    // Root scripts
    summary.push(`   Root Scripts Validation: ${results.rootScripts.valid ? '✅ PASSED' : '❌ FAILED'}`);
    if (results.rootScripts.errors.length > 0) {
        summary.push(`      Errors: ${results.rootScripts.errors.length}`);
        results.rootScripts.errors.slice(0, 3).forEach(err => {
            summary.push(`      - ${err.type}: ${err.message}`);
        });
        if (results.rootScripts.errors.length > 3) {
            summary.push(`      ... and ${results.rootScripts.errors.length - 3} more`);
        }
    }
    if (results.rootScripts.warnings.length > 0) {
        summary.push(`      Warnings: ${results.rootScripts.warnings.length}`);
    }
    summary.push('');

    // Recommendations
    if (!results.overallValid) {
        summary.push('💡 RECOMMENDATIONS:');
        summary.push('   1. Review and fix all errors listed above');
        summary.push('   2. Address warnings to improve project quality');
        summary.push('   3. Run validation again after fixes');
        summary.push('');
    }

    summary.push('='.repeat(60));

    return summary;
}

/**
 * Prints validation results to console
 */
export function printValidationResults(result: ComprehensiveValidationResult): void {
    console.log('\n' + result.summary.join('\n'));

    // Print detailed errors if any
    if (result.overall.totalErrors > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('DETAILED ERRORS:');
        console.log('='.repeat(60) + '\n');

        if (result.structure.errors.length > 0) {
            console.log('Structure Errors:');
            result.structure.errors.forEach((err, i) => {
                console.log(`  ${i + 1}. [${err.type}] ${err.message}`);
                if (err.path) console.log(`     Path: ${err.path}`);
            });
            console.log();
        }

        if (result.references.errors.length > 0) {
            console.log('Reference Errors:');
            result.references.errors.forEach((err, i) => {
                console.log(`  ${i + 1}. [${err.type}] ${err.message}`);
                if (err.path) console.log(`     Path: ${err.path}`);
            });
            console.log();
        }

        if (result.builds.errors.length > 0) {
            console.log('Build Errors:');
            result.builds.errors.forEach((err, i) => {
                console.log(`  ${i + 1}. [${err.type}] ${err.message}`);
                if (err.path) console.log(`     Path: ${err.path}`);
            });
            console.log();
        }

        if (result.rootScripts.errors.length > 0) {
            console.log('Root Scripts Errors:');
            result.rootScripts.errors.forEach((err, i) => {
                console.log(`  ${i + 1}. [${err.type}] ${err.message}`);
                if (err.path) console.log(`     Path: ${err.path}`);
            });
            console.log();
        }
    }

    // Print detailed warnings if any
    if (result.overall.totalWarnings > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('DETAILED WARNINGS:');
        console.log('='.repeat(60) + '\n');

        const allWarnings = [
            ...result.structure.warnings,
            ...result.references.warnings,
            ...result.builds.warnings,
            ...result.rootScripts.warnings
        ];

        allWarnings.forEach((warn, i) => {
            console.log(`  ${i + 1}. [${warn.type}] ${warn.message}`);
            if (warn.path) console.log(`     Path: ${warn.path}`);
        });
        console.log();
    }
}

// Export all validation functions
export {
    // Structure validation
    validateAllStructure,
    validateProjectStructure,
    validateFrontendStructure,
    validateBackendStructure,

    // Reference validation
    validateAllReferences,
    validateImports,
    validateConfigPaths,
    validateApiReferences,

    // Build validation
    validateIndependentBuilds,
    validateFrontendBuild,
    validateBackendBuild,
    validateRootBuildScripts,

    // Types
    ValidationResult,
    ValidationError,
    ValidationWarning,
    StructureConfig,
    ReferenceValidationResult,
    BuildValidationResult
};
