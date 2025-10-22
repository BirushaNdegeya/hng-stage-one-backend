import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { prisma } from "./utils/prisma.js";
import stringsRouter from "./routes/strings.js";

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

dotenv.config({ quiet: true });
const port = process.env.PORT || 3000;

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "HNG Stage One Backend API",
    version: "1.0.0",
    description: "RESTful API service that analyzes strings and stores their computed properties",
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: "Development server",
    },
  ],
};

// Swagger options
const swaggerOptions = {
  swaggerDefinition,
  apis: ["./src/routes/strings.js"], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     description: Returns basic API information
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/", function (req, res) {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`
  );
  res.status(200).json({
    message: "Welcome to HNG Stage One Backend API",
    timestamp: new Date().toISOString(),
  });
});

// Mount the strings router
app.use("/strings", stringsRouter);

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(port, function () {
    console.log(`
========================================
APP [STATUS:RUNNING] ON PORT ::: ${port}
========================================
    `);
  });
}

// Ensure Prisma client disconnects on process exit
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default app;
