import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '../data/properties';
import { useLanguage, formatPrice } from '../i18n';

interface Props {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  favorites: Record<number, boolean>;
}

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function MapView({ properties, selectedProperty, onSelectProperty, favorites }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const { language, translateLocation } = useLanguage();

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [36.22, 133.31],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    properties.forEach(property => {
      const isFavorite = favorites[property.id];
      const isNegotiating = property.isNegotiating;
      const isLand = property.type === '空き地';
      
      let color = isLand ? '#22c55e' : '#3b82f6';
      if (isNegotiating) color = '#f59e0b';
      if (isFavorite) color = '#ef4444';
      
      const marker = L.circleMarker([property.lat, property.lng], {
        radius: 10,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      });

      const priceStr = formatPrice(property.priceMan, language);

      marker.bindTooltip(`
        <div class="text-sm">
          <div class="font-bold">${property.listingCode}</div>
          <div>${priceStr}</div>
          <div>${translateLocation(property.location)}</div>
          ${property.layout ? `<div>${property.layout}</div>` : ''}
        </div>
      `, { direction: 'top', offset: [0, -10] });

      marker.on('click', () => {
        onSelectProperty(property);
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [properties, favorites, onSelectProperty, language, translateLocation]);

  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !selectedProperty) return;

    map.flyTo([selectedProperty.lat, selectedProperty.lng], 14, {
      duration: 0.5,
    });

    markersRef.current.forEach((marker, index) => {
      const property = properties[index];
      if (property?.id === selectedProperty.id) {
        marker.setStyle({ weight: 4, radius: 14 });
      } else {
        const isFavorite = favorites[property?.id];
        const isNegotiating = property?.isNegotiating;
        const isLand = property?.type === '空き地';
        let color = isLand ? '#22c55e' : '#3b82f6';
        if (isNegotiating) color = '#f59e0b';
        if (isFavorite) color = '#ef4444';
        marker.setStyle({ weight: 2, radius: 10, fillColor: color });
      }
    });
  }, [selectedProperty, properties, favorites]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full min-h-[300px]"
      style={{ zIndex: 1 }}
    />
  );
}
