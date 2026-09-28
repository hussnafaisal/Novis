import { X, Search, UserRound, ShoppingBag, Bell, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MobileMenu({ open, onClose, cartCount, setCartOpen, setSearchOpen, theme, setTheme }) {
  if (!open) return null;

  return (
    <div className="mobile-panel">
      <div className="mobile-head">
        <Link to="/" className="brand" onClick={onClose}>NOVIS</Link>
        <button onClick={onClose} aria-label="Close menu"><X /></button>
      </div>
      <nav>
        <Link onClick={onClose} to="/collection/men">MEN WATCHES</Link>
        <Link onClick={onClose} to="/collection/women">WOMEN WATCHES</Link>
        <Link onClick={onClose} to="/collection/couple">COUPLE WATCHES</Link>
        <Link onClick={onClose} to="/collection/limited">LIMITED EDITION</Link>
        <Link onClick={onClose} to="/about">ABOUT</Link>
        <Link onClick={onClose} to="/journal">JOURNAL</Link>
        <Link onClick={onClose} to="/contact">CONTACT</Link>
      </nav>
      <div className="mobile-links">
        <button onClick={() => { onClose(); setSearchOpen?.(true); }}><Search /> SEARCH</button>
        <Link onClick={onClose} to="/login"><UserRound /> ACCOUNT</Link>
        <Link onClick={onClose} to="/notifications"><Bell /> NOTIFICATIONS</Link>
        <button onClick={() => { onClose(); setCartOpen?.(true); }}><ShoppingBag /> BAG ({cartCount})</button>
        <button onClick={() => setTheme?.(theme === 'dark' ? 'light' : 'dark')}><span className="mobile-theme-icon">{theme === 'dark' ? <Sun /> : <Moon />}</span> {theme === 'dark' ? 'LIGHT THEME' : 'DARK THEME'}</button>
      </div>
    </div>
  );
}
