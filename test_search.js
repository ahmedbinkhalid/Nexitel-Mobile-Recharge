// Test script to add sample data and test search functionality
const fetch = require('node-fetch');

const baseUrl = 'http://localhost:5000';
let cookies = '';

async function login() {
  const response = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  const setCookies = response.headers.get('set-cookie');
  if (setCookies) {
    cookies = setCookies.split(';')[0];
  }
  
  console.log('Login response:', response.status);
  return response.ok;
}

async function testSearch() {
  console.log('Testing phone number search...');
  
  const response = await fetch(`${baseUrl}/api/activities/search/mobile/5551234567`, {
    headers: {
      'Cookie': cookies
    }
  });
  
  const data = await response.json();
  console.log('Search response status:', response.status);
  console.log('Search data:', data);
}

async function main() {
  await login();
  await testSearch();
}

main().catch(console.error);