// Sección "Mapa de planes" del informe PDF: pines por día con Leaflet + OpenStreetMap.
// El informe es un documento aparte, así que Leaflet se carga desde CDN. Sin internet, la sección se retira sola.
import { ExportDay } from './exportData';

const LEAFLET_VERSION = '1.9.4';
export const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

interface MapPoint {
  lat: number;
  lng: number;
  day: number;
  color: string;
  title: string;
}

export const MAP_CSS = `
  .map-wrap { break-inside: avoid; }
  #trip-map { height: 380px; border-radius: 10px; border: 1px solid #e2e8f0; background: #f1f5f9; }
  .pin span {
    display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;
    border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(15,23,42,.35); color: #fff; font: 800 11px/1 system-ui, sans-serif;
  }
  .pin span b { transform: rotate(45deg); }
  .map-legend { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 8px; font-size: 11px; color: #475569; }
  .map-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 4px; vertical-align: -1px; }
  @media print { #trip-map { height: 330px; } }
`;

/** HTML + script del mapa. Devuelve '' si ningún plan tiene coordenadas. */
export const renderMapSection = (days: ExportDay[]): string => {
  const points: MapPoint[] = days.flatMap((d) =>
    d.activities
      .filter((a) => a.type !== 'nota' && a.coords && a.coords.length === 2)
      .map((a) => ({ lat: a.coords![0], lng: a.coords![1], day: d.dayNumber, color: d.color, title: a.title }))
  );
  if (points.length === 0) return '';

  const daysWithPins = days.filter((d) => points.some((p) => p.day === d.dayNumber));
  const legend = daysWithPins
    .map((d) => `<span><i style="background:${d.color}"></i>Día ${d.dayNumber}</span>`)
    .join('');
  // JSON seguro dentro de <script>: evita cerrar la etiqueta con "</"
  const data = JSON.stringify(points).replace(/</g, '\\u003c');

  return `
  <section class="map-wrap" id="map-section">
    <h2>🗺️ Mapa de planes</h2>
    <div id="trip-map" role="img" aria-label="Mapa con ${points.length} planes"></div>
    <div class="map-legend">${legend}</div>
  </section>
  <script>window.__mapReady = false;</script>
  <script src="${LEAFLET_JS}" crossorigin=""></script>
  <script>
  (function () {
    var done = function () { window.__mapReady = true; };
    try {
      if (!window.L) throw new Error('Leaflet no disponible');
      var pts = ${data};
      var map = L.map('trip-map', { zoomControl: false, scrollWheelZoom: false });
      var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap', maxZoom: 18
      }).addTo(map);
      pts.forEach(function (p) {
        L.marker([p.lat, p.lng], {
          title: p.title,
          icon: L.divIcon({ className: 'pin', html: '<span style="background:' + p.color + '"><b>' + p.day + '</b></span>', iconSize: [24, 24], iconAnchor: [12, 24] })
        }).addTo(map);
      });
      map.fitBounds(pts.map(function (p) { return [p.lat, p.lng]; }), { padding: [28, 28], maxZoom: 15 });
      tiles.on('load', done);
      setTimeout(done, 5000);
    } catch (e) {
      var s = document.getElementById('map-section');
      if (s) s.remove();
      done();
    }
  })();
  </script>`;
};
