import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icons broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Punti di interesse principali
const LOCATIONS = {
  home: {
    pos: [40.9151, 14.2629],
    title: '🏠 Casa / Sede',
    desc: 'Arzano (NA)',
    color: '#ef4444' // Rosso come il marker di Google
  },
  field: {
    pos: [40.8381864, 14.1673849],
    title: '🌳 Campo Cinofilo',
    desc: 'SmartDog Napoli - Via Raffaele Ruggiero, 219',
    color: '#0f766e' // Verde acqua brand
  }
};


// Poligono che costeggia l'area metropolitana di Napoli coperta
// Coordinate tracciate seguendo: costa flegrea → Bacoli → Giugliano → Aversa → Acerra → Vesuvio → costa tirrenica
const COVERAGE_POLYGON = [
  [40.9750, 14.2150], // Aversa Nord
  [40.9630, 14.3200], // Afragola / Caivano
  [40.9550, 14.3850], // Acerra Nord
  [40.9200, 14.4200], // Acerra Est
  [40.9000, 14.4350], // Pomigliano Est
  [40.8650, 14.4400], // San Giorgio Cremano / Barra
  [40.8350, 14.4300], // Portici Sud
  [40.8000, 14.4200], // Torre del Greco
  [40.7700, 14.4000], // Torre Annunziata
  [40.7600, 14.3700], // Costa Vesuviana Sud
  [40.7800, 14.3200], // Ercolano costa
  [40.8000, 14.2700], // Napoli Est costa
  [40.8150, 14.2300], // Napoli Centro costa
  [40.8200, 14.1950], // Posillipo / Mergellina
  [40.8180, 14.1600], // Bagnoli
  [40.8250, 14.1250], // Pozzuoli
  [40.8050, 14.0900], // Bacoli
  [40.7950, 14.0650], // Capo Miseno
  [40.8150, 14.0800], // Monte di Procida
  [40.8500, 14.0850], // Licola / Lago Patria
  [40.8950, 14.0950], // Varcaturo
  [40.9300, 14.1300], // Giugliano Sud
  [40.9500, 14.1700], // Giugliano Nord
  [40.9700, 14.1900], // Qualiano / Villaricca
  [40.9750, 14.2150], // chiude su Aversa Nord
];

// Crea un'icona personalizzata con la zampetta
const createPawIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    background: ${color};
    color: white;
    border: 3px solid white;
    border-radius: 50% 50% 50% 0; /* Forma a goccia rovesciata tipo marker */
    transform: rotate(-45deg);
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  ">
    <div style="transform: rotate(45deg); font-size: 16px;">🐾</div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32], // Ancora la punta del marker al punto esatto
  popupAnchor: [0, -32]
});

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    // Adatta la vista per mostrare entrambi i punti e il poligono
    const group = L.featureGroup([
      L.marker(LOCATIONS.home.pos),
      L.marker(LOCATIONS.field.pos),
      L.polygon(COVERAGE_POLYGON)
    ]);
    map.fitBounds(group.getBounds(), { padding: [30, 30] });
  }, [map]);
  return null;
}

export default function CoverageMap() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={LOCATIONS.home.pos}
        zoom={10}
        style={{ width: '100%', height: '100%', borderRadius: '12px' }}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FitBounds />

        {/* Poligono copertura tratteggiato */}
        <Polygon
          positions={COVERAGE_POLYGON}
          pathOptions={{
            color: '#0f766e',
            weight: 2.5,
            dashArray: '10 8',
            dashOffset: '0',
            fillColor: '#14b8a6',
            fillOpacity: 0.07,
          }}
        />

        {/* Marker Casa */}
        <Marker position={LOCATIONS.home.pos} icon={createPawIcon(LOCATIONS.home.color)}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong>{LOCATIONS.home.title}</strong><br />
              {LOCATIONS.home.desc}
            </div>
          </Popup>
        </Marker>

        {/* Marker Campo Cinofilo */}
        <Marker position={LOCATIONS.field.pos} icon={createPawIcon(LOCATIONS.field.color)}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong>{LOCATIONS.field.title}</strong><br />
              {LOCATIONS.field.desc}
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Badge copertura */}
      <div style={{
        position: 'absolute',
        bottom: '12px', left: '12px',
        zIndex: 1000,
        background: 'rgba(255,255,255,0.95)',
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        fontSize: '0.65rem',
        fontWeight: 700,
        color: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{ color: '#042f2e' }}>📍 Copertura: Napoli e Provincia</span>
        <span style={{ color: LOCATIONS.home.color }}>🐾 Casa</span>
        <span style={{ color: LOCATIONS.field.color }}>🐾 Campo</span>
      </div>
    </div>
  );
}
