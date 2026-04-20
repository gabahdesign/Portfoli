"use client";

import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Search, MapPin, X, Check, Loader2, Navigation } from "lucide-react";
import { geocodeLocation, reverseGeocode } from "@/app/actions/activities";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const customIcon = L.divIcon({
  html: `<div class="text-[var(--color-accent)] drop-shadow-[0_0_10px_var(--color-accent)]">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>`,
  className: "custom-leaflet-icon",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (data: { address: string; lat: number; lng: number }) => void;
  onCancel: () => void;
}

export default function LocationPicker({ initialLat, initialLng, onConfirm, onCancel }: LocationPickerProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<[number, number]>(
    initialLat && initialLng ? [initialLat, initialLng] : [41.768, 2.399]
  );
  const [address, setAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Initialize address if initial coords exist
  useEffect(() => {
    if (initialLat && initialLng && !address) {
      handleReverseGeocode(Number(initialLat), Number(initialLng));
    }
  }, [initialLat, initialLng]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!search.trim()) return;

    setIsSearching(true);
    try {
      const res = await geocodeLocation(search);
      if (res.success && res.lat && res.lng) {
        const newCoords: [number, number] = [Number(res.lat), Number(res.lng)];
        setCoords(newCoords);
        if (res.display_name) {
          setAddress(res.display_name);
          setSearch(res.display_name);
        } else {
          handleReverseGeocode(newCoords[0], newCoords[1]);
        }
      } else {
        alert("No s'ha trobat cap ubicació per aquesta cerca.");
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    setCoords([lat, lng]);
    handleReverseGeocode(lat, lng);
  };

  const handleReverseGeocode = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await reverseGeocode(lat, lng);
      if (res.success) {
        setAddress(res.address || "");
        if (!search) setSearch(res.address || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center sm:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full h-full sm:max-w-4xl sm:h-[80vh] flex flex-col bg-[var(--color-surface)] sm:border border-[var(--color-border)] sm:rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Header with Search */}
        <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 space-y-4">
           <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-display font-black tracking-tight">Tria la Ubicació</h3>
              <button onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
           </div>
           
           <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" size={18} />
              <input 
                type="text" 
                autoFocus
                placeholder="Cerca un lloc..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl pl-12 pr-28 py-4 text-sm outline-none focus:border-[var(--color-accent)] transition-all shadow-inner"
              />
              <button 
                type="submit" 
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--color-accent)] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="animate-spin" size={14} /> : "Cercar"}
              </button>
           </form>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative z-0">
          <MapContainer 
            center={coords} 
            zoom={13} 
            zoomControl={false}
            style={{ height: "100%", width: "100%", cursor: 'crosshair' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <ChangeView center={coords} />
            <MapEvents onLocationSelect={handleLocationSelect} />
            <Marker position={coords} icon={customIcon} />
          </MapContainer>

          {/* Map Overlay Info */}
          <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-6 p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[1000] flex flex-col sm:flex-row items-center gap-4">
             <div className="flex items-center gap-4 w-full sm:w-auto">
               <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] shrink-0">
                  <MapPin size={20} />
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--color-accent)] mb-1">Ubicació Seleccionada</p>
                  <p className="text-xs text-white font-medium truncate">{loading ? "Carregant adreça..." : (address || "Clica al mapa per triar")}</p>
               </div>
             </div>
             <button 
               onClick={() => onConfirm({ address, lat: coords[0], lng: coords[1] })}
               className="w-full sm:w-auto bg-[var(--color-accent)] text-white px-8 py-4 sm:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--color-accent-glow)] hover:scale-105 transition-all"
               disabled={loading || !address}
             >
                Confirmar Ubicació
             </button>
          </div>
        </div>

        {/* CSS for Leaflet icons */}
        <style jsx global>{`
          .custom-leaflet-icon {
            background: transparent !important;
            border: none !important;
          }
          .leaflet-container {
            font-family: inherit !important;
            background-color: #0a0a0c !important;
          }
        `}</style>
      </div>
    </div>
  );
}
