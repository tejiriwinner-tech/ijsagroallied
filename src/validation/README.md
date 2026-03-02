# Project Structure Validation Suite

Comprehensive validation suite for verifying the project structure reorganization meets all requirements.

## Overview

This validation suite ensures that the project structure cleanup has been completed successfully by checking:

1. **Structure Compliance** - Verifies correct folder organization
2. **Reference Integrity** - Validates all file references and imports
3. **Build Configuration** - Ensures frontend and backend can build independently
4. **Script Configuration** - Validates root-level build scripts

## Requirements Validated

This suite validates the following requirements from the project-structure-cleanup spec:

- **Requirement 4.1**: Maintain functional integrity during migration
- **Requirement 7.3**: Preserve development workflow
- **Requirement 7.5**: Maintain compatibility with existing tooling

## Usage

### Quick Start

Run validation in dry-run mode (recommended):

```bash
npm run validate
```

Run validation with actual build attempts:

```bash
npm run validate:build
```

### Command Line Options

```bash
# Show help
npm run validate -- --help

# Validate specific directory
npm run validate -- --root /path/to/project

# Run with actual builds
npm run validate -- --build
```

## Validation Checks

### 1. Structure Validation

Checks that the project structure follows the required organization:

- ✅ Root contains only allowed folders (frontend, backend, docs, scripts, .vscode, .kiro)
- ✅ Frontend directory exists with required folders (app, components, public)
- ✅ Backend directory exists with required folders (api, config, database)
- ✅ No duplicate Next.js applications
- ✅ No duplicate Git repositories
- ✅ PHP API is in backend, not frontend

### 2. Reference Validation

Validates that all file references are correct:

- ✅ All import statements resolve to existing files
- ✅ Configuration files have valid path references
- ✅ No references to old structure (my-app/, frontend/php-api)
- ✅ Package.json scripts reference valid directories
- ✅ API endpoint references are updated

### 3. Build Validation

Ensures independent build capability:

- ✅ Frontend has package.json with build script
- ✅ Frontend has Next.js dependencies
- ✅ Frontend has Next.js configuration
- ✅ Backend has API directory with PHP files
- ✅ Backend has package.json with serve script
- ✅ Backend has database configuration

### 4. Root Scripts Validation

Validates root-level scripts:

- ✅ Root package.json has essential scripts (dev:frontend, dev:backend, build:frontend, etc.)
- ✅ Scripts reference correct directories
- ✅ No old path references in scripts

## Output

The validation suite provides:

1. **Console Output** - Real-time progress and results
2. **Summary Report** - Overall status and statistics
3. **Detailed Errors** - Specific issues with file paths
4. **Detailed Warnings** - Non-critical issues to address
5. **Exit Code** - 0 for success, 1 for failure

### Example Output

```
╔═══════════════════════════════════════════════════════════╗
║   Project Structure Validation Suite                     ║
╚═══════════════════════════════════════════════════════════╝

Root Directory: /path/to/project
Mode: Dry Run (no actual builds)

🔍 Running comprehensive validation suite...

📁 Validating project structure...
   ✅ Structure validation passed
   Errors: 0, Warnings: 1

🔗 Validating file references and imports...
   ✅ Reference validation passed
   Errors: 0, Warnings: 0

🔨 Validating build configuration...
   ✅ Build validation passed
   Frontend buildable: ✅
   Backend buildable: ✅
   Errors: 0, Warnings: 2

📜 Validating root build scripts...
   ✅ Root scripts validation passed
   Errors: 0, Warnings: 0

============================================================
VALIDATION SUMMARY
============================================================

✅ OVERALL STATUS: PASSED
   All validation checks passed successfully!

📊 STATISTICS:
   Total Errors:   0
   Total Warnings: 3

✅ All validations passed! The project structure is compliant.
```

## Testing

Run the validation suite tests:

```bash
npm run test:validation
```

## Module Structure

```
src/validation/
├── index.ts                    # Main entry point
├── cli.ts                      # Command-line interface
├── structure-validator.ts      # Structure validation logic
├── reference-validator.ts      # Reference validation logic
├── build-validator.ts          # Build validation logic
├── README.md                   # This file
└── __tests__/
    └── validation.test.ts      # Unit tests
```

## API

### Main Functions

#### `runComprehensiveValidation(rootDir, config, dryRun)`

Runs the complete validation suite.

**Parameters:**
- `rootDir` (string): Root directory of the project (default: current directory)
- `config` (StructureConfig): Optional structure configuration
- `dryRun` (boolean): If true, skips actual build attempts (default: true)

**Returns:** `ComprehensiveValidationResult`

#### `printValidationResults(result)`

Prints validation results to console.

**Parameters:**
- `result` (ComprehensiveValidationResult): Results from validation

### Individual Validators

#### Structure Validation
- `validateProjectStructure(config)` - Validates overall project structure
- `validateFrontendStructure(config)` - Validates frontend organization
- `validateBackendStructure(config)` - Validates backend organization
- `validateAllStructure(config)` - Runs all structure checks

#### Reference Validation
- `validateImports(rootDir, targetDir)` - Validates import statements
- `validateConfigPaths(rootDir)` - Validates configuration paths
- `validateApiReferences(rootDir)` - Validates API endpoint references
- `validateAllReferences(rootDir)` - Runs all reference checks

#### Build Validation
- `validateFrontendBuild(rootDir, dryRun)` - Validates frontend build
- `validateBackendBuild(rootDir, dryRun)` - Validates backend build
- `validateIndependentBuilds(rootDir, dryRun)` - Validates both builds
- `validateRootBuildScripts(rootDir)` - Validates root scripts

## Integration

The validation suite can be integrated into:

1. **CI/CD Pipeline** - Run as part of automated testing
2. **Pre-commit Hooks** - Validate before committing changes
3. **Development Workflow** - Run manually during development
4. **Migration Process** - Validate after each migration step

### CI/CD Example

```yaml
# .github/workflows/validate.yml
name: Validate Structure

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run validate
```

## Troubleshooting

### Common Issues

**Issue: "Frontend directory does not exist"**
- Ensure the frontend folder is present in the project root
- Check that you're running from the correct directory

**Issue: "Broken import" errors**
- Review the import paths in the reported files
- Ensure all files have been moved to their correct locations
- Update import statements to reflect new structure

**Issue: "Missing build script"**
- Check that package.json has a "build" script
- Ensure package.json is in the correct location

**Issue: "PHP is not available"**
- Install PHP on your system
- Ensure PHP is in your system PATH

### Debug Mode

For more detailed output, you can modify the validation code to enable debug logging:

```typescript
// In your code
process.env.DEBUG = 'true';
const result = runComprehensiveValidation(rootDir);
```

## Contributing

When adding new validation checks:

1. Add the validation function to the appropriate validator module
2. Add unit tests in `__tests__/validation.test.ts`
3. Update this README with the new check
4. Reference the requirement being validated

## License

Proprietary - MV Agricultural Consult
