# Build Stage
FROM node:18-alpine as build-stage
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Production Stage
FROM node:18-alpine as production-stage
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production

# Copy server code
COPY server/ .

# Copy built frontend from build-stage to client/dist (relative to /app/server)
# Structure:
# /app/server (backend code)
# /app/client/dist (frontend static)
COPY --from=build-stage /app/dist /app/client/dist

# Setup Server Dir
WORKDIR /app/server

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose Port
EXPOSE 3000

# Start
CMD ["npm", "start"]
