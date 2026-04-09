"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons in Next.js
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onChange }: LocationPickerProps) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return (
    <Marker
      position={[lat, lng]}
      icon={customIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          if (marker != null) {
            const { lat, lng } = marker.getLatLng();
            onChange(lat, lng);
          }
        },
      }}
    />
  );
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  // Use local state to handle internal map centering without infinite loops
  const [position, setPosition] = useState<[number, number]>([lat, lng]);

  useEffect(() => {
    if (lat !== position[0] || lng !== position[1]) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-slate-200 mt-4 relative z-0">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
          Click or Drag marker to adjust location
        </p>
      </div>
    </div>
  );
}
