FROM node:20-slim

# Install dependencies for Fluent Bit
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Add Fluent Bit repository and install
RUN curl https://packages.fluentbit.io/fluentbit.key | gpg --dearmor > /usr/share/keyrings/fluentbit-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/fluentbit-keyring.gpg] https://packages.fluentbit.io/debian/$(lsb_release -cs) $(lsb_release -cs) main" > /etc/apt/sources.list.d/fluent-bit.list && \
    apt-get update && \
    apt-get install -y fluent-bit && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Copy Fluent Bit configuration
COPY fluent-bit.conf /etc/fluent-bit/fluent-bit.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose application port
EXPOSE 3001

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
