# 🇦🇷 BA 2026 | Mi Itinerario en Buenos Aires (10 al 23 de Octubre)

> **Progressive Web App (PWA)** offline-first diseñada a medida para organizar el viaje a Buenos Aires: itinerario interactivo día a día, control de liquidez y presupuesto con cotización en tiempo real, escáner OCR de comprobantes, rutas en transporte público y guía de supervivencia porteña.

Construida con **React 19**, **TypeScript**, **Vite**, **Supabase** y un diseño visual centralizado en un archivo madre único de estilos (`src/index.css`).

---

## ✨ Características Principales

1. **🗺️ Itinerario Inteligente (14 Días):**
   - Vistas duales intercambiables: **Tablero Kanban horizontal** con drag & drop y **Timeline cronológico** día a día.
   - Tarjetas dinámicas con soporte para **Planes**, **Lotes de Compras multi-ítem** (con desglose de precios individuales) y **Notas/Avisos**.
   - Filtros por momento del día (Mañana, Tarde, Noche) y selector "¿Va mi amiga?" para planes en compañía o solitario.
   - Botón directo de **¿Cómo llegar?** integrado con la API de Google Maps en modo **Transporte Público (Subte y Colectivos)**.

2. **💵 Billetera & Control de Liquidez:**
   - Seguimiento del tope global de **$1.000 USD** con conversión automática entre **ARS y USD**.
   - Control de liquidez en efectivo: **$500 USD cambiados = $760.000 ARS pactados** ($490.000 ARS recibidos en mano), diferenciando pagos en efectivo vs. tarjeta de crédito/débito.
   - Ticker de cotización del **Dólar Blue en tiempo real** (conectado a `dolarapi.com`) con opción de ajuste manual.
   - Sincronización espejo bidireccional: Cualquier actividad del itinerario con costo estimado genera y actualiza automáticamente su contraparte en la billetera.

3. **🛒 Secciones Dinámicas por Categoría:**
   - Categorías predeterminadas (Mercado, Gastronomía, Regalos, Transporte, Salidas) y creación de categorías personalizadas.
   - Calculadora integrada con teclado táctil, cinta de operaciones, atajos de redondeo y formulario rápido de tickets.
   - Historial detallado de compras con filtrado por medio de pago (Efectivo / Tarjeta).

4. **📷 Escáner OCR de Comprobantes & Facturas:**
   - Captura directa desde la cámara del celular o subida de fotos de tickets.
   - Visor Lightbox con **corrección de perspectiva interactiva de 4 esquinas** y zoom.
   - Extracción de texto y montos con **Tesseract OCR**, previsualización editable y desglose automático de artículos detectados.

5. **📍 Mapas & Navegación Porteña:**
   - Mapa interactivo de la ciudad con **Leaflet** y pines codificados por color según la categoría de actividad.
   - Guía porteña completa: mapa interactivo de líneas de Subte (A, B, C, D, E, H), cómo pedir el boleto en colectivo ("¿Hasta dónde vas?"), descuentos RED SUBE en trasbordos, consejos de seguridad y tipo de enchufes.

6. **✅ Checklist & Respaldo:**
   - Checklist de equipaje y documentos categorizado (Tecnología, Dinero, Documentos, Ropa).
   - Modo Offline-First con respaldo automático en `localStorage` (con control de versiones de caché).
   - Base de datos en la nube con **Supabase** y suscripciones Realtime para sincronizar cambios en vivo.

---

## 🏗️ Arquitectura del Código

El proyecto sigue una arquitectura **Mobile-First modular** donde la lógica de negocio y persistencia está desacoplada de la interfaz de usuario:

```
src/
├── types/                          # Contratos e interfaces TypeScript
│   ├── activity.ts                 # Interfaces de actividades y compras
│   ├── expense.ts                  # Interfaces de gastos, pagos y comprobantes
│   ├── category.ts                 # Categorías y checklist
│   └── supabase.ts                 # Mapeo snake_case (DB) <-> camelCase (UI) y SyncStatus
│
├── services/                       # Capa de datos desacoplada (BaaS & Local)
│   ├── supabaseClient.ts           # Cliente singleton de Supabase
│   ├── activityService.ts          # CRUD y serialización JSON de actividades
│   ├── expenseService.ts           # CRUD de gastos y comprobantes
│   ├── categoryChecklistService.ts # Persistencia de categorías y checklist
│   ├── exchangeRateService.ts      # Fetch en vivo de cotización Dólar Blue
│   ├── syncService.ts              # Carga inicial y suscripciones en tiempo real
│   ├── mirrorSyncService.ts        # Sincronización espejo Itinerario <-> Billetera
│   └── storageService.ts           # Hidratación y versionado de LocalStorage
│
├── hooks/                          # Custom Hooks para evitar Prop Drilling
│   ├── useTripSync.ts              # Sincronización Supabase, Dólar Blue y LocalStorage
│   ├── useItinerary.ts             # CRUD de actividades, modales y Kanban
│   ├── useWallet.ts                # CRUD de gastos, liquidez, categorías y checklist
│   └── useTripData.ts              # Hook integrador y métricas calculadas
│
├── components/                     # Microcomponentes UI (<250 líneas)
│   ├── itinerary/                  # Kanban, Timeline, tarjetas y modales de días
│   ├── wallet/                     # Hero, liquidez, categorías dinámicas y calculadora
│   ├── scanner/                    # Cámara, OCR progress, revisión y lightbox
│   ├── modals/                     # Modales de actividades, compras multi-ítem y gastos
│   ├── auth/                       # Modal de inicio de sesión con Google y Magic Link
│   ├── trips/                      # Selector de viajes y asistente de creación global
│   ├── updates/                    # Barra de progreso, cuadrícula de novedades y release notes
│   ├── common/                     # Header con ticker y barra de navegación
│   ├── MapView.tsx                 # Mapa interactivo Leaflet
│   ├── ChecklistView.tsx           # Checklist de viaje categorizado
│   ├── SurvivalGuide.tsx           # Guía rápida de transporte y modismos
│   └── ReceiptViewerModal.tsx      # Visor modal de comprobantes
│
├── App.tsx                         # Orquestador raíz ultraligero (~80 líneas)
├── main.tsx                        # Punto de entrada TypeScript React
└── index.css                       # Archivo madre único de estilos (No fragmentar)
```

---

## 💻 Requisitos e Instalación en otra PC

Para instalar y correr el proyecto en cualquier computadora sin complicaciones, consulta también el archivo [`requirements.txt`](./requirements.txt).

### 1. Pre-requisitos de Software
* **Node.js**: Versión 18.x o 20.x LTS recomendada ([Descargar Node.js](https://nodejs.org/)).
* **npm**: Versión 9.x o superior (incluido con Node.js).
* **Git**: Para clonar el repositorio ([Descargar Git](https://git-scm.com/)).

### 2. Configuración de Variables de Entorno
Copia el archivo de ejemplo `.env.example` creando un archivo `.env.local` en la raíz del proyecto:
```bash
cp .env.example .env.local
```
Configura tus credenciales de Supabase en `.env.local`:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-public-key-aqui
```
*(Nota: Si no configuras Supabase, la app funciona de forma local con LocalStorage).*

### 3. Comandos de Ejecución
```bash
# 1. Instalar todas las dependencias
npm install

# 2. Iniciar el servidor local de desarrollo
npm run dev

# 3. Comprobar tipos TypeScript (sin emitir archivos)
npx tsc --noEmit

# 4. Compilar para producción
npm run build
```

---

## 📱 Instalación como App en tu Celular (PWA)

Al estar desplegada en **Vercel** bajo HTTPS, tu celular detecta el archivo [`public/manifest.json`](./public/manifest.json) y te permite instalarla como aplicación nativa:

* **En Android (Google Chrome):**
  1. Abre la URL de tu proyecto en Vercel.
  2. Presiona los tres puntos (`⋮`) arriba a la derecha.
  3. Toca **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.
* **En iPhone (Safari):**
  1. Abre la URL en Safari.
  2. Toca el botón **Compartir** (cuadrado con flecha hacia arriba).
  3. Desliza hacia abajo y selecciona **"Agregar a pantalla de inicio"**.

¡Listo! La app se abrirá a pantalla completa con su propio icono sin barras del navegador y con respuesta táctil instantánea.

---

## 📄 Licencia y Documentación Técnica Adicional
* Consulta la [Hoja de Ruta Global, Reglas de Negocio y Progreso (ROADMAP.md)](./ROADMAP.md) para conocer la evolución a plataforma SaaS multi-viaje, el esquema de datos de Supabase y las pautas para agentes de IA y desarrolladores.
