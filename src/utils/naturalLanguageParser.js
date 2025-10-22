// Helper function to parse natural language query
export function parseNaturalLanguageQuery(query) {
  const lowerQuery = query.toLowerCase();
  const filters = {};

  // Check for palindrome
  if (lowerQuery.includes("palindromic") || lowerQuery.includes("palindrome")) {
    filters.is_palindrome = true;
  }

  // Check for single word
  if (lowerQuery.includes("single word") || lowerQuery.includes("single-word")) {
    filters.word_count = 1;
  }

  // Check for length conditions
  const lengthMatch = lowerQuery.match(/longer than (\d+) characters?/);
  if (lengthMatch) {
    filters.min_length = parseInt(lengthMatch[1], 10) + 1;
  }

  // Check for containing character
  const containMatch = lowerQuery.match(/contain(?:ing)? (?:the )?(?:letter )?([a-z])/);
  if (containMatch) {
    filters.contains_character = containMatch[1];
  } else if (lowerQuery.includes("first vowel")) {
    filters.contains_character = "a"; // Heuristic
  }

  // If no filters were parsed, return null
  if (Object.keys(filters).length === 0) {
    return null;
  }

  return filters;
}
