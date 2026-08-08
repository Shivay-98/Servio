FROM node:20-alpine AS base
WORKDIR /app

FROM base AS server-deps
COPY server/package.json server/package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS client-build
COPY client/package.json client/package-lock.json* ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=server-deps /app/node_modules ./node_modules
COPY server/ ./
COPY --from=client-build /app/dist ./public
EXPOSE 5000
USER node
CMD ["node", "server.js"]
