FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY backend/package*.json ./
RUN npm install

# Build TypeScript backend
COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
