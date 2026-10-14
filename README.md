# NOVIS — Frontend-only luxury watch store

This version runs without a backend server. Storefront accounts, products, carts, orders, contact messages, and admin edits are stored in the browser's local storage on the current device/browser.

## Run locally on Windows

1. Extract the ZIP.
2. Open PowerShell in the project folder.
3. Run:

```powershell
npm install
npm run dev
```

Or double-click `RUN-NOVIS.bat`.

- Storefront: `http://localhost:5173/`
- Admin panel: `http://localhost:5173/admin`

## Netlify deployment

The root `netlify.toml` is configured for this repository layout:
- Build command: `npm run build`
- Publish directory: `frontend/dist`

If the Netlify UI has custom build settings overriding the file, clear the conflicting override or set the publish directory to `frontend/dist` with the repository root as the base directory.

## Important limitations

This is a frontend-only demo. Local storage is not a shared database and does not sync customer/order data between devices or browsers. Do not use real customer passwords or sensitive personal data in this demo. Real production authentication and secure cross-device persistence require a backend or managed database/auth service.
