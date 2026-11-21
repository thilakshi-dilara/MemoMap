import { Search } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { matchesQuery, placeOf, type Memory } from '../lib/memories';

export function useMemoryFilters(memories: Memory[] | null) {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const year = params.get('year') ?? '';
  const place = params.get('place') ?? '';
  const favorites = params.get('favorites') === '1';
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const years = useMemo(() => [...new Set((memories ?? []).map((memory) => memory.memoryDate.slice(0, 4)))].sort().reverse(), [memories]);
  const places = useMemo(() => [...new Set((memories ?? []).map(placeOf))].sort(), [memories]);
  const filtered = useMemo(
    () => (memories ?? []).filter((memory) => matchesQuery(memory, query) && (!year || memory.memoryDate.startsWith(year)) && (!place || placeOf(memory) === place) && (!favorites || memory.isFavorite)),
    [memories, query, year, place, favorites],
  );
  const active = Boolean(query || year || place || favorites);
  const bar = (
    <div className="filters">
      <label className="filters__search">
        <Search size={18} />
        <input type="search" value={query} onChange={(event) => update('q', event.target.value)} placeholder="Search your memories..." aria-label="Search your memories" />
      </label>
      <div className="filters__chips">
        <button className={`pill ${!active ? 'is-on' : ''}`} onClick={() => setParams(new URLSearchParams(), { replace: true })}>All memories</button>
        <button className={`pill ${favorites ? 'is-on' : ''}`} onClick={() => update('favorites', favorites ? '' : '1')}>Favorites</button>
        <select className={`pill ${year ? 'is-on' : ''}`} value={year} onChange={(event) => update('year', event.target.value)} aria-label="Filter by year">
          <option value="">All years</option>
          {years.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select className={`pill ${place ? 'is-on' : ''}`} value={place} onChange={(event) => update('place', event.target.value)} aria-label="Filter by place">
          <option value="">All places</option>
          {places.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
    </div>
  );
  return { filtered, bar, active };
}
