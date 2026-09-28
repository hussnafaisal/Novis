import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShieldCheck, Truck, Clock3, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createOrder } from '../services/api';

const emptyForm = { fullName: '', line1: '', city: '', country: 'Pakistan', phone: '' };

export default function Cart({ open, setOpen, items, setItems, onChange, onRemove, token }) {
  const [gift, setGift] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0), [items]);
  const total = subtotal + (gift ? 25 : 0);

  useEffect(() => {
    if (!open) {
      setCheckout(false);
      setMsg('');
      setSuccess('');
    }

    const previousOverflow = document.body.style.overflow;
    if (open) document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const startCheckout = () => {
    setMsg('');
    setSuccess('');
    if (!token) {
      setMsg('Please sign in before checkout so we can connect the order to your account.');
      return;
    }
    if (!items.length) {
      setMsg('Your bag is empty.');
      return;
    }
    setCheckout(true);
  };

  async function submit(event) {
    event.preventDefault();
    setMsg('');
    setSuccess('');
    if (!form.fullName.trim() || form.fullName.trim().length < 2) return setMsg('Please enter your full name.');
    if (!form.line1.trim() || form.line1.trim().length < 3) return setMsg('Please enter your shipping address.');
    if (!form.city.trim() || form.city.trim().length < 2) return setMsg('Please enter your city.');
    if (!token) return setMsg('Your session has expired. Please sign in again.');

    try {
      setBusy(true);
      const { order } = await createOrder(token, {
        address: { ...form, fullName: form.fullName.trim(), line1: form.line1.trim(), city: form.city.trim() },
        giftWrap: gift,
        paymentMethod: 'cod',
      });
      setSuccess(`Order ${order.orderNumber} was placed successfully.`);
      setItems([]);
      setGift(false);
      setForm(emptyForm);
      setCheckout(false);
      window.dispatchEvent(new CustomEvent('novis-order-updated'));
    } catch (error) {
      setMsg(error?.message || 'We could not place your order. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside className="cart-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.35 }}>
            <div className="drawer-head">
              <div><span className="eyebrow">BAG</span><h2>YOUR BAG</h2><small>{items.reduce((sum, item) => sum + Number(item.qty || 0), 0)} items</small></div>
              <button onClick={() => setOpen(false)} aria-label="Close bag"><X /></button>
            </div>

            <div className="cart-items">
              {!items.length ? <div className="empty">Your bag is waiting for a considered choice.</div> : items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image || item.images?.[0]} alt={item.name} />
                  <div className="cart-item-copy">
                    <h3>{item.name}</h3>
                    <p>{item.type} · {item.size}</p>
                    <strong>${Number(item.price).toLocaleString()}</strong>
                    <div className="qty">
                      <button onClick={() => Number(item.qty) > 1 ? onChange(item.id, Number(item.qty) - 1) : onRemove(item.id)} aria-label="Decrease quantity"><Minus size={13} /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => onChange(item.id, Number(item.qty) + 1)} aria-label="Increase quantity"><Plus size={13} /></button>
                    </div>
                  </div>
                  <button className="delete" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <>
                <label className="gift"><input type="checkbox" checked={gift} onChange={(event) => setGift(event.target.checked)} /><span>Add a premium gift box <small>$25</small></span></label>
                <div className="summary"><div><span>Subtotal</span><strong>${subtotal.toLocaleString()}</strong></div><div><span>Shipping</span><strong>Free</strong></div><div className="total"><span>Estimated total</span><strong>${total.toLocaleString()}</strong></div></div>
                <button className="checkout" onClick={startCheckout}>CHECKOUT <span>→</span></button>
              </>
            )}

            {success && <div className="cart-message success-msg"><CheckCircle2 size={14} />{success}</div>}
            {msg && <div className="cart-message error-msg"><AlertCircle size={14} />{msg}</div>}

            <div className="reassurance"><span><ShieldCheck />Secure Payment</span><span><Truck />Free Shipping</span><span><Clock3 />2-Year Warranty</span></div>

            {checkout && (
              <form className="checkout-form" onSubmit={submit} autoComplete="off">
                <div className="checkout-form-head"><h3>Shipping details</h3><button type="button" onClick={() => setCheckout(false)} aria-label="Close checkout"><X size={16} /></button></div>
                <input autoComplete="name" required placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                <input autoComplete="street-address" required placeholder="Address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
                <input autoComplete="address-level2" required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input autoComplete="country-name" required placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                <input autoComplete="tel" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <button className="checkout" type="submit" disabled={busy}>{busy ? 'PLACING ORDER…' : 'PLACE ORDER'}</button>
              </form>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
