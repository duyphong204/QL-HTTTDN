# Multi-stage Dockerfile for NestJS Monorepo Microservices
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm ci

COPY libs ./libs
COPY apps ./apps
COPY src ./src

ARG SERVICE_NAME=api-gateway
RUN npx nest build ${SERVICE_NAME}

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist /app/dist

# Bảo mật: Sử dụng user không có quyền root (non-root)
RUN chown -R node:node /app
USER node

ARG SERVICE_NAME=api-gateway
ENV SERVICE_PATH=${SERVICE_NAME}

EXPOSE 3000

CMD ["sh", "-c", "node dist/apps/${SERVICE_PATH}/main.js"]
