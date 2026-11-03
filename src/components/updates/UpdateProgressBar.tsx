import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface UpdateProgressBarProps {
  onComplete: () => void;
  targetVersion?: string;
}

export default function UpdateProgressBar({
  onComplete,
  targetVersion = '2.0.0'
}: UpdateProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Iniciando comprobación de actualización...');

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      // Smooth progress curve
      const increment = Math.max(1, Math.floor((100 - current) / 6));
      current = Math.min(100, current + increment);
      setProgress(current);

      if (current < 35) {
        setStatusText('Comprobando caché de módulos y TypeScript...');
      } else if (current < 75) {
        setStatusText('Sincronizando servicios en la nube y multi-viaje...');
      } else if (current < 100) {
        setStatusText('Cargando nuevas interfaces y optimizaciones...');
      } else {
        setStatusText('¡Actualización completada con éxito!');
        clearInterval(interval);

        setTimeout(() => {
          onComplete();
        }, 400);
      }
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="update-progress-container animate-fade-in">
      <div className="update-progress-card animate-scale-up">
        
        {/* Animated Icon */}
        <div className="update-pulse-icon-box">
          {progress >= 100 ? (
            <CheckCircle2 size={36} className="text-emerald animate-scale-up" />
          ) : (
            <Sparkles size={34} className="text-sky spin-pulse-icon" />
          )}
        </div>

        <div className="update-progress-text-box">
          <span className="update-badge-pill">Actualización v{targetVersion}</span>
          <h3 className="update-progress-title">
            {progress >= 100 ? '¡Listo para despegar!' : 'Optimizando tu aplicación...'}
          </h3>
          <p className="update-status-detail">{statusText}</p>
        </div>

        {/* Progress Bar Track */}
        <div className="update-bar-track">
          <div
            className="update-bar-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="update-percentage-row">
          <span className="update-step-label">Paso 1 de 2: Instalando componentes</span>
          <span className="update-pct-val">{progress}%</span>
        </div>

      </div>
    </div>
  );
}