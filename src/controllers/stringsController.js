import { prisma } from "../utils/prisma.js";
import { computeStringProperties } from "../utils/compute-string-propreties.js";
import crypto from "crypto";
import { withRetry } from "../utils/dbRetry.js";

// POST /strings
export const createString = async (req, res) => {
  try {
    const { value } = req.body;

    // Basic validation
    if (!value || typeof value !== "string") {
      return res
        .status(400)
        .json({ error: 'Invalid or missing "value" field' });
    }

    // SIMPLE properties computation (avoid external function)
    const length = value.length;

    // Case-insensitive palindrome check
    const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const is_palindrome = cleaned === cleaned.split("").reverse().join("");

    const unique_characters = new Set(value).size;

    // Word count
    const word_count =
      value.trim() === "" ? 0 : value.trim().split(/\s+/).length;

    // SHA256 hash
    const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

    // Character frequency
    const character_frequency_map = {};
    for (const char of value) {
      character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
    }

    const id = sha256_hash;

    // Check existing
    const existing = await withRetry(() => prisma.stringData.findUnique({ where: { id } }));
    if (existing) {
      return res
        .status(409)
        .json({ error: "String already exists in the system" });
    }

    // Create with minimal data
    const stringData = await withRetry(() => prisma.stringData.create({
      data: {
        id,
        value,
        length,
        is_palindrome,
        unique_characters,
        word_count,
        sha256_hash,
        character_frequency_map,
      },
    }));

    res.status(201).json({
      id: stringData.id,
      value: stringData.value,
      properties: {
        length: stringData.length,
        is_palindrome: stringData.is_palindrome,
        unique_characters: stringData.unique_characters,
        word_count: stringData.word_count,
        sha256_hash: stringData.sha256_hash,
        character_frequency_map: stringData.character_frequency_map,
      },
      created_at: stringData.created_at.toISOString(),
    });
  } catch (error) {
    console.error("POST Error:", error);

    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "String already exists in the system" });
    }

    res.status(500).json({
      error: "Internal server error",
      ...(process.env.NODE_ENV !== "production" && { debug: error.message }),
    });
  }
};

// GET /strings/:value
export const getStringByValue = async (req, res) => {
  try {
    const { value } = req.params;

    if (!value || typeof value !== "string") {
      return res
        .status(400)
        .json({ error: 'Invalid "value" parameter (must be string)' });
    }

    const properties = computeStringProperties(value);
    const id = properties.sha256_hash;

    const stringData = await withRetry(() => prisma.stringData.findUnique({
      where: { id },
    }));

    if (!stringData) {
      return res
        .status(404)
        .json({ error: "String does not exist in the system" });
    }

    res.status(200).json({
      id: stringData.id,
      value: stringData.value,
      properties: {
        length: stringData.length,
        is_palindrome: stringData.is_palindrome,
        unique_characters: stringData.unique_characters,
        word_count: stringData.word_count,
        sha256_hash: stringData.sha256_hash,
        character_frequency_map: stringData.character_frequency_map,
      },
      created_at: stringData.created_at.toISOString(),
    });
  } catch (error) {
    console.error("Detailed error in GET /strings/:value:", error);

    // If computeStringProperties fails or string not found, return 404
    return res
      .status(404)
      .json({ error: "String does not exist in the system" });
  }
};

// GET /strings with filtering
export const getStringsWithFilters = async (req, res) => {
  const {
    is_palindrome,
    min_length,
    max_length,
    word_count,
    contains_character,
  } = req.query;

  // Build filters object for database
  const filters = {};
  // Build filters_applied object for response
  const filtersApplied = {};

  // Validate and apply filters
  if (is_palindrome !== undefined) {
    if (is_palindrome !== "true" && is_palindrome !== "false") {
      return res.status(400).json({
        error: 'Invalid "is_palindrome" parameter (must be true or false)',
      });
    }
    const isPalindromeBool = is_palindrome === "true";
    filters.is_palindrome = isPalindromeBool;
    filtersApplied.is_palindrome = isPalindromeBool;
  }

  if (min_length !== undefined) {
    const minLen = parseInt(min_length, 10);
    if (isNaN(minLen) || minLen < 0) {
      return res.status(400).json({
        error: 'Invalid "min_length" parameter (must be non-negative integer)',
      });
    }
    filters.length = { ...filters.length, gte: minLen };
    filtersApplied.min_length = minLen;
  }

  if (max_length !== undefined) {
    const maxLen = parseInt(max_length, 10);
    if (isNaN(maxLen) || maxLen < 0) {
      return res.status(400).json({
        error: 'Invalid "max_length" parameter (must be non-negative integer)',
      });
    }
    filters.length = { ...filters.length, lte: maxLen };
    filtersApplied.max_length = maxLen;
  }

  // Check for conflicting length filters
  if (
    filters.length?.gte !== undefined &&
    filters.length?.lte !== undefined &&
    filters.length.gte > filters.length.lte
  ) {
    return res.status(400).json({
      error:
        "Invalid length range (min_length cannot be greater than max_length)",
    });
  }

  if (word_count !== undefined) {
    const wc = parseInt(word_count, 10);
    if (isNaN(wc) || wc < 0) {
      return res.status(400).json({
        error: 'Invalid "word_count" parameter (must be non-negative integer)',
      });
    }
    filters.word_count = wc;
    filtersApplied.word_count = wc;
  }

  if (contains_character !== undefined) {
    if (
      typeof contains_character !== "string" ||
      contains_character.length !== 1
    ) {
      return res.status(400).json({
        error:
          'Invalid "contains_character" parameter (must be a single character)',
      });
    }
    filtersApplied.contains_character = contains_character;
  }

  try {
    let stringData = await withRetry(() => prisma.stringData.findMany({
      where: filters,
      orderBy: { created_at: "desc" },
    }));

    // Apply contains_character filter if specified
    if (contains_character !== undefined) {
      stringData = stringData.filter((item) =>
        item.value.includes(contains_character)
      );
    }

    const data = stringData.map((item) => ({
      id: item.id,
      value: item.value,
      properties: {
        length: item.length,
        is_palindrome: item.is_palindrome,
        unique_characters: item.unique_characters,
        word_count: item.word_count,
        sha256_hash: item.sha256_hash,
        character_frequency_map: item.character_frequency_map,
      },
      created_at: item.created_at.toISOString(),
    }));

    // Build response according to specification
    const response = {
      data,
      count: data.length,
      filters_applied: filtersApplied,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "production"
          ? "Contact support"
          : error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    });
  }
};

// Helper function to parse natural language query (SINGLE DEFINITION)
function parseNaturalLanguageQuery(query) {
  const lowerQuery = query.toLowerCase();
  const filters = {};

  // Check for palindrome
  if (lowerQuery.includes("palindromic") || lowerQuery.includes("palindrome")) {
    filters.is_palindrome = true;
  }

  // Check for single word
  if (
    lowerQuery.includes("single word") ||
    lowerQuery.includes("single-word") ||
    lowerQuery.includes("one word")
  ) {
    filters.word_count = 1;
  } else if (
    lowerQuery.includes("multiple words") ||
    lowerQuery.includes("many words")
  ) {
    filters.word_count_gt = 1;
  }

  // Check for length conditions
  const longerThanMatch = lowerQuery.match(/longer than (\d+) characters?/);
  const shorterThanMatch = lowerQuery.match(/shorter than (\d+) characters?/);
  const moreThanMatch = lowerQuery.match(/more than (\d+) characters?/);
  const lessThanMatch = lowerQuery.match(/less than (\d+) characters?/);

  if (longerThanMatch || moreThanMatch) {
    const match = longerThanMatch || moreThanMatch;
    filters.min_length = parseInt(match[1], 10) + 1;
  }
  if (shorterThanMatch || lessThanMatch) {
    const match = shorterThanMatch || lessThanMatch;
    filters.max_length = parseInt(match[1], 10) - 1;
  }

  // Check for containing character
  const containMatch = lowerQuery.match(
    /contain(?:s|ing)? (?:the )?(?:letter )?([a-z])/i
  );
  const withMatch = lowerQuery.match(/with (?:the )?(?:letter )?([a-z])/i);

  if (containMatch) {
    filters.contains_character = containMatch[1].toLowerCase();
  } else if (withMatch) {
    filters.contains_character = withMatch[1].toLowerCase();
  } else if (lowerQuery.includes("first vowel")) {
    filters.contains_character = "a"; // Heuristic
  }

  return filters;
}

// Build Prisma filters from parsed natural language
function buildDatabaseFilters(parsedFilters) {
  const filters = {};

  if (parsedFilters.is_palindrome !== undefined) {
    filters.is_palindrome = parsedFilters.is_palindrome;
  }

  if (parsedFilters.min_length !== undefined) {
    filters.length = { ...filters.length, gte: parsedFilters.min_length };
  }

  if (parsedFilters.max_length !== undefined) {
    filters.length = { ...filters.length, lte: parsedFilters.max_length };
  }

  if (parsedFilters.word_count !== undefined) {
    filters.word_count = parsedFilters.word_count;
  } else if (parsedFilters.word_count_gt !== undefined) {
    filters.word_count = { gt: parsedFilters.word_count_gt };
  }

  return filters;
}

// GET /strings/filter-by-natural-language
export const getStringsByNaturalLanguage = async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res
      .status(400)
      .json({ error: 'Missing or invalid "query" parameter' });
  }

  // Parse natural language query
  const parsedFilters = parseNaturalLanguageQuery(query);

  try {
    // Build database query from parsed filters
    const dbFilters = buildDatabaseFilters(parsedFilters);

    let stringData = await withRetry(() => prisma.stringData.findMany({
      where: dbFilters,
      orderBy: { created_at: "desc" },
    }));

    // Apply contains_character filter in memory if specified
    if (parsedFilters.contains_character) {
      stringData = stringData.filter((item) =>
        item.value.includes(parsedFilters.contains_character)
      );
    }

    const data = stringData.map((item) => ({
      id: item.id,
      value: item.value,
      properties: {
        length: item.length,
        is_palindrome: item.is_palindrome,
        unique_characters: item.unique_characters,
        word_count: item.word_count,
        sha256_hash: item.sha256_hash,
        character_frequency_map: item.character_frequency_map,
      },
      created_at: item.created_at.toISOString(),
    }));

    res.status(200).json({
      data,
      count: data.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters,
      },
    });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "production"
          ? "Contact support"
          : error.message,
    });
  }
};

// DELETE /strings/:value
export const deleteString = async (req, res) => {
  try {
    const { value } = req.params;

    if (!value || typeof value !== "string") {
      return res
        .status(400)
        .json({ error: 'Invalid "value" parameter (must be string)' });
    }

    const properties = computeStringProperties(value);
    const id = properties.sha256_hash;

    const existing = await prisma.stringData.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).send(); // Empty response body for 404
    }

    await prisma.stringData.delete({
      where: { id },
    });

    res.status(204).send(); // Empty response body for success
  } catch (error) {
    console.error("Detailed error in DELETE /strings/:value:", error);

    // Handle not found or computation errors
    if (error.code === "P2025") {
      return res.status(404).send();
    }

    // For any other error, assume string doesn't exist
    return res.status(404).send();
  }
};
