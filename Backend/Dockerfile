# ---- Base Stage ----
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# ---- Dependencies Stage ----
FROM base AS deps
COPY package*.json ./
RUN npm install --frozen-lockfile

# ---- Build Stage ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build
RUN mkdir -p /app/uploads

# ---- Production Stage ----
FROM base AS prod
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/uploads ./uploads
EXPOSE 5000
CMD ["node", "dist/index.js"]
