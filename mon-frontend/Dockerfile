# Stage 1: Install all dependencies
FROM node:24.12.0 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the Remix application
FROM node:24.12.0 AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Remix (produces build/server and build/client)
RUN npm run build

# Stage 3: Production dependencies only
FROM node:24.12.0 AS production-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 4: Production runner
FROM node:24.12.0 AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 remix
RUN adduser --system --uid 1001 remix

# Copy production node_modules
COPY --from=production-deps /app/node_modules ./node_modules

# Copy the built application
COPY --from=builder /app/build ./build

# Copy public directory for static assets
COPY --from=builder /app/public ./public

# Copy package.json (needed for the start script)
COPY package.json .

# Set ownership
RUN chown -R remix:remix /app

USER remix

EXPOSE 3000
CMD ["npm", "run", "start"]