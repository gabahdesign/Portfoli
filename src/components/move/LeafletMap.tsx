"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Navigation } from "lucide-react";
import { renderToString } from "react-dom/server";

// We disable SSR for Next.js in the parent component via `next/dynamic`.

// Function to generate dynamic colored MapPins via Lucide SVG
const createCustomIcon = (color: string) => {
  const iconHtml = renderToString(
    <div style={{ color: color, filter: `drop-shadow(0 0 10px ${color})` }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  );
  
  return L.divIcon({
    html: iconHtml,
    className: "custom-leaflet-icon bg-transparent border-none",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function LeafletMap({ activities }: { activities: any[] }) {
  // Filter activities that have valid lat/lng coords
  const validActivities = (activities || []).filter(a => Array.isArray(a.location_coords) ? false : (a.location_coords?.lat && a.location_coords?.lng));
  
  // Center roughly in Catalonia/Montseny area by default, or use the first activity
  const center: [number, number] = validActivities.length > 0 
    ? [parseFloat(validActivities[0].location_coords.lat), parseFloat(validActivities[0].location_coords.lng)] 
    : [41.768, 2.399];

  return (
    <div className="w-full h-full aspect-[21/9] rounded-[2.5rem] border border-[var(--color-border)] overflow-hidden relative shadow-2xl z-0 group">
      <MapContainer 
        center={center} 
        zoom={9} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", backgroundColor: '#0a0a0c', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {validActivities.map(act => (
          <Marker 
            key={act.id} 
            position={[parseFloat(act.location_coords.lat), parseFloat(act.location_coords.lng)]}
            icon={createCustomIcon(act.move_categories?.move_groups?.accent_color || "#156EF6")}
          >
            <Popup className="rounded-xl overflow-hidden shadow-2xl border-none">
               <div className="p-2 min-w-[200px]">
                 <div className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-1" style={{ color: act.move_categories?.move_groups?.accent_color || "#156EF6" }}>
                    {act.move_categories?.name}
                 </div>
                 <div className="font-bold text-gray-900 mb-1">{act.title}</div>
                 <div className="text-xs text-gray-600">{act.location}</div>
                 <div className="text-xs font-medium text-gray-400 mt-2">
                    {new Date(act.start_datetime).toLocaleDateString('ca-ES', { day: 'numeric', month: 'short' })}
                 </div>
               </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* OVERLAY UI OVER MAP */}
      <div className="absolute bottom-6 left-6 p-6 bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl max-w-sm shadow-2xl z-[1000] pointer-events-none transition-opacity duration-300 md:group-hover:opacity-30">
        <div className="flex items-center gap-3 mb-2">
          <Navigation className="text-[var(--color-accent)]" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Vista de Terreny</span>
        </div>
        <h4 className="text-lg font-display font-black text-white">Geolocalització</h4>
        <p className="text-white/60 text-xs mt-1">S'han detectat {validActivities.length} activitats amb coordenades registrades.</p>
      </div>

      <style jsx global>{`
        .leaflet-container {
           font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
           border-radius: 16px !important;
           padding: 0 !important;
           border: 1px solid #e5e7eb;
        }
        .leaflet-popup-tip {
           box-shadow: none !important;
        }
        .custom-leaflet-icon {
           background: transparent;
           border: none;
        }
      `}</style>
    </div>
  );
}
