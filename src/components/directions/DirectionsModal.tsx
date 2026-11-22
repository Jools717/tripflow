import React, { useCallback, useEffect, useState } from 'react';
import { X, Navigation, MapPin, Loader2, LocateFixed, ExternalLink } from 'lucide-react';
import { Activity } from '../../types/activity';
import { Trip } from '../../types/trip';
import {
  GeoPosition,
  GeoErrorReason,
  TravelMode,
  TRAVEL_MODES,
  getGeoPermission,
  getCurrentPosition,
  buildDirectionsUrl,
  buildEmbedUrl,
  distanceKm,
  formatDistance,
  loadPreferredMode,
  savePreferredMode
} from '../../services/locationService';
import LocationHelp from './LocationHelp';

interface DirectionsModalProps {
  activity: Activity;
  trip: Trip | null;
  onClose: () => void;
}

type Stage = 'checking' | 'ask' | 'locating' | 'ready' | 'error' | 'skipped';

export default function DirectionsModal({ activity, trip, onClose }: DirectionsModalProps) {
  const [stage, setStage] = useState<Stage>('checking');
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [errorReason, setErrorReason] = useState<GeoErrorReason>('unavailable');
  const [mode, setMode] = useState<TravelMode>(loadPreferredMode);

  const locate = useCallback(async () => {
    setStage('locating');
    try {
      setPosition(await getCurrentPosition());
      setStage('ready');
    } catch (err) {
      setErrorReason((err as { reason?: GeoErrorReason })?.reason || 'unavailable');
      setStage('error');
    }
  }, []);

  // Al abrir: si ya hay permiso se ubica directo; si no, se explica antes de pedirlo
  useEffect(() => {
    let cancelled = false;
    getGeoPermission().then((perm) => {
      if (cancelled) return;
      if (perm === 'granted') locate();
      else if (perm === 'denied') { setErrorReason('denied'); setStage('error'); }
      else if (perm === 'unsupported') { setErrorReason('unsupported'); setStage('error'); }
      else setStage('ask');
    });
    return () => { cancelled = true; };
  }, [locate]);

  const handleMode = (m: TravelMode) => {
    setMode(m);
    savePreferredMode(m);
  };

  const urlFromHere = buildDirectionsUrl(activity, trip, mode, position);
  const urlWithoutOrigin = buildDirectionsUrl(activity, trip, mode, null);
  const distance = position && activity.coords ? distanceKm(position, activity.coords) : null;
  // Ruta dentro de la app cuando hay ubicación; si no, solo el destino
  const embedUrl =
    stage === 'ready' ? buildEmbedUrl(activity, trip, mode, position)
    : stage === 'skipped' || stage === 'error' ? buildEmbedUrl(activity, trip, mode, null)
    : null;
  const place = [activity.address || activity.barrio, trip?.destinationCity].filter(Boolean).join(' · ');

  return (
    <div className="modal-backdrop-overlay directions-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="directions-modal-card animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="directions-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="directions-header">
          <span className="directions-header-icon"><Navigation size={20} /></span>
          <div className="directions-header-text">
            <h3 id="directions-title">Cómo llegar</h3>
            <p className="directions-destination">{activity.title}</p>
            {place && <p className="directions-place"><MapPin size={12} /> {place}</p>}
          </div>
          <button type="button" className="export-modal-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="directions-modes" role="radiogroup" aria-label="Medio de transporte">
          {TRAVEL_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              className={`directions-mode-chip ${mode === m.id ? 'active' : ''}`}
              onClick={() => handleMode(m.id)}
            >
              <span aria-hidden="true">{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>

        {(stage === 'checking' || stage === 'locating') && (
          <div className="directions-status">
            <Loader2 size={18} className="directions-spin" />
            <span>{stage === 'checking' ? 'Preparando la ruta…' : 'Buscando tu ubicación…'}</span>
          </div>
        )}

        {stage === 'ask' && (
          <div className="directions-permission-box">
            <LocateFixed size={22} />
            <div>
              <strong>¿Usamos tu ubicación?</strong>
              <p>Así Google Maps te muestra la ruta desde donde estás ahora. Solo se usa para abrir la ruta; no se guarda.</p>
              <div className="directions-permission-actions">
                <button type="button" className="directions-btn-primary" onClick={locate}>
                  Activar mi ubicación
                </button>
                <button type="button" className="directions-btn-ghost" onClick={() => setStage('skipped')}>
                  Ahora no
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="directions-permission-box warn">
            <LocateFixed size={22} />
            <div>
              <LocationHelp reason={errorReason} />
              {errorReason !== 'unsupported' && errorReason !== 'insecure' && (
                <button type="button" className="directions-btn-ghost" onClick={locate}>Reintentar</button>
              )}
            </div>
          </div>
        )}

        {embedUrl && (
          <div className="directions-embed-wrapper">
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={`Ruta a ${activity.title}`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

        {stage === 'ready' && (
          <>
            <p className="directions-located">
              📍 Ubicación detectada{distance !== null ? ` · estás a ${formatDistance(distance)} en línea recta` : ''}
            </p>
            <a className="directions-btn-open" href={urlFromHere} target="_blank" rel="noopener noreferrer" onClick={onClose}>
              <Navigation size={18} />
              <span>{embedUrl ? 'Navegar con Google Maps' : 'Abrir ruta en Google Maps'}</span>
              <ExternalLink size={15} />
            </a>
          </>
        )}

        {stage !== 'ready' && stage !== 'checking' && stage !== 'locating' && (
          <a
            className={stage === 'skipped' ? 'directions-btn-open' : 'directions-link-secondary'}
            href={urlWithoutOrigin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            {stage === 'skipped' && <Navigation size={18} />}
            <span>Abrir en Google Maps sin mi ubicación</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
