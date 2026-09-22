# Base image for dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci


# Stage 2: Development (Hot Reloading)

FROM deps AS dev    

WORKDIR /app

# Copy configuration and source code
COPY tsconfig.json ./
COPY src ./src

EXPOSE 3001

# Run tsx watch for instant live reloading during development
CMD ["npm", "run", "dev"]


# Stage 3: Builder (Compile TypeScript & Prune)

FROM deps AS builder

WORKDIR /app

COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to ./dist
RUN npm run build

# Prune devDependencies to keep only production modules
RUN npm prune --omit=dev


# Stage 4: Production Runner

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Use built-in non-root user 'node' for security
USER node

# Copy package metadata
COPY --chown=node:node package*.json ./

# Copy pruned production dependencies from builder stage
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

# Copy compiled JavaScript output from builder stage
COPY --chown=node:node --from=builder /app/dist ./dist

# Expose production port
EXPOSE 3001

# Healthcheck to verify server is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/v1 || exit 1

# Start server directly with node for proper Unix signal forwarding (SIGTERM / SIGINT)
CMD ["node", "dist/server.js"]
