#!/bin/bash
# ============================================
# Script: Test API với JWT Token
# Description: Test các API endpoints với JWT token
# Usage: ./test_api.sh <endpoint> [method]
# Example: ./test_api.sh /api/users GET
# ============================================

ENDPOINT=${1:-/api/health}
METHOD=${2:-GET}
API_URL="http://localhost:8080$ENDPOINT"

# Load access token from file
if [ -f .access_token.txt ]; then
    ACCESS_TOKEN=$(cat .access_token.txt)
else
    echo "❌ Access token not found. Please run test_login.sh first."
    exit 1
fi

echo "============================================"
echo "Testing API Endpoint"
echo "============================================"
echo "URL: $API_URL"
echo "Method: $METHOD"
echo ""

# Make API request
if [ "$METHOD" = "GET" ]; then
    RESPONSE=$(curl -s -X GET "$API_URL" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json")
elif [ "$METHOD" = "POST" ]; then
    RESPONSE=$(curl -s -X POST "$API_URL" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$3")
else
    RESPONSE=$(curl -s -X "$METHOD" "$API_URL" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json")
fi

# Display response
echo "Response:"
echo "$RESPONSE" | jq '.'

# Check if response is valid JSON
if echo "$RESPONSE" | jq empty 2>/dev/null; then
    echo ""
    echo "✅ Valid JSON response"
else
    echo ""
    echo "⚠️  Response may not be valid JSON"
fi
