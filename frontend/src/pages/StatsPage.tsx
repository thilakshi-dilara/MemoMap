import { Camera, CalendarDays, Heart, ImagePlus, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, ErrorState, PageLoader } from '../components/States';
import { formatDate, photosCount, placeOf, placesCount, useMemories } from '../lib/memories';
import { Thumb } from './DashboardPage';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StatsPage() {
  const { memories, error, reload } = useMemories();
  const years = useMemo(() => [...new Set((memories ?? []).map((memory) => memory.memoryDate.slice(0, 4)))].sort().reverse(), [memories]);
  const [pickedYear, setPickedYear] = useState('');
  const year = pickedYear || years[0] || String(new Date().getFullYear());

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!memories) return <PageLoader />;

  const header = <PageHeader title="Your year of little adventures" subtitle="A snapshot of where you've been and what you kept." action={false} />;
  if (memories.length === 0) return <div className="stats-page">{header}<EmptyState title="No stats yet" text="Save a few memories and your story in numbers will appear here." /></div>;

  const inYear = memories.filter((memory) => memory.memoryDate.startsWith(year));
  const byMonth = MONTHS.map((_, month) => inYear.filter((memory) => new Date(memory.memoryDate).getUTCMonth() === month).length);
  const peak = Math.max(1, ...byMonth);
  const photos = photosCount(memories);
  const favorites = memories.filter((memory) => memory.isFavorite).length;
  const placeCounts = Object.entries(memories.reduce<Record<string, number>>((counts, memory) => ({ ...counts, [placeOf(memory)]: (counts[placeOf(memory)] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const journey = [...memories].sort((a, b) => a.memoryDate.localeCompare(b.memoryDate)).slice(-8);

  return (
    <div className="stats-page">
      {header}
      <div className="stat-cards">
        <article><Camera size={20} /><b>{memories.length}</b><span>Memories</span></article>
        <article><MapPin size={20} /><b>{placesCount(memories)}</b><span>Places explored</span></article>
        <article><ImagePlus size={20} /><b>{photos}</b><span>Photos saved</span></article>
        <article><Heart size={20} /><b>{favorites}</b><span>Favorites</span></article>
      </div>
      <div className="insights">
        <article><MapPin size={22} /><span><b>{placesCount(memories)} places explored</b><small>{placeCounts[0] ? `Most visited: ${placeCounts[0][0]}` : 'Pin a place to start'}</small></span></article>
        <article><CalendarDays size={22} /><span><b>{inYear.length} memories in {year}</b><small>{inYear.length ? `${formatDate(inYear[inYear.length - 1].memoryDate, 'month')} – ${formatDate(inYear[0].memoryDate, 'month')}` : 'Nothing saved yet'}</small></span></article>
        <article><ImagePlus size={22} /><span><b>{(photos / memories.length).toFixed(1)} photos per memory</b><small>{photos} photos across your stories</small></span></article>
      </div>
      <div className="stats-grid">
        <section className="panel">
          <header className="panel__head">
            <h2>Activity over time</h2>
            <select value={year} onChange={(event) => setPickedYear(event.target.value)} aria-label="Year">{years.map((value) => <option key={value}>{value}</option>)}</select>
          </header>
          <p className="muted">Memories you saved each month of {year}.</p>
          <div className="bars" role="img" aria-label={`Memories per month in ${year}`}>
            {byMonth.map((count, month) => (
              <div key={MONTHS[month]} className="bars__col">
                <span className="bars__value">{count || ''}</span>
                <span className="bars__bar" style={{ height: `${(count / peak) * 100}%` }} />
                <small>{MONTHS[month]}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Where your memories live</h2>
          <div className="place-bars">
            {placeCounts.slice(0, 6).map(([place, count]) => (
              <div key={place}><span>{place}</span><i><b style={{ width: `${(count / placeCounts[0][1]) * 100}%` }} /></i><small>{count}</small></div>
            ))}
          </div>
        </section>
        <section className="panel stats-journey">
          <h2>Your journey so far</h2>
          <p className="muted">From your first memory to your latest adventure.</p>
          {journey.map((memory) => (
            <Link key={memory.id} to={`/memories/${memory.id}`} className="stop">
              <i /><Thumb memory={memory} />
              <span><b>{placeOf(memory)}</b><span>{memory.title}</span><small>{formatDate(memory.memoryDate)}</small></span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
