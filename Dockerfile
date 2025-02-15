# Remove platform specification since it's causing issues
FROM node:20-slim AS builder

# Install OpenSSL and build dependencies
RUN apt-get update && apt-get install -y openssl postgresql-client git

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-slim AS runner

# Install OpenSSL and runtime dependencies
RUN apt-get update && apt-get install -y openssl postgresql-client git

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /usr/local/bin/wait-for-it.sh /usr/local/bin/wait-for-it.sh

EXPOSE 3000

CMD ["sh", "-c", "wait-for-it.sh postgres-pgvector:5432 -- npm run start"]