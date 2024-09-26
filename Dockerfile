# Stage 1: Build the NestJS app
FROM node:18 AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the application files
COPY . .

# Build the NestJS app
RUN npm run build

# Stage 2: Serve the application
FROM node:18

WORKDIR /app

# Copy necessary files
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Expose the app port (default: 3000)
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:prod"]
