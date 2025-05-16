# ---- 1. Build Stage ----
FROM node:18-alpine AS builder

WORKDIR /app

# cache deps
COPY package*.json ./
RUN npm ci

# copy config and source
COPY vite.config.ts tsconfig*.json tsconfig.app.json ./
COPY postcss.config.js tailwind.config.js ./
COPY public ./public
COPY src ./src

# build production assets
RUN npm run build

# ---- 2. Production Stage ----
FROM nginx:alpine AS production

# remove default nginx assets
RUN rm -rf /usr/share/nginx/html/*

# copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# optional: copy your custom nginx.conf if you have one
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
