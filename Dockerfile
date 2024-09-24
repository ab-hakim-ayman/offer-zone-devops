# Stage 1: Build the NestJS app
FROM node:18 AS build

WORKDIR /app

# Install dependencies (without optional native dependencies)
COPY package*.json ./

# Ensure native dependencies like bcrypt are rebuilt inside the container
RUN npm install --force

# Copy the rest of the application files
COPY . .

# Build the NestJS app
RUN npm run build

# Stage 2: Serve the application
FROM node:18

WORKDIR /app

# Copy the necessary files from the build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Expose the app port (default: 3000)
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:prod"]
