#!/bin/bash
# ============================================
# Script: Test Login API
# Description: Test đăng nhập và lấy JWT token
# Usage: ./test_login.sh [username] [password]
# ============================================

API_URL="http://localhost:8080/api/auth/login"
USERNAME=${1:-admin}
PASSWORD=${2:-admin123}

echo "============================================"
echo "Testing Login API"
echo "============================================"
echo "URL: $API_URL"
echo "Username: $USERNAME"
echo "Password: $PASSWORD"
echo ""

# Make login request
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

# Check if response contains accessToken
if echo "$RESPONSE" | grep -q "accessToken"; then
    echo "✅ Login successful!"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.'
    
    # Extract access token
    ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.data.accessToken')
    REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.data.refreshToken')
    
    echo ""
    echo "============================================"
    echo "Access Token:"
    echo "$ACCESS_TOKEN"
    echo ""
    echo "Refresh Token:"
    echo "$REFRESH_TOKEN"
    echo "============================================"
    
    # Save token to file for use in other scripts
    echo "$ACCESS_TOKEN" > .access_token.txt
    echo "$REFRESH_TOKEN" > .refresh_token.txt
    echo ""
    echo "Tokens saved to .access_token.txt and .refresh_token.txt"
else
    echo "❌ Login failed!"
    echo "Response:"
    echo "$RESPONSE" | jq '.'
    exit 1
fi
