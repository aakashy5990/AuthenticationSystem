
# Use official Node.js image
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy backend source code
COPY . .

# Backend port
EXPOSE 4000

# Start backend
CMD ["npm", "start"]
