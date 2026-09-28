import { useEffect, useState } from 'react';
import { BarChart3, ShoppingBag, Users, Watch, LogOut, Edit3, Trash2, MessageSquare, RefreshCw, X } from 'lucide-react';
import { getAdminDashboard, getAdminOrders, getAdminCustomers, getAdminContacts, replyContact, createProduct, updateProduct, deleteProduct, logout, getProducts, updateAdminOrder } from '../services/api';
import './admin.css';

const money = (value) => `$${Number(value || 0).toLocaleString()}`;
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
  const token = localStorage.getItem('novis-token');

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
      setError('Please add an image URL.');
      return;
    }
    try {
      new URL(productForm.image.trim());
    } catch {
      setError('Image URL is not valid. Please paste a complete image URL.');
      return;
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

  const editProduct = (product) => setProductForm({
    name: product.name || '',
    slug: product.slug || '',
    type: product.type || '',
    size: product.size || '',
    price: product.price ?? '',
    compareAt: product.compareAt ?? '',
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
      await replyContact(token, id, reply.trim());
      setReply('');
      setReplying(null);
      await load();
    } catch (requestError) {
      setError(friendly(requestError));
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
        <button className="admin-logout" onClick={async () => { await logout().catch(() => {}); localStorage.removeItem('novis-token'); onLogout(); }}><LogOut size={16} /> Logout</button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div><span className="admin-kicker">PRIVATE NOVIS CONTROL ROOM</span><h1>{tab === 'dashboard' ? 'Dashboard' : tab[0].toUpperCase() + tab.slice(1)}</h1></div>
          <div className="admin-user">{user?.name}<button onClick={load} aria-label="Refresh"><RefreshCw size={16} /></button></div>
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
                <label>PRICE<input type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} /></label>
                <label>COMPARE PRICE<input type="number" min="0" step="0.01" value={productForm.compareAt} onChange={(e) => setProductForm({ ...productForm, compareAt: e.target.value })} /></label>
                <label>BRAND<input autoComplete="off" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} /></label>
                <label>IMAGE URL<input autoComplete="off" type="url" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="https://example.com/watch.jpg" /></label>
                <label>CATEGORY<select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}><option value="">Select category</option><option value="men">Men</option><option value="women">Women</option><option value="couple">Couple</option><option value="limited">Limited</option></select></label>
                <label>STOCK<input type="number" min="0" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} /></label>
                <label className="full">DESCRIPTION<textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} /></label>
                <label className="full">FEATURES <small>comma separated</small><input value={productForm.features} onChange={(e) => setProductForm({ ...productForm, features: e.target.value })} /></label>
                <div className="image-url-preview full">{productForm.image ? <img src={productForm.image} alt="Preview" onError={(e) => { e.currentTarget.style.display = 'none'; }} onLoad={(e) => { e.currentTarget.style.display = 'block'; }} /> : <span>Image preview will appear here after you paste a valid URL.</span>}</div>
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
                    <strong>{money(product.price)}</strong>
                    <button onClick={() => { setEditing(product.id); editProduct(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="Edit product"><Edit3 size={16} /></button>
                    <button onClick={() => removeProduct(product.id)} aria-label="Archive product"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === 'orders' && <section className="admin-panel"><div className="panel-head"><h2>Order management</h2><span>Pending · Confirmed · Shipped · Delivered · Returned · Rejected</span></div><OrderTable orders={orders} onSave={saveOrder} /></section>}
        {tab === 'customers' && <section className="admin-panel"><div className="panel-head"><h2>Customers</h2></div><div className="admin-list">{customers.map((customer) => <div key={customer.id}><b>{customer.name}</b><span>{customer.email}</span><small>{customer._count.orders} orders</small></div>)}</div></section>}

        {tab === 'messages' && (
          <section className="admin-panel">
            <div className="panel-head"><h2>Contact & query messages</h2><span>Replies appear in the customer's notifications.</span></div>
            <div className="admin-list">
              {contacts.map((contact) => (
                <div className="message-row" key={contact.id}>
                  <b>{contact.subject}</b><span>{contact.name} · {contact.email}</span><p>{contact.message}</p>
                  {contact.adminReply && <small>Current reply: {contact.adminReply}</small>}
                  {replying === contact.id ? (
                    <div className="reply-box">
                      <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your reply…" />
                      <div><button className="gold-btn" onClick={() => sendReply(contact.id)}>SEND REPLY</button><button className="text-btn" onClick={() => setReplying(null)}>CANCEL</button></div>
                    </div>
                  ) : (
                    <button className="text-btn" onClick={() => { setReplying(contact.id); setReply(contact.adminReply || ''); }}>{contact.adminReply ? 'EDIT REPLY' : 'REPLY'}</button>
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

function OrderTable({ orders, onSave }) {
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState('');

  useEffect(() => {
    const next = {};
    orders.forEach((order) => { next[order.id] = order.notes || ''; });
    setDrafts(next);
  }, [orders]);

  const save = async (order) => {
    try {
      setSavingId(order.id);
      await onSave(order.id, order.status, drafts[order.id] || '');
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="order-table">
      <div className="thead"><span>ORDER</span><span>CUSTOMER</span><span>TOTAL</span><span>DATE</span><span>STATUS / COURIER REPLY</span></div>
      {orders.map((order) => (
        <div className="trow" key={order.id}>
          <span>{order.orderNumber}</span>
          <span>{order.customerName}<small>{order.customerEmail}</small></span>
          <span>{money(order.total)}</span>
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          <div className="order-control">
            <select value={order.status} onChange={(e) => onSave(order.id, e.target.value, drafts[order.id] || '')}>
              {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'REJECTED', 'CANCELLED'].map((status) => <option key={status}>{status}</option>)}
            </select>
            <input value={drafts[order.id] || ''} onChange={(e) => setDrafts({ ...drafts, [order.id]: e.target.value })} placeholder="Courier reply / order update" />
            <button className="save-order-btn" disabled={savingId === order.id} onClick={() => save(order)}>{savingId === order.id ? 'SAVING…' : 'SAVE UPDATE'}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
