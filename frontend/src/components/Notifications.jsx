import { useEffect, useMemo, useState } from 'react';
import { Bell, ChevronRight, PackageCheck, Truck, MessageCircle, X, RefreshCw, Mail, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyOrders, getMyMessages } from '../services/api';

const statusLabel = {
  PENDING: 'Order received',
  CONFIRMED: 'Order confirmed',
  SHIPPED: 'Order shipped',
  DELIVERED: 'Order delivered',
  RETURNED: 'Order returned',
  REJECTED: 'Order rejected',
  CANCELLED: 'Order cancelled',
};

const READ_KEY = 'novis-read-notifications';

function getReadIds() {
  try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch { return []; }
}

export default function Notifications({ token, compact = false }) {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [readIds, setReadIds] = useState(getReadIds);

  const markRead = (id) => {
    setReadIds((previous) => {
      if (previous.includes(id)) return previous;
      const next = [...previous, id].slice(-300);
      localStorage.setItem(READ_KEY, JSON.stringify(next));
      return next;
    });
  };

  const markAllRead = (entries) => {
    if (!entries.length) return;
    setReadIds((previous) => {
      const next = [...new Set([...previous, ...entries.map((entry) => entry.id)])].slice(-300);
      localStorage.setItem(READ_KEY, JSON.stringify(next));
      return next;
    });
  };

  const load = async () => {
    if (!token) {
      setOrders([]); setMessages([]); return;
    }
    try {
      setLoading(true); setError('');
      const [orderData, messageData] = await Promise.all([getMyOrders(token), getMyMessages(token)]);
      setOrders(orderData.orders || []);
      setMessages(messageData.messages || []);
    } catch (requestError) {
      setError(requestError?.message || 'We could not load your notifications.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!token) return undefined;
    load();
    const timer = window.setInterval(load, 15000);
    const refresh = () => load();
    window.addEventListener('novis-order-updated', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('novis-order-updated', refresh); };
  }, [token]);

  useEffect(() => { if (open) load(); }, [open]);

  const entries = useMemo(() => buildEntries(orders, messages), [orders, messages]);
  const unreadEntries = useMemo(() => entries.filter((entry) => !readIds.includes(entry.id)), [entries, readIds]);
  const notificationCount = unreadEntries.length;

  if (!compact) {
    return (
      <section className="notifications-page">
        <div className="notifications-head">
          <div><span className="eyebrow">NOVIS ACCOUNT</span><h1>Notifications</h1><p>Track your order status, courier updates and replies to your NOVIS queries.</p></div>
          <div className="notification-head-actions">
            <button className="notification-refresh" onClick={() => markAllRead(entries)} disabled={!unreadEntries.length}><Check size={15} /> MARK ALL READ</button>
            <button className="notification-refresh" onClick={load}><RefreshCw size={16} /> REFRESH</button>
          </div>
        </div>
        <NotificationList entries={entries} loading={loading} error={error} readIds={readIds} onRead={markRead} />
      </section>
    );
  }

  return (
    <div className="notification-wrap">
      <button className="notification-trigger" aria-label="Order notifications" onClick={() => setOpen((value) => !value)}>
        <Bell size={18} />
        {token && notificationCount > 0 && <b>{notificationCount > 9 ? '9+' : notificationCount}</b>}
      </button>
      {open && (
        <div className="notification-popover">
          <div className="notification-pop-head">
            <div><span className="eyebrow">NOVIS</span><h3>Notifications</h3></div>
            <button onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button>
          </div>
          {!token ? (
            <div className="notification-empty"><p>Sign in to receive order updates and query replies.</p><Link to="/login" onClick={() => setOpen(false)}>SIGN IN</Link></div>
          ) : (
            <>
              <NotificationList entries={entries.slice(0, 6)} loading={loading} error={error} readIds={readIds} onRead={markRead} compact />
              <div className="notification-footer"><button type="button" onClick={() => markAllRead(entries)} disabled={!unreadEntries.length}>MARK ALL READ</button><Link to="/notifications" onClick={() => setOpen(false)}>VIEW ALL UPDATES <ChevronRight size={14} /></Link></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function buildEntries(orders, messages) {
  const orderEntries = orders
    .filter((order) => order.status !== 'PENDING' || order.notes)
    .map((order) => ({
      id: `order-${order.id}-${order.status}-${order.updatedAt || order.createdAt}`,
      date: new Date(order.updatedAt || order.createdAt), type: 'order', order,
    }));
  const messageEntries = messages
    .filter((message) => message.adminReply)
    .map((message) => ({
      id: `message-${message.id}-${message.repliedAt || message.updatedAt || message.createdAt}`,
      date: new Date(message.repliedAt || message.updatedAt || message.createdAt), type: 'message', message,
    }));
  return [...orderEntries, ...messageEntries].sort((a, b) => b.date - a.date);
}

function NotificationList({ entries, loading, error, readIds, onRead, compact = false }) {
  if (loading && !entries.length) return <div className="notification-state">Loading your updates…</div>;
  if (error) return <div className="notification-state notification-error">{error}</div>;
  if (!entries.length) return <div className="notification-state"><PackageCheck size={20} /><p>No notifications yet.</p></div>;

  return (
    <div className={compact ? 'notification-list compact-list' : 'notification-list'}>
      {entries.slice(0, compact ? 6 : 100).map((entry) => {
        const isRead = readIds.includes(entry.id);
        if (entry.type === 'message') {
          return (
            <article className={`notification-item ${isRead ? 'read' : 'unread'}`} key={entry.id} onClick={() => onRead(entry.id)} role="button" tabIndex={0}>
              <div className="notification-icon message"><Mail size={16} /></div>
              <div className="notification-copy"><div className="notification-title"><strong>Reply to your query</strong><span>{entry.message.subject}</span></div><p>{entry.message.adminReply}</p><small>{entry.date.toLocaleString()}</small></div>
              {!isRead && <span className="unread-dot" aria-label="Unread" />}
            </article>
          );
        }
        const order = entry.order;
        return (
          <article className={`notification-item ${isRead ? 'read' : 'unread'}`} key={entry.id} onClick={() => onRead(entry.id)} role="button" tabIndex={0}>
            <div className={`notification-icon ${String(order.status || 'PENDING').toLowerCase()}`}><Truck size={16} /></div>
            <div className="notification-copy"><div className="notification-title"><strong>{statusLabel[order.status] || order.status}</strong><span>{order.orderNumber}</span></div><p>Your order status is <b>{String(order.status || 'PENDING').toLowerCase()}</b>.</p>{order.notes && <div className="courier-reply"><MessageCircle size={14} /><span><b>Courier / NOVIS reply:</b> {order.notes}</span></div>}<small>{entry.date.toLocaleString()}</small></div>
            {!isRead && <span className="unread-dot" aria-label="Unread" />}
          </article>
        );
      })}
    </div>
  );
}
