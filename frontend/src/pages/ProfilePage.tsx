import { BarChart3, ChevronRight, CircleHelp, Heart, Image, LogOut, Pencil, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '../components/layout/AppLayout';
import { PageHeader } from '../components/PageHeader';
import { api } from '../lib/api';
import { useAuth, type User } from '../lib/auth';
import { photosCount, placesCount, useMemories } from '../lib/memories';

const timezones = (() => {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch {
    return ['UTC'];
  }
})();

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { memories } = useMemories();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', avatarUrl: '', timezone: 'UTC' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  if (!user) return null;

  const startEdit = () => {
    setForm({ displayName: user.displayName, avatarUrl: user.avatarUrl ?? '', timezone: user.timezone });
    setMessage(null);
    setEditing(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.displayName.trim().length < 2) return setMessage({ kind: 'error', text: 'Your name needs at least 2 characters.' });
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, string | null> = { displayName: form.displayName.trim(), timezone: form.timezone };
      if (form.avatarUrl.trim()) body.avatarUrl = form.avatarUrl.trim();
      else if (user.avatarUrl) body.avatarUrl = null;
      setUser(await api<User>('/users/me', { method: 'PATCH', body }));
      setEditing(false);
      setMessage({ kind: 'ok', text: 'Profile saved.' });
    } catch (error) {
      setMessage({ kind: 'error', text: (error as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const year = new Date(user.createdAt).getFullYear();
  const count = memories?.length;
  const rows = [
    ['/gallery', 'My Memories', count === undefined ? 'Loading…' : `${count} ${count === 1 ? 'memory' : 'memories'}`, Image],
    ['/gallery?favorites=1', 'Favorites', 'Your saved moments', Heart],
    ['/stats', 'Your Stats', 'Your story in numbers', BarChart3],
  ] as const;

  return (
    <div className="profile-page">
      <PageHeader title="A little about you" subtitle="The person behind the pins." action={false} />
      <div className="profile-grid">
        <div className="profile-col">
          <article className="panel profile-card">
            <div className="profile-card__cover" />
            <Avatar user={user} size={96} />
            <h2>{user.displayName}</h2>
            <p>{user.email}</p>
            <span className="chip chip--soft">🕑 {user.timezone}</span>
            <p className="muted">Collecting moments since {year}</p>
            <div className="mini-stats">
              <b>{count ?? '–'}<small>Memories</small></b>
              <b>{memories ? placesCount(memories) : '–'}<small>Places</small></b>
              <b>{memories ? photosCount(memories) : '–'}<small>Photos</small></b>
            </div>
            <button className="btn btn--outline btn--block" onClick={startEdit}><Pencil size={16} />Edit Profile</button>
          </article>
          <button className="btn btn--outline btn--block logout" onClick={signOut}><LogOut size={17} />Log Out</button>
        </div>

        <div className="profile-col">
          <form id="settings" className="panel info-card" onSubmit={save}>
            <header className="panel__head">
              <h2>Personal information</h2>
              {!editing && <button type="button" className="link" onClick={startEdit}>Edit details</button>}
            </header>
            {message && <div className={message.kind === 'ok' ? 'alert alert--ok' : 'alert'} role="status">{message.text}</div>}
            <div className="info-card__grid">
              <label className="field"><span className="field__label">Full name</span><span className="field__control"><input value={editing ? form.displayName : user.displayName} readOnly={!editing} onChange={(event) => setForm({ ...form, displayName: event.target.value })} maxLength={100} /></span></label>
              <label className="field"><span className="field__label">Time zone</span><span className="field__control">
                {editing ? (
                  <select value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })}>{timezones.map((zone) => <option key={zone}>{zone}</option>)}</select>
                ) : <input value={user.timezone} readOnly />}
              </span></label>
              <label className="field wide"><span className="field__label">Email address</span><span className="field__control"><input value={user.email} readOnly /></span><small className="field__hint">Email can&apos;t be changed here.</small></label>
              {editing && (
                <label className="field wide"><span className="field__label">Profile photo URL</span><span className="field__control"><input type="url" value={form.avatarUrl} onChange={(event) => setForm({ ...form, avatarUrl: event.target.value })} placeholder="https://example.com/me.jpg" /></span></label>
              )}
            </div>
            {editing ? (
              <div className="info-card__actions">
                <button type="button" className="btn btn--outline" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              </div>
            ) : <p className="muted">Your personal details are only visible to you.</p>}
          </form>

          <article className="story-card">
            <Sparkles size={30} />
            <div>
              <h2>Your story is taking shape.</h2>
              <p>{memories ? `${count} memories · ${placesCount(memories)} places · ${photosCount(memories)} photos` : 'Counting your moments…'}</p>
              <Link to="/stats">Explore your stats →</Link>
            </div>
          </article>

          <nav className="panel list-card">
            {rows.map(([to, title, sub, Icon]) => (
              <Link key={title} to={to}><Icon size={21} /><span><b>{title}</b><small>{sub}</small></span><ChevronRight size={18} /></Link>
            ))}
            <a href="mailto:support@memomap.app"><CircleHelp size={21} /><span><b>Help &amp; Support</b><small>We&apos;re here for you</small></span><ChevronRight size={18} /></a>
          </nav>
        </div>
      </div>
    </div>
  );
}
