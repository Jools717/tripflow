# 🌍 Hoja de Ruta Global y Registro Histórico de Evolución (SaaS Viajes)

> **Documento de Contexto y Progreso para Desarrolladores y Agentes de IA**  
> **Última Actualización:** 2 de Noviembre de 2026  
> **Estado General:** Fases 0, 1, 2, 3, 4, 5 y 6 Completadas al 100% · **Fase 7 en Preparación (Exportación PDF & Calendario)**

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
| **Fase 3** | **Motor Multi-Divisa Global** | Cotizaciones dinámicas mundiales (USD, EUR, JPY, COP, etc.) + soporte Dólar Blue y Banderas | ✅ **COMPLETADO** |
| **Fase 4** | **Dashboard "Mis Viajes"** | Selector de viajes activos, creación asistida en 3 pasos y cambio de contexto | ✅ **COMPLETADO** |
| **Fase 5** | **Guías y Mapas por Destino** | Módulos dinámicos de transporte/supervivencia local y mapas autoadaptables | ✅ **COMPLETADO** |
| **Fase 6** | **Colaboración & Cloud Sync** | Migración de base de datos ejecutada, aislamiento por tripId/userId y Realtime | ✅ **COMPLETADO** |
| **Fase 7** | **Exportación & Calendario** | Exportar a PDF ejecutivo, sincronizar a Google Calendar / Apple Calendar (.ics) | 🟡 **SIGUIENTE PASO** |

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

### ✅ Fase 3: Motor Multi-Divisa Global Dinámico (Completada: Noviembre 2026)

#### 🎯 Objetivo
Transformar el motor financiero para soportar viajes a cualquier destino con su moneda local (EUR en Europa, JPY en Japón, GBP en Reino Unido, COP en Colombia, MXN en México, BRL en Brasil, etc.) manteniendo compatibilidad especial y retrocompatible con el Dólar Blue de Argentina y banderas visuales en toda la interfaz.

#### 🛠️ Especificación Detallada y Tareas Ejecutadas:
- [x] **1. Servicio Global de Tipos de Cambio (`src/services/fxRatesService.ts`):** ✅
  - Conector dual inteligente:
    - Si el viaje es a Argentina (`AR`), consulta en tiempo real `dolarapi.com` (Dólar Blue compra/venta).
    - Para los otros 50 destinos mundiales, consulta tipos de cambio internacionales en vivo (USD a EUR, JPY, GBP, COP, MXN, etc.) mediante API pública con caché en `localStorage` (evitando llamadas innecesarias y funcionando 100% offline).
  - Almacenamiento de cotización manual por viaje para cuando el usuario cambia divisas a tasas pactadas.
- [x] **2. Generalización de Formateadores Financieros y Banderas (`src/utils/helpers.ts`):** ✅
  - Migración y tipado 100% TypeScript de `src/utils/helpers.ts` eliminando el archivo `.js`.
  - Diccionario maestro `CURRENCY_REGISTRY` y `COUNTRY_FLAGS` para el Top 50 países.
  - Implementación de `formatCurrency(amount, currencyCode, options)` basado en `Intl.NumberFormat` nativo del navegador con soporte de banderas emoji.
  - Funciones `getCurrencyFlag(currencyCode, countryCode)` y `getCurrencySymbol(currencyCode)`.
  - Preservación de `formatCurrencyARS()` para total retrocompatibilidad con las pantallas existentes.
- [x] **3. Adaptación Dinámica del Header y Ticker con Banderas (`src/components/common/Header.tsx`):** ✅
  - Widget de tipo de cambio reactivo: muestra el par con banderas `{baseFlag} 1 {baseCurrency} = {localFlag} [X] {localCurrency}`.
  - Botón "En vivo" contextual: si el viaje es Argentina consulta Dólar Blue; si es Japón consulta JPY en tiempo real; si es Europa consulta EUR en tiempo real.
  - Toast de confirmación en vivo (`.rate-feedback-toast`).
  - Indicadores de presupuesto en Header adaptados a la moneda base y local del viaje activo.
- [x] **4. Adaptación Integral de la Billetera (`src/components/wallet/`):** ✅
  - `WalletHero.tsx`: Banderas de divisa base y local, consulta en vivo internacional, cálculo de remanente en moneda local y base.
  - `LiquidityTracker.tsx`: Adaptación para mostrar seguimiento de efectivo en la moneda local (`localFlag` y `localCurrency`) y tarjeta frente al presupuesto.
  - `ExpenseRow.tsx`: Badge dual con banderas (`{localFlag} {formatCurrency}` y `{baseFlag} ${USD}`).
  - `AddExpenseForm.tsx`: Selector alternador entre moneda local con bandera (`{localFlag} En JPY`) o divisa base (`{baseFlag} En USD`) con previsualización simultánea.

---

### ✅ Fase 4: Dashboard Principal "Mis Viajes" & Asistente de Creación (Completada: Noviembre 2026)

#### 🎯 Objetivo
Una pantalla principal limpia y moderna ("Mis Viajes") donde el usuario gestiona todos sus viajes, monitorea el presupuesto consumido, visualiza banderas y días restantes, y puede crear una nueva aventura internacional en menos de 1 minuto con generación automática de días.

#### 🛠️ Especificación Detallada y Tareas Ejecutadas:
- [x] **1. Vista Dashboard `src/components/trips/TripsDashboard.tsx`:** ✅
  - Grid responsivo de tarjetas de viajes con banderas nacionales emoji de gran tamaño y código de país.
  - Filtros interactivos por estado: *Todos*, *Activo Ahora*, *Próximos* e *Historial*.
  - Indicador temporal dinámico (ej: "¡En Curso Hoy!", "Faltan X días", "Viaje Concluido").
  - Barra de progreso de presupuesto consumido en divisa base con rangos de alerta (saludable, advertencia, peligro) y conversión simultánea a divisa local.
  - Métricas rápidas por viaje (número de actividades, actividades completadas y compras realizadas).
  - Acciones rápidas: *Abrir Itinerario*, *Ver Billetera* y *Eliminar Viaje* (con protección de integridad para el viaje principal de Argentina).
  - Encabezado con avatar e insignia oficial de usuario (`AdminJools` / rol `Admin`).
- [x] **2. Asistente Wizard en 3 Pasos `src/components/trips/CreateTripWizard.tsx`:** ✅
  - **Paso 1 (Destino):** Buscador reactivo entre los 51 países del Top 50 mundial con banderas, selector rápido de ciudades clave o ciudad personalizada, y generación automática de título.
  - **Paso 2 (Fechas):** Selectores de fecha de inicio y fin, cálculo reactivo de la duración en días y switch para activar la generación automática de días del Kanban.
  - **Paso 3 (Presupuesto & Divisa):** Configuración de presupuesto total en USD con cálculo del cupo diario sugerido, asignación de divisa local y cotización en tiempo real vía Open Exchange Rates o DolarApi con feedback instantáneo.
- [x] **3. Generador Dinámico de Días (`generateTripDays` en `src/data/initialData.ts`):** ✅
  - Cálculo algorítmico de la secuencia de días entre las fechas seleccionadas.
  - Formateo inteligente en español (`Día X · Lun, 16 nov`), badges de color rotativos y marcado de hitos (como el día de regreso).
  - Integrado de forma reactiva en `useTripData.ts`, `ItineraryView.tsx` y `TimelineView.tsx`.
- [x] **4. Navegación Principal Global (`src/components/common/Navigation.tsx`):** ✅
  - Pestaña **"Mis Viajes"** (icono de avión y badge Hub) integrada como primera pestaña de navegación móvil y desktop, permitiendo alternar sin fricción entre destinos.

---

### ✅ Fase 5: Guías de Destino y Mapas Dinámicos (Completada: Noviembre 2026)

#### 🎯 Objetivo
Transformar la sección "Guía Porteña" y la visualización de mapa para adaptarse dinámicamente a cualquier país o ciudad del mundo seleccionada por el viajero, manteniendo intacta toda la información especializada de Buenos Aires (Subte, SUBE, Dólar Blue).

#### 🛠️ Especificación Detallada y Tareas Ejecutadas:
- [x] **1. Centrado Dinámico y Días Adaptables en el Mapa (`src/components/MapView.tsx`):** ✅
  - Registro de coordenadas de ciudades y países en `src/data/cityCoordinates.ts` para los 51 destinos del catálogo mundial.
  - Al abrir un viaje (ej. Tokio, Madrid, Nueva York, Medellín o Buenos Aires), el mapa de Leaflet se inicializa centrado automáticamente en las coordenadas de la ciudad de destino.
  - El filtro por día se alimenta de forma reactiva de `generateTripDays(activeTrip)` mostrando la cantidad exacta de días del viaje activo en lugar de estar fijado a 14 días.
  - Banner informativo contextual (`.map-empty-destination-notice`) cuando un viaje aún no tiene coordenadas guardadas.
  - Enlaces de "¿Cómo llegar?" y leyendas de transporte público adaptadas a la ciudad activa.
- [x] **2. Catálogo Modular de Guías de Destino (`src/data/destinationGuides.ts` y `src/types/guide.ts`):** ✅
  - Fichas minuciosamente detalladas para destinos principales (Argentina, Japón, España, Estados Unidos, Reino Unido) y generador algorítmico universal con estándares de la UE, América y Asia para los 51 países.
  - Conservación al 100% de la información histórica de Buenos Aires (Líneas de Subte A, B, C, D, E, H, tarjeta SUBE, Red SUBE, Dólar MEP y Dólar Blue).
- [x] **3. Microcomponentes Atómicos de Guía (<250 líneas por archivo):** ✅
  - `src/components/guide/EmergencyCard.tsx`: Tarjetas de emergencia locales (911, 112, 110, 107, etc.) con enlace telefónico directo de llamada en 1 toque (`tel:...`).
  - `src/components/guide/TransitGuideCard.tsx`: Tipos de tarjeta de transporte (Suica, OMNY, Multi, SUBE, Contactless), métodos de recarga y visualización de líneas de metro destacadas con sus colores oficiales.
  - `src/components/guide/PlugsAndMoneyCard.tsx`: Tipos de enchufe (A, B, C, F, G, I), voltaje, frecuencia, política estricta de propinas (ej: alerta de falta de respeto en Japón vs. 18-22% obligatoria en EE.UU.) y balance de tarjeta vs. efectivo.
  - `src/components/guide/CityTipsList.tsx`: Catálogo de aplicaciones móviles indispensables y consejos locales clasificados por categorías.
- [x] **4. Explorador Global de Guías (`src/components/SurvivalGuide.tsx`):** ✅
  - Cabecera con bandera emoji de gran formato, lema del destino y badge que destaca si es el destino del viaje en curso.
  - Selector reactivo para explorar guías de cualquiera de los 51 países del Top 50 en cualquier momento sin perder el contexto del viaje activo.

---

### ✅ Fase 6: Colaboración & Sincronización Cloud (Completada: Noviembre 2026)

#### 🎯 Objetivo
Transformar la base de datos de producción en Supabase para soportar nativamente arquitectura multi-viaje y multi-usuario con sincronización en tiempo real, garantizando la preservación del 100% de los datos históricos del viaje a Buenos Aires.

#### 🛠️ Especificación Detallada y Tareas Ejecutadas:
- [x] **1. Configuración de Acceso CLI Automatizado:** ✅
  - Integración de `SUPABASE_ACCESS_TOKEN` y `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` permitiendo a Antigravity ejecutar migraciones y ajustes DDL de forma autónoma.
- [x] **2. Creación de la Tabla Maestra `trips`:** ✅
  - Creada en producción con 15 columnas: `id`, `user_id`, `title`, `destination_city`, `country_code`, `flag_emoji`, `start_date`, `end_date`, `base_currency`, `local_currency`, `exchange_rate`, `budget_total_base`, `is_active`, `notes`, `created_at`.
  - Registrado el viaje maestro `trip-ba-2026` para el usuario administrador `AdminJools` (`user-admin-jools`).
- [x] **3. Aislamiento y Migración Segura de Datos Históricos:** ✅
  - Columnas `trip_id` y `user_id` añadidas a `activities`, `expenses` y `checklist` con valor por defecto `'trip-ba-2026'` y `'user-admin-jools'`.
  - **Auditoría en vivo completada:**
    - `activities`: **22/22 actividades históricas preservadas y vinculadas** a `trip-ba-2026`.
    - `expenses`: **3/3 gastos históricos preservados y vinculados** a `trip-ba-2026`.
    - `checklist`: **10/10 ítems históricos preservados y vinculados** a `trip-ba-2026`.
  - Nuevas columnas `currency` y `amount_usd` en `expenses` para cálculo multi-divisa.
- [x] **4. Índices B-Tree de Alto Rendimiento:** ✅
  - Creados `idx_activities_trip_id`, `idx_expenses_trip_id`, `idx_checklist_trip_id` e `idx_trips_user_id` para consultas instantáneas en milisegundos.
- [x] **5. Publicación Realtime Habilitada:** ✅
  - Tabla `trips` añadida a `supabase_realtime` para reflejar instantáneamente la creación, edición o eliminación de viajes entre múltiples pantallas.
- [x] **6. Certificación del Cliente Frontend:** ✅
  - Conexión verificada tanto con clave de servicio como con clave pública (`anon`), filtrando reactivamente por viaje activo (`.eq('trip_id', activeTripId)`).

---

### ⚪ Fase 7: Exportación & Calendario

#### 🎯 Objetivo
Permitir que el viajero exporte su itinerario completo en formato imprimible/PDF para llevar en físico u offline, y sincronice sus actividades con Google Calendar / Apple Calendar (.ics).

#### 🛠️ Tareas Clave:
1. Generación de reporte ejecutivo en PDF con itinerario día por día, mapa de pines y resumen financiero de gastos.
2. Exportador de eventos `.ics` compatible con Google Calendar, Apple Calendar y Outlook.
3. Botón de compartir resumen rápido por WhatsApp o portapapeles.

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

### Tabla `trips` (Estructura Multi-Viaje Global)
| Columna en Supabase (`snake_case`) | Propiedad en React (`camelCase`) | Tipo | Descripción |
|---|---|---|---|
| `id` | `id` | `text` (PK) | Ej: `'trip-ba-2026'`, `'trip-173059...'` |
| `user_id` | `userId` | `text` | Propietario del viaje (default: `'user-admin-jools'`) |
| `title` | `title` | `text` | Título del viaje (ej: `'Buenos Aires 2026'`, `'Aventura en Tokio'`) |
| `destination_city` | `destinationCity` | `text` | Ciudad de destino (ej: `'Buenos Aires'`, `'Tokio'`) |
| `country_code` | `countryCode` | `text` | Código ISO del país (ej: `'AR'`, `'JP'`, `'ES'`) |
| `flag_emoji` | `flagEmoji` | `text` | Bandera nacional emoji (ej: `'🇦🇷'`, `'🇯🇵'`) |
| `start_date` | `startDate` | `text` | Fecha de inicio (`YYYY-MM-DD`) |
| `end_date` | `endDate` | `text` | Fecha de finalización (`YYYY-MM-DD`) |
| `base_currency` | `baseCurrency` | `text` | Moneda base de cálculo (ej: `'USD'`) |
| `local_currency` | `localCurrency` | `text` | Moneda oficial del país destino (ej: `'ARS'`, `'JPY'`) |
| `exchange_rate` | `exchangeRate` | `numeric` | Cotización base 1 USD a moneda local |
| `budget_total_base` | `budgetTotalBase` | `numeric` | Tope presupuestario en moneda base |
| `is_active` | `isActive` | `boolean` | Indicador de viaje en curso |
| `notes` | `notes` | `text` | Notas del viaje o alojamiento |

### Tabla `activities`
| Columna en Supabase (`snake_case`) | Propiedad en React (`camelCase`) | Tipo | Descripción |
|---|---|---|---|
| `id` | `id` | `text` (PK) | Ej: `act-1792082845815` |
| `trip_id` | `tripId` | `text` (FK) | Vínculo al viaje (default: `'trip-ba-2026'`) |
| `user_id` | `userId` | `text` | Creador o responsable (default: `'user-admin-jools'`) |
| `day_number` | `dayNumber` | `integer` | Día del viaje (1 al 14 o según duración) |
| `time` | `time` | `text` | Ej: `"10:30"` |
| `period` | `period` | `text` | `"mañana"`, `"tarde"`, `"noche"` |
| `title` | `title` | `text` | Título del plan o lote de compra |
| `barrio` | `barrio` | `text` | Ej: `"San Telmo"`, `"Palermo"` |
| `category` | `category` | `text` | `"compras"`, `"mercado"`, `"regalos"`, `"gastronomia"`, etc. |
| `address` | `address` | `text` | Dirección física |
| `lat`, `lng` | `coords` (`[lat, lng]`) | `float` | Coordenadas Leaflet (`[number, number] | null`) |
| `description` | `description` / `items` / `note` | `text` (JSON) | **Crítico:** Almacena compras multi-ítem y notas en formato JSON: `{"type":"compras","items":[{"id":"it-1","name":"Pezuña","price":35000}],"note":"..."}` |
| `tip` | `tip` | `text` | Tip porteño o local |
| `with_friend` | `withFriend` | `boolean` | Alternador "¿Va mi amiga?" |
| `completed` | `completed` | `boolean` | Checkbox de plan realizado |
| `cost_estimated_ars` | `costEstimatedARS` | `numeric` | Costo estimado en ARS (suma de ítems en compras) |

### Tabla `expenses`
| Columna en Supabase (`snake_case`) | Propiedad en React (`camelCase`) | Tipo | Descripción |
|---|---|---|---|
| `id` | `id` | `text` (PK) | Ej: `exp-1792082845815` |
| `trip_id` | `tripId` | `text` (FK) | Vínculo al viaje (default: `'trip-ba-2026'`) |
| `user_id` | `userId` | `text` | Pagador/Usuario (default: `'user-admin-jools'`) |
| `date` | `date` | `text` | Fecha del gasto (`YYYY-MM-DD`) |
| `concept` | `concept` | `text` | Concepto de la compra o gasto |
| `category` | `category` | `text` | Categoría de gasto (`gastronomia`, `mercado`, etc.) |
| `amount_ars` | `amountARS` | `numeric` | Monto en moneda local o ARS |
| `currency` | `currency` | `text` | Código de divisa (ej: `'ARS'`, `'JPY'`, `'EUR'`) |
| `amount_usd` | `amountUSD` | `numeric` | Equivalente aproximado en USD |
| `paid_by` | `paidBy` / `paymentMethod` | `text` | `'efectivo'` o `'tarjeta'` |
| `note` | `note` / `items` | `text` (JSON) | Detalles o desglose de productos |
| `receipt_id` | `receiptId` | `text` | Vínculo a ticket en `media_manager` |
| `activity_id` | `activityId` | `text` (FK) | Vínculo opcional a la actividad espejo (`activities.id`) |

### Reglas de Negocio Esenciales (¡No Romper!)
1. **Sincronización Espejo Itinerario-Billetera:**  
   Toda actividad con `costEstimatedARS > 0` genera automáticamente un registro espejo en `itineraryExpenses` en la Billetera. Si se edita el valor o los ítems desde la Billetera (`src/components/modals/EditExpenseModal.tsx`), este cambio se sincroniza bidireccionalmente hacia la tarjeta del itinerario (`src/services/mirrorSyncService.ts`).
2. **Compras Multi-ítem (`type === 'compras'`):**  
   El valor `costEstimatedARS` es siempre la suma exacta de los productos en `items: [{ id, name, price }]`.
3. **Notas / Avisos (`type === 'nota'`):**  
   Costo $0, sin botón de Google Maps transit ni cálculo engañoso en billetera.
4. **Control de Liquidez en Billetera:**  
   Seguimiento de **USD 500 cambiados** = $760.000 ARS pactados ($490.000 ARS recibidos en mano), descontando gastos en efectivo vs. pagos con tarjeta frente al tope global de $1.000 USD.
