// Learn more: https://github.com/testing-library/jest-dom
// Note: @testing-library/jest-dom may need to be installed separately
// For now, we'll skip this import if it's not available
try {
    require('@testing-library/jest-dom')
} catch (e) {
    // jest-dom not available, tests will still work without custom matchers
}

// Polyfill fetch for Node.js test environment
// This is required for integration tests that make HTTP requests
const fetch = require('node-fetch')
global.fetch = fetch
global.Headers = fetch.Headers
global.Request = fetch.Request
global.Response = fetch.Response
