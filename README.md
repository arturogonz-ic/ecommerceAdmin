# Ecommerce Admin

Next.js admin panel for the Ecommerce ecosystem.

## Stack

- Next.js (App Router)
- Tailwind CSS

## Features

- Product management — create, edit, delete, image upload, discounts
- Order management — full list with filters (status, product, category, date range), status transitions, shipping info
- Category management — create, delete, category-level discounts
- Dashboard — revenue, profit, and order count by period (day / week / month / year / all time)
- Failed orders widget — quick view of cancelled and lost orders
- Suggestions — view, mark as read, and delete user-submitted feedback

## Getting started

```bash
pnpm install
pnpm dev -- -p 3000
```

Admin runs on `http://localhost:3000`. Requires the API running on `http://localhost:4000`.

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Ecommerce API (default: `http://localhost:4000`) |

## Architecture

Follows screaming architecture — top-level folders are domain names (`catalog`, `orders`, `categories`, etc.). Components are dumb: they only render what hooks provide. All API calls, state, and business logic live in hooks.
