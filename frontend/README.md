# NOVIS — Frontend-only luxury watch storefront

## Run on Windows
1. Install Node.js LTS if it is not installed.
2. Extract this folder.
3. Open PowerShell in this folder and run `npm install`.
4. Run `npm run dev` and open the local URL printed by Vite.

You do not need to run a backend server. Product, cart, customer, order, contact and admin-demo data are stored in this browser's localStorage. Data is not shared across browsers or devices; clearing browser storage removes the local demo data.

## Admin access
Open `/admin` and enter the configured administrator email and password. Incorrect credentials are rejected, and customer accounts cannot open the dashboard. Admin sessions and customer sessions use separate browser storage keys. The storefront does not display admin records to customer accounts. Since this is a frontend-only demo, the admin gate is not production-secure: users with browser developer tools can inspect or modify local data. Never use real customer information or production secrets here.

## Password reset and assistant
Forgot-password uses a local arithmetic CAPTCHA, then allows a new password to be saved in this browser. No email is sent and this client-side CAPTCHA is not a substitute for server-side identity verification. The NOVIS assistant is an on-site FAQ helper with predefined responses, not a general-purpose AI service; a truly open-ended Meta-AI-style assistant requires an external AI service/API.

## Currency
Watch prices are displayed in Pakistani Rupees (PKR). Starter watch prices are demo prices and can be edited from the local admin dashboard.


## Admin query replies and product prices
- Replies are stored under both `reply` and `adminReply`, so they display consistently after refresh.
- Existing local product records with missing/zero prices are repaired from the bundled catalog when id, slug, or name matches. Valid prices are preserved.
- Admin product editing and display accept `price`, `pricePKR`, `price_pkr`, and `amount` fields and format them as PKR.


Customer logout: signed-in customers now see a LOG OUT control in the storefront navigation. It clears the customer session and returns them to the login screen. On small screens, the logout icon remains visible.

## Netlify deployment and admin route

This project includes `netlify.toml` and `public/_redirects` so direct navigation or refresh at `/admin` is routed back to the React app instead of returning a Netlify 404. Deploy from the project root (the directory containing `package.json`) with build command `npm run build` and publish directory `dist`.

Open the admin area at `/admin`. Frontend-only demo admin credentials: `muttahir@novis.local` / `muttahir123@`. Demo data and sessions are stored in the current browser's localStorage and are not shared between devices.
