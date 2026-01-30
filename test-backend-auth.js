// Backend Authentication Test Script
// This script tests the login and registration endpoints

const API_BASE_URL = "http://localhost/backend/api/api";

async function testLogin(email, password) {
    console.log(`\n🔐 Testing login with: ${email}`);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Login successful!');
            console.log('User:', data.user);
            console.log('Token:', data.token ? 'Generated' : 'Missing');
            return { success: true, data };
        } else {
            console.log('❌ Login failed:', data.message || 'Unknown error');
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
        return { success: false, error: error.message };
    }
}

async function testRegister(name, email, password) {
    console.log(`\n📝 Testing registration with: ${email}`);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Registration successful!');
            console.log('User:', data.user);
            console.log('Token:', data.token ? 'Generated' : 'Missing');
            return { success: true, data };
        } else {
            console.log('❌ Registration failed:', data.message || 'Unknown error');
            return { success: false, error: data.message };
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('🚀 Starting Backend Authentication Tests');
    console.log('API URL:', API_BASE_URL);
    console.log('='.repeat(50));

    // Test 1: Admin login
    await testLogin('admin@ijs.com', 'admin123');

    // Test 2: Invalid login
    await testLogin('wrong@email.com', 'wrongpassword');

    // Test 3: Register new user (with timestamp to avoid duplicates)
    const timestamp = Date.now();
    await testRegister(`Test User ${timestamp}`, `test${timestamp}@example.com`, 'password123');

    console.log('\n' + '='.repeat(50));
    console.log('✨ Tests completed!');
}

runTests();
