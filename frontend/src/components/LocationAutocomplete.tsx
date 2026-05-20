import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useSettings } from './ThemeProvider';

export default function LocationAutocomplete({ placeholder, className, value, onChange, ...props }: any) {
 const { settings } = useSettings();
 const [query, setQuery] = useState(value || "");
 const [isOpen, setIsOpen] = useState(false);
 const [results, setResults] = useState<any[]>([]);
 const [loading, setLoading] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);
 
 const mapProvider = settings?.mapProvider || "osm";
 const mapApiKey = settings?.googleMapsApiKey || "";

 useEffect(() => {
 if (mapProvider === 'google' && mapApiKey && !(window as any).google) {
 const script = document.createElement("script");
 script.src = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}&libraries=places`;
 script.async = true;
 document.head.appendChild(script);
 }
 }, [mapProvider, mapApiKey]);

 useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const handleSearch = async (text: string) => {
 setQuery(text);
 if (onChange) onChange(text);
 if (!text || text.length < 3) {
 setResults([]);
 setIsOpen(false);
 return;
 }
 
 setLoading(true);
 setIsOpen(true);
 
 if (mapProvider === 'google' && (window as any).google) {
 const service = new (window as any).google.maps.places.AutocompleteService();
 service.getPlacePredictions({ input: text, types: ['(regions)'] }, (predictions: any[], status: any) => {
 setLoading(false);
 if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
 setResults(predictions.map((p) => ({ label: p.description, value: p.description })));
 } else {
 setResults([]);
 }
 });
 } else {
 // OSM Nominatim - filtered for administrative boundaries and places
 fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&featuretype=city&limit=5`)
 .then(res => res.json())
 .then(data => {
 setResults(data.map((item: any) => ({
 label: item.display_name,
 value: item.display_name
 })));
 setLoading(false);
 })
 .catch(() => {
 setResults([]);
 setLoading(false);
 });
 }
 };

 return (
 <div className="relative w-full" ref={dropdownRef}>
 <input
 type="text"
 placeholder={placeholder}
 className={className}
 value={query}
 onChange={(e) => handleSearch(e.target.value)}
 onFocus={() => { if (results.length > 0) setIsOpen(true); }}
 {...props}
 />
 {isOpen && (results.length > 0 || loading) && (
 <div className="absolute z-[100] w-full mt-1 bg-card rounded-app border border-border overflow-hidden max-h-64 overflow-y-auto">
 {loading ? (
 <div className="p-4 flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
 <Loader2 className="animate-spin w-4 h-4 mr-2" /> Searching...
 </div>
 ) : (
 <ul className="py-2">
 {results.map((r, i) => (
 <li 
 key={i} 
 className="px-4 py-3 hover:bg-primary/5 cursor-pointer flex items-start gap-3 transition-colors border-b border-border/50 last:border-0"
 onClick={() => {
 setQuery(r.value);
 if (onChange) onChange(r.value);
 setIsOpen(false);
 }}
 >
 <MapPin className="w-4 h-4 text-primary dark:text-white shrink-0 mt-0.5" />
 <span className="text-xs text-foreground/80 font-semibold leading-relaxed">{r.label}</span>
 </li>
 ))}
 </ul>
 )}
 </div>
 )}
 </div>
 );
}
