const axios = require('axios');

async function testRegister() {
  try {
    const response = await axios.post('http://localhost:4000/api/auth/register', {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    console.log('Registration response:', response.data);
  } catch (error) {
    console.error('Full error:', error);
    if (error.response) {
      console.error('Registration error response data:', error.response.data);
      console.error('Registration error response status:', error.response.status);
      console.error('Registration error response headers:', error.response.headers);
    }
    if (error.message) {
      console.error('Error message:', error.message);
    }
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
  }
}

testRegister();
