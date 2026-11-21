import { Crosshair, LoaderCircle, MapPin, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { pinIcon, SRI_LANKA, TILE_ATTRIBUTION, TILE_URL } from '../lib/mapConfig';

export type PickedLocation = { name: string; latitude: number | null; longitude: number | null };
type Result = { display_name: string; lat: string; lon: string; name?: string };

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const shortName = (result: Result) => result.name || result.display_name.split(',').slice(0, 2).join(',').trim();

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(`${NOMINATIM}/reverse?format=jsonv2&zoom=12&lat=${lat}&lon=${lon}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) return '';
    const result = (await response.json()) as Result;
    return result.display_name ? result.display_name.split(',').slice(0, 2).join(',').trim() : '';
  } catch {
    return '';
  }
}

function ClickToPick({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({ click: (event) => onPick(event.latlng.lat, event.latlng.lng) });
  return null;
}

function FollowPoint({ point }: { point: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    // Unanimated: a zoom animation still running when the form navigates away makes Leaflet throw after the map is removed.
    if (point) map.setView(point, Math.max(map.getZoom(), 11), { animate: false });
  }, [map, point]);
  return null;
}

export function LocationPicker({ value, onChange, error }: { value: PickedLocation; onChange: (value: PickedLocation) => void; error?: string }) {
  const [results, setResults] = useState<Result[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');
  const point: [number, number] | null = value.latitude !== null && value.longitude !== null ? [value.latitude, value.longitude] : null;

  const search = async () => {
    const q = value.name.trim();
    if (q.length < 2) return setMessage('Type a place name to search.');
    setSearching(true);
    setMessage('');
    try {
      const response = await fetch(`${NOMINATIM}/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`, { headers: { Accept: 'application/json' } });
      const found = response.ok ? ((await response.json()) as Result[]) : [];
      setResults(found);
      if (found.length === 0) setMessage('No places found. Try another name, or tap the map to drop a pin.');
    } catch {
      setMessage('Place search is unavailable right now. Tap the map to drop a pin instead.');
    } finally {
      setSearching(false);
    }
  };

  const pickPoint = async (lat: number, lon: number) => {
    const latitude = Number(lat.toFixed(6));
    const longitude = Number(lon.toFixed(6));
    onChange({ ...value, latitude, longitude });
    if (!value.name.trim()) {
      const name = await reverseGeocode(latitude, longitude);
      if (name) onChange({ name, latitude, longitude });
    }
  };

  const useCurrent = () => {
    if (!navigator.geolocation) return setMessage('Your browser cannot share its location.');
    setMessage('Finding you…');
    navigator.geolocation.getCurrentPosition(
      (position) => { setMessage(''); void pickPoint(position.coords.latitude, position.coords.longitude); },
      () => setMessage('Location permission was denied. Search or tap the map instead.'),
      { timeout: 10_000 },
    );
  };

  return (
    <div className={`picker ${error ? 'picker--error' : ''}`}>
      <div className="picker__bar">
        <span className="field__control">
          <MapPin size={18} />
          <input
            value={value.name}
            onChange={(event) => { onChange({ ...value, name: event.target.value }); setResults(null); }}
            onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void search(); } }}
            placeholder="Choose a place… e.g. Galle Fort"
            aria-label="Location name"
            maxLength={255}
          />
        </span>
        <button type="button" className="btn btn--soft" onClick={search} disabled={searching}>
          {searching ? <LoaderCircle className="spin" size={17} /> : <Search size={17} />}Search
        </button>
        <button type="button" className="btn btn--soft icon-only" onClick={useCurrent} aria-label="Use my current location" title="Use my current location"><Crosshair size={17} /></button>
      </div>
      {results && results.length > 0 && (
        <ul className="picker__results" role="listbox">
          {results.map((result) => (
            <li key={`${result.lat},${result.lon}`}>
              <button type="button" onClick={() => { onChange({ name: shortName(result), latitude: Number(Number(result.lat).toFixed(6)), longitude: Number(Number(result.lon).toFixed(6)) }); setResults(null); }}>
                <MapPin size={15} /><span><b>{shortName(result)}</b><small>{result.display_name}</small></span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="picker__map">
        <MapContainer center={point ?? SRI_LANKA} zoom={point ? 11 : 7} scrollWheelZoom={false} className="picker__canvas">
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
          <ClickToPick onPick={pickPoint} />
          <FollowPoint point={point} />
          {point && <Marker position={point} icon={pinIcon()} />}
        </MapContainer>
        <span className="picker__hint">{point ? `${point[0].toFixed(4)}°, ${point[1].toFixed(4)}°` : 'Tap the map to drop a pin'}</span>
        {point && <button type="button" className="picker__clear" onClick={() => onChange({ ...value, latitude: null, longitude: null })} aria-label="Remove pin"><X size={15} /></button>}
      </div>
      {(error || message) && <small className={error ? 'field__error' : 'field__hint'}>{error || message}</small>}
    </div>
  );
}
