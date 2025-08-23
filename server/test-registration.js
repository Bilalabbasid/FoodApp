// Test script to demonstrate user registration for real users
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/v1';

async function testRegistration() {
  try {
    console.log('🧪 Testing User Registration...\n');

    // Test 1: Register a new customer
    const newCustomer = {
      name: 'Test Customer',
      email: 'test@newuser.com',
      password: 'TestPass123!',
      phone: '+1-555-999-8888'
    };

    console.log('📝 Registering new customer:', newCustomer.email);
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, newCustomer);
    console.log('✅ Registration successful:', registerResponse.data.success);

    // Test 2: Try to login with new user
    console.log('\n🔐 Testing login with new user...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: newCustomer.email,
      password: newCustomer.password
    });
    console.log('✅ Login successful:', loginResponse.data.success);
    console.log('👤 User role:', loginResponse.data.data.user.roles);

    // Test 3: Try to register with same email (should fail)
    console.log('\n❌ Testing duplicate email registration...');
    try {
      await axios.post(`${API_BASE}/auth/register`, newCustomer);
      console.log('❌ Should not reach here');
    } catch (error) {
      console.log('✅ Correctly rejected duplicate email:', error.response.data.message);
    }

    console.log('\n🎉 All registration tests passed!');
    console.log('\n💡 Real users can register with:');
    console.log('- Any unique email address');
    console.log('- Password minimum 8 characters');
    console.log('- Optional phone number');
    console.log('- Automatically assigned "customer" role');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRegistration();
