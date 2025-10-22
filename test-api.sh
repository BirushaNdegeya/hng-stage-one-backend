#!/bin/bash
# Complete cURL test suite for String Analysis API
# Replace localhost:3000 with your actual server URL

# BASE_URL="http://localhost:3000"
BASE_URL="https://darin-lowliest-savanna.ngrok-free.dev"
echo "=========================================="
echo "1. POST /strings - Create/Analyze Strings"
echo "=========================================="

# Test 1.1: Create a normal string
echo -e "\n✓ Test 1.1: Create normal string"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "hello world"}' \
  -w "\nStatus: %{http_code}\n"

# Test 1.2: Create a palindrome
echo -e "\n✓ Test 1.2: Create palindrome"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "racecar"}' \
  -w "\nStatus: %{http_code}\n"

# Test 1.3: Create another palindrome
echo -e "\n✓ Test 1.3: Create another palindrome"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "A man a plan a canal Panama"}' \
  -w "\nStatus: %{http_code}\n"

# Test 1.4: Create single word string
echo -e "\n✓ Test 1.4: Create single word"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "amazing"}' \
  -w "\nStatus: %{http_code}\n"

# Test 1.5: Create string with specific character
echo -e "\n✓ Test 1.5: Create string with 'z'"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "zebra pizza buzz"}' \
  -w "\nStatus: %{http_code}\n"

# Test 1.6: Create long string
echo -e "\n✓ Test 1.6: Create long string"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "this is a very long string with many words"}' \
  -w "\nStatus: %{http_code}\n"

# Test 1.7: Duplicate string (should return 409)
echo -e "\n✗ Test 1.7: Duplicate string (expect 409)"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "hello world"}' \
  -w "\nStatus: %{http_code}\n"

# Test 1.8: Missing value field (should return 400)
echo -e "\n✗ Test 1.8: Missing value field (expect 400)"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}' \
  -w "\nStatus: %{http_code}\n"

# Test 1.9: Invalid data type (should return 422)
echo -e "\n✗ Test 1.9: Invalid data type (expect 422)"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": 123}' \
  -w "\nStatus: %{http_code}\n"

# Test 1.10: Empty request body (should return 400)
echo -e "\n✗ Test 1.10: Empty body (expect 400)"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n=========================================="
echo "2. GET /strings/:value - Get Specific String"
echo "=========================================="

# Test 2.1: Get existing string
echo -e "\n✓ Test 2.1: Get existing string"
curl -X GET "${BASE_URL}/strings/hello%20world" \
  -w "\nStatus: %{http_code}\n"

# Test 2.2: Get palindrome
echo -e "\n✓ Test 2.2: Get palindrome"
curl -X GET "${BASE_URL}/strings/racecar" \
  -w "\nStatus: %{http_code}\n"

# Test 2.3: Get non-existent string (should return 404)
echo -e "\n✗ Test 2.3: Get non-existent (expect 404)"
curl -X GET "${BASE_URL}/strings/nonexistent" \
  -w "\nStatus: %{http_code}\n"

echo -e "\n=========================================="
echo "3. GET /strings - Get All with Filters"
echo "=========================================="

# Test 3.1: Get all strings (no filter)
echo -e "\n✓ Test 3.1: Get all strings"
curl -X GET "${BASE_URL}/strings" \
  -w "\nStatus: %{http_code}\n"

# Test 3.2: Filter by palindrome
echo -e "\n✓ Test 3.2: Filter palindromes"
curl -X GET "${BASE_URL}/strings?is_palindrome=true" \
  -w "\nStatus: %{http_code}\n"

# Test 3.3: Filter by non-palindrome
echo -e "\n✓ Test 3.3: Filter non-palindromes"
curl -X GET "${BASE_URL}/strings?is_palindrome=false" \
  -w "\nStatus: %{http_code}\n"

# Test 3.4: Filter by minimum length
echo -e "\n✓ Test 3.4: Filter min_length=10"
curl -X GET "${BASE_URL}/strings?min_length=10" \
  -w "\nStatus: %{http_code}\n"

# Test 3.5: Filter by maximum length
echo -e "\n✓ Test 3.5: Filter max_length=15"
curl -X GET "${BASE_URL}/strings?max_length=15" \
  -w "\nStatus: %{http_code}\n"

# Test 3.6: Filter by length range
echo -e "\n✓ Test 3.6: Filter length range (5-20)"
curl -X GET "${BASE_URL}/strings?min_length=5&max_length=20" \
  -w "\nStatus: %{http_code}\n"

# Test 3.7: Filter by word count
echo -e "\n✓ Test 3.7: Filter word_count=2"
curl -X GET "${BASE_URL}/strings?word_count=2" \
  -w "\nStatus: %{http_code}\n"

# Test 3.8: Filter by single word
echo -e "\n✓ Test 3.8: Filter single word"
curl -X GET "${BASE_URL}/strings?word_count=1" \
  -w "\nStatus: %{http_code}\n"

# Test 3.9: Filter by character
echo -e "\n✓ Test 3.9: Filter contains 'z'"
curl -X GET "${BASE_URL}/strings?contains_character=z" \
  -w "\nStatus: %{http_code}\n"

# Test 3.10: Multiple filters combined
echo -e "\n✓ Test 3.10: Multiple filters"
curl -X GET "${BASE_URL}/strings?is_palindrome=true&min_length=5&max_length=20" \
  -w "\nStatus: %{http_code}\n"

# Test 3.11: All filters combined
echo -e "\n✓ Test 3.11: All filters combined"
curl -X GET "${BASE_URL}/strings?is_palindrome=false&min_length=5&max_length=50&word_count=2&contains_character=a" \
  -w "\nStatus: %{http_code}\n"

# Test 3.12: Invalid is_palindrome value (should return 400)
echo -e "\n✗ Test 3.12: Invalid palindrome value (expect 400)"
curl -X GET "${BASE_URL}/strings?is_palindrome=maybe" \
  -w "\nStatus: %{http_code}\n"

# Test 3.13: Invalid min_length (should return 400)
echo -e "\n✗ Test 3.13: Invalid min_length (expect 400)"
curl -X GET "${BASE_URL}/strings?min_length=-5" \
  -w "\nStatus: %{http_code}\n"

# Test 3.14: Invalid max_length (should return 400)
echo -e "\n✗ Test 3.14: Invalid max_length (expect 400)"
curl -X GET "${BASE_URL}/strings?max_length=abc" \
  -w "\nStatus: %{http_code}\n"

# Test 3.15: Conflicting length range (should return 400)
echo -e "\n✗ Test 3.15: Conflicting length (expect 400)"
curl -X GET "${BASE_URL}/strings?min_length=20&max_length=10" \
  -w "\nStatus: %{http_code}\n"

# Test 3.16: Invalid word_count (should return 400)
echo -e "\n✗ Test 3.16: Invalid word_count (expect 400)"
curl -X GET "${BASE_URL}/strings?word_count=abc" \
  -w "\nStatus: %{http_code}\n"

# Test 3.17: Invalid contains_character (should return 400)
echo -e "\n✗ Test 3.17: Invalid contains_character (expect 400)"
curl -X GET "${BASE_URL}/strings?contains_character=abc" \
  -w "\nStatus: %{http_code}\n"

echo -e "\n=========================================="
echo "4. GET /strings/filter-by-natural-language"
echo "=========================================="

# Test 4.1: Single word palindromes
echo -e "\n✓ Test 4.1: Single word palindromes"
curl -X GET "${BASE_URL}/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings" \
  -w "\nStatus: %{http_code}\n"

# Test 4.2: Strings longer than X characters
echo -e "\n✓ Test 4.2: Longer than 10 characters"
curl -X GET "${BASE_URL}/strings/filter-by-natural-language?query=strings%20longer%20than%2010%20characters" \
  -w "\nStatus: %{http_code}\n"

# Test 4.3: Strings containing specific letter
echo -e "\n✓ Test 4.3: Containing letter 'z'"
curl -X GET "${BASE_URL}/strings/filter-by-natural-language?query=strings%20containing%20the%20letter%20z" \
  -w "\nStatus: %{http_code}\n"

# Test 4.4: Palindromes with first vowel
echo -e "\n✓ Test 4.4: Palindromes with first vowel"
curl -X GET "${BASE_URL}/strings/filter-by-natural-language?query=palindromic%20strings%20that%20contain%20the%20first%20vowel" \
  -w "\nStatus: %{http_code}\n"

# Test 4.5: Multiple words
echo -e "\n✓ Test 4.5: Multiple words"
curl -X GET "${BASE_URL}/strings/filter-by-natural-language?query=strings%20with%20multiple%20words" \
  -w "\nStatus: %{http_code}\n"

# Test 4.6: Shorter than X characters
echo -e "\n✓ Test 4.6: Shorter than 15 characters"
curl -X GET "${BASE_URL}/strings/filter-by-natural-language?query=strings%20shorter%20than%2015%20characters" \
  -w "\nStatus: %{http_code}\n"

# Test 4.7: Single word strings
echo -e "\n✓ Test 4.7: Single word strings"
curl -X GET "${BASE_URL}/strings/filter-by-natural-language?query=all%20single%20word%20strings" \
  -w "\nStatus: %{http_code}\n"

# Test 4.8: All palindromes
echo -e "\n✓ Test 4.8: All palindromes"
curl -X GET "${BASE_URL}/strings/filter-by-natural-language?query=all%20palindromic%20strings" \
  -w "\nStatus: %{http_code}\n"

# Test 4.9: Missing query parameter (should return 400)
echo -e "\n✗ Test 4.9: Missing query (expect 400)"
curl -X GET "${BASE_URL}/strings/filter-by-natural-language" \
  -w "\nStatus: %{http_code}\n"

# Test 4.10: Empty query (should return 400)
echo -e "\n✗ Test 4.10: Empty query (expect 400)"
curl -X GET "${BASE_URL}/strings/filter-by-natural-language?query=" \
  -w "\nStatus: %{http_code}\n"

echo -e "\n=========================================="
echo "5. DELETE /strings/:value"
echo "=========================================="

# Test 5.1: Delete existing string
echo -e "\n✓ Test 5.1: Delete existing string"
curl -X DELETE "${BASE_URL}/strings/amazing" \
  -w "\nStatus: %{http_code}\n"

# Test 5.2: Delete already deleted string (should return 404)
echo -e "\n✗ Test 5.2: Delete non-existent (expect 404)"
curl -X DELETE "${BASE_URL}/strings/amazing" \
  -w "\nStatus: %{http_code}\n"

# Test 5.3: Delete another string
echo -e "\n✓ Test 5.3: Delete another string"
curl -X DELETE "${BASE_URL}/strings/zebra%20pizza%20buzz" \
  -w "\nStatus: %{http_code}\n"

# Test 5.4: Verify deletion by GET
echo -e "\n✓ Test 5.4: Verify deletion (expect 404)"
curl -X GET "${BASE_URL}/strings/amazing" \
  -w "\nStatus: %{http_code}\n"

echo -e "\n=========================================="
echo "6. Additional Edge Cases"
echo "=========================================="

# Test 6.1: Empty string
echo -e "\n✓ Test 6.1: Create empty string"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": ""}' \
  -w "\nStatus: %{http_code}\n"

# Test 6.2: String with special characters
echo -e "\n✓ Test 6.2: Special characters"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "!@#$%^&*()"}' \
  -w "\nStatus: %{http_code}\n"

# Test 6.3: String with numbers
echo -e "\n✓ Test 6.3: String with numbers"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "test123"}' \
  -w "\nStatus: %{http_code}\n"

# Test 6.4: Very long string
echo -e "\n✓ Test 6.4: Very long string"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"}' \
  -w "\nStatus: %{http_code}\n"

# Test 6.5: String with newlines and tabs
echo -e "\n✓ Test 6.5: String with whitespace"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "hello\nworld\ttab"}' \
  -w "\nStatus: %{http_code}\n"

# Test 6.6: Unicode characters
echo -e "\n✓ Test 6.6: Unicode characters"
curl -X POST "${BASE_URL}/strings" \
  -H "Content-Type: application/json" \
  -d '{"value": "Hello 世界 🌍"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n=========================================="
echo "✅ All tests completed!"
echo "=========================================="