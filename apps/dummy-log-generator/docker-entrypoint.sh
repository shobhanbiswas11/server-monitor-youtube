#!/bin/bash
set -e

# Start Fluent Bit in the background
echo "Starting Fluent Bit..."
/opt/fluent-bit/bin/fluent-bit -c /etc/fluent-bit/fluent-bit.conf &
FLUENTBIT_PID=$!

# Start Node.js application
echo "Starting Node.js application..."
node index.js &
NODE_PID=$!

# Function to handle shutdown
shutdown() {
    echo "Shutting down..."
    kill -TERM $NODE_PID 2>/dev/null || true
    kill -TERM $FLUENTBIT_PID 2>/dev/null || true
    wait $NODE_PID 2>/dev/null || true
    wait $FLUENTBIT_PID 2>/dev/null || true
    exit 0
}

# Trap SIGTERM and SIGINT
trap shutdown SIGTERM SIGINT

# Wait for both processes
wait -n

# If either process exits, exit the script
exit $?
