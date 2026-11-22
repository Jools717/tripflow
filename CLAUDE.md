# TripFlow — guía para Claude

PWA de planificación de viajes (React 19 + TypeScript 7 + Vite 8 + Supabase). Detalle funcional en [README.md](README.md); fases, reglas de negocio y contratos de la base de datos en [ROADMAP.md](ROADMAP.md). Léelos antes de cambios grandes.

## Reglas inamovibles (resumen de ROADMAP §4)
- **Nunca** `git commit` ni `git push`: el usuario los hace a mano. Vercel despliega solo desde GitHub.
- El viaje **Buenos Aires 2026** (`trip-ba-2026`) tiene datos reales: no se rompe ni se borra.
- Estilos de la app solo en `src/index.css` (único archivo madre). Componentes < 250 líneas.
- Antes de dar algo por terminado: `npx tsc --noEmit` y `npm run build` sin errores.
- Cada versión nueva se registra en `src/components/updates/versionConfig.ts`.
- Archivos con finales de línea CRLF: respetarlos al editar.

## Ejecutar comandos (WSL ↔ Windows)
`node_modules` está instalado desde Windows: TypeScript 7 y Vite 8 traen binarios nativos de Windows y **fallan desde Linux/WSL**. Ejecutar con el Node de Windows:

```bash
cd /mnt/c && cmd.exe /c "cd /d C:\PROJECTS\TYPRESCRIPT\trip-flow && npx tsc --noEmit && npm run build"
cd /mnt/c && cmd.exe /c "cd /d C:\PROJECTS\TYPRESCRIPT\trip-flow && npx vite preview --port 4173 --strictPort"   # en segundo plano
```

## Base de datos Supabase (producción)
Proyecto `qewtjswdhpsldsyqkbgo`. Políticas RLS abiertas (`using (true)`) en todas las tablas: es un proyecto de pruebas, decisión del usuario.

Scripts del usuario en `/home/jools/bin/` (permitidos en `~/.claude/settings.json`):
- `node /home/jools/bin/tripflow-backup.mjs` — **copia de seguridad obligatoria antes de cualquier escritura**. Guarda JSON por tabla + `restore.sql` en `C:\Users\Julian\Desktop\tripflow-backups\<fecha>\`.
- `/home/jools/bin/tripflow-sql "<SQL>"` — ejecuta SQL (Management API, token en `.env.local`).
- `/home/jools/bin/tripflow-e2e <script.mjs>` — pruebas Playwright con Edge de Windows; scripts en `C:\Users\Julian\AppData\Local\Temp\tripflow-e2e\` (`smoke.mjs`, `verify.mjs`, `export.mjs`). Requiere la vista previa en el puerto 4173.

Datos de prueba: usar ids/títulos con prefijo `zz` y borrarlos al terminar. `checklist`, `activities` y `expenses` tienen FK a `trips`.

## Autenticación (Fase 8 en curso, ver ROADMAP)
- Supabase Auth: correo + contraseña (con confirmación) y Google. `src/services/authService.ts` / `src/hooks/useAuth.ts`; UI en `src/components/auth/`.
- **AdminJools es una cuenta real** de Supabase Auth (id `26d4da6c-536c-4ed3-91af-62e1f11a28f8`, rol `admin` en `app_metadata`) y es dueña del viaje de Buenos Aires. El antiguo acceso local "12345" ya no existe. `OWNER_USER_ID` / `resolveOwnerId()` en `src/types/user.ts` son el dueño por defecto mientras la app se pueda usar sin sesión (hasta la Fase 8.3); no volver a escribir `'user-admin-jools'`.
- Hasta el paso 8.4, las políticas RLS siguen abiertas: no hay aislamiento real entre usuarios.
- No crear cuentas de prueba a la ligera: cada registro envía un correo y el SMTP de Supabase permite ~2 por hora.
- `App.tsx` es la puerta de acceso: sin sesión solo se muestra `AuthPage`; la app vive en `TripApp.tsx` y recibe `auth` por props (no llamar a `useAuth()` dentro de la app). Cerrar sesión borra los datos locales.
- Pruebas e2e: `gate.mjs` y `auth.mjs` funcionan sin sesión; las de la app (`smoke`, `directions`, `export`, `offline`) necesitan iniciar sesión con una cuenta de pruebas (credenciales en `.env.local` como `E2E_EMAIL` / `E2E_PASSWORD`, nunca en el código).
- Plantillas de correo en español: `supabase/templates/`. Supabase solo deja editarlas con SMTP propio (pendiente).
- Nombre visible: `app_metadata.display_name` tiene prioridad sobre `user_metadata` (Google lo sobrescribe en cada inicio de sesión).

## Decisiones de diseño a respetar
- **Cotización por viaje:** Buenos Aires usa la fila global `trip_settings.id='config'` (Dólar Blue); el resto de viajes, `trips.exchange_rate`. Ver `useTripData.ts`. No volver a escribir la cotización de otro viaje en `trip_settings`.
- **Fechas `YYYY-MM-DD`:** usar `parseLocalDate` / `toLocalIsoDate` / `countTripDays` de `src/utils/helpers.ts`; `new Date('YYYY-MM-DD')` es UTC y resta un día en América.
- **Escrituras en Supabase:** usar siempre `cloudWrite()` (`src/services/cloudQueue.ts`), nunca `supabase.from(...).insert/update/delete` directo: encola los cambios sin conexión y reporta los errores de datos con `reportCloudError()` (badge "Error al guardar"). Las lecturas pueden usar el cliente directamente.
- **Modo offline:** Service Worker generado por `build/serviceWorkerPlugin.js` (plantilla `build/sw-template.js`); solo en producción, así que se prueba con `vite preview`, no con `npm run dev`. Las pruebas e2e deben poner `localStorage.ba_last_seen_app_version` a la versión actual para que el modal de novedades no tape la interfaz.
- **Exportación (Fase 7):** `src/services/export/` (PDF imprimible, `.ics`, resumen WhatsApp) + `src/components/export/ExportModal.tsx`.
- **Cómo llegar:** todo botón de ruta usa `useDirections()` (`src/components/directions/directionsContext.ts`), que abre `DirectionsModal` (pide la ubicación, muestra la ruta con un iframe de **Maps Embed API** y ofrece abrir Google Maps con `origin`). La clave `VITE_GOOGLE_MAPS_EMBED_KEY` está en `.env.local` y en Vercel (Production); restringida en Google Cloud a `trip-flow-app.vercel.app`, `localhost:5173` y `localhost:4173`, y solo a Maps Embed API. Sin clave, el modal funciona sin mapa. No volver a enlazar `google.com/maps/dir` directamente desde un `window.open` tras un `await`: los navegadores móviles lo bloquean.
