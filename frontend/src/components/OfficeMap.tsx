"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet marker icons
const customIcon = L.icon({
 iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
 iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
 shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
 iconSize: [25, 41],
 iconAnchor: [12, 41],
 popupAnchor: [1, -34],
 shadowSize: [41, 41]
});

interface OfficeLocation {
 city: string;
 address: string;
 lat?: number;
 lng?: number;
}

const DEFAULT_COORDS: Record<string, { lat: number; lng: number }> = {
 "New York": { lat: 40.6413, lng: -73.7781 },
 "London": { lat: 51.4700, lng: -0.4543 },
 "Dubai": { lat: 25.2532, lng: 55.3657 }
};

export default function OfficeMap({ locations }: { locations: OfficeLocation[] }) {
 const [mapId, setMapId] = useState<string | null>(null);

 useEffect(() => {
 setMapId(`office-map-${Math.random().toString(36).substring(2, 9)}`);
 }, []);

 const processedLocations = useMemo(() => {
 return locations.map(loc => {
 if (loc.lat && loc.lng) return loc;
 const fallback = DEFAULT_COORDS[loc.city] || { lat: 0, lng: 0 };
 return { ...loc, ...fallback };
 }).filter(loc => loc.lat !== 0 || loc.lng !== 0);
 }, [locations]);

 if (!mapId) {
 return (
 <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center rounded-app">
 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Initializing Geographic Grid...</span>
 </div>
 );
 }

 // Calculate center of all locations or default to a global view
 const center: [number, number] = processedLocations.length > 0 
 ? [processedLocations[0].lat!, processedLocations[0].lng!]
 : [20, 0];

 return (
 <div className="w-full h-full rounded-app overflow-hidden">
 <MapContainer 
 key={mapId}
 center={center} 
 zoom={2} 
 scrollWheelZoom={false} 
 className="w-full h-full z-0"
 >
 <TileLayer
 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
 />
 {processedLocations.map((loc, i) => (
 <Marker key={i} position={[loc.lat!, loc.lng!]} icon={customIcon}>
 <Popup>
 <div className="p-1">
 <h4 className="font-black text-xs uppercase tracking-tight mb-1">{loc.city}</h4>
 <p className="text-[10px] text-slate-500 font-bold leading-tight">{loc.address}</p>
 </div>
 </Popup>
 </Marker>
 ))}
 </MapContainer>
 </div>
 );
}
