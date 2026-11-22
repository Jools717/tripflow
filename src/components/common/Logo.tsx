import React from 'react';

/** Silueta del avión que hace de "T" en el logo de TripFlow (alas = barra de la T). */
export const PLANE_T_PATH =
  'M27 13.5c2.4 0 4.2 1.5 4.2 3.6v1.4l12.8 3.9c1 .3 1.6 1.2 1.6 2.2v4l-14.4-2.4v12.4l5.8 3.9v3.9l-10-2-10 2v-3.9l5.8-3.9V26.2L8.4 28.6v-4c0-1 .6-1.9 1.6-2.2l12.8-3.9v-1.4c0-2.1 1.8-3.6 4.2-3.6z';

/** Ícono de app: avión-T blanco sobre el cuadro azul. */
export function BrandMark({ size = 34, className = '' }: { size?: number; className?: string }) {
  const id = React.useId();
  return (
    <svg className={`tf-brandmark ${className}`} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path d={PLANE_T_PATH} transform="translate(5 2)" fill="#fff" />
    </svg>
  );
}

/** Logotipo "TripFlow": el avión es la T y el resto va en Outfit ExtraBold. tone="light" para fondos azules. */
export function Wordmark({ tone = 'brand', className = '' }: { tone?: 'brand' | 'light'; className?: string }) {
  const id = React.useId();
  return (
    <span className={`tf-wordmark ${tone} ${className}`} role="img" aria-label="TripFlow">
      <svg viewBox="8 13.5 38 33" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#0369a1" />
          </linearGradient>
        </defs>
        <path d={PLANE_T_PATH} fill={tone === 'light' ? '#fff' : `url(#${id})`} />
      </svg>
      <span aria-hidden="true">ripFlow</span>
    </span>
  );
}
