
# Use official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Expose Vite development port
EXPOSE 5173

# Start Vite and allow access outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
