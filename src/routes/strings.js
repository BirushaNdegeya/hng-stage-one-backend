import express from "express";
import {
  createString,
  getStringByValue,
  getStringsWithFilters,
  getStringsByNaturalLanguage,
  deleteString,
} from "../controllers/stringsController.js";

const router = express.Router();

/**
 * @swagger
 * /strings:
 *   post:
 *     summary: Store a string and compute its properties
 *     description: Stores a string and computes its properties
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 description: The string to store
 *     responses:
 *       201:
 *         description: String stored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 value:
 *                   type: string
 *                 properties:
 *                   type: object
 *                   properties:
 *                     length:
 *                       type: integer
 *                     is_palindrome:
 *                       type: boolean
 *                     unique_characters:
 *                       type: integer
 *                     word_count:
 *                       type: integer
 *                     sha256_hash:
 *                       type: string
 *                     character_frequency_map:
 *                       type: object
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request body or missing value field
 *       409:
 *         description: String already exists
 *       422:
 *         description: Invalid data type for value
 */
router.post("/", createString);

/**
 * @swagger
 * /strings/{value}:
 *   get:
 *     summary: Retrieve a stored string by its value
 *     description: Retrieves a stored string by its value
 *     parameters:
 *       - in: path
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: The string value to retrieve
 *     responses:
 *       200:
 *         description: String retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 value:
 *                   type: string
 *                 properties:
 *                   type: object
 *                   properties:
 *                     length:
 *                       type: integer
 *                     is_palindrome:
 *                       type: boolean
 *                     unique_characters:
 *                       type: integer
 *                     word_count:
 *                       type: integer
 *                     sha256_hash:
 *                       type: string
 *                     character_frequency_map:
 *                       type: object
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid value parameter
 *       404:
 *         description: String does not exist
 */
router.get("/:value", getStringByValue);

/**
 * @swagger
 * /strings:
 *   get:
 *     summary: Retrieve all strings with optional filtering
 *     description: Retrieves all strings with optional filtering
 *     parameters:
 *       - in: query
 *         name: is_palindrome
 *         schema:
 *           type: boolean
 *         description: Filter by palindrome status
 *       - in: query
 *         name: min_length
 *         schema:
 *           type: integer
 *         description: Minimum string length
 *       - in: query
 *         name: max_length
 *         schema:
 *           type: integer
 *         description: Maximum string length
 *       - in: query
 *         name: word_count
 *         schema:
 *           type: integer
 *         description: Exact word count
 *       - in: query
 *         name: contains_character
 *         schema:
 *           type: string
 *           maxLength: 1
 *         description: Single character to search for
 *     responses:
 *       200:
 *         description: Strings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       value:
 *                         type: string
 *                       properties:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: integer
 *                 filters_applied:
 *                   type: object
 *       400:
 *         description: Invalid query parameter values or types
 */
router.get("/", getStringsWithFilters);

/**
 * @swagger
 * /strings/filter-by-natural-language:
 *   get:
 *     summary: Filter strings using natural language queries
 *     description: Filters strings using natural language queries
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Natural language description of filters
 *     responses:
 *       200:
 *         description: Strings filtered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *                 interpreted_query:
 *                   type: object
 *                   properties:
 *                     original:
 *                       type: string
 *                     parsed_filters:
 *                       type: object
 *       400:
 *         description: Unable to parse natural language query
 *       422:
 *         description: Query parsed but resulted in conflicting filters
 */
router.get("/filter-by-natural-language", getStringsByNaturalLanguage);

/**
 * @swagger
 * /strings/{value}:
 *   delete:
 *     summary: Delete a stored string
 *     description: Deletes a stored string
 *     parameters:
 *       - in: path
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: The string value to delete
 *     responses:
 *       204:
 *         description: String deleted successfully
 *       400:
 *         description: Invalid value parameter
 *       404:
 *         description: String does not exist
 */
router.delete("/:value", deleteString);

export default router;
