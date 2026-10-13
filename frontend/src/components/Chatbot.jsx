import { useMemo, useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const starter = { from: 'bot', text: 'Welcome to NOVIS. I can help with watches, pricing, orders, accounts, delivery and returns. What would you like to know?' };
function answerFor(raw) {
  const q = raw.toLowerCase();
  if (/price|cost|pkr|rupee|expensive|cheap/.test(q)) return 'All NOVIS prices are displayed in Pakistani Rupees (PKR). Open any timepiece to see its current price and availability.';
  if (/order|track|status|delivery|ship|courier/.test(q)) return 'Sign in with the same customer account and open Order Updates to review locally saved order information. Delivery timing can vary by location.';
  if (/return|refund|exchange/.test(q)) return 'Please review our Refund & Return Policy, then send the NOVIS team your order details from the Contact page for help.';
  if (/password|forgot|reset|login|sign in|account/.test(q)) return 'You can create an account, sign in, or use Forgot Password. Password reset in this browser demo is local and does not send email.';
  if (/watch|collection|men|women|automatic|chronograph|skeleton|water/.test(q)) return 'Explore the Collection and open a watch for its specifications, features, availability and price. You can add available watches to your bag.';
  if (/cart|bag|checkout|buy|purchase|payment/.test(q)) return 'Add a watch to your bag to review it. This frontend-only demo can save an order locally, but it does not process real payments.';
  if (/contact|support|help|human|email/.test(q)) return 'You can contact NOVIS using the Contact page. The demo stores your enquiry in this browser so it can be reviewed in the local admin dashboard.';
  if (/hello|hi\b|hey|salam|assalam/.test(q)) return 'Hello! Welcome to NOVIS. Are you looking for a watch, help with an order, account support or product details?';
  if (/thank/.test(q)) return 'You are welcome. I am happy to help with your NOVIS shopping experience.';
  return 'I can help with NOVIS watches, PKR prices, product features, the shopping bag, local demo orders, account access, returns and contact options. For something specific, tell me the watch name or open the Contact page. I am an on-site guide, not a general-purpose AI model.';
}
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([starter]);
  const canSend = useMemo(() => draft.trim().length > 0, [draft]);
  const send = (event) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((old) => [...old, { from: 'user', text }, { from: 'bot', text: answerFor(text) }]);
    setDraft('');
  };
  return <div className="novis-chatbot">
    {open && <section className="chat-window" aria-label="NOVIS chat assistant">
      <header className="chat-head"><span className="chat-avatar"><Sparkles size={17}/></span><div><strong>NOVIS ASSISTANT</strong><small>Shopping help · local demo</small></div><button type="button" aria-label="Close chat" onClick={() => setOpen(false)}><X size={18}/></button></header>
      <div className="chat-messages">{messages.map((m, i) => <div key={`${i}-${m.from}`} className={`chat-bubble ${m.from}`}>{m.text}</div>)}<div className="chat-shortcuts"><Link to="/collection/all" onClick={() => setOpen(false)}>Browse watches</Link><Link to="/contact" onClick={() => setOpen(false)}>Contact NOVIS</Link></div></div>
      <form className="chat-compose" onSubmit={send}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask NOVIS a question…" aria-label="Message NOVIS"/><button type="submit" disabled={!canSend} aria-label="Send message"><Send size={17}/></button></form>
    </section>}
    <button className="chat-launcher" type="button" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Close NOVIS assistant' : 'Open NOVIS assistant'}>{open ? <X size={22}/> : <MessageCircle size={22}/>}<span>{open ? 'CLOSE' : 'ASK NOVIS'}</span></button>
  </div>;
}
