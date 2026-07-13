import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Listing } from '../lib/types';

function priceIcon(rent: number, active: boolean) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${active ? '#3770BF' : '#1B1E23'};color:#fff;padding:2px 8px;border-radius:999px;font:600 12px sans-serif;white-space:nowrap">₹${Math.round(rent / 1000)}k</div>`,
  });
}

export function MapView({
  listings, activeId, onPin,
}: { listings: Listing[]; activeId?: string; onPin?: (id: string) => void }) {
  const center: [number, number] = listings.length
    ? [listings[0].lat, listings[0].lng]
    : [12.9352, 77.6245];
  return (
    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map(l => (
        <Marker
          key={l.id}
          position={[l.lat, l.lng]}
          icon={priceIcon(l.rent, l.id === activeId)}
          eventHandlers={{ click: () => onPin?.(l.id) }}
        />
      ))}
    </MapContainer>
  );
}
