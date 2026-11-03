import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Calendar, Filter, MapPin, Compass } from 'lucide-react';
import { Activity } from '../types/activity';
import { Trip } from '../types/trip';
import { INITIAL_DAYS, generateTripDays } from '../data/initialData';
import { getGoogleMapsTransitUrl, getCategoryBadge } from '../utils/helpers';
import { getDestinationCoordinates } from '../data/cityCoordinates';

interface MapViewProps {
  activities: Activity[];
  selectedActivity?: Activity | null;
  onSelectActivity?: (activity: Activity | null) => void;
  activeTrip?: Trip | null;
}

export default function MapView({ activities, selectedActivity, activeTrip }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [filterDay, setFilterDay] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const destinationCoords = useMemo(() => {
    return getDestinationCoordinates(activeTrip?.destinationCity, activeTrip?.countryCode);
  }, [activeTrip?.destinationCity, activeTrip?.countryCode]);

  const days = useMemo(() => {
    if (activeTrip) {
      return generateTripDays(activeTrip);
    }
    return INITIAL_DAYS;
  }, [activeTrip]);

  const validActivities = activities.filter(a => a.coords && Array.isArray(a.coords) && a.coords.length === 2);

  const filteredPlaces = validActivities.filter(a => {
    if (filterDay !== 'all' && a.dayNumber !== Number(filterDay)) return false;
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: destinationCoords,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center when activeTrip destination coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (filteredPlaces.length === 0) {
      mapInstanceRef.current.setView(destinationCoords, 13);
    }
  }, [destinationCoords, filteredPlaces.length]);

  // Update Markers when filters or activities change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    filteredPlaces.forEach(act => {
      if (!act.coords) return;
      const [lat, lng] = act.coords;
      const catBadge = getCategoryBadge(act.category);
      const mapsUrl = getGoogleMapsTransitUrl(act);

      const customIcon = L.divIcon({
        className: 'custom-map-marker-wrapper',
        html: `
          <div class="custom-marker-pin" style="background-color: ${catBadge.color}">
            <span class="marker-day-number">D${act.dayNumber}</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div class="map-popup-card">
          <div class="popup-header">
            <span class="popup-day-tag">Día ${act.dayNumber} · ${act.barrio}</span>
            <span class="popup-time">${act.time} hs</span>
          </div>
          <h4 class="popup-title">${act.title}</h4>
          ${act.address ? `<p class="popup-address">📍 ${act.address}</p>` : ''}
          ${act.tip ? `<p class="popup-tip">💡 ${act.tip}</p>` : ''}
          <div class="popup-footer">
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="popup-maps-btn">
              <span>Cómo llegar (Google Maps)</span>
              <span class="btn-arrow">↗</span>
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersLayerRef.current?.addLayer(marker);
      bounds.extend([lat, lng]);

      if (selectedActivity && selectedActivity.id === act.id) {
        setTimeout(() => {
          marker.openPopup();
          mapInstanceRef.current?.setView([lat, lng], 15);
        }, 150);
      }
    });

    if (filteredPlaces.length > 0 && !selectedActivity) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [filteredPlaces, selectedActivity]);

  return (
    <div className="map-view-container">
      {/* Controls & Filter bar */}
      <div className="map-controls-card">
        <div className="map-controls-row">
          
          <div className="control-field">
            <label className="control-label">
              <Calendar size={14} />
              <span>Filtrar por Día:</span>
            </label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="map-filter-select"
            >
              <option value="all">Todos los días ({days.length} Días)</option>
              {days.map(d => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Día {d.dayNumber}: {d.barrioPrincipal}
                </option>
              ))}
            </select>
          </div>

          <div className="control-field">
            <label className="control-label">
              <Filter size={14} />
              <span>Categoría:</span>
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="map-filter-select"
            >
              <option value="all">Todas las categorías</option>
              <option value="gastronomia">Gastronomía & Bares</option>
              <option value="cultura">Cultura & Monumentos</option>
              <option value="naturaleza">Parques & Naturaleza</option>
              <option value="vida_nocturna">Vida Nocturna & Fiestas</option>
              <option value="compras">Compras & Tiendas</option>
              <option value="transporte">Transporte & Llegadas</option>
            </select>
          </div>

          <div className="map-quick-count">
            <MapPin size={14} className="text-sky" />
            <span><strong>{filteredPlaces.length}</strong> puntos marcados</span>
          </div>

        </div>
      </div>

      {/* Destination Location Info Banner */}
      {filteredPlaces.length === 0 && (
        <div className="map-empty-destination-notice">
          <Compass size={16} className="text-sky" />
          <span>
            Centrado en <strong>{activeTrip?.flagEmoji || '🌍'} {activeTrip?.destinationCity || 'tu destino'}</strong>. Al agregar planes con dirección en el Itinerario se marcarán automáticamente con su pin aquí.
          </span>
        </div>
      )}

      {/* Map Container */}
      <div className="map-canvas-wrapper">
        <div ref={mapContainerRef} className="leaflet-map-element" />
      </div>

      {/* Quick Transit Legend / Hint */}
      <div className="map-transit-legend">
        <p>
          💡 <strong>Tip de navegación:</strong> Toca cualquier marcador para ver detalles y presiona 
          <strong> "¿Cómo llegar?"</strong> para abrir <strong>Google Maps</strong> con las rutas óptimas de 
          <strong> transporte público</strong> en {activeTrip?.destinationCity || 'tu destino'} desde tu ubicación actual.
        </p>
      </div>

    </div>
  );
}
