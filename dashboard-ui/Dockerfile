# Use node as base image
FROM node:24-bookworm-slim

# Set working directory
WORKDIR /app

# Copy dependencies
 COPY package*.json .

 # Install dependencies
 RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables for webpack dev server in Docker
ENV WATCHPACK_POLLING=true
ENV WDS_SOCKET_HOST=localhost
ENV WDS_SOCKET_PORT=3000

# Start project
CMD ["npm", "start"]
