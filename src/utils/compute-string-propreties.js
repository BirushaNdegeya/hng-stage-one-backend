import crypto from "crypto";

// Helper function to compute string properties
export function computeStringProperties(value) {
  const length = value.length;
  const isPalindrome =
    value.toLowerCase() === value.split("").reverse().join("").toLowerCase();
  const uniqueCharacters = new Set(value).size;
  const wordCount = value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  const sha256Hash = crypto.createHash("sha256").update(value).digest("hex");
  const characterFrequencyMap = {};
  for (const char of value) {
    characterFrequencyMap[char] = (characterFrequencyMap[char] || 0) + 1;
  }
  return {
    length,
    is_palindrome: isPalindrome,
    unique_characters: uniqueCharacters,
    word_count: wordCount,
    sha256_hash: sha256Hash,
    character_frequency_map: characterFrequencyMap,
  };
}
