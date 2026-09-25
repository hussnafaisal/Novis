# NOVIS corrected build

This build keeps the original Components project styling and applies functionality fixes:

- Cart quantity can never go below 1. Removing an item is separate through the trash button.
- Cart quantity cannot exceed available stock.
- Existing saved cart quantities are normalized so old `0` quantities are corrected.
- Product add/edit/delete APIs have field-level validation and useful error messages.
- Product description requires at least 10 words and reports the exact count.
- Product images, prices, stock, movement and water-resistance validation is shown clearly.
- Admin product deletion now actually removes the product from the local store.
- Admin order/customer status control can change to any valid order status.
- Admin API errors are returned with human-readable messages.
- Admin product forms are responsive on mobile, tablet and desktop.
- Original black/gold default styling and existing white/light theme styling are preserved.

Run:

npm install
npm run dev

For production verification:

npm run build
npm start
