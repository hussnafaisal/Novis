import { useEffect, useState } from 'react';
import { BarChart3, ShoppingBag, Users, Watch, LogOut, Edit3, Trash2, MessageSquare, RefreshCw, X } from 'lucide-react';
import { getAdminDashboard, getAdminOrders, getAdminCustomers, getAdminContacts, replyContact, createProduct, updateProduct, deleteProduct, logout, getProducts, updateAdminOrder } from '../services/api';
import '../lib/money.js';
import { money } from '../lib/money.js';
import './admin.css';
const blankProduct = () => ({
  name: '', slug: '', type: '', size: '', price: '', compareAt: '', category: '', brand: '', description: '', features: '', image: '', stock: '', active: true,
});

function friendly(error) {
  return error?.message || 'Something went wrong. Please try again.';
}

export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [dash, setDash] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productForm, setProductForm] = useState(blankProduct());
  const [editing, setEditing] = useState(null);
  const [replying, setReplying] = useState(null);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const token = localStorage.getItem('novis-admin-token');

  async function load() {
    try {
      setLoading(true);
      const [dashboard, adminOrders, customerData, messageData, productData] = await Promise.all([
        getAdminDashboard(token),
        getAdminOrders(token),
        getAdminCustomers(token),
        getAdminContacts(token),
        getProducts(),
      ]);
      setDash(dashboard);
      setOrders(adminOrders.orders || []);
      setCustomers(customerData.customers || []);
      setContacts(messageData.messages || []);
      setProducts(productData.products || []);
      setError('');
    } catch (requestError) {
      setError(friendly(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const saveProduct = async (event) => {
    event.preventDefault();
    setError('');
    if (!productForm.name.trim() || !productForm.slug.trim() || !productForm.type.trim() || !productForm.size.trim()) {
      setError('Please complete the product name, slug, type and size.');
      return;
    }
    if (!productForm.image.trim()) {
      setError('Please upload a product image or enter an image URL.');
      return;
    }
    if (!productForm.image.startsWith('data:image/')) {
      try {
        const imageUrl = new URL(productForm.image.trim());
        if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new Error('Unsupported image URL');
      } catch {
        setError('Please upload a valid image or enter a complete HTTP/HTTPS image URL.');
        return;
      }
    }
    if (Number(productForm.price) < 0 || Number(productForm.stock) < 0) {
      setError('Price and stock cannot be negative.');
      return;
    }

    try {
      setSaving(true);
      const body = {
        ...productForm,
        name: productForm.name.trim(),
        slug: productForm.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        type: productForm.type.trim(),
        size: productForm.size.trim(),
        brand: productForm.brand.trim() || undefined,
        price: Number(productForm.price),
        compareAt: productForm.compareAt === '' ? undefined : Number(productForm.compareAt),
        stock: Number(productForm.stock || 0),
        features: String(productForm.features).split(',').map((item) => item.trim()).filter(Boolean),
        images: [productForm.image.trim()],
        active: true,
      };

      if (editing) await updateProduct(token, editing, body);
      else await createProduct(token, { ...body, id: body.slug });

      setEditing(null);
      setProductForm(blankProduct());
      await load();
    } catch (requestError) {
      setError(friendly(requestError));
    } finally {
      setSaving(false);
    }
  };

  const uploadProductImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProductForm((current) => ({ ...current, image: reader.result }));
        setError('');
      } else setError('Could not read this image. Please try another file.');
    };
    reader.onerror = () => setError('Could not read this image. Please try another file.');
    reader.readAsDataURL(file);
  };

  const editProduct = (product) => setProductForm({
    name: product.name || '',
    slug: product.slug || '',
    type: product.type || '',
    size: product.size || '',
    price: product.price ?? product.pricePKR ?? product.price_pkr ?? product.amount ?? '',
    compareAt: product.compareAt ?? product.compareAtPrice ?? product.compare_at_price ?? '',
    category: product.category || '',
    brand: product.brand || '',
    description: product.description || '',
    features: (product.features || []).join(', '),
    image: product.image || product.images?.[0] || '',
    stock: product.stock ?? '',
    active: product.active !== false,
  });

  const removeProduct = async (id) => {
    if (!window.confirm('Archive this product from the storefront?')) return;
    try {
      await deleteProduct(token, id);
      await load();
    } catch (requestError) {
      setError(friendly(requestError));
    }
  };

  const sendReply = async (id) => {
    if (!reply.trim()) {
      setError('Please write a reply before sending.');
      return;
    }
    try {
      setSendingReply(true);
      await replyContact(token, id, reply.trim());
      setReply('');
      setReplying(null);
      await load();
    } catch (requestError) {
      setError(friendly(requestError));
    } finally {
      setSendingReply(false);
    }
  };

  const saveOrder = async (id, status, notes) => {
    try {
      await updateAdminOrder(token, id, { status, notes });
      await load();
      window.dispatchEvent(new CustomEvent('novis-order-updated'));
    } catch (requestError) {
      setError(friendly(requestError));
    }
  };

  const handleLogout = async () => {
    const adminToken = localStorage.getItem('novis-admin-token');
    await logout(adminToken).catch(() => {});
    localStorage.removeItem('novis-admin-token');
    localStorage.removeItem('novis-local-session');
    onLogout();
  };

  if (loading && !dash) return <div className="admin-shell"><div className="admin-loading">Loading NOVIS control room…</div></div>;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo"><strong>NOVIS</strong><small>ADMIN CONTROL</small></div>
        <nav>
          {[['dashboard', 'Dashboard', BarChart3], ['products', 'Products', Watch], ['orders', 'Orders', ShoppingBag], ['customers', 'Customers', Users], ['messages', 'Queries', MessageSquare]].map(([value, label, Icon]) => (
            <button className={tab === value ? 'active' : ''} onClick={() => setTab(value)} key={value}><Icon size={17} />{label}</button>
          ))}
        </nav>
        <button className="admin-logout" onClick={handleLogout}><LogOut size={16} /> <span>Logout</span></button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div><span className="admin-kicker">PRIVATE NOVIS CONTROL ROOM</span><h1>{tab === 'dashboard' ? 'Dashboard' : tab[0].toUpperCase() + tab.slice(1)}</h1></div>
          <div className="admin-header-actions"><div className="admin-user">{user?.name || 'Administrator'}<button onClick={load} aria-label="Refresh" title="Refresh data"><RefreshCw size={16} /></button></div><button className="header-logout" onClick={handleLogout}><LogOut size={15} /> LOG OUT</button></div>
        </header>
        {error && <div className="admin-error">{error}</div>}

        {tab === 'dashboard' && dash && (
          <>
            <div className="stat-grid">
              {[[ShoppingBag, 'Total Orders', dash.stats.totalOrders], [BarChart3, 'Revenue', money(dash.stats.totalRevenue)], [Users, 'Customers', dash.stats.totalCustomers], [Watch, 'Products', dash.stats.totalProducts]].map(([Icon, label, value]) => (
                <div className="stat" key={label}><Icon /><span>{label}</span><strong>{value}</strong></div>
              ))}
            </div>
            <section className="admin-panel"><div className="panel-head"><h2>Recent orders</h2></div><OrderTable orders={orders.slice(0, 10)} onSave={saveOrder} /></section>
          </>
        )}

        {tab === 'products' && (
          <>
            <section className="admin-panel">
              <div className="panel-head"><h2>{editing ? 'Edit product' : 'Add product'}</h2><button className="admin-icon-btn" type="button" onClick={() => { setEditing(null); setProductForm(blankProduct()); }}><X size={17} /></button></div>
              <form className="product-form" onSubmit={saveProduct} autoComplete="off">
                <label>NAME<input autoComplete="off" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></label>
                <label>SLUG<input autoComplete="off" value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} /></label>
                <label>TYPE<input autoComplete="off" value={productForm.type} onChange={(e) => setProductForm({ ...productForm, type: e.target.value })} placeholder="Automatic / Quartz" /></label>
                <label>SIZE<input autoComplete="off" value={productForm.size} onChange={(e) => setProductForm({ ...productForm, size: e.target.value })} placeholder="40mm" /></label>
                <label>PRICE (PKR)<input type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} /></label>
                <label>COMPARE PRICE<input type="number" min="0" step="0.01" value={productForm.compareAt} onChange={(e) => setProductForm({ ...productForm, compareAt: e.target.value })} /></label>
                <label>BRAND<input autoComplete="off" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} /></label>
                <label>IMAGE URL<input autoComplete="off" type="text" value={productForm.image.startsWith('data:image/') ? '' : productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="Paste image URL or upload below" /></label>
                <label>UPLOAD PRODUCT IMAGE<input type="file" accept="image/*" onChange={uploadProductImage} /><small>No app-imposed file-size limit. Very large files may still exceed browser storage limits.</small></label>
                <label>CATEGORY<select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}><option value="">Select category</option><option value="men">Men</option><option value="women">Women</option><option value="couple">Couple</option><option value="limited">Limited</option></select></label>
                <label>STOCK<input type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} /></label>
                <label className="full">DESCRIPTION<textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} /></label>
                <label className="full">FEATURES <small>comma separated</small><input value={productForm.features} onChange={(e) => setProductForm({ ...productForm, features: e.target.value })} /></label>
                <div className="image-url-preview full">{productForm.image ? <><img src={productForm.image} alt="Product preview" onError={(e) => { e.currentTarget.style.display = 'none'; }} onLoad={(e) => { e.currentTarget.style.display = 'block'; }} /><button className="text-btn" type="button" onClick={() => setProductForm({ ...productForm, image: '' })}>REMOVE IMAGE</button></> : <span>Product image preview will appear here after you paste a URL or upload an image.</span>}</div>
                <button className="gold-btn full" type="submit" disabled={saving}>{saving ? 'SAVING…' : editing ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}</button>
              </form>
            </section>

            <section className="admin-panel">
              <div className="panel-head"><h2>Store products</h2><span>Image URL · any image dimensions supported</span></div>
              <div className="admin-product-list">
                {products.map((product) => (
                  <div className="admin-product" key={product.id}>
                    <img src={product.image || product.images?.[0]} alt="" />
                    <div><b>{product.name}</b><small>{product.brand || 'NOVIS'} · {product.category || 'Uncategorised'} · Stock {product.stock}</small></div>
                    <strong>{money(Number(product.price ?? product.pricePKR ?? product.price_pkr ?? product.amount) || 0)}</strong>
                    <button onClick={() => { setEditing(product.id); editProduct(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Edit product"><Edit3 size={16} /></button>
                    <button onClick={() => removeProduct(product.id)} aria-label="Archive product"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === 'orders' && <OrderManagement orders={orders} onSave={saveOrder} />}
        {tab === 'customers' && <section className="admin-panel"><div className="panel-head"><h2>Customers</h2></div><div className="admin-list">{customers.length ? customers.map((customer) => <div key={customer.id || customer.email}><b>{customer.name || customer.profile?.name || 'Customer'}</b><span>{customer.email || customer.profile?.email || 'No email'}</span><small>{Number(customer.orderCount ?? customer._count?.orders ?? customer.orders?.length ?? 0)} orders · {money(customer.totalSpent || 0)} spent</small></div>) : <p className="admin-empty">No customer accounts yet. Customers will appear here after registering on the storefront.</p>}</div></section>}

        {tab === 'messages' && (
          <section className="admin-panel">
            <div className="panel-head"><h2>Contact & query messages</h2><span>Replies appear in the customer's notifications.</span></div>
            <div className="admin-list">
              {contacts.map((contact) => (
                <div className="message-row" key={contact.id}>
                  <b>{contact.subject}</b><span>{contact.name} · {contact.email}</span><p>{contact.message}</p>
                  {(contact.adminReply || contact.reply) && <small>Current reply: {contact.adminReply || contact.reply}</small>}
                  {replying === contact.id ? (
                    <div className="reply-box">
                      <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your reply…" />
                      <div><button className="gold-btn" type="button" disabled={sendingReply} onClick={() => sendReply(contact.id)}>{sendingReply ? 'SENDING…' : 'SEND REPLY'}</button><button className="text-btn" onClick={() => setReplying(null)}>CANCEL</button></div>
                    </div>
                  ) : (
                    <button className="text-btn" onClick={() => { setReplying(contact.id); setReply(contact.adminReply || contact.reply || ''); }}>{contact.adminReply ? 'EDIT REPLY' : 'REPLY'}</button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'REJECTED', 'CANCELLED'];

function OrderManagement({ orders, onSave }) {
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const counts = ORDER_STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((order) => String(order.status || 'PENDING').toUpperCase() === status).length;
    return acc;
  }, {});
  const visibleOrders = selectedStatus === 'ALL'
    ? orders
    : orders.filter((order) => String(order.status || 'PENDING').toUpperCase() === selectedStatus);

  return (
    <section className="admin-panel order-management-panel">
      <div className="panel-head"><div><h2>Order management</h2><p className="panel-subtitle">Orders are sorted into the status selected for each order.</p></div><span>{orders.length} total orders</span></div>
      <div className="order-status-filters">
        <button className={selectedStatus === 'ALL' ? 'selected' : ''} onClick={() => setSelectedStatus('ALL')}>ALL <b>{orders.length}</b></button>
        {ORDER_STATUSES.map((status) => <button key={status} className={`${selectedStatus === status ? 'selected' : ''} status-${status.toLowerCase()}`} onClick={() => setSelectedStatus(status)}>{status} <b>{counts[status]}</b></button>)}
      </div>
      {selectedStatus !== 'ALL' && <div className="status-section-heading"><span className={`status-dot status-dot-${selectedStatus.toLowerCase()}`} /><h3>{selectedStatus} ORDERS</h3><span>{visibleOrders.length} order{visibleOrders.length === 1 ? '' : 's'}</span></div>}
      {visibleOrders.length ? <OrderTable orders={visibleOrders} onSave={onSave} showItems /> : <div className="admin-empty">No {selectedStatus === 'ALL' ? '' : selectedStatus.toLowerCase() + ' '}orders in this section yet. When an order status is updated, it will appear here.</div>}
    </section>
  );
}

function OrderTable({ orders, onSave, showItems = false }) {
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const next = {};
    orders.forEach((order) => { next[order.id] = order.notes || order.courierReply || order.adminReply || ''; });
    setDrafts((current) => ({ ...next, ...current }));
  }, [orders]);

  const save = async (order) => {
    try {
      setSavingId(order.id);
      await onSave(order.id, order.status, drafts[order.id] || '');
    } finally {
      setSavingId('');
    }
  };

  const itemDetails = (item) => {
    const product = item.product && typeof item.product === 'object' ? item.product : {};
    const name = item.name || item.productName || item.title || product.name || item.watchName || 'NOVIS Timepiece';
    const priceRaw = item.price ?? item.unitPrice ?? item.unit_price ?? item.pricePKR ?? item.price_pkr ?? item.amount ?? product.price ?? product.pricePKR ?? product.price_pkr ?? 0;
    const price = Number(String(priceRaw).replace(/[^0-9.-]/g, '')) || 0;
    const qty = Math.max(1, Number(item.qty ?? item.quantity ?? item.count ?? 1) || 1);
    return { name, price, qty, lineTotal: price * qty, image: item.image || item.images?.[0] || product.image || product.images?.[0] || '' };
  };

  const totalFor = (order) => {
    const saved = Number(order.total ?? order.totalAmount ?? order.grandTotal ?? order.totalPrice ?? order.amount ?? 0);
    const itemTotal = (Array.isArray(order.items) ? order.items : []).reduce((sum, item) => sum + itemDetails(item).lineTotal, 0);
    return saved > 0 ? saved : itemTotal + (order.giftWrap ? Number(order.giftWrapAmount || 2500) : 0);
  };

  return (
    <div className="order-table">
      <div className="thead"><span>ORDER</span><span>CUSTOMER</span><span>TOTAL</span><span>DATE</span><span>STATUS / COURIER REPLY</span></div>
      {orders.map((order) => {
        const items = Array.isArray(order.items) ? order.items : Array.isArray(order.products) ? order.products : [];
        const isExpanded = Boolean(expanded[order.id]);
        return (
          <div className="order-record" key={order.id}>
            <div className="trow">
              <span><b>{order.orderNumber || order.orderNo || order.id}</b>{showItems && <button className="view-items-btn" onClick={() => setExpanded((prev) => ({ ...prev, [order.id]: !prev[order.id] }))}>{isExpanded ? 'HIDE ITEMS' : `VIEW ITEMS (${items.length})`}</button>}</span>
              <span>{order.customerName || order.customer || order.address?.fullName || order.shippingAddress?.fullName || 'Customer'}<small>{order.customerEmail || order.email || ''}</small></span>
              <span className="order-total">{money(totalFor(order))}</span>
              <span>{Number.isNaN(new Date(order.createdAt || order.date || order.orderedAt).getTime()) ? '—' : new Date(order.createdAt || order.date || order.orderedAt).toLocaleDateString()}</span>
              <div className="order-control">
                <select aria-label={`Status for ${order.orderNumber || order.id}`} value={String(order.status || 'PENDING').toUpperCase()} onChange={(e) => onSave(order.id, e.target.value, drafts[order.id] || '')}>
                  {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <input value={drafts[order.id] || ''} onChange={(e) => setDrafts({ ...drafts, [order.id]: e.target.value })} placeholder="Courier reply / order update" />
                <button className="save-order-btn" disabled={savingId === order.id} onClick={() => save(order)}>{savingId === order.id ? 'SAVING…' : 'SAVE UPDATE'}</button>
              </div>
            </div>
            {showItems && isExpanded && <div className="order-items-breakdown">
              <div className="items-breakdown-title">ITEMS IN THIS ORDER</div>
              {items.length ? items.map((item, index) => {
                const detail = itemDetails(item);
                return <div className="order-item-line" key={`${order.id}-${item.id || item.productId || index}`}>
                  {detail.image ? <img src={detail.image} alt="" /> : <div className="order-item-placeholder"><Watch size={18} /></div>}
                  <div className="order-item-name"><b>{detail.name}</b><small>Qty: {detail.qty}</small></div>
                  <div><small>UNIT PRICE</small><b>{money(detail.price)}</b></div>
                  <div><small>LINE TOTAL</small><b>{money(detail.lineTotal)}</b></div>
                </div>;
              }) : <p className="admin-empty">This older order has no saved product line items.</p>}
              <div className="order-breakdown-footer"><span>{order.giftWrap ? 'Gift wrap' : 'Items subtotal'}</span><b>{money(items.reduce((sum, item) => sum + itemDetails(item).lineTotal, 0))}</b></div>
              {order.giftWrap && <div className="order-breakdown-footer"><span>Gift wrap charge</span><b>{money(order.giftWrapAmount || 2500)}</b></div>}
              <div className="order-breakdown-footer grand"><span>ORDER TOTAL</span><b>{money(totalFor(order))}</b></div>
            </div>}
          </div>
        );
      })}
    </div>
  );
}
