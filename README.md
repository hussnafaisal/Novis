# NOVIS — Luxury Watch Full-Stack Project

This package is the cleaned NOVIS project based on the current project structure and the requested luxury-watch specification.

## What was fixed

- Removed invalid `Facebook` / `Instagram` imports from `lucide-react`.
- Added working inline social SVG icons in the footer.
- Kept `Link` correctly imported from `react-router-dom`.
- Replaced the fragile PostgreSQL-only local setup with SQLite for local development, so a local PostgreSQL server is not required just to start NOVIS.
- Added a local `server/.env` with a SQLite `DATABASE_URL`.
- Added `npm run setup` to generate Prisma, create/update the SQLite database, and seed products/admin.
- Preserved the frontend routes, storefront, cart, auth/reset-password flow, and private admin route.

## Windows quick start

1. Extract this ZIP.
2. Open PowerShell in the extracted folder.
3. Run:

```powershell
npm install
npm run setup
npm run dev
```

Or double-click `RUN-NOVIS.bat`.

## URLs

- Storefront: http://localhost:5173/
- Admin: http://localhost:5173/admin
- API health: http://localhost:4000/api/health

## Admin

Email: `admin@novis.local`

Password: `muttahir123@`

Change this password before production use.

## Password reset

The reset flow does not require the old password. It creates a short-lived reset token and allows the user to set a new password. If SMTP is not configured, the development server prints the reset URL in the server console. Configure SMTP variables in `server/.env` for real email delivery.

## Important

The ZIP intentionally does not contain `node_modules`. Run `npm install` after extraction.
