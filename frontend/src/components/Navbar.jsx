import {Search,UserRound,ShoppingBag,Menu,X,ChevronDown} from 'lucide-react';
import {Link} from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Notifications from './Notifications';

export default function Navbar({cartCount,setCartOpen,setMenuOpen,menuOpen,setSearchOpen,theme,setTheme,token}){
  return <header className="nav">
    <div className="nav-inner">
      <Link to="/" className="brand brand-with-logo" aria-label="NOVIS home">
        <img src="https://dummyimage.com/44x44/111111/d6b36b&text=N" alt="NOVIS logo"/>
        <span className="brand-name-wrap"><strong>NOVIS</strong><span>TIMEPIECES</span></span>
      </Link>
      <nav className="main-nav">
        <div className="nav-drop"><button>COLLECTION <ChevronDown size={13}/></button><div className="dropdown"><Link to="/collection/men">Men Watches</Link><Link to="/collection/women">Women Watches</Link><Link to="/collection/couple">Couple Watches</Link><Link to="/collection/limited">Limited Edition</Link></div></div>
        <div className="nav-drop"><button>BRANDS <ChevronDown size={13}/></button><div className="dropdown"><Link to="/collection/rolex">Rolex</Link><Link to="/collection/omega">Omega</Link><Link to="/collection/tissot">Tissot</Link><Link to="/collection/citizen">Citizen</Link></div></div>
        <Link to="/about">ABOUT</Link><Link to="/contact">CONTACT</Link><Link to="/journal">JOURNAL</Link>
      </nav>
      <div className="nav-actions">
        <button aria-label="Search" onClick={()=>setSearchOpen(true)}><Search size={18}/></button>
        <Link to="/login" aria-label="Account"><UserRound size={18}/></Link>
        <Notifications token={token} compact />
        <button aria-label="Bag" className="bag-btn" onClick={()=>setCartOpen(true)}><ShoppingBag size={18}/><b>{cartCount}</b></button>
        <ThemeToggle theme={theme} setTheme={setTheme}/>
        <button className="mobile-menu-btn" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen?<X size={20}/>:<Menu size={20}/>}</button>
      </div>
    </div>
  </header>
}
