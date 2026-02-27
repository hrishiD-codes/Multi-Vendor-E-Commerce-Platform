FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN mkdir -p public

# Build-time env vars (overridden at runtime via docker-compose environment)
ARG NEXT_PUBLIC_USER_SERVICE_URL=http://localhost
ARG NEXT_PUBLIC_PRODUCT_SERVICE_URL=http://localhost
ARG NEXT_PUBLIC_CART_SERVICE_URL=http://localhost
ARG NEXT_PUBLIC_ORDER_SERVICE_URL=http://localhost
ARG NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost
ARG NEXTAUTH_URL=http://localhost:3000
ARG NEXTAUTH_SECRET=changeme

ENV NEXT_PUBLIC_USER_SERVICE_URL=$NEXT_PUBLIC_USER_SERVICE_URL
ENV NEXT_PUBLIC_PRODUCT_SERVICE_URL=$NEXT_PUBLIC_PRODUCT_SERVICE_URL
ENV NEXT_PUBLIC_CART_SERVICE_URL=$NEXT_PUBLIC_CART_SERVICE_URL
ENV NEXT_PUBLIC_ORDER_SERVICE_URL=$NEXT_PUBLIC_ORDER_SERVICE_URL
ENV NEXT_PUBLIC_PAYMENT_SERVICE_URL=$NEXT_PUBLIC_PAYMENT_SERVICE_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

RUN npm run build

# ─── Production runner ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
