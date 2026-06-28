'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix Leaflet's default icon issue with webpack/nextjs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons based on category
const getCategoryIcon = (category: string) => {
  let color = 'blue';
  switch (category) {
    case 'Pothole': color = 'red'; break;
    case 'Lighting': color = 'yellow'; break;
    case 'Water': color = 'blue'; break;
    case 'Waste': color = 'green'; break;
    case 'Infrastructure': color = 'violet'; break;
  }
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Component to recenter map when tickets change
const MapUpdater = ({ tickets }: { tickets: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (tickets.length > 0) {
      const bounds = L.latLngBounds(tickets.map(t => [t.lat, t.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [tickets, map]);
  return null;
};

export default function TicketMap({ tickets, onSelectTicket }: { tickets: any[], onSelectTicket: (t: any) => void }) {
  // Default center (can be overridden by MapUpdater)
  const defaultCenter: [number, number] = [37.7749, -122.4194]; 

  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <MapContainer center={defaultCenter} zoom={13} className="w-full h-full bg-slate-900 z-0">
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater tickets={tickets} />
        {tickets.map((ticket) => (
          <Marker 
            key={ticket.id} 
            position={[ticket.lat, ticket.lng]}
            icon={getCategoryIcon(ticket.category)}
            eventHandlers={{ click: () => onSelectTicket(ticket) }}
          >
            <Popup className="rounded-lg shadow-xl">
              <div className="font-semibold text-sm">{ticket.category}</div>
              <div className="text-xs text-muted-foreground mt-1">Severity: {ticket.severity}/5</div>
              <div className="text-xs text-muted-foreground">Reports: {ticket.report_count}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
