#!/usr/bin/env node
/**
 * Validation CLI
 * 
 * Command-line interface for running the comprehensive validation suite.
 * 
 * Usage:
 *   npm run validate              # Run validation in dry-run mode
 *   npm run validate -- --build   # Run validation with actual build attempts
 *   npm run validate -- --help    # Show help
 */

import { runComprehensiveValidation, printValidationResults } from './index';
import * as path from 'path';

interface CliOptions {
    rootDir: string;
    dryRun: boolean;
    help: boolean;
}

function parseArgs(): CliOptions {
    const args = process.argv.slice(2);

    const options: CliOptions = {
        rootDir: process.cwd(),
        dryRun: true,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        switch (arg) {
            case '--help':
            case '-h':
                options.help = true;
                break;

            case '--build':
            case '-b':
                options.dryRun = false;
                break;

            case '--root':
            case '-r':
                if (i + 1 < args.length) {
                    options.rootDir = path.resolve(args[i + 1]);
                    i++;
                } else {
                    console.error('Error: --root requires a directory path');
                    process.exit(1);
                }
                break;

            default:
                console.error(`Unknown option: ${arg}`);
                console.error('Use --help for usage information');
                process.exit(1);
        }
    }

    return options;
}

function printHelp(): void {
    console.log(`
Validation CLI - Project Structure Validation Suite

Usage:
  npm run validate [options]

Options:
  --help, -h          Show this help message
  --build, -b         Run actual build attempts (not just dry-run)
  --root, -r <path>   Specify project root directory (default: current directory)

Examples:
  npm run validate                    # Run validation in dry-run mode
  npm run validate -- --build         # Run validation with actual builds
  npm run validate -- --root /path    # Validate specific directory

Description:
  This tool validates the project structure reorganization by checking:
  - Project structure compliance (correct folder organization)
  - File references and imports (all imports resolve correctly)
  - Build configuration (frontend and backend can build independently)
  - Root scripts (package.json scripts are correctly configured)

Exit Codes:
  0 - All validations passed
  1 - Validation errors found or CLI error
`);
}

function main(): void {
    const options = parseArgs();

    if (options.help) {
        printHelp();
        process.exit(0);
    }

    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║   Project Structure Validation Suite                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log();
    console.log(`Root Directory: ${options.rootDir}`);
    console.log(`Mode: ${options.dryRun ? 'Dry Run (no actual builds)' : 'Full Validation (with builds)'}`);
    console.log();

    try {
        const result = runComprehensiveValidation(options.rootDir, undefined, options.dryRun);
        printValidationResults(result);

        if (result.overall.valid) {
            console.log('\n✅ All validations passed! The project structure is compliant.\n');
            process.exit(0);
        } else {
            console.log('\n❌ Validation failed. Please fix the errors above and run again.\n');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Fatal error during validation:');
        console.error(error instanceof Error ? error.message : String(error));
        console.error();
        process.exit(1);
    }
}

// Run CLI if executed directly
if (require.main === module) {
    main();
}

export { main, parseArgs, printHelp };
