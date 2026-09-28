import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Collection from './components/Collection';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Craft from './components/Craft';
import Journal from './components/Journal';
import Movement from './components/Movement';
import Materials from './components/Materials';
import Story from './components/Story';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import MobileMenu from './components/MobileMenu';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import Notifications from './components/Notifications';
import AdminDashboard from './admin/AdminDashboard';
import { api, getProducts, getCart, addCart, updateCart, removeCart, login, logout } from './services/api';
import './styles/globals.css';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('NOVIS UI error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="friendly-error">
          <div>
            <span className="eyebrow">NOVIS</span>
            <h1>Something went wrong.</h1>
            <p>We could not load this section correctly. Please refresh the page and try again.</p>
            <button className="lux-btn gold" onClick={() => window.location.reload()}>
              REFRESH PAGE
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Loader() {
  return (
    <div className="app-loader" role="status" aria-label="Loading NOVIS">
      <div className="watch-loader">
        <div className="loader-crown" />
        <div className="loader-hand h1" />
        <div className="loader-hand h2" />
        <div className="loader-center" />
      </div>
      <div className="loader-logo">
        NOVIS
        <span>TIMEPIECES</span>
      </div>
      <div className="loader-progress"><span /></div>
    </div>
  );
}

function StaticPage({ title, eyebrow, children }) {
  return (
    <div className="static-page">
      <div className="static-hero">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <div className="static-content">{children}</div>
    </div>
  );
}

function Contact({ token }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      await api('/content/contact', { method: 'POST', body: form, token });
      setMsg('Thank you. Your message has been sent to NOVIS.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setMsg(error?.message || 'We could not send your message. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <StaticPage title="Contact NOVIS" eyebrow="GET IN TOUCH">
      <div className="contact-grid">
        <div>
          <h2>We are here to help.</h2>
          <p>For product questions, order support, private appointments or general enquiries, send us a message. Your enquiry is delivered directly to the NOVIS administration team.</p>
          <div className="contact-info">
            <span>EMAIL</span><b>hello@novis.com</b>
            <span>HOURS</span><b>Mon–Sat · 10:00–18:00</b>
          </div>
        </div>
        <form className="lux-form" onSubmit={submit}>
          <label>NAME<input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>EMAIL<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>SUBJECT<input required minLength={2} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></label>
          <label>MESSAGE<textarea required minLength={5} rows="7" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label>
          <button className="lux-btn gold" disabled={busy}>{busy ? 'SENDING…' : 'SEND MESSAGE'}</button>
          {msg && <small className="form-msg">{msg}</small>}
        </form>
      </div>
    </StaticPage>
  );
}

function Policy({ type }) {
  const data = {
    refund: ['Refund & Return Policy', 'We want every NOVIS purchase to feel considered. Eligible returns should be requested within the period stated on your order documentation. Items must be unused, complete and returned in their original condition. Approved refunds are processed after inspection.'],
    terms: ['Terms & Conditions', 'Use of this website means you agree to use the service lawfully and provide accurate account and order information. Product availability, pricing and delivery estimates may change.'],
    privacy: ['Privacy Policy', 'NOVIS uses account, order and enquiry information to provide the services you request. We do not needlessly expose customer information and access to administration data is restricted by role.'],
  }[type];

  return (
    <StaticPage title={data[0]} eyebrow="NOVIS POLICY">
      <article className="policy-copy">
        <h2>{data[0]}</h2>
        <p>{data[1]}</p>
        <h3>Information & support</h3>
        <p>For questions about this policy, please use the Contact page and include the order or account email where relevant.</p>
      </article>
    </StaticPage>
  );
}

function ProductPage({ products, onAdd }) {
  const location = useLocation();
  const slug = location.pathname.split('/').pop();
  const product = products.find((p) => p.slug === slug) || products.find((p) => p.id === slug);

  if (!product) {
    return <StaticPage title="Piece not found" eyebrow="NOVIS"><p>The requested timepiece is unavailable.</p></StaticPage>;
  }

  return <ProductDetail product={product} onAdd={onAdd} />;
}

function CollectionRoute({ common }) {
  const location = useLocation();
  const kind = location.pathname.split('/').pop() || 'all';
  return <Collection {...common} initialCategory={kind} />;
}

function Storefront() {
  const [theme, setTheme] = useState(() => localStorage.getItem('novis-theme') || 'dark');
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('novis-guest-cart') || '[]');
    } catch {
      return [];
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('novis-token') || '');
  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [boot, setBoot] = useState(true);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('novis-theme', theme);
  }, [theme]);

  useEffect(() => {
    let alive = true;
    const minimum = new Promise((resolve) => setTimeout(resolve, 1000));

    Promise.all([getProducts(), minimum])
      .then(([data]) => {
        if (alive) {
          setProducts((data.products || []).map((p) => ({
            ...p,
            image: p.image || p.images?.[0] || '',
          })));
        }
      })
      .catch((error) => {
        console.error('NOVIS products:', error);
        if (alive) setProducts([]);
      })
      .finally(() => {
        if (alive) setBoot(false);
      });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const onToast = (event) => {
      setToast(String(event.detail || 'Something went wrong.'));
      window.clearTimeout(window.__novisToastTimer);
      window.__novisToastTimer = window.setTimeout(() => setToast(''), 3500);
    };
    window.addEventListener('novis-toast', onToast);
    return () => window.removeEventListener('novis-toast', onToast);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return undefined;
    }

    let alive = true;
    Promise.all([
      api('/auth/me', { token }),
      getCart(token),
    ])
      .then(([me, cartData]) => {
        if (!alive) return;
        setUser(me.user);
        setItems((cartData.cart?.items || []).map((item) => ({ ...item, qty: item.quantity })));
      })
      .catch(() => {
        if (!alive) return;
        localStorage.removeItem('novis-token');
        setToken('');
        setUser(null);
      });

    return () => { alive = false; };
  }, [token]);

  useEffect(() => {
    if (!token) localStorage.setItem('novis-guest-cart', JSON.stringify(items));
  }, [items, token]);

  const count = items.reduce((sum, item) => sum + Number(item.qty || item.quantity || 0), 0);

  const add = async (product) => {
    try {
      if (Number(product.stock || 0) <= 0) {
        throw new Error('This timepiece is currently out of stock.');
      }

      if (token) {
        const { cart } = await addCart(token, product.id, 1);
        setItems((cart.items || []).map((item) => ({ ...item, qty: item.quantity })));
      } else {
        setItems((previous) => {
          const existing = previous.find((item) => item.id === product.id);
          if (existing) return previous.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
          return [...previous, { ...product, qty: 1 }];
        });
      }
      setCartOpen(true);
    } catch (error) {
      console.error('NOVIS cart:', error);
      window.dispatchEvent(new CustomEvent('novis-toast', { detail: error?.message || 'Could not add this item.' }));
    }
  };

  const change = async (id, qty) => {
    const safeQty = Math.max(1, Number(qty || 1));
    try {
      if (token) {
        const { cart } = await updateCart(token, id, safeQty);
        setItems((cart.items || []).map((item) => ({ ...item, qty: item.quantity })));
      } else {
        setItems((previous) => previous.map((item) => item.id === id ? { ...item, qty: safeQty } : item));
      }
    } catch (error) {
      console.error('NOVIS cart update:', error);
      window.dispatchEvent(new CustomEvent('novis-toast', { detail: error?.message || 'Could not update your bag.' }));
    }
  };

  const remove = async (id) => {
    try {
      if (token) {
        const { cart } = await removeCart(token, id);
        setItems((cart.items || []).map((item) => ({ ...item, qty: item.quantity })));
      } else {
        setItems((previous) => previous.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error('NOVIS cart remove:', error);
      window.dispatchEvent(new CustomEvent('novis-toast', { detail: error?.message || 'Could not remove this item.' }));
    }
  };

  const handleLogin = async (email, password) => {
    const data = await login({ email, password });
    localStorage.setItem('novis-token', data.token);
    setToken(data.token);
    setUser(data.user);
    navigate('/');
  };

  const common = {
    products,
    onAdd: add,
    onOpen: (product) => navigate(`/product/${product.slug}`),
  };

  if (boot) return <Loader />;

  return (
    <div className="site" data-theme={theme}>
      <Navbar
        cartCount={count}
        setCartOpen={setCartOpen}
        setMenuOpen={setMenuOpen}
        menuOpen={menuOpen}
        setSearchOpen={setSearchOpen}
        theme={theme}
        setTheme={setTheme}
        token={token}
      />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} cartCount={count} setCartOpen={setCartOpen} setSearchOpen={setSearchOpen} theme={theme} setTheme={setTheme} />

      <main>
        <Routes>
          <Route path="/" element={<><Hero /><Collection {...common} /><Craft /><Movement /><Materials /><Story /><Journal /></>} />
          <Route path="/product/:slug" element={<ProductPage products={products} onAdd={add} />} />
          <Route path="/collection/:kind" element={<CollectionRoute common={common} />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/about" element={<StaticPage title="The NOVIS Story" eyebrow="ABOUT NOVIS"><Story /></StaticPage>} />
          <Route path="/contact" element={<Contact token={token} />} />
          <Route path="/notifications" element={<Notifications token={token} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} user={user} mode="login" />} />
          <Route path="/signup" element={<Login onLogin={handleLogin} user={user} mode="signup" />} />
          <Route path="/forgot-password" element={<Login onLogin={handleLogin} user={user} mode="forgot" />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<Policy type="privacy" />} />
          <Route path="/terms" element={<Policy type="terms" />} />
          <Route path="/refund-policy" element={<Policy type="refund" />} />
        </Routes>
      </main>

      <Footer theme={theme} setTheme={setTheme} />
      <Cart open={cartOpen} setOpen={setCartOpen} items={items} setItems={setItems} onChange={change} onRemove={remove} token={token} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} products={products} onOpen={(p) => navigate(`/product/${p.slug}`)} />
      {toast && <div className="site-toast" role="alert">{toast}</div>}
    </div>
  );
}

function AdminRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('novis-token');
    if (!token) {
      setLoading(false);
      return;
    }
    api('/auth/me', { token })
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('novis-token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-shell"><div className="admin-loading">Loading NOVIS control room…</div></div>;
  if (!user || user.role !== 'ADMIN') return <AdminLogin onLogin={setUser} />;
  return <AdminDashboard user={user} onLogout={() => setUser(null)} />;
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter the admin email and password.');
      return;
    }
    try {
      setBusy(true);
      const data = await login({ email: email.trim(), password });
      if (data.user.role !== 'ADMIN') throw new Error('This account is not an admin account.');
      localStorage.setItem('novis-token', data.token);
      onLogin(data.user);
    } catch (error) {
      setError(error?.message || 'Unable to sign in. Please check your details.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={submit} autoComplete="off">
        <div className="admin-logo"><strong>NOVIS</strong><small>ADMIN CONTROL</small></div>
        <h1>Admin Sign in</h1>
        <p>Private administration area.</p>
        <input autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" type="email" />
        <div className="admin-password">
          <input autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} type={show ? 'text' : 'password'} placeholder="Password" />
          <button type="button" onClick={() => setShow((value) => !value)}>{show ? 'HIDE' : 'SHOW'}</button>
        </div>
        <button type="submit" disabled={busy}>{busy ? 'PLEASE WAIT…' : 'ENTER DASHBOARD'}</button>
        {error && <small>{error}</small>}
      </form>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="*" element={<Storefront />} />
      </Routes>
    </ErrorBoundary>
  );
}
