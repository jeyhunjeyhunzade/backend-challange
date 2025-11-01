# -------- Base builder --------
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --quiet
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc -p .

# -------- Runtime image --------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci --omit=dev --quiet
COPY --from=builder /app/dist ./dist
COPY .env ./.env
EXPOSE 3000
CMD ["node", "dist/index.js"]
