"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search, MapPin, Navigation, Crosshair, Loader2, X } from "lucide-react";
import { useSettings } from "./ThemeProvider";
import { useToast } from "./Toast";
import { cn } from "@/lib/utils";

// Fix for default Leaflet marker icons
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (data: LocationData) => void;
  addressValue?: string;
  onAddLocation?: (data: LocationData) => void;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function LocationMarker({ lat, lng, onChange }: LocationPickerProps) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
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
            onChange({ lat, lng });
          }
        },
      }}
    />
  );
}

export default function LocationPicker({
  lat,
  lng,
  onChange,
  addressValue,
  onAddLocation,
}: LocationPickerProps) {
  const { settings } = useSettings();
  const { showToast } = useToast();
  const [position, setPosition] = useState<[number, number]>([lat, lng]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [currentLocationData, setCurrentLocationData] = useState<LocationData | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lat !== position[0] || lng !== position[1]) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  useEffect(() => {
    if (addressValue !== undefined && !isFocused && addressValue !== searchQuery) {
      setSearchQuery(addressValue);
    }
  }, [addressValue, isFocused]);

  // Click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      if (settings.mapProvider === "google" && settings.googleMapsApiKey) {
        // Simple autocomplete for OSM as fallback if Google Places API is not integrated
      }
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&email=info@carrental.com`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (err) {
      console.error("Fetch suggestions failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.length >= 3 && searchQuery !== addressValue) {
        fetchSuggestions(searchQuery);
      } else if (!searchQuery) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, addressValue]);

  const reverseGeocode = async (newLat: number, newLng: number) => {
    try {
      if (settings.mapProvider === "google" && settings.googleMapsApiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLat},${newLng}&key=${settings.googleMapsApiKey}`
        );
        const data = await response.json();
        if (data.status === "OK" && data.results[0]) {
          const result = data.results[0];
          const address = result.formatted_address;
          const components = result.address_components;

          let city = "",
            state = "",
            country = "";
          components.forEach((c: any) => {
            if (c.types.includes("locality")) city = c.long_name;
            if (c.types.includes("administrative_area_level_1")) state = c.long_name;
            if (c.types.includes("country")) country = c.long_name;
          });

          setSearchQuery(address);
          const dataObj = { lat: newLat, lng: newLng, address, city, state, country };
          setCurrentLocationData(dataObj);
          onChange(dataObj);
        }
      } else {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&email=info@carrental.com`
        );
        const data = await response.json();
        if (data && data.address) {
          const address = data.display_name;
          const city =
            data.address.city || data.address.town || data.address.village || "";
          const state = data.address.state || "";
          const country = data.address.country || "";
          const postcode = data.address.postcode || "";

          setSearchQuery(address);
          const dataObj = { lat: newLat, lng: newLng, address, city, state, country, postcode };
          setCurrentLocationData(dataObj);
          onChange(dataObj);
        }
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
      onChange({ lat: newLat, lng: newLng });
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation error code:", err.code, "message:", err.message);
        setIsLocating(false);
        let msg = "Unable to retrieve your location.";
        if (err.code === 1) msg = "Location Access Blocked: Please enable location permissions in your browser settings to use the auto-locate feature.";
        else if (err.code === 2) msg = "Location information is unavailable at this moment.";
        else if (err.code === 3) msg = "Location Request Timed Out: The system took too long to retrieve your coordinates.";
        showToast(msg, "info");
      }
    );
  };

  const handleSelectSuggestion = (s: any) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    const address = s.display_name;
    const city = s.address.city || s.address.town || s.address.village || "";
    const state = s.address.state || "";
    const country = s.address.country || "";
    const postcode = s.address.postcode || "";

    setSearchQuery(address);
    setShowSuggestions(false);
    setPosition([lat, lng]);
    const dataObj = { lat, lng, address, city, state, country, postcode };
    setCurrentLocationData(dataObj);
    onChange(dataObj);
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowSuggestions(false);

    try {
      if (settings.mapProvider === "google" && settings.googleMapsApiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            searchQuery
          )}&key=${settings.googleMapsApiKey}`
        );
        const data = await response.json();
        if (data.status === "OK" && data.results[0]) {
          const { lat: newLat, lng: newLng } = data.results[0].geometry.location;
          reverseGeocode(newLat, newLng);
        }
      } else {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=1&email=info@carrental.com`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const first = data[0];
          reverseGeocode(parseFloat(first.lat), parseFloat(first.lon));
        }
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualChange = (data: { lat: number; lng: number }) => {
    reverseGeocode(data.lat, data.lng);
  };

  return (
    <div className="space-y-4">
      <div className="relative group" ref={suggestionsRef}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={`Search address...`}
          className={cn(
            "w-full h-14 bg-white border-2 border-slate-100 rounded-app pl-12 text-sm font-bold text-slate-700 outline-none focus:border-primary transition-all truncate",
            onAddLocation ? "pr-[280px]" : "pr-44"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setSuggestions([]); }}
              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            title="Get Current Location"
            className="h-10 w-10 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-app hover:text-primary hover:bg-white transition-all disabled:opacity-50 active:scale-95"
          >
            {isLocating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Crosshair size={16} />
            )}
          </button>
          {onAddLocation && searchQuery && (
            <button
              type="button"
              onClick={() => {
                if (currentLocationData) {
                  onAddLocation(currentLocationData);
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                  setCurrentLocationData(null);
                }
              }}
              disabled={!currentLocationData}
              className="h-10 px-4 bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-app hover:bg-primary hover:text-white transition-all active:scale-95 disabled:opacity-30"
            >
              Add Location
            </button>
          )}
          {searchQuery && (
            <button
              type="button"
              onClick={handleManualSearch}
              disabled={isSearching}
              className="h-10 px-5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-app hover:bg-secondary transition-all active:scale-95"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : "Search"}
            </button>
          )}
        </div>

        {/* Autocomplete Suggestions */}
        {(showSuggestions || isSearching) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-app shadow-2xl z-[1000] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {isSearching && (
              <div className="p-4 flex items-center justify-center text-slate-400 gap-3">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Searching Database...</span>
              </div>
            )}
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSuggestion(s)}
                className="px-5 py-4 hover:bg-slate-50 cursor-pointer flex items-start gap-4 transition-colors border-b border-slate-50 last:border-none group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                  <MapPin size={14} className="text-slate-400 group-hover:text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-900 leading-tight mb-1 truncate">{s.display_name.split(',')[0]}</p>
                  <p className="text-[10px] font-bold text-slate-400 truncate">{s.display_name}</p>
                </div>
                {onAddLocation && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const lat = parseFloat(s.lat);
                      const lng = parseFloat(s.lon);
                      const city = s.address.city || s.address.town || s.address.village || "";
                      const state = s.address.state || "";
                      const country = s.address.country || "";
                      onAddLocation({ lat, lng, address: s.display_name, city, state, country });
                    }}
                    className="h-8 px-3 bg-slate-50 hover:bg-primary hover:text-white rounded-app text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full h-[400px] rounded-app overflow-hidden border-2 border-slate-100 relative z-0 shadow-sm">
        {settings.mapProvider === "google" && settings.googleMapsApiKey ? (
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/place?key=${settings.googleMapsApiKey}&q=${lat},${lng}&zoom=15`}
            allowFullScreen
          ></iframe>
        ) : (
          <MapContainer
            key="osm-map-container"
            center={position}
            zoom={16}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={position} />
            <LocationMarker lat={lat} lng={lng} onChange={handleManualChange} />
          </MapContainer>
        )}

        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-app border border-slate-200/50 flex items-center gap-3 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">
            {settings.mapProvider === "google"
              ? "Google Maps Engine"
              : "OpenStreetMap Engine"}
          </p>
        </div>
      </div>
    </div>
  );
}
