import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMemoryFilters } from '../components/Filters';
import { PageHeader } from '../components/PageHeader';
import { MemoryMap } from '../components/MemoryMap';
import { EmptyState, ErrorState, Skeleton } from '../components/States';
import { formatDate, hasCoords, placeOf, placesCount, useMemories } from '../lib/memories';
import { Thumb } from './DashboardPage';

export default function MapPage() {
  const { memories, error, reload } = useMemories();
  const { filtered, bar } = useMemoryFilters(memories);
  const [params] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(params.get('focus'));
  const located = filtered.filter(hasCoords);
  const selected = located.find((memory) => memory.id === selectedId) ?? null;
  const unplaced = filtered.length - located.length;

  return (
    <div className="map-page">
      <PageHeader title="Your memories, mapped" subtitle={memories ? `${placesCount(memories)} places · ${memories.length} memories` : 'Loading your places…'} />
      {bar}
      {error ? <ErrorState message={error} onRetry={reload} /> : (
        <div className="map-page__grid">
          <div className="map-page__main">
            <MemoryMap memories={filtered} selectedId={selectedId} onSelect={setSelectedId} showPath scrollZoom className="map-page__map">
              {memories === null && <div className="map-overlay"><span className="spinner" />Loading your map…</div>}
              {memories && memories.length === 0 && (
                <div className="map-overlay map-overlay--empty">
                  <b>Your map is waiting for its first pin</b>
                  <span>Add a memory with a place and it will appear here.</span>
                  <Link className="btn btn--primary" to="/memories/new">Add your first memory</Link>
                </div>
              )}
            </MemoryMap>
            {selected && (
              <article className="selected-card">
                <Thumb memory={selected} className="selected-card__img" />
                <div>
                  <h3>{selected.title}</h3>
                  <p>{placeOf(selected)} · {formatDate(selected.memoryDate, 'long')}</p>
                  <small>{selected.latitude.toFixed(4)}°N, {selected.longitude.toFixed(4)}°E</small>
                </div>
                <Link className="btn btn--outline" to={`/memories/${selected.id}`}>View memory</Link>
              </article>
            )}
          </div>
          <aside className="panel places">
            <header className="panel__head"><h2>Your places</h2><span className="see-all">{located.length} stops</span></header>
            <p className="muted">Select a story to find it on the map.{unplaced > 0 && ` ${unplaced} ${unplaced === 1 ? 'memory has' : 'memories have'} no location yet.`}</p>
            {memories === null ? <Skeleton rows={4} /> : filtered.length === 0 ? (
              memories.length === 0 ? <EmptyState title="No places yet" text="Pin your first memory to start your map." /> : <p className="muted">No memories match these filters.</p>
            ) : filtered.map((memory) => (
              <button key={memory.id} className={`place-row ${memory.id === selectedId ? 'is-active' : ''}`} onClick={() => hasCoords(memory) && setSelectedId(memory.id)} disabled={!hasCoords(memory)}>
                <Thumb memory={memory} />
                <span><b>{memory.title}</b><small>{hasCoords(memory) ? placeOf(memory) : 'No location'} · {formatDate(memory.memoryDate)}</small></span>
                <ChevronRight size={18} />
              </button>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}
