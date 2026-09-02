# Fase 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

# Fase 2: Production
FROM node:22-alpine
LABEL author="Fabrizio Pistagna <fabrizio.pistagna@ingv.it>"
LABEL description="MetaCat OCI compatible image"

WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD [ "node", "src/server.js" ]
