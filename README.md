# Novis Timepieces

A premium black-and-gold luxury watch e-commerce website built with Next.js, React, TypeScript and Tailwind CSS.

## Included

- Responsive luxury storefront for desktop, tablet and mobile
- Black, champagne-gold visual system with editorial serif typography
- Hero, categories, best sellers, promotional banners, craftsmanship section, testimonials and AI concierge
- Product quick view with gallery, specifications, stock state and quantity controls
- Persistent shopping cart with localStorage
- Customer sign-up, sign-in, protected checkout and account page
- Cash-on-delivery checkout with server-side stock verification
- Automatic stock reduction after successful orders
- Admin authentication
- Admin product creation, editing, soft deletion, stock management and image upload
- Admin order management and invoice generation
- Contact form stored in the local data store
- Streaming AI concierge with a safe local fallback when AI environment variables are not configured
- Usage counters for AI messages and estimated tokens

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and set production credentials before deployment.

```env
AUTH_SECRET="replace-with-a-long-random-secret"
ADMIN_USERNAME="your-admin-username"
ADMIN_PASSWORD="your-strong-admin-password"
AI_API_URL=""
AI_API_KEY=""
AI_MODEL=""
```

If AI variables are empty, the concierge uses the built-in streaming fallback so the UI remains functional.

## Important

The default development data store is `data/store.json`. This is intentionally simple for local/demo deployment. For production-scale commerce, replace it with a transactional database and a real payment provider before accepting live payments.
