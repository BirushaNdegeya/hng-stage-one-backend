import { prisma } from "../utils/prisma.js";
import { computeStringProperties } from "../utils/compute-string-propreties.js";
import { parseNaturalLanguageQuery } from "../utils/naturalLanguageParser.js";

// POST /strings
export const createString = async (req, res) => {
  const { value } = req.body;

  // Validate request body
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  if (!value) {
    return res.status(400).json({ error: 'Missing "value" field' });
  }

  if (typeof value !== "string") {
    return res
      .status(422)
      .json({ error: 'Invalid data type for "value" (must be string)' });
  }

  const properties = computeStringProperties(value);
  const id = properties.sha256_hash;

  try {
    // Check if string already exists
    const existing = await prisma.stringData.findUnique({
      where: { id },
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "String already exists in the system" });
    }

    // Store the string
    const stringData = await prisma.stringData.create({
      data: {
        id,
        value,
        length: properties.length,
        is_palindrome: properties.is_palindrome,
        unique_characters: properties.unique_characters,
        word_count: properties.word_count,
        sha256_hash: properties.sha256_hash,
        character_frequency_map: properties.character_frequency_map,
      },
    });

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

// GET /strings/:value
export const getStringByValue = async (req, res) => {
  const { value } = req.params;

  if (!value || typeof value !== "string") {
    return res.status(400).json({ error: 'Invalid "value" parameter (must be string)' });
  }

  const properties = computeStringProperties(value);
  const id = properties.sha256_hash;

  try {
    const stringData = await prisma.stringData.findUnique({
      where: { id },
    });

    if (!stringData) {
      return res.status(404).json({ error: "String does not exist in the system" });
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

// GET /strings with filtering
export const getStringsWithFilters = async (req, res) => {
  const {
    is_palindrome,
    min_length,
    max_length,
    word_count,
    contains_character,
  } = req.query;

  // Build filters object
  const filters = {};
  const filtersApplied = {};

  // Validate and apply filters
  if (is_palindrome !== undefined) {
    if (is_palindrome !== "true" && is_palindrome !== "false") {
      return res.status(400).json({ error: 'Invalid "is_palindrome" parameter (must be true or false)' });
    }
    filters.is_palindrome = is_palindrome === "true";
    filtersApplied.is_palindrome = filters.is_palindrome;
  }

  if (min_length !== undefined) {
    const minLen = parseInt(min_length, 10);
    if (isNaN(minLen) || minLen < 0) {
      return res.status(400).json({ error: 'Invalid "min_length" parameter (must be non-negative integer)' });
    }
    filters.length = { ...filters.length, gte: minLen };
    filtersApplied.min_length = minLen;
  }

  if (max_length !== undefined) {
    const maxLen = parseInt(max_length, 10);
    if (isNaN(maxLen) || maxLen < 0) {
      return res.status(400).json({ error: 'Invalid "max_length" parameter (must be non-negative integer)' });
    }
    filters.length = { ...filters.length, lte: maxLen };
    filtersApplied.max_length = maxLen;
  }

  if (word_count !== undefined) {
    const wc = parseInt(word_count, 10);
    if (isNaN(wc) || wc < 0) {
      return res.status(400).json({ error: 'Invalid "word_count" parameter (must be non-negative integer)' });
    }
    filters.word_count = wc;
    filtersApplied.word_count = wc;
  }

  if (contains_character !== undefined) {
    if (typeof contains_character !== "string" || contains_character.length !== 1) {
      return res.status(400).json({ error: 'Invalid "contains_character" parameter (must be a single character)' });
    }
    // For contains_character, we need to check if the character is in the value
    // Since Prisma doesn't support direct string contains on JSON, we'll filter in JS after query
    filtersApplied.contains_character = contains_character;
  }

  try {
    let stringData = await prisma.stringData.findMany({
      where: filters,
      orderBy: { created_at: "desc" },
    });

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

    res.status(200).json({
      data,
      count: data.length,
      filters_applied: filtersApplied,
    });
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

// GET /strings/filter-by-natural-language
export const getStringsByNaturalLanguage = async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: 'Missing or invalid "query" parameter' });
  }

  // Parse natural language query
  const parsedFilters = parseNaturalLanguageQuery(query);
  if (!parsedFilters) {
    return res.status(400).json({ error: "Unable to parse natural language query" });
  }

  // Check for conflicting filters (e.g., min_length > max_length)
  if (parsedFilters.min_length && parsedFilters.max_length && parsedFilters.min_length > parsedFilters.max_length) {
    return res.status(422).json({ error: "Query parsed but resulted in conflicting filters" });
  }

  // Build Prisma filters
  const filters = {};
  const filtersApplied = {};

  if (parsedFilters.is_palindrome !== undefined) {
    filters.is_palindrome = parsedFilters.is_palindrome;
    filtersApplied.is_palindrome = parsedFilters.is_palindrome;
  }

  if (parsedFilters.min_length !== undefined) {
    filters.length = { ...filters.length, gte: parsedFilters.min_length };
    filtersApplied.min_length = parsedFilters.min_length;
  }

  if (parsedFilters.max_length !== undefined) {
    filters.length = { ...filters.length, lte: parsedFilters.max_length };
    filtersApplied.max_length = parsedFilters.max_length;
  }

  if (parsedFilters.word_count !== undefined) {
    filters.word_count = parsedFilters.word_count;
    filtersApplied.word_count = parsedFilters.word_count;
  }

  if (parsedFilters.contains_character !== undefined) {
    filtersApplied.contains_character = parsedFilters.contains_character;
  }

  try {
    let stringData = await prisma.stringData.findMany({
      where: filters,
      orderBy: { created_at: "desc" },
    });

    // Apply contains_character filter if specified
    if (parsedFilters.contains_character !== undefined) {
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
        parsed_filters: filtersApplied,
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
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    });
  }
};

// DELETE /strings/:value
export const deleteString = async (req, res) => {
  const { value } = req.params;

  if (!value || typeof value !== "string") {
    return res.status(400).json({ error: 'Invalid "value" parameter (must be string)' });
  }

  const properties = computeStringProperties(value);
  const id = properties.sha256_hash;

  try {
    const existing = await prisma.stringData.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "String does not exist in the system" });
    }

    await prisma.stringData.delete({
      where: { id },
    });

    res.status(204).send();
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
