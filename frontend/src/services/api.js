import { products as starterProducts } from '../data/products';

const KEYS = {
  products: 'novis-local-products',
  users: 'novis-local-users',
  orders: 'novis-local-orders',
  contacts: 'novis-local-contacts',
  messages: 'novis-local-messages',
  carts: 'novis-local-carts',
  token: 'novis-customer-token',
};
const read = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const initialProducts = () => starterProducts.map((p, i) => ({
  ...p, id: p.id || id(), slug: p.slug || p.id, brand: 'NOVIS', stock: 8 + i,
  active: true, featured: i < 3, compareAt: Math.round(p.price * 1.15),
  images: [p.image], image: p.image, description: p.description || '',
  features: p.features || [], category: p.category || 'men',
}));
function products() {
  const existing = read(KEYS.products, null);
  if (Array.isArray(existing) && existing.length) {
    const starterByKey = new Map();
    starterProducts.forEach((p) => [p.id, p.slug, p.name].filter(Boolean).forEach((key) => starterByKey.set(String(key).toLowerCase(), p)));
    const migrated = existing.map((product) => {
      const p = { ...product };
      const match = [p.id, p.slug, p.name].filter(Boolean).map((key) => starterByKey.get(String(key).toLowerCase())).find(Boolean);
      const parsedPrice = Number(p.price ?? p.pricePKR ?? p.price_pkr ?? p.amount);
      p.price = Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : Number(match?.price || 0);
      const parsedCompare = Number(p.compareAt ?? p.compareAtPrice ?? p.compare_at_price);
      p.compareAt = Number.isFinite(parsedCompare) && parsedCompare > 0 ? parsedCompare : Number(p.price ? Math.round(p.price * 1.15) : 0);
      p.id = p.id || p.slug || match?.id || id();
      p.slug = p.slug || match?.slug || p.id;
      p.image = p.image || p.images?.[0] || match?.image || '';
      p.images = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);
      p.stock = Number.isFinite(Number(p.stock)) ? Number(p.stock) : 0;
      p.active = p.active !== false;
      return p;
    });
    if (JSON.stringify(migrated) !== JSON.stringify(existing)) write(KEYS.products, migrated);
    return migrated;
  }
  const seed = initialProducts(); write(KEYS.products, seed); return seed;
}
const list = key => read(key, []);
const save = (key, value) => write(key, value);
const numeric = (...values) => {
  for (const value of values) {
    const parsed = Number(typeof value === 'string' ? value.replace(/[^0-9.-]/g, '') : value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
};
function itemPrice(item = {}) {
  const product = item.product && typeof item.product === 'object' ? item.product : {};
  return numeric(item.price, item.unitPrice, item.unit_price, item.pricePKR, item.price_pkr, item.amount, product.price, product.pricePKR, product.price_pkr);
}
function itemQuantity(item = {}) {
  return numeric(item.qty, item.quantity, item.count) || 1;
}
function orderItemTotal(items = []) {
  return (Array.isArray(items) ? items : []).reduce((sum, item) => sum + itemPrice(item) * itemQuantity(item), 0);
}
function normalizeOrder(order) {
  const o = { ...order };
  o.id = o.id || o._id || o.orderNumber || id();
  o.orderNumber = o.orderNumber || o.orderNo || o.number || `NV-${String(o.id).slice(-7).toUpperCase()}`;
  const rawItems = Array.isArray(o.items) ? o.items : Array.isArray(o.products) ? o.products : [];
  o.items = rawItems.map((item) => {
    const product = item.product && typeof item.product === 'object' ? item.product : {};
    const price = itemPrice(item);
    const qty = itemQuantity(item);
    return {
      ...item,
      name: item.name || item.productName || item.title || product.name || item.watchName || 'NOVIS Timepiece',
      price: price || 0,
      qty,
      image: item.image || item.images?.[0] || product.image || product.images?.[0] || '',
    };
  });
  o.customerName = o.customerName || (typeof o.customer === 'string' ? o.customer : o.customer?.name) || o.name || o.address?.fullName || o.shippingAddress?.fullName || o.shipping?.name || 'Customer';
  o.customerEmail = o.customerEmail || o.email || o.user?.email || o.customer?.email || '';
  o.customer = o.customerName;
  o.email = o.customerEmail;
  o.total = numeric(o.total, o.totalAmount, o.grandTotal, o.totalPrice, o.amount, o.price) || orderItemTotal(o.items) + (o.giftWrap ? numeric(o.giftWrapAmount) || 2500 : 0);
  o.status = String(o.status || 'PENDING').toUpperCase();
  o.notes = o.notes || o.courierReply || o.adminReply || '';
  o.createdAt = o.createdAt || o.date || o.orderedAt || new Date().toISOString();
  return o;
}
function orders() {
  const existing = list(KEYS.orders);
  const normalized = existing.map(normalizeOrder);
  if (JSON.stringify(existing) !== JSON.stringify(normalized)) save(KEYS.orders, normalized);
  return normalized;
}
function currentUser(token) {
  const actual = token || localStorage.getItem(KEYS.token) || localStorage.getItem('novis-token');
  if (!actual) return null;
  const sessions = read('novis-local-sessions', {});
  if (sessions[actual]) return sessions[actual];
  const legacy = read('novis-local-session', null);
  return legacy?.token === actual ? legacy.user : null;
}
function createSession(user) {
  const authToken = `local-${id()}`;
  const sessions = read('novis-local-sessions', {});
  sessions[authToken] = user; save('novis-local-sessions', sessions);
  save('novis-local-session', { token: authToken, user });
  return authToken;
}
function cartFor(user) {
  const carts = read(KEYS.carts, {});
  return carts[user.id] || [];
}
function saveCart(user, items) {
  const carts = read(KEYS.carts, {}); carts[user.id] = items; save(KEYS.carts, carts);
}
function cartResult(items) { return { cart: { items: items.map(item => ({ ...item, quantity: item.qty || item.quantity || 1 })) } }; }
function normalizeProduct(body) {
  const image = body.image || body.images?.[0] || '';
  return { ...body, id: body.id || body.slug || id(), slug: body.slug || body.id || id(), image, images: body.images || [image], price: Number(body.price || 0), stock: Number(body.stock ?? 0), active: body.active !== false };
}
export async function api(path, { method = 'GET', body, token } = {}) {
  await Promise.resolve();
  const verb = method.toUpperCase();
  const user = currentUser(token);
  const fail = message => { throw new Error(message); };

  if (path === '/products' && verb === 'GET') {
    const all = products().filter(p => p.active !== false);
    const query = path.includes('?') ? path.split('?')[1] : '';
    return { products: all, total: all.length };
  }
  if (path === '/auth/register' && verb === 'POST') {
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '').trim();
    if (name.length < 2) fail('Please enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Enter a valid email address.');
    if (password.length < 8) fail('Password must be at least 8 characters.');
    if (email === 'admin@novis.local' || email === 'muttahir@novis.local') fail('This email cannot be used for customer registration.');
    const users = list(KEYS.users);
    if (users.some(u => String(u.email || '').toLowerCase() === email)) fail('An account with this email already exists. Please sign in instead.');
    const created = { id: id(), name, email, password, role: 'CUSTOMER', createdAt: new Date().toISOString(), profile: { name, email } };
    save(KEYS.users, [...users, created]);
    const session = { id: created.id, name: created.name, email: created.email, role: created.role };
    const authToken = createSession(session);
    return { token: authToken, user: session, message: 'Account created successfully.' };
  }
  if (path === '/auth/login' && verb === 'POST') {
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '').trim();
    if (!email || !password) fail('Enter your email address and password.');

    // The local demo has one reserved admin identity. It is never created through customer sign-up.
    const isReservedAdminEmail = email === 'admin@novis.local' || email === 'muttahir@novis.local';
    let found = null;
    if (isReservedAdminEmail) {
      const accepted = password === 'muttahir123@';
      if (!accepted) fail('Email or password is incorrect.');
      found = { id: 'novis-admin', name: 'NOVIS Admin', email, role: 'ADMIN' };
      const users = list(KEYS.users).filter(u => u.role !== 'ADMIN');
      save(KEYS.users, [...users, { ...found, password, createdAt: new Date().toISOString() }]);
    } else {
      found = list(KEYS.users).find(u => u.role !== 'ADMIN' && String(u.email || '').toLowerCase() === email && String(u.password || '').trim() === password);
    }
    if (!found) fail('Email or password is incorrect.');
    const safeUser = { id: found.id, name: found.name, email: found.email, role: found.role };
    const authToken = createSession(safeUser);
    return { token: authToken, user: safeUser };
  }
  if (path === '/auth/me' && verb === 'GET') {
    if (!user) fail('Please sign in to continue.');
    return { user };
  }
  if (path === '/auth/logout' && verb === 'POST') {
    const actual = token || localStorage.getItem(KEYS.token) || localStorage.getItem('novis-token');
    const sessions = read('novis-local-sessions', {}); if (actual) delete sessions[actual]; save('novis-local-sessions', sessions);
    if (actual === localStorage.getItem(KEYS.token)) localStorage.removeItem(KEYS.token);
    if (actual === localStorage.getItem('novis-admin-token')) localStorage.removeItem('novis-admin-token');
    localStorage.removeItem('novis-token'); return { message: 'Signed out.' };
  }
  if (path === '/auth/forgot-password' && verb === 'POST') {
    const email = String(body?.email || '').trim().toLowerCase();
    const found = list(KEYS.users).some(u => String(u.email || '').toLowerCase() === email && u.role !== 'ADMIN');
    return { exists: found, message: found ? 'Account found. Complete the new password fields below.' : 'No customer account was found with this email.' };
  }
  if (path === '/auth/reset-password' && verb === 'POST') {
    const email = String(body?.email || '').trim().toLowerCase();
    const users = list(KEYS.users); const found = users.find(u => String(u.email || '').toLowerCase() === email && u.role !== 'ADMIN');
    if (!found) fail('No customer account was found with this email.');
    if (String(body?.password || '').length < 8) fail('Password must be at least 8 characters.');
    save(KEYS.users, users.map(u => u.id === found.id ? { ...u, password: body.password, passwordUpdatedAt: new Date().toISOString() } : u));
    return { message: 'Password updated successfully. You can now sign in with your new password.' };
  }
  if (path === '/cart' && verb === 'GET') { if (!user) fail('Please sign in.'); return cartResult(cartFor(user)); }
  if (path === '/cart/items' && verb === 'POST') {
    if (!user) fail('Please sign in to sync your bag.');
    const itemProduct = products().find(p => p.id === body.productId);
    if (!itemProduct) fail('This timepiece is no longer available.');
    const items = cartFor(user); const found = items.find(i => i.id === itemProduct.id);
    const next = found ? items.map(i => i.id === itemProduct.id ? { ...i, qty: i.qty + Number(body.quantity || 1) } : i) : [...items, { ...itemProduct, qty: Number(body.quantity || 1) }];
    saveCart(user, next); return cartResult(next);
  }
  const cartMatch = path.match(/^\/cart\/items\/([^/]+)$/);
  if (cartMatch && user) {
    const items = cartFor(user);
    const next = verb === 'DELETE' ? items.filter(i => i.id !== cartMatch[1]) : items.map(i => i.id === cartMatch[1] ? { ...i, qty: Number(body?.quantity || 1) } : i);
    saveCart(user, next); return cartResult(next);
  }
  if (path === '/orders' && verb === 'POST') {
    if (!user) fail('Please sign in before placing an order.');
    const items = Array.isArray(body?.items) && body.items.length ? body.items : cartFor(user);
    if (!items.length) fail('Your bag is empty. Add a timepiece before placing an order.');
    const subtotal = orderItemTotal(items);
    const giftWrap = Boolean(body?.giftWrap);
    const order = normalizeOrder({
      id: id(), orderNumber: `NV-${Date.now().toString().slice(-7)}`, userId: user.id,
      customer: user.name, customerName: user.name, email: user.email, customerEmail: user.email,
      items: items.map(item => ({ ...item, qty: Number(item.qty || item.quantity || 1) })),
      subtotal, giftWrap, giftWrapAmount: giftWrap ? 2500 : 0, total: subtotal + (giftWrap ? 2500 : 0),
      status: 'PENDING', address: body.address || {}, notes: '', createdAt: new Date().toISOString(),
    });
    save(KEYS.orders, [order, ...orders()]); saveCart(user, []);
    return { order, message: 'Your order has been placed.' };
  }
  if (path === '/orders/mine' && verb === 'GET') return { orders: orders().filter(o => o.userId === user?.id) };
  if (path === '/content/contact' && verb === 'POST') {
    const contact = { id: id(), ...body, userId: user?.id || null, status: 'new', createdAt: new Date().toISOString() };
    save(KEYS.contacts, [contact, ...list(KEYS.contacts)]); return { message: 'Message saved on this device.' };
  }
  if (path === '/content/my-messages' && verb === 'GET') return { messages: list(KEYS.contacts).filter(c => c.userId === user?.id || c.email === user?.email) };
  if (path === '/admin/dashboard' && verb === 'GET') {
    if (user?.role !== 'ADMIN') fail('Admin access required.');
    const allOrders = orders(), users = list(KEYS.users), ps = products();
    return { stats: { totalOrders: allOrders.length, totalRevenue: allOrders.reduce((n, o) => n + numeric(o.total), 0), totalCustomers: users.filter(u => u.role !== 'ADMIN').length, totalProducts: ps.length } };
  }
  if (path === '/orders' && verb === 'GET') { if (user?.role !== 'ADMIN') fail('Admin access required.'); return { orders: orders() }; }
  if (path === '/admin/customers' && verb === 'GET') {
    if (user?.role !== 'ADMIN') fail('Admin access required.');
    const allOrders = orders();
    const customers = list(KEYS.users).filter(u => u.role !== 'ADMIN').map(({ password, ...customer }) => {
      const customerOrders = allOrders.filter(o => o.userId === customer.id || (customer.email && String(o.customerEmail || o.email || '').toLowerCase() === String(customer.email).toLowerCase()));
      return { ...customer, orderCount: customerOrders.length, totalSpent: customerOrders.reduce((sum, order) => sum + numeric(order.total), 0), orders: customerOrders };
    });
    return { customers };
  }
  if (path === '/admin/contacts' && verb === 'GET') { if (user?.role !== 'ADMIN') fail('Admin access required.'); return { messages: list(KEYS.contacts) }; }
  const contactMatch = path.match(/^\/admin\/contacts\/([^/]+)$/);
  if (contactMatch && verb === 'PATCH') {
    if (user?.role !== 'ADMIN') fail('Admin access required.');
    const messages = list(KEYS.contacts).map(c => c.id === contactMatch[1] ? { ...c, reply: String(body?.reply || '').trim(), adminReply: String(body?.reply || '').trim(), status: 'replied', repliedAt: new Date().toISOString() } : c);
    save(KEYS.contacts, messages); return { message: 'Reply saved locally.' };
  }
  if (path === '/products' && verb === 'POST') {
    if (user?.role !== 'ADMIN') fail('Admin access required.');
    const p = normalizeProduct(body); const ps = products(); if (ps.some(x => x.slug === p.slug)) fail('A product with this slug already exists.');
    save(KEYS.products, [p, ...ps]); return { product: p };
  }
  const productMatch = path.match(/^\/products\/([^/]+)$/);
  if (productMatch && (verb === 'PUT' || verb === 'DELETE')) {
    if (user?.role !== 'ADMIN') fail('Admin access required.');
    const ps = products();
    if (verb === 'DELETE') { save(KEYS.products, ps.map(p => p.id === productMatch[1] ? { ...p, active: false } : p)); return { message: 'Product archived.' }; }
    const updated = ps.map(p => p.id === productMatch[1] ? normalizeProduct({ ...p, ...body, id: p.id }) : p);
    save(KEYS.products, updated); return { product: updated.find(p => p.id === productMatch[1]) };
  }
  const orderMatch = path.match(/^\/admin\/orders\/([^/]+)$/);
  if (orderMatch && (verb === 'PATCH' || verb === 'PUT')) {
    if (user?.role !== 'ADMIN') fail('Admin access required.');
    const updatedOrders = orders().map(o => o.id === orderMatch[1] ? normalizeOrder({ ...o, ...body, status: String(body?.status || o.status).toUpperCase() }) : o);
    save(KEYS.orders, updatedOrders); return { order: updatedOrders.find(o => o.id === orderMatch[1]) };
  }
  if (path.startsWith('/payments/')) fail('Online payment needs a payment provider. This frontend-only demo can save orders locally but cannot process real card payments.');
  return { message: 'This feature is not available in frontend-only mode.' };
}
export const getProducts = (params = '') => api(`/products${params ? `?${params}` : ''}`);
export const login = body => api('/auth/login', { method: 'POST', body });
export const register = body => api('/auth/register', { method: 'POST', body });
export const getMe = () => api('/auth/me');
export const logout = token => api('/auth/logout', { method: 'POST', token });
export const getCart = token => api('/cart', { token });
export const addCart = (token, productId, quantity = 1) => api('/cart/items', { method: 'POST', token, body: { productId, quantity } });
export const updateCart = (token, productId, quantity) => api(`/cart/items/${productId}`, { method: 'PATCH', token, body: { quantity } });
export const removeCart = (token, productId) => api(`/cart/items/${productId}`, { method: 'DELETE', token });
export const createOrder = (token, body) => api('/orders', { method: 'POST', token, body });
export const getMyOrders = token => api('/orders/mine', { token });
export const getMyMessages = token => api('/content/my-messages', { token });
export const getAdminDashboard = token => api('/admin/dashboard', { token });
export const getAdminOrders = token => api('/orders', { token });
export const updateOrderStatus = (token, id, status) => api(`/orders/${id}/status`, { method: 'PATCH', token, body: { status } });
export const getAdminCustomers = token => api('/admin/customers', { token });
export const createStripeCheckout = (token, orderId) => api('/payments/stripe/checkout', { method: 'POST', token, body: { orderId } });
export const getAdminContacts = token => api('/admin/contacts', { token });
export const replyContact = (token, id, reply) => api(`/admin/contacts/${id}`, { method: 'PATCH', token, body: { reply } });
export const createProduct = (token, body) => api('/products', { method: 'POST', token, body });
export const updateProduct = (token, id, body) => api(`/products/${id}`, { method: 'PUT', token, body });
export const deleteProduct = (token, id) => api(`/products/${id}`, { method: 'DELETE', token });
export const updateAdminOrder = (token, id, body) => api(`/admin/orders/${id}`, { method: 'PATCH', token, body });
