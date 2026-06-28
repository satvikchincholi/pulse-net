"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";

const severityColors = {
  low: "#10b981",      // emerald-500
  medium: "#eab308",   // yellow-500
  high: "#f97316",     // orange-500
  critical: "#ef4444"  // red-500
};

interface Ticket {
  id: string;
  lat: number;
  lng: number;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  reported_area: string;
  bounty_amount: number;
}

export default function ResponderMap({ tickets, onSelectTicket }: { tickets: Ticket[], onSelectTicket: (t: Ticket) => void }) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Geolocation error:", err)
      );
    }
  }, []);

  // If no tickets and we haven't resolved user location yet, show loading state
  if (tickets.length === 0 && !userLocation) {
    return <div className="w-full h-full bg-slate-800 animate-pulse rounded-xl" />;
  }

  // Use a default center if no tickets
  const defaultCenter = tickets.length > 0 
    ? { lat: tickets[0].lat, lng: tickets[0].lng } 
    : (userLocation || { lat: 40.7128, lng: -74.0060 }); // e.g. NYC fallback
  
  return (
    <div className="w-full h-full relative z-0">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={13}
          mapId="PULSE_NET_MAP_ID"
          disableDefaultUI={true}
          gestureHandling="greedy"
          style={{ width: "100%", height: "100%" }}
        >
          {tickets.map((ticket) => (
            <AdvancedMarker
              key={ticket.id}
              position={{ lat: ticket.lat, lng: ticket.lng }}
              onClick={() => setSelectedTicket(ticket)}
            >
              <Pin 
                background={severityColors[ticket.severity] || severityColors.low} 
                borderColor="#ffffff" 
                glyphColor="#ffffff" 
              />
            </AdvancedMarker>
          ))}

          {selectedTicket && (
            <InfoWindow
              position={{ lat: selectedTicket.lat, lng: selectedTicket.lng }}
              onCloseClick={() => setSelectedTicket(null)}
              headerContent={<div className="font-semibold text-slate-900">{selectedTicket.category}</div>}
            >
              <div className="text-slate-900 min-w-[150px] p-1">
                <div className="text-xs text-slate-600 capitalize mb-3">{selectedTicket.severity} Priority</div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelectTicket(selectedTicket); }}
                  className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-500 w-full font-medium"
                >
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
