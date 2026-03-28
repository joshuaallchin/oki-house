import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '../data/properties';
import { PropertyRating } from '../hooks/useNotes';

interface MapViewProps {
  properties: Property[];
  selectedId: number | null;
  onSelectProperty: (id: number) => void;
  getRating: (id: number) => PropertyRating;
}

export default function MapView({ properties, selectedId, onSelectProperty, getRating }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [36.21, 133.31],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    properties.forEach((prop) => {
      const rating = getRating(prop.id);
      const isFav = rating.favorite;
      const isSelected = prop.id === selectedId;

      const color = prop.category === '空き地'
        ? '#059669'
        : isFav
        ? '#e11d48'
        : prop.negotiating
        ? '#f59e0b'
        : '#3b82f6';

      const size = isSelected ? 16 : 10;
      const border = isSelected ? 4 : 2;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: ${color};
          border: ${border}px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: all 0.2s;
        "></div>`,
        iconSize: [size + border * 2, size + border * 2],
        iconAnchor: [(size + border * 2) / 2, (size + border * 2) / 2],
      });

      const marker = L.marker([prop.lat, prop.lng], { icon })
        .addTo(map)
        .bindTooltip(
          `<div style="font-size:12px;min-width:120px;">
            <strong>${prop.listingId}</strong><br/>
            ${prop.location} · ${prop.price}<br/>
            ${prop.layout ? prop.layout + ' · ' : ''}${prop.category}
            ${isFav ? ' ❤️' : ''}
            ${prop.negotiating ? '<br/><span style="color:#f59e0b">商談中</span>' : ''}
          </div>`,
          { direction: 'top', offset: [0, -10] }
        );

      marker.on('click', () => onSelectProperty(prop.id));
      markersRef.current.set(prop.id, marker);
    });
  }, [properties, selectedId, onSelectProperty, getRating]);

  useEffect(() => {
    if (selectedId && mapRef.current) {
      const prop = properties.find((p) => p.id === selectedId);
      if (prop) {
        mapRef.current.flyTo([prop.lat, prop.lng], 14, { duration: 0.5 });
      }
    }
  }, [selectedId, properties]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: '300px' }}
    />
  );
}
