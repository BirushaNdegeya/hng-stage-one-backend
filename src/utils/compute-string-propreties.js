import crypto from "crypto";

export function computeStringProperties(value) {
  // Validate input
  if (value === undefined || value === null) {
    throw new Error("Value cannot be undefined or null");
  }

  if (typeof value !== "string") {
    throw new Error("Value must be a string");
  }

  try {
    const length = value.length;

    // Case-insensitive palindrome check (ignore non-alphanumeric for palindrome)
    const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const is_palindrome =
      cleaned.length > 0
        ? cleaned === cleaned.split("").reverse().join("")
        : false;

    // Unique characters count
    const unique_characters = new Set(value).size;

    // Word count - handle empty strings and multiple spaces
    const trimmed = value.trim();
    const word_count = trimmed === "" ? 0 : trimmed.split(/\s+/).length;

    // SHA256 hash
    const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

    // Character frequency map - ensure it's a proper object
    const character_frequency_map = {};
    for (const char of value) {
      character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
    }

    return {
      length,
      is_palindrome,
      unique_characters,
      word_count,
      sha256_hash,
      character_frequency_map,
    };
  } catch (error) {
    console.error("Error in computeStringProperties for value:", value, error);
    throw error;
  }
}
