import { ArrowRight, CalendarDays, ChevronRight, CircleHelp, Clock3, Heart, Image, LogOut, MapPin, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import banner from '../assets/figma/dashboard-banner.png';
import { Avatar } from '../components/layout/AppLayout';
import { MemoryMap } from '../components/MemoryMap';
import { EmptyState, ErrorState, Skeleton } from '../components/States';
import { firstName, useAuth } from '../lib/auth';
import { coverOf, formatDate, hasCoords, photosCount, placeOf, placesCount, sinceJoined, useMemories, type Memory } from '../lib/memories';

export function Thumb({ memory, className = 'thumb' }: { memory: Memory; className?: string }) {
  const cover = coverOf(memory);
  return cover ? <img className={className} src={cover} alt="" loading="lazy" /> : <span className={`${className} thumb--empty`}><MapPin size={20} /></span>;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { memories, error, reload } = useMemories();
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const shown = useMemo(() => (memories ?? []).filter((memory) => filter === 'all' || memory.isFavorite), [memories, filter]);
  const latest = (memories ?? []).slice(0, 3);
  const journey = (memories ?? []).slice(0, 4);
  const located = (memories ?? []).filter(hasCoords).length;
  const stats = [
    [MapPin, memories ? String(memories.length) : '–', 'Memories'],
    [Image, memories ? String(placesCount(memories)) : '–', 'Places'],
    [CalendarDays, sinceJoined(user?.createdAt), 'Since Joined'],
  ] as const;

  return (
    <div className="dashboard">
      <section className="welcome-banner">
        <div className="welcome-banner__copy">
          <h1>Welcome back,<br />{firstName(user?.displayName)}! <span className="wave" aria-hidden="true">👋</span></h1>
          <p>Relive your memories and explore the places you&apos;ve been.</p>
          <Link className="btn btn--light" to="/gallery">View My Memories <ArrowRight size={16} /></Link>
        </div>
        <img className="welcome-banner__art" src={banner} alt="" />
      </section>

      <div className="stat-tiles">
        {stats.map(([Icon, value, label]) => (
          <article key={label}><Icon size={30} strokeWidth={1.6} /><b>{value}</b><span>{label}</span></article>
        ))}
      </div>

      <aside className="dash-profile">
        <div className="dash-profile__cover" />
        <Avatar user={user} size={96} />
        <h2>{user?.displayName}</h2>
        <p>{user?.email}</p>
        <div className="dash-profile__stats">
          <b>{memories?.length ?? '–'}<small>Memories</small></b>
          <b>{memories ? placesCount(memories) : '–'}<small>Places</small></b>
          <b>{memories ? photosCount(memories) : '–'}<small>Photos</small></b>
        </div>
        <nav>
          <Link to="/gallery"><Image size={19} />My Memories<ChevronRight size={18} /></Link>
          <Link to="/gallery?favorites=1"><Heart size={19} />Favorites<ChevronRight size={18} /></Link>
          <Link to="/settings"><Settings size={19} />Settings<ChevronRight size={18} /></Link>
          <a href="mailto:support@memomap.app"><CircleHelp size={19} />Help &amp; Support<ChevronRight size={18} /></a>
        </nav>
        <button className="btn btn--outline btn--block" onClick={async () => { await logout(); navigate('/', { replace: true }); }}><LogOut size={17} />Log Out</button>
      </aside>

      <section className="panel dash-map">
        <header className="panel__head">
          <h2><MapPin className="accent" size={20} />My Memories Map</h2>
          <select value={filter} onChange={(event) => setFilter(event.target.value as 'all' | 'favorites')} aria-label="Filter map">
            <option value="all">All Memories</option>
            <option value="favorites">Favorites</option>
          </select>
        </header>
        {error ? <ErrorState message={error} onRetry={reload} /> : (
          <MemoryMap memories={shown} selectedId={selected} onSelect={setSelected} className="dash-map__map">
            {memories === null && <div className="map-overlay"><span className="spinner" />Loading your map…</div>}
            {memories && located === 0 && (
              <div className="map-overlay map-overlay--empty">
                <b>{memories.length === 0 ? 'Your map is waiting for its first pin' : 'None of your memories have a location yet'}</b>
                <span>{memories.length === 0 ? 'Add a memory with a place and it will appear here.' : 'Edit a memory and choose a place to pin it.'}</span>
                <Link className="btn btn--primary" to="/memories/new">Add a memory</Link>
              </div>
            )}
          </MemoryMap>
        )}
      </section>

      <section className="panel dash-latest">
        <header className="panel__head">
          <h2><Image className="accent" size={20} />Latest Memories</h2>
          <Link className="see-all" to="/gallery">See All <ArrowRight size={15} /></Link>
        </header>
        {error ? null : memories === null ? <Skeleton rows={3} /> : latest.length === 0 ? (
          <EmptyState title="No memories yet" text="Your latest moments will show up here." />
        ) : latest.map((memory) => (
          <Link key={memory.id} to={`/memories/${memory.id}`} className={`memory-row ${selected === memory.id ? 'is-active' : ''}`} onMouseEnter={() => hasCoords(memory) && setSelected(memory.id)}>
            <Thumb memory={memory} />
            <span className="memory-row__text">
              <b>{memory.title}{memory.isFavorite && <Heart size={14} fill="currentColor" aria-label="Favorite" />}</b>
              <small><MapPin size={13} />{placeOf(memory)}<CalendarDays size={13} />{formatDate(memory.memoryDate, 'month')}</small>
            </span>
            <ChevronRight className="memory-row__go" size={18} />
          </Link>
        ))}
      </section>

      <section className="panel dash-journey">
        <header className="panel__head">
          <h2><Clock3 className="accent" size={20} />Your Journey Timeline</h2>
          <Link className="see-all" to="/timeline">See All <ArrowRight size={15} /></Link>
        </header>
        {error ? null : memories === null ? <Skeleton rows={1} /> : journey.length === 0 ? (
          <p className="muted">Your journey starts with your first memory.</p>
        ) : (
          <div className="journey">
            {journey.map((memory) => (
              <Link key={memory.id} to={`/memories/${memory.id}`} className="journey__item">
                <Thumb memory={memory} />
                <span><b>{memory.title}</b><small>{formatDate(memory.memoryDate, 'month')}</small></span>
                <i className="journey__dot" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
