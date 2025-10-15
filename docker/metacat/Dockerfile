# Fase 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

# Fase 2: Production
FROM node:18-alpine
LABEL author="Fabrizio Pistagna <fabrizio.pistagna@ingv.it>"
LABEL description="MetaCat OCI compatible image"

WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD [ "node", "src/server.js" ]