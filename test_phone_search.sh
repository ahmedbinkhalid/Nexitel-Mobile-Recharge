#!/bin/bash

# Test phone number search functionality

# 1. Login to get session cookie
echo "=== Testing Phone Number Search ==="
echo "1. Logging in..."
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c /tmp/cookies.txt -b /tmp/cookies.txt \
  -s -o /tmp/login_response.html

echo "2. Testing ICCID search for 8901260123456789012..."
curl -X GET "http://localhost:5000/api/activities/search/iccid/8901260123456789012" \
  -b /tmp/cookies.txt -s | jq .

echo "3. Testing mobile number search for 5551234567..."
curl -X GET "http://localhost:5000/api/activities/search/mobile/5551234567" \
  -b /tmp/cookies.txt -s | jq .

echo "4. Testing mobile number search for 5551234568..."
curl -X GET "http://localhost:5000/api/activities/search/mobile/5551234568" \
  -b /tmp/cookies.txt -s | jq .

echo "=== Test Complete ==="