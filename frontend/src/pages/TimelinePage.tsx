import { ArrowUpRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMemoryFilters } from '../components/Filters';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, ErrorState, PageLoader } from '../components/States';
import { formatDate, placeOf, useMemories, type Memory } from '../lib/memories';
import { Thumb } from './DashboardPage';

const monthName = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' });

export default function TimelinePage() {
  const { memories, error, reload } = useMemories();
  const { filtered, bar } = useMemoryFilters(memories);
  const years = filtered.reduce<Record<string, Memory[]>>((groups, memory) => {
    (groups[memory.memoryDate.slice(0, 4)] ??= []).push(memory);
    return groups;
  }, {});

  return (
    <div className="timeline-page">
      <PageHeader title="Your journey, one moment at a time" subtitle="The places, people and little things worth remembering." />
      {bar}
      {error ? <ErrorState message={error} onRetry={reload} /> : memories === null ? <PageLoader /> : memories.length === 0 ? (
        <EmptyState title="Your timeline is empty" text="Once you save memories, they line up here in the order you lived them." />
      ) : filtered.length === 0 ? <p className="muted center">No memories match your search.</p> : (
        Object.entries(years).sort(([a], [b]) => b.localeCompare(a)).map(([year, items]) => (
          <section key={year} className="tl-year">
            <header><h2>{year}</h2><span>{items.length} {items.length === 1 ? 'memory' : 'memories'}</span></header>
            {items.map((memory) => (
              <div key={memory.id} className="tl-row">
                <div className="tl-row__when"><b>{monthName(memory.memoryDate)}</b><small>{year}</small><i /></div>
                <Link to={`/memories/${memory.id}`} className="tl-card">
                  <div className="tl-card__media">
                    <Thumb memory={memory} className="tl-card__img" />
                    <small>{memory.media.length} {memory.media.length === 1 ? 'photo' : 'photos'} · {placeOf(memory)}</small>
                  </div>
                  <div className="tl-card__body">
                    <small>{formatDate(memory.memoryDate)} · {placeOf(memory)}</small>
                    <h3>{memory.title}{memory.isFavorite && <Heart size={16} className="accent" fill="currentColor" />}</h3>
                    {memory.description && <p>{memory.description}</p>}
                  </div>
                  <ArrowUpRight className="tl-card__go" size={18} />
                </Link>
              </div>
            ))}
          </section>
        ))
      )}
      {memories && memories.length > 0 && (
        <footer className="tl-end"><Heart size={22} /><b>The beginning of your MemoMap story</b><small>More places. More moments. More you.</small></footer>
      )}
    </div>
  );
}
