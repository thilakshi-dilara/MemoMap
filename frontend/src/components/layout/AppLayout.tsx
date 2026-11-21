import { BarChart3, CalendarDays, ChevronDown, CircleHelp, Clock3, House, Image, LogOut, Map, Plus, Search, Settings, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import mountains from '../../assets/figma/sidebar-mountains.png';
import { initials, useAuth, type User } from '../../lib/auth';
import { Logo } from '../Logo';

const nav = [
  ['/dashboard', 'Dashboard', House],
  ['/map', 'Map', Map],
  ['/timeline', 'Timeline', CalendarDays],
  ['/gallery', 'Memories', Image],
  ['/stats', 'Stats', BarChart3],
  ['/profile', 'Profile', UserRound],
] as const;

export function Avatar({ user, size = 40 }: { user: User | null; size?: number }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {user?.avatarUrl && !broken ? <img src={user.avatarUrl} alt="" onError={() => setBroken(true)} /> : initials(user?.displayName)}
    </span>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  const signOut = async () => {
    setOpen(false);
    await logout();
    navigate('/', { replace: true });
  };
  return (
    <div className="profile-menu" ref={ref}>
      <button className="profile-menu__trigger" onClick={() => setOpen((value) => !value)} aria-haspopup="menu" aria-expanded={open}>
        <Avatar user={user} size={40} />
        <span>{user?.displayName}</span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="profile-menu__panel" role="menu">
          <div className="profile-menu__head">
            <Avatar user={user} size={44} />
            <span><b>{user?.displayName}</b><small>{user?.email}</small></span>
          </div>
          <Link role="menuitem" to="/profile" onClick={() => setOpen(false)}><UserRound size={17} />My Profile</Link>
          <Link role="menuitem" to="/memories/new" onClick={() => setOpen(false)}><Plus size={17} />Add Memory</Link>
          <Link role="menuitem" to="/stats" onClick={() => setOpen(false)}><BarChart3 size={17} />Your Stats</Link>
          <button role="menuitem" className="danger" onClick={signOut}><LogOut size={17} />Log Out</button>
        </div>
      )}
    </div>
  );
}

function GlobalSearch() {
  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const focus = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', focus);
    return () => window.removeEventListener('keydown', focus);
  }, []);
  return (
    <form className="topbar__search" role="search" onSubmit={(event) => { event.preventDefault(); navigate(`/gallery?q=${encodeURIComponent(ref.current?.value ?? '')}`); }}>
      <Search size={18} />
      <input ref={ref} type="search" placeholder="Search memories, places..." aria-label="Search memories" />
      <kbd>Ctrl + K</kbd>
    </form>
  );
}

export function AppLayout() {
  const user = useAuth((state) => state.user);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo to="/dashboard" stacked />
        <nav className="sidebar__nav">
          {nav.map(([to, label, Icon]) => <NavLink to={to} key={to}><Icon size={21} />{label}</NavLink>)}
        </nav>
        <div className="sidebar__secondary">
          <NavLink to="/settings"><Settings size={21} />Settings</NavLink>
          <a href="mailto:support@memomap.app"><CircleHelp size={21} />Help &amp; Support</a>
        </div>
        <img className="sidebar__art" src={mountains} alt="" />
        <p className="sidebar__foot">Collect moments...<br />Explore your journey... ♡</p>
      </aside>

      <div className="main">
        <header className="topbar">
          <GlobalSearch />
          <ProfileMenu />
        </header>
        <header className="mobile-bar">
          <Logo to="/dashboard" />
          <Link to="/memories/new" className="icon-btn" aria-label="Add memory"><Plus size={20} /></Link>
          <Link to="/profile" aria-label="Profile"><Avatar user={user} size={36} /></Link>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Primary">
        <NavLink to="/dashboard"><House size={22} />Home</NavLink>
        <NavLink to="/timeline"><Clock3 size={22} />Timeline</NavLink>
        <Link to="/memories/new" className="bottom-nav__add" aria-label="Add memory"><Plus size={28} /></Link>
        <NavLink to="/map"><Map size={22} />Map</NavLink>
        <NavLink to="/profile"><UserRound size={22} />Profile</NavLink>
      </nav>
    </div>
  );
}
