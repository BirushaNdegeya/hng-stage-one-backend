import crypto from "crypto";

// Helper function to compute string properties
export function computeStringProperties(value) {
  try {
    if (typeof value !== "string") {
      throw new Error("Value must be a string");
    }

    const length = value.length;

    // Case-insensitive palindrome check (ignore spaces for palindrome)
    const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const is_palindrome = cleaned === cleaned.split("").reverse().join("");

    // Unique characters count
    const unique_characters = new Set(value).size;

    // Word count (split by whitespace, filter out empty strings)
    const words = value.trim().split(/\s+/);
    const word_count = value.trim() === "" ? 0 : words.length;

    // SHA256 hash
    const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

    // Character frequency map
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
    console.error("Error in computeStringProperties:", error);
    throw error;
  }
}
