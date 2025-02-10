

FROM --platform=linux/amd64 node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY  prisma ./


COPY package.json package-lock.json*./

RUN npm install

COPY ..

RUN npm run build


FROM node:18-alpine AS production

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/package-lock.json ./package-lock.json
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma

EXPOSE 3000


CMD ["npm", "start"]


