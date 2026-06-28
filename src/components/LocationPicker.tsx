"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

export default function LocationPicker({ position, setPosition }: { position: [number, number] | null, setPosition: (p: [number, number]) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !position) return <div className="h-48 w-full bg-slate-800 animate-pulse rounded-xl" />;

  const center = { lat: position[0], lng: position[1] };

  return (
    <div className="h-48 w-full rounded-xl overflow-hidden border border-slate-700 z-0 relative">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={center}
          defaultZoom={13}
          mapId="LOCATION_PICKER_MAP_ID"
          disableDefaultUI={true}
          gestureHandling="greedy"
          style={{ width: "100%", height: "100%" }}
          onClick={(e) => {
            if (e.detail.latLng) {
              setPosition([e.detail.latLng.lat, e.detail.latLng.lng]);
            }
          }}
        >
          <AdvancedMarker position={center}>
            <Pin background="#6366f1" borderColor="#ffffff" glyphColor="#ffffff" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}
