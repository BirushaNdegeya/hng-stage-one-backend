# HNG Stage One Backend

RESTful API service that analyzes strings and stores their computed properties.

## Features

- **GET /**: Welcome endpoint with API information
- **POST /strings**: Store a string and compute its properties
- **GET /strings/:value**: Retrieve a stored string by its value
- **GET /strings**: Retrieve all strings with optional filtering
- **GET /strings/filter-by-natural-language**: Filter strings using natural language queries
- **DELETE /strings/:value**: Delete a stored string
- String property computation (length, palindrome check, unique characters, word count, SHA256 hash, character frequency)
- Database storage using Prisma and SQLite
- CORS enabled for cross-origin requests
- Rate limiting (100 requests per 15 minutes per IP)
- Request logging for debugging

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- pnpm (package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/BirushaNdegeya/hng-stage-one-backend.git
   cd hng-stage-one-backend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up the database:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Create a `.env` file in the root directory (optional, defaults are provided):

   ```env
   PORT=3000
   DATABASE_URL="file:./dev.db"
   ```

5. Start the development server:

   ```bash
   pnpm run dev
   ```

6. For production:
   ```bash
   pnpm run start
   ```

## API Endpoints

### GET /

Returns basic API information.

**Response:**

```json
{
  "message": "Welcome to HNG Stage One Backend API",
  "timestamp": "2025-10-22T07:52:43.181Z"
}
```

### POST /strings

Stores a string and computes its properties.

**Request Body:**

```json
{
  "value": "hello world"
}
```

**Success Response (201 Created):**

```json
{
  "id": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
  "value": "hello world",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 9,
    "word_count": 2,
    "sha256_hash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    "character_frequency_map": {
      "h": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "w": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2025-10-22T07:52:43.181Z"
}
```

**Error Responses:**

- `400 Bad Request`: Invalid request body or missing "value" field
- `409 Conflict`: String already exists
- `422 Unprocessable Entity`: Invalid data type for "value" (must be string)

### GET /strings/:value

Retrieves a stored string by its value.

**Success Response (200 OK):**

```json
{
  "id": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
  "value": "hello world",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 9,
    "word_count": 2,
    "sha256_hash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    "character_frequency_map": {
      "h": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "w": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2025-10-22T07:52:43.181Z"
}
```

**Error Response:**

- `404 Not Found`: String does not exist

### GET /strings

Retrieves all strings with optional filtering.

**Query Parameters:**

- `is_palindrome` (boolean): Filter by palindrome status
- `min_length` (integer): Minimum string length
- `max_length` (integer): Maximum string length
- `word_count` (integer): Exact word count
- `contains_character` (string): Single character to search for

**Example Request:**

```
GET /strings?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a
```

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "id": "hash1",
      "value": "string1",
      "properties": { /* ... */ },
      "created_at": "2025-08-27T10:00:00Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "max_length": 20,
    "word_count": 2,
    "contains_character": "a"
  }
}
```

**Error Response:**

- `400 Bad Request`: Invalid query parameter values or types

### GET /strings/filter-by-natural-language

Filters strings using natural language queries.

**Query Parameter:**

- `query` (string): Natural language description of filters

**Example Requests:**

```
GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings
GET /strings/filter-by-natural-language?query=strings%20longer%20than%2010%20characters
GET /strings/filter-by-natural-language?query=strings%20containing%20the%20letter%20z
```

**Success Response (200 OK):**

```json
{
  "data": [ /* array of matching strings */ ],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Unable to parse natural language query
- `422 Unprocessable Entity`: Query parsed but resulted in conflicting filters

### DELETE /strings/:value

Deletes a stored string.

**Success Response (204 No Content):** Empty response body

**Error Response:**

- `404 Not Found`: String does not exist

## Environment Variables

- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: Database connection string (default: "file:./dev.db")

## Dependencies

- `express`: Web framework for Node.js
- `cors`: Cross-Origin Resource Sharing middleware
- `express-rate-limit`: Rate limiting middleware
- `dotenv`: Environment variable management
- `@prisma/client`: Database ORM
- `prisma`: Database toolkit
- `crypto`: Built-in Node.js crypto module

## Development Dependencies

- `nodemon`: Automatic server restart during development

## Testing

Test the endpoints using curl:

```bash
# Test root endpoint
curl http://localhost:3000/

# Test POST /strings
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "hello world"}'

# Test GET /strings/:value
curl http://localhost:3000/strings/hello%20world

# Test GET /strings with filters
curl "http://localhost:3000/strings?is_palindrome=false"

# Test GET /strings/filter-by-natural-language
curl "http://localhost:3000/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings"

# Test DELETE /strings/:value
curl -X DELETE http://localhost:3000/strings/hello%20world
```

## API Documentation

The API is documented using Swagger. To view the documentation:

1. Start the server
2. Visit `http://localhost:3000/api-docs` (Swagger UI will be available if implemented)

## Project Structure

```
hng-stage-one-backend/
├── src/
│   ├── index.js                    # Main application file (entry point)
│   ├── controllers/
│   │   └── stringsController.js    # Business logic for string operations
│   ├── routes/
│   │   └── strings.js              # Route definitions and Swagger docs
│   ├── utils/
│   │   ├── prisma.js               # Prisma client setup
│   │   ├── compute-string-propreties.js # String property computation
│   │   └── naturalLanguageParser.js # Natural language query parser
│   └── generated/                  # Prisma generated files
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Database migrations
├── .env                            # Environment variables (create this)
├── .gitignore                      # Git ignore rules
├── package.json                    # Project dependencies and scripts
├── pnpm-lock.yaml                  # Lock file for pnpm
└── README.md                       # This file
```
