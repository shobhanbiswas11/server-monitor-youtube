const express = require("express");
const winston = require("winston");

// Configure Winston logger
const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          }`;
        })
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for error logs
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Sample log messages
const infoMessages = [
  "User login successful",
  "Database connection established",
  "API request completed",
  "Cache hit for user data",
  "File uploaded successfully",
  "Email sent to user",
  "Background job completed",
  "Session created",
  "Payment processed",
  "Report generated successfully",
];

const warnMessages = [
  "High memory usage detected",
  "API rate limit approaching",
  "Deprecated function called",
  "Cache miss - fetching from database",
  "Slow query detected",
  "Connection retry attempted",
  "Configuration missing, using default",
  "Token expiring soon",
  "Disk space running low",
  "Queue size increasing",
];

const errorMessages = [
  "Database connection failed",
  "Authentication failed",
  "File not found",
  "Invalid request parameters",
  "External API timeout",
  "Permission denied",
  "Memory allocation error",
  "Network connection lost",
  "Payment gateway error",
  "Unable to process request",
];

const debugMessages = [
  "Request headers parsed",
  "Middleware chain started",
  "Query parameters validated",
  "Response headers set",
  "Cache lookup initiated",
  "Route handler executed",
  "Database query prepared",
  "Template rendered",
  "Session data retrieved",
  "Event emitted successfully",
];

// Function to get random element from array
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Function to get random interval between min and max milliseconds
const getRandomInterval = (min = 1000, max = 5000) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Generate random log data (excludes errors)
const generateRandomLog = () => {
  const logTypes = [
    { level: "info", messages: infoMessages, weight: 60 },
    { level: "debug", messages: debugMessages, weight: 30 },
    { level: "warn", messages: warnMessages, weight: 10 },
  ];

  // Weighted random selection
  const totalWeight = logTypes.reduce((sum, type) => sum + type.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedType = logTypes[0];

  for (const type of logTypes) {
    if (random < type.weight) {
      selectedType = type;
      break;
    }
    random -= type.weight;
  }

  const message = getRandomElement(selectedType.messages);
  const meta = {
    userId: Math.floor(Math.random() * 1000),
    requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
    duration: Math.floor(Math.random() * 1000),
  };

  logger.log(selectedType.level, message, meta);
};

// Generate a single error
const generateError = (customMessage = null) => {
  const message = customMessage || getRandomElement(errorMessages);
  const meta = {
    userId: Math.floor(Math.random() * 1000),
    requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
    stackTrace: new Error().stack,
  };

  logger.error(message, meta);
  return message;
};

// Tracking intervals
let logGenerationInterval = null;
let errorGenerationInterval = null;

// Start normal log generation (info, debug, warn only)
const startLogGeneration = () => {
  if (logGenerationInterval) {
    return false;
  }

  const scheduleNextLog = () => {
    const interval = getRandomInterval(1000, 5000);
    logGenerationInterval = setTimeout(() => {
      generateRandomLog();
      scheduleNextLog();
    }, interval);
  };

  logger.info("Starting normal log generation");
  scheduleNextLog();
  return true;
};

// Stop normal log generation
const stopLogGeneration = () => {
  if (logGenerationInterval) {
    clearTimeout(logGenerationInterval);
    logGenerationInterval = null;
    logger.info("Stopped normal log generation");
    return true;
  }
  return false;
};

// Start error generation
const startErrorGeneration = () => {
  if (errorGenerationInterval) {
    return false;
  }

  const scheduleNextError = () => {
    const interval = getRandomInterval(2000, 8000);
    errorGenerationInterval = setTimeout(() => {
      generateError();
      scheduleNextError();
    }, interval);
  };

  logger.info("Starting error generation");
  scheduleNextError();
  return true;
};

// Stop error generation
const stopErrorGeneration = () => {
  if (errorGenerationInterval) {
    clearTimeout(errorGenerationInterval);
    errorGenerationInterval = null;
    logger.info("Stopped error generation");
    return true;
  }
  return false;
};

// Create Express app
const app = express();
app.use(express.json());

// 1. Status endpoint
app.get("/status", (req, res) => {
  res.json({
    status: "ok",
    message: "Dummy log generator is running",
    generation: {
      normalLogs: logGenerationInterval !== null,
      errors: errorGenerationInterval !== null,
    },
    endpoints: {
      status: "GET /status",
      generateError: "POST /generate-error",
      startErrorGeneration: "POST /start-error-generation",
      stopErrorGeneration: "POST /stop-error-generation",
      startGeneration: "POST /start-generation",
      stopGeneration: "POST /stop-generation",
    },
  });
});

// 2. Generate a single error
app.post("/generate-error", (req, res) => {
  const { message, type } = req.body;

  let errorMsg;
  if (message) {
    errorMsg = message;
  } else if (type) {
    // If type is provided, try to find a matching error message
    const typeMessages = {
      database: [
        "Database connection failed",
        "Failed to execute query",
        "Database health check failed",
      ],
      authentication: ["Authentication failed", "Permission denied"],
      network: ["Network connection lost", "External API timeout"],
      file: ["File not found"],
      memory: ["Memory allocation error", "Out of memory error"],
      payment: ["Payment gateway error"],
    };
    const messages = typeMessages[type] || errorMessages;
    errorMsg = getRandomElement(messages);
  } else {
    errorMsg = generateError();
  }

  if (message || type) {
    // Generate the error if we have a custom message or type
    const meta = {
      userId: Math.floor(Math.random() * 1000),
      requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
      stackTrace: new Error().stack,
      ...(type && { errorType: type }),
    };
    logger.error(errorMsg, meta);
  }

  res.json({
    status: "success",
    message: "Error log generated",
    errorMessage: errorMsg,
    ...(type && { errorType: type }),
  });
});

// 3. Start error generation
app.post("/start-error-generation", (req, res) => {
  const started = startErrorGeneration();
  res.json({
    status: "success",
    message: started
      ? "Error generation started"
      : "Error generation already running",
    generating: true,
  });
});

// 4. Stop error generation
app.post("/stop-error-generation", (req, res) => {
  const stopped = stopErrorGeneration();
  res.json({
    status: "success",
    message: stopped
      ? "Error generation stopped"
      : "Error generation was not running",
    generating: false,
  });
});

// 5. Start normal log generation
app.post("/start-generation", (req, res) => {
  const started = startLogGeneration();
  res.json({
    status: "success",
    message: started
      ? "Normal log generation started"
      : "Normal log generation already running",
    generating: true,
  });
});

// 6. Stop normal log generation
app.post("/stop-generation", (req, res) => {
  const stopped = stopLogGeneration();
  res.json({
    status: "success",
    message: stopped
      ? "Normal log generation stopped"
      : "Normal log generation was not running",
    generating: false,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Express error handler caught an error", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    status: "error",
    message: err.message,
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Dummy log generator server started on port ${PORT}`);
  logger.info("Endpoints available:");
  logger.info("  GET  /status                  - Check server status");
  logger.info("  POST /generate-error          - Generate a single error log");
  logger.info("  POST /start-error-generation  - Start generating errors");
  logger.info("  POST /stop-error-generation   - Stop generating errors");
  logger.info("  POST /start-generation        - Start generating normal logs");
  logger.info("  POST /stop-generation         - Stop generating normal logs");
  logger.info("");
  logger.info("Server ready. Use endpoints to control log generation.");
});
