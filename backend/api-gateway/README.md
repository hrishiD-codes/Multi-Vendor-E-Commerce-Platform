# API Gateway — NGINX

Single-entry-point NGINX reverse proxy for the E-Kart microservices platform.

## Architecture

```
Client (Browser / Mobile)
        │
        ▼
┌───────────────────┐   port 80 / 443
│   NGINX Gateway   │──────────────────────────────┐
└───────────────────┘                              │
        │  Rate Limiting + CORS + Security Headers │
        │                                          │
        ├──/api/auth/*        ──► user-service          :8001
        ├──/api/users/*       ──► user-service          :8001
        │
        ├──/api/products/*    ──► product-catalog-service :8002
        ├──/api/categories/*  ──► product-catalog-service :8002
        │
        ├──/api/cart/*        ──► shopping-cart-service  :8003
        │
        ├──/api/orders/*      ──► order-service          :8004
        │
        ├──/api/payments/*    ──► payment-service        :8005
        ├──/api/webhooks/*    ──► payment-service        :8005
        │
        └──/api/notifications/*──► notification-service  :8006
```

## Files

| File                  | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `nginx.conf`          | Main NGINX config (worker procs, rate-limit zones, gzip)         |
| `conf.d/default.conf` | Virtual host: upstreams, location blocks, CORS, security headers |
| `Dockerfile`          | Builds the NGINX gateway container image                         |

## Rate Limiting

| Zone           | Limit              | Applied To                                                      |
| -------------- | ------------------ | --------------------------------------------------------------- |
| `api_auth`     | 10 req/min per IP  | `POST /api/auth/register`, `POST /api/auth/login`, forgot/reset |
| `api_general`  | 60 req/min per IP  | All other `/api/*` routes                                       |
| `api_webhooks` | 120 req/min per IP | `/api/webhooks/*` (external payment providers)                  |

## CORS

Handled globally at the gateway level. Allowed origins:

- `http://localhost:3000` (Next.js dev)
- `http://localhost:3001` (alternate port)

OPTIONS preflight responses are handled inline and return **204** — no request reaches a backend service for preflight calls.

## Headers forwarded to services

| Header              | Value            | Used by                       |
| ------------------- | ---------------- | ----------------------------- |
| `X-Real-IP`         | Client IP        | All services (logging)        |
| `X-Forwarded-For`   | Proxy chain      | All services                  |
| `Authorization`     | Bearer token     | Cart, Order, Payment services |
| `X-Forwarded-Proto` | `http` / `https` | All services                  |

> **Note:** `X-User-Id` is set by each service after it validates the Authorization token — not injected by the gateway. This keeps auth logic inside the User Service.

## Health Checks

| Endpoint                        | Routes to                             |
| ------------------------------- | ------------------------------------- |
| `GET /health`                   | Gateway itself (instant 200)          |
| `GET /api/health/users`         | user-service `/api/health`            |
| `GET /api/health/products`      | product-catalog-service `/api/health` |
| `GET /api/health/cart`          | shopping-cart-service `/api/health`   |
| `GET /api/health/orders`        | order-service `/api/health`           |
| `GET /api/health/payments`      | payment-service `/api/health`         |
| `GET /api/health/notifications` | notification-service `/api/health`    |

## Running

### With Docker Compose (all services)

```bash
# 1. Create your secrets file
cp .env.example .env
# 2. Fill in Stripe, Twilio, SendGrid keys in .env

# 3. Start everything
docker-compose up -d

# 4. Verify
curl http://localhost/health
curl http://localhost/api/health/users
```

### Gateway only (local NGINX, services already running)

```bash
nginx -c "$(pwd)/nginx.conf" -t   # validate config
nginx -c "$(pwd)/nginx.conf"      # start
nginx -s reload                   # hot-reload after changes
```

## Security Headers

All responses include:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## Production Notes

- Enable SSL by adding a second `server` block on port 443 with `ssl_certificate` directives.
- Replace `limit_req_zone` memory sizes for high-traffic deployments.
- Add `proxy_cache` zones for read-heavy product/category endpoints.
- Use a load-balanced upstream group (`server service1; server service2;`) for horizontal scaling.
