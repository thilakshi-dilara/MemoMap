import { ArrowUpRight, Camera, Heart, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMemoryFilters } from '../components/Filters';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, ErrorState, PageLoader } from '../components/States';
import { formatDate, photosCount, placeOf, useMemories } from '../lib/memories';
import { Thumb } from './DashboardPage';

export default function GalleryPage() {
  const { memories, error, reload } = useMemories();
  const { filtered, bar } = useMemoryFilters(memories);
  const [order, setOrder] = useState<'new' | 'old'>('new');
  const sorted = order === 'new' ? filtered : [...filtered].reverse();

  return (
    <div className="gallery-page">
      <PageHeader title="Your little collection of everything" subtitle={memories ? `${memories.length} memories · ${photosCount(memories)} photos · a whole lot of life.` : 'Gathering your memories…'} />
      {bar}
      {error ? <ErrorState message={error} onRetry={reload} /> : memories === null ? <PageLoader /> : memories.length === 0 ? (
        <EmptyState title="Your collection is empty" text="Every collection starts with one moment. Save your first memory and pin it to the map." />
      ) : (
        <>
          <div className="list-meta">
            <span>{filtered.length} {filtered.length === 1 ? 'memory' : 'memories'} found</span>
            <select value={order} onChange={(event) => setOrder(event.target.value as 'new' | 'old')} aria-label="Sort order">
              <option value="new">Newest first</option>
              <option value="old">Oldest first</option>
            </select>
          </div>
          {sorted.length === 0 ? <p className="muted center">No memories match your search.</p> : (
            <div className="card-grid">
              {sorted.map((memory) => (
                <Link key={memory.id} to={`/memories/${memory.id}`} className="memory-card">
                  <div className="memory-card__media">
                    <Thumb memory={memory} className="memory-card__img" />
                    {memory.media.length > 0 && <span className="memory-card__count"><Camera size={13} />{memory.media.length} {memory.media.length === 1 ? 'photo' : 'photos'}</span>}
                    {memory.isFavorite && <span className="memory-card__fav" aria-label="Favorite"><Heart size={14} fill="currentColor" /></span>}
                  </div>
                  <small className="memory-card__meta"><MapPin size={12} />{placeOf(memory)} · {formatDate(memory.memoryDate)}</small>
                  <h3>{memory.title}</h3>
                  <ArrowUpRight className="memory-card__go" size={18} />
                </Link>
              ))}
            </div>
          )}
          <p className="muted center foot-note">You&apos;re all caught up. Your next memory is waiting to happen.</p>
        </>
      )}
    </div>
  );
}
