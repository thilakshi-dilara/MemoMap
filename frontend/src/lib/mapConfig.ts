import L from 'leaflet';

export const SRI_LANKA: [number, number] = [7.8731, 80.7718];
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function pinIcon(selected = false, photo?: string | null) {
  const root = document.createElement('span');
  root.className = `map-pin${selected ? ' map-pin--active' : ''}`;
  const head = document.createElement('span');
  head.className = 'map-pin__head';
  if (selected && photo) {
    const image = document.createElement('span');
    image.className = 'map-pin__photo';
    image.style.backgroundImage = `url("${encodeURI(photo)}")`;
    head.appendChild(image);
  }
  root.appendChild(head);
  const size: [number, number] = selected ? [52, 62] : [30, 38];
  return L.divIcon({ html: root, className: 'map-pin-wrap', iconSize: size, iconAnchor: [size[0] / 2, size[1]], popupAnchor: [0, -size[1] + 4] });
}
