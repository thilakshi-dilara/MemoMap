import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { pinIcon, SRI_LANKA, TILE_ATTRIBUTION, TILE_URL } from '../lib/mapConfig';
import { coverOf, formatDate, hasCoords, placeOf, type Memory } from '../lib/memories';

type Located = Memory & { latitude: number; longitude: number };

function fitAll(map: L.Map, points: Located[], animate: boolean) {
  if (points.length === 0) map.setView(SRI_LANKA, 7, { animate });
  else if (points.length === 1) map.setView([points[0].latitude, points[0].longitude], 11, { animate });
  else map.fitBounds(L.latLngBounds(points.map((point) => [point.latitude, point.longitude])), { padding: [40, 40], maxZoom: 11, animate });
}

function FitToMemories({ points }: { points: Located[] }) {
  const map = useMap();
  useEffect(() => {
    fitAll(map, points, false);
  }, [map, points]);
  return null;
}

function FocusSelected({ point, markers }: { point?: Located; markers: React.RefObject<Record<string, L.Marker | null>> }) {
  const map = useMap();
  useEffect(() => {
    if (!point) return;
    map.flyTo([point.latitude, point.longitude], Math.max(map.getZoom(), 9), { duration: 0.6 });
    markers.current[point.id]?.openPopup();
  }, [map, point, markers]);
  return null;
}

type Props = {
  memories: Memory[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showPath?: boolean;
  className?: string;
  scrollZoom?: boolean;
  children?: React.ReactNode;
};

export function MemoryMap({ memories, selectedId, onSelect, showPath = false, className = '', scrollZoom = false, children }: Props) {
  const points = useMemo(() => memories.filter(hasCoords), [memories]);
  const path = useMemo(() => [...points].sort((a, b) => a.memoryDate.localeCompare(b.memoryDate)).map((point) => [point.latitude, point.longitude] as [number, number]), [points]);
  const markers = useRef<Record<string, L.Marker | null>>({});
  const mapRef = useRef<L.Map | null>(null);
  const selected = points.find((point) => point.id === selectedId);

  return (
    <div className={`memory-map ${className}`}>
      <MapContainer ref={mapRef} center={SRI_LANKA} zoom={7} scrollWheelZoom={scrollZoom} className="memory-map__canvas">
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <FitToMemories points={points} />
        <FocusSelected point={selected} markers={markers} />
        {showPath && path.length > 1 && <Polyline positions={path} pathOptions={{ color: '#7c62ef', weight: 2, dashArray: '6 7', opacity: 0.75 }} />}
        {points.map((memory) => {
          const cover = coverOf(memory);
          return (
            <Marker
              key={memory.id}
              position={[memory.latitude, memory.longitude]}
              icon={pinIcon(memory.id === selectedId, cover)}
              ref={(marker) => { markers.current[memory.id] = marker; }}
              eventHandlers={{ click: () => onSelect?.(memory.id) }}
              title={memory.title}
            >
              <Popup className="map-popup" closeButton={false}>
                <Link to={`/memories/${memory.id}`} className="map-popup__card">
                  {cover ? <img src={cover} alt="" /> : <span className="map-popup__ph" />}
                  <span>
                    <b>{memory.title}</b>
                    <small>{placeOf(memory)} · {formatDate(memory.memoryDate, 'month')}</small>
                    <em>Open memory →</em>
                  </span>
                </Link>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <button type="button" className="memory-map__recenter" onClick={() => mapRef.current && fitAll(mapRef.current, points, true)} aria-label="Show all memories" title="Show all memories">
        <LocateFixed size={18} />
      </button>
      {points.length > 0 && <span className="memory-map__count"><i />{new Set(points.map((point) => placeOf(point))).size} places · {points.length} memories</span>}
      {children}
    </div>
  );
}
