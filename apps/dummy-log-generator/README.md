# Dummy Log Generator

A simple Express application that generates dummy logs using Winston for testing log analysis systems.

## Features

- **Automatic Random Log Generation**: Generates logs at random intervals (1-5 seconds)
- **Multiple Log Levels**: info, debug, warn, and error logs
- **Express API**: REST endpoints to trigger specific log scenarios
- **Winston Logger**: Professional logging with file rotation
- **Critical Scenarios**: Simulate real-world error patterns

## Installation

```bash
pnpm install
```

## Usage

Start the server:

```bash
pnpm start
```

For development with auto-reload:

```bash
pnpm dev
```

The server will start on port 3001 (or the PORT environment variable) and automatically begin generating random logs.

## API Endpoints

### Health Check
```bash
GET /
```
Returns server status and available endpoints.

### Generate Single Error
```bash
POST /generate-error
Content-Type: application/json

{
  "message": "Custom error message",  // optional
  "severity": "error"                 // optional: debug, info, warn, error
}
```

### Generate Batch of Logs
```bash
POST /generate-batch
Content-Type: application/json

{
  "count": 10,                        // optional, default: 10
  "types": ["info", "error", "warn"]  // optional, specific log types
}
```

### Generate Critical Scenario
```bash
POST /generate-critical
Content-Type: application/json

{
  "scenario": "database_failure"  // options: database_failure, memory_leak, 
                                  //          api_cascade_failure, security_breach
}
```

Available scenarios:
- **database_failure**: Simulates database connection pool exhaustion and query failures
- **memory_leak**: Simulates increasing memory usage and OOM errors
- **api_cascade_failure**: Simulates cascading failures across multiple services
- **security_breach**: Simulates security threats and brute force attacks

### Start/Stop Automatic Generation
```bash
POST /start-auto-generation
POST /stop-auto-generation
```

## Example Usage

```bash
# Check if server is running
curl http://localhost:3001/

# Generate a single error
curl -X POST http://localhost:3001/generate-error \
  -H "Content-Type: application/json" \
  -d '{"message": "Test error", "severity": "error"}'

# Generate 50 random logs
curl -X POST http://localhost:3001/generate-batch \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'

# Generate only error and warn logs
curl -X POST http://localhost:3001/generate-batch \
  -H "Content-Type: application/json" \
  -d '{"count": 20, "types": ["error", "warn"]}'

# Simulate database failure
curl -X POST http://localhost:3001/generate-critical \
  -H "Content-Type: application/json" \
  -d '{"scenario": "database_failure"}'

# Stop automatic log generation
curl -X POST http://localhost:3001/stop-auto-generation
```

## Log Files

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

Files automatically rotate when they reach 5MB, keeping up to 5 files.

## Log Format

Logs are generated with:
- Timestamp
- Log level (debug, info, warn, error)
- Message
- Metadata (userId, requestId, duration, etc.)

Example log entry:
```json
{
  "timestamp": "2026-01-12T10:30:45.123Z",
  "level": "error",
  "message": "Database connection failed",
  "userId": 456,
  "requestId": "req_abc123xyz",
  "duration": 342
}
```
