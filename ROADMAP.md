# 🌍 Hoja de Ruta Global y Registro Histórico de Evolución (SaaS Viajes)

> **Documento de Contexto y Progreso para Desarrolladores y Agentes de IA**  
> **Última Actualización:** 2 de Noviembre de 2026  
> **Estado General:** Fase 0 Completada al 100% · **Fase 1 en Preparación**

---

## 🎯 1. Visión y Objetivo de la Transformación

Evolucionar la aplicación **"Mi Itinerario Buenos Aires 2026"** (una PWA personal para un solo viaje) hacia una **Plataforma Global Multi-Usuario y Multi-Destino (SaaS)** que permita a cualquier viajero del mundo planificar, presupuestar y ejecutar viajes en cualquier país con la mejor experiencia móvil del mercado.

### Los 4 Pilares Inamovibles del Producto
1. **Itinerario Táctil e Inteligente:** Tablero Kanban con drag & drop y vista Timeline cronológica día a día.
2. **Control Financiero & Liquidez:** Seguimiento de presupuesto, compras multi-ítem, y control estricto de efectivo en mano vs. pagos con tarjeta.
3. **Escáner OCR de Tickets & Facturas:** Extracción de datos en el dispositivo (WebAssembly) con corrección de perspectiva.
4. **Mobile-First PWA Offline-Ready:** Capacidad de instalarse en el celular como app nativa y funcionar sin internet con sincronización en la nube cuando vuelva la señal.

---

## 🧭 2. Tablero de Estado de las Fases

| Fase | Nombre | Alcance Principal | Estado |
|---|---|---|---|
| **Fase 0** | **Arquitectura Base & TypeScript** | React 19 + TypeScript 100% + Desacoplamiento de Servicios y Custom Hooks | ✅ **COMPLETADO** |
| **Fase 1** | **Modelo Multi-Viaje & Top 50 Países** | Marca TripFlow, catálogo Top 50 países, entidad `Trip`, selector y aislamiento por `tripId` | ✅ **COMPLETADO** |
| **Fase 2** | **Multi-Usuario (AdminJools & Auth)** | Usuario `AdminJools` (clave `12345`), modal visual `AuthModal`, migración de Argentina a Admin | ✅ **COMPLETADO** |
| **Fase 3** | **Motor Multi-Divisa Global** | Cotizaciones dinámicas mundiales (USD, EUR, JPY, COP, etc.) + soporte Dólar Blue | 🟢 **EN PROGRESO** |
| **Fase 4** | **Dashboard "Mis Viajes"** | Selector de viajes activos, creación asistida en 3 pasos y cambio de contexto | ⚪ *Pendiente* |
| **Fase 5** | **Guías y Mapas por Destino** | Módulos dinámicos de transporte/supervivencia local y mapas autoadaptables | ⚪ *Pendiente* |

---

## 📜 3. Registro Histórico de Fases

### ✅ Fase 0: Arquitectura Base, TypeScript y Hooks (Completada: Noviembre 2026)
* **Objetivo:** Refactorizar el monolito inicial (~1.154 líneas en `App.jsx` y componentes de +1.000 líneas) para tener una base modular y mantenible.
* **Logros alcanzados:**
  - Migración 100% a TypeScript (`.ts` / `.tsx`). Eliminados todos los `.jsx`.
  - Capa de datos y persistencia extraída a `src/services/` (8 servicios desacoplados de la UI).
  - Componentes divididos en microcomponentes (<250 líneas) por dominio: `itinerary/`, `wallet/`, `scanner/`, `modals/`, `common/`.
  - Creación de Custom Hooks especializados (`useTripSync`, `useItinerary`, `useWallet`, `useTripData`) eliminando el *prop drilling*.
  - `App.tsx` reducido de 1.154 líneas a solo 84 líneas.
  - Creación de `requirements.txt` y documentación completa de compilación sin errores.
  - Mantenimiento estricto del archivo madre único de estilos (`src/index.css`).

---

### ✅ Fase 1: Marca TripFlow, Modelo Multi-Viaje y Top 50 Países (Completada: Noviembre 2026)
* **Objetivo:** Rebranding global provisional a **TripFlow**, creación del catálogo oficial del Top 50 de países del mundo y aislamiento de datos por `trip_id`.
* **Logros alcanzados:**
  - Adopción de la identidad **TripFlow** en `package.json`, `index.html`, `public/manifest.json` y Header.
  - Creación de `GLOBAL_DESTINATIONS` con 51 países mundiales (América, Europa, Asia, Oceanía y África) con sus banderas, monedas oficiales (`JPY`, `EUR`, `USD`, `GBP`, `COP`, `MXN`, etc.), ciudades clave y tasas de cambio aproximadas.
  - Buscador inteligente en `CreateTripModal.tsx` para filtrar instantáneamente entre los 51 países por nombre o ciudad.
  - Aislamiento de datos en `useTripData.ts`: cada viaje tiene su propio conjunto activo de actividades y gastos.
  - Protección y retrocompatibilidad del 100% para el viaje original a **Buenos Aires 2026** (`trip-ba-2026`).

---

### ✅ Fase 2: Autenticación, Usuario AdminJools y Migración de Datos (Completada: Noviembre 2026)
* **Objetivo:** Crear el usuario administrador **AdminJools** (clave `12345`), habilitar inicio de sesión local y en la nube, y migrar toda la información histórica de Argentina a su propiedad.
* **Logros alcanzados:**
  - Perfil oficial de administrador creado: `AdminJools` (`adminjools@tripflow.app`, rol `admin`).
  - Autenticación por credenciales (`AdminJools` / `12345`) en `src/services/authService.ts` y botón de acceso rápido de 1 clic en `AuthModal.tsx`.
  - Migración automática de datos en `src/services/storageService.ts`: todas las actividades, gastos, checklist y categorías del viaje original a Buenos Aires ahora pertenecen explícitamente a `userId: 'user-admin-jools'` y `tripId: 'trip-ba-2026'`.
  - Soporte integrado de Supabase Auth (Google OAuth y Magic Link) como métodos alternativos.

---

### ⚪ Fase 3: Motor Multi-Divisa Global Dinámico

#### 🎯 Objetivo
Soportar viajes a cualquier destino con su moneda local (EUR en Europa, JPY en Japón, GBP en Reino Unido, COP en Colombia, MXN en México, etc.) manteniendo compatibilidad especial con el Dólar Blue de Argentina.

#### 🛠️ Tareas Clave:
1. Crear servicio de divisas `src/services/fxRatesService.ts`.
2. Integrar API pública de tipos de cambio con caché (ej: Open Exchange Rates o ExchangeRate-API).
3. Mantener el conector dedicado de `dolarapi.com` cuando el país sea Argentina (`country_code === 'AR'`).
4. Generalizar los formateadores de divisas en `src/utils/helpers.ts` para aceptar cualquier símbolo y código de moneda ISO (`formatCurrency(amount, currencyCode)`).

---

### ⚪ Fase 4: Dashboard Principal "Mis Viajes" & Asistente de Creación

#### 🎯 Objetivo
Una pantalla principal limpia donde el usuario gestiona sus viajes y puede crear uno nuevo en menos de 1 minuto.

#### 🛠️ Tareas Clave:
1. Vista `src/components/trips/TripsDashboard.tsx`:
   - Lista de tarjetas de viajes (Activos, Pasados, Próximos).
   - Indicador de días restantes para el viaje, presupuesto consumido y destino.
2. Asistente `src/components/trips/CreateTripWizard.tsx`:
   - Paso 1: Destino (Ciudad y País).
   - Paso 2: Fechas (Inicio y Fin).
   - Paso 3: Presupuesto y Moneda preferida.
3. Generador automático de días: Crea la estructura del Kanban según la cantidad de días entre fechas.

---

### ⚪ Fase 5: Guías de Destino y Mapas Dinámicos

#### 🎯 Objetivo
Adaptar la sección de "Guía Porteña" y el mapa a cualquier ciudad del mundo.

#### 🛠️ Tareas Clave:
1. Guías modulares por país:
   - Teléfonos de emergencia locales (911, 112, etc.).
   - Tarjetas y sistemas de transporte público recomendados.
   - Consejos de enchufes y propinas.
2. Centrado inteligente de mapa Leaflet:
   - Al seleccionar un viaje a Tokio, el mapa se inicializa en Tokio.
   - Búsqueda de lugares o geocodificación automática para nuevos pines.

---

## 🛡️ 4. Reglas de Oro para Desarrolladores y Agentes de IA

1. **Retrocompatibilidad Total:** El viaje original a Buenos Aires 2026 nunca debe romperse ni perder datos durante ninguna de las fases.
2. **Cero Commits Automáticos:** Nunca ejecutar `git commit` ni `git push`. El usuario los realiza manualmente.
3. **Mantener `src/index.css` como único archivo madre de estilos:** No fragmentar en múltiples módulos CSS.
4. **Microcomponentes (<250 líneas):** Mantener archivos pequeños y atómicos organizados por dominio.
5. **Verificación Estricta en Cada Paso:** `npx tsc --noEmit` y `npm run build` deben pasar siempre con 0 errores antes de dar por terminada cualquier subtarea.
6. **Estándar Permanente de Novedades y Actualizaciones (Release Onboarding Standard):**
   - Toda nueva versión o mejora mayor debe registrarse en `src/components/updates/versionConfig.ts`.
   - La aplicación detectará automáticamente el cambio de versión:
     - Para nuevos accesos: muestra la barra de progreso animada de optimización y la cuadrícula moderna de novedades con botón de continuar.
     - Para usuarios con la app abierta: muestra la píldora flotante con mensaje directo: `¡Nueva versión lista! Toca aquí para actualizar la app`. Al tocarla, ejecuta la actualización segura con recarga.
7. **Contingencias y Salvaguarda de Datos (Cero Pérdida de Información):**
   - Antes de aplicar cualquier actualización o recargar la página (`window.location.reload()`), se ejecuta obligatoriamente `createSafetyDataBackup()`.
   - Se crea una instantánea inmutable con timestamp en `localStorage` (`ba_safety_backup_latest` y `ba_safety_backup_<timestamp>`).
   - Se asegura el vaciado forzado de estados en memoria antes del reload para que ninguna actividad, gasto o nota se pierda durante la actualización.



---

## 🗄️ 5. Apéndice Técnico: Contratos de Base de Datos y Reglas de Negocio

> **Nota para futuros agentes de IA y desarrolladores:**  
> La base de datos en Supabase está en producción con datos reales del viaje. **No se deben renombrar ni eliminar columnas sin una migración explícita.**

### Tabla `activities`
| Columna en Supabase (`snake_case`) | Propiedad en React (`camelCase`) | Tipo | Descripción |
|---|---|---|---|
| `id` | `id` | `text` (PK) | Ej: `act-1792082845815` |
| `day_number` | `dayNumber` | `integer` | Día del viaje (1 al 14) |
| `time` | `time` | `text` | Ej: `"10:30"` |
| `period` | `period` | `text` | `"mañana"`, `"tarde"`, `"noche"` |
| `title` | `title` | `text` | Título del plan o lote de compra |
| `barrio` | `barrio` | `text` | Ej: `"San Telmo"`, `"Palermo"` |
| `category` | `category` | `text` | `"compras"`, `"mercado"`, `"regalos"`, `"gastronomia"`, etc. |
| `address` | `address` | `text` | Dirección física |
| `lat`, `lng` | `coords` (`[lat, lng]`) | `float` | Coordenadas Leaflet (`[number, number] | null`) |
| `description` | `description` / `items` / `note` | `text` (JSON) | **Crítico:** Almacena compras multi-ítem y notas en formato JSON: `{"type":"compras","items":[{"id":"it-1","name":"Pezuña","price":35000}],"note":"..."}` |
| `tip` | `tip` | `text` | Tip porteño |
| `with_friend` | `withFriend` | `boolean` | Alternador "¿Va mi amiga?" |
| `completed` | `completed` | `boolean` | Checkbox de plan realizado |
| `cost_estimated_ars` | `costEstimatedARS` | `numeric` | Costo estimado en ARS (suma de ítems en compras) |

### Reglas de Negocio Esenciales (¡No Romper!)
1. **Sincronización Espejo Itinerario-Billetera:**  
   Toda actividad con `costEstimatedARS > 0` genera automáticamente un registro espejo en `itineraryExpenses` en la Billetera. Si se edita el valor o los ítems desde la Billetera (`src/components/modals/EditExpenseModal.tsx`), este cambio se sincroniza bidireccionalmente hacia la tarjeta del itinerario (`src/services/mirrorSyncService.ts`).
2. **Compras Multi-ítem (`type === 'compras'`):**  
   El valor `costEstimatedARS` es siempre la suma exacta de los productos en `items: [{ id, name, price }]`.
3. **Notas / Avisos (`type === 'nota'`):**  
   Costo $0, sin botón de Google Maps transit ni cálculo engañoso en billetera.
4. **Control de Liquidez en Billetera:**  
   Seguimiento de **USD 500 cambiados** = $760.000 ARS pactados ($490.000 ARS recibidos en mano), descontando gastos en efectivo vs. pagos con tarjeta frente al tope global de $1.000 USD.
