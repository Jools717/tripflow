// Catálogo de Guías de Destino y Supervivencia para Viajeros
import { DestinationGuide, MetroLineInfo } from '../types/guide';
import { GLOBAL_DESTINATIONS } from '../types/trip';

export const BUENOS_AIRES_SUBTE_LINES: MetroLineInfo[] = [
  { code: 'A', name: 'Línea A (Celeste)', color: '#38bdf8', route: 'Plaza de Mayo ↔ San Pedrito (Congreso y Av. de Mayo)' },
  { code: 'B', name: 'Línea B (Roja)', color: '#ef4444', route: 'L.N. Alem ↔ J.M. de Rosas (Corrientes, Teatros y Obelisco)' },
  { code: 'C', name: 'Línea C (Azul)', color: '#3b82f6', route: 'Retiro ↔ Constitución (Conecta ambas terminales de tren)' },
  { code: 'D', name: 'Línea D (Verde)', color: '#10b981', route: 'Catedral ↔ Congreso de Tucumán (Palermo y Recoleta)' },
  { code: 'E', name: 'Línea E (Violeta)', color: '#8b5cf6', route: 'Retiro ↔ Plaza de los Virreyes (San Telmo y Microcentro)' },
  { code: 'H', name: 'Línea H (Amarilla)', color: '#eab308', route: 'Facultad de Derecho ↔ Hospitales (Transversal Recoleta)' }
];

export const DESTINATION_GUIDES_CATALOG: Record<string, DestinationGuide> = {
  AR: {
    countryCode: 'AR',
    countryName: 'Argentina',
    flagEmoji: '🇦🇷',
    city: 'Buenos Aires',
    tagline: 'Manual del Viajero Porteño Inteligente',
    intro: 'Moverse por la Ciudad Autónoma de Buenos Aires (CABA) es súper fácil y económico dominando el Subte, los colectivos y la tarjeta SUBE.',
    emergency: [
      { label: 'Emergencias Generales', number: '911', desc: 'Policía y atención integral 24/7' },
      { label: 'Ambulancia / SAME', number: '107', desc: 'Emergencias médicas gratuitas' },
      { label: 'Bomberos de la Ciudad', number: '100', desc: 'Siniestros y rescates' }
    ],
    transit: {
      name: 'Tarjeta SUBE Física',
      type: 'Tarjeta prepaga recargable',
      description: 'Indispensable para Subte, colectivos y trenes en el Área Metropolitana. El colectivo requiere avisar el destino al chofer antes de apoyar la tarjeta.',
      rechargeMethod: 'Estaciones de Subte, kioscos con lector o celular con NFC mediante la app Carga SUBE.',
      howToPay: 'Descuento automático de "Red SUBE": segundo viaje con 50% de descuento y tercero con 75% dentro de las 2 horas.'
    },
    metroLines: BUENOS_AIRES_SUBTE_LINES,
    plugs: {
      plugTypes: ['Tipo I (3 patas planas oblicuas en V)', 'Tipo C (2 patas redondas)'],
      voltage: '220V',
      frequency: '50Hz',
      adapterNeeded: 'Requerido para cargadores de EE.UU. o Europa continental.'
    },
    money: {
      tippingPolicy: '10% habitual en restaurantes si la atención fue satisfactoria.',
      cardVsCash: 'Mixto: tarjetas internacionales aplican dólar MEP muy favorable; lleva efectivo para ferias callejeras y pequeños locales.',
      cashAdvice: 'El efectivo en pesos (ARS) se cambia en casas de cambio a cotización Dólar Blue para mayor rendimiento.'
    },
    apps: [
      { name: 'Google Maps', desc: 'Rutas óptimas en Subte y colectivos en tiempo real', category: 'mapas' },
      { name: 'Cabify & Uber', desc: 'Traslados seguros y transparentes por la noche', category: 'transporte' },
      { name: 'Carga SUBE', desc: 'Acredita saldo al instante apoyando la tarjeta al celular', category: 'pagos' },
      { name: 'BA Cómo Llego', desc: 'App oficial con estado de cortes y frecuencias del transporte', category: 'transporte' }
    ],
    customTips: [
      {
        category: 'Dinero & Pagos',
        title: 'Pagos con Tarjeta (Dólar MEP)',
        content: 'Tus pagos con tarjeta de crédito o débito internacional aplican automáticamente la cotización del dólar MEP (muy cercana al Dólar Blue).',
        badge: 'Finanzas'
      },
      {
        category: 'Seguridad Urbana',
        title: 'Moverse seguro como un local',
        content: 'En ferias como San Telmo o zonas concurridas como Caminito, lleva tu celular y pertenencias en bolsillos delanteros.',
        badge: 'Seguridad'
      },
      {
        category: 'Gastronomía Porteña',
        title: 'Costumbres y Horarios Porteños',
        content: 'La cena se inicia tarde (después de las 21:30). No te pierdas la fugazzeta rellena, las medialunas y el asado.',
        badge: 'Gastronomía'
      }
    ]
  },

  JP: {
    countryCode: 'JP',
    countryName: 'Japón',
    flagEmoji: '🇯🇵',
    city: 'Tokio',
    tagline: 'Guía de Movilidad & Etiqueta en Japón',
    intro: 'Japón cuenta con el sistema de transporte más puntual y eficiente del planeta. Conocer las tarjetas IC y la etiqueta local hará tu viaje perfecto.',
    emergency: [
      { label: 'Policía Nacional (Koban)', number: '110', desc: 'Asistencia y pérdida de documentos' },
      { label: 'Ambulancia / Bomberos', number: '119', desc: 'Emergencias médicas y rescates' },
      { label: 'Japan Helpline (Inglés)', number: '0570-000-911', desc: 'Soporte multilingüe 24 horas' }
    ],
    transit: {
      name: 'Tarjeta IC (Suica / Pasmo / ICOCA)',
      type: 'Tarjeta sin contacto o Apple/Google Wallet',
      description: 'Sirve para todo el transporte público (metro, trenes de cercanías, buses) y para pagar en cualquier tienda konbini (7-Eleven, Lawson).',
      rechargeMethod: 'En máquinas de las estaciones con efectivo en yenes (JPY) o en Apple Wallet con tarjeta bancaria.',
      howToPay: 'Basta con acercar el celular o tarjeta al molinete al entrar y salir; la tarifa se calcula según la distancia recorrida.'
    },
    metroLines: [
      { code: 'JY', name: 'Yamanote Line (Verde)', color: '#22c55e', route: 'Línea circular que une Shibuya, Shinjuku, Tokio Station, Ueno y Akihabara' },
      { code: 'G', name: 'Ginza Line (Naranja)', color: '#f97316', route: 'Asakusa ↔ Shibuya (Cruza el centro histórico y comercial)' },
      { code: 'M', name: 'Marunouchi Line (Roja)', color: '#ef4444', route: 'Ikebukuro ↔ Ogikubo (Pasa por la Estación de Tokio y Ginza)' },
      { code: 'E', name: 'Toei Oedo Line (Magenta)', color: '#d946ef', route: 'Conexión subterránea circular hacia Roppongi y Shinjuku' }
    ],
    plugs: {
      plugTypes: ['Tipo A (2 clavijas planas sin tierra)', 'Tipo B (2 planas + 1 redonda)'],
      voltage: '100V',
      frequency: '50Hz (Tokio) / 60Hz (Osaka)',
      adapterNeeded: 'Enchufes idénticos a EE.UU. No se necesita adaptador para cargadores de dos clavijas planas.'
    },
    money: {
      tippingPolicy: '❌ ¡Cero propinas! Dejar propina se considera una falta de respeto o confuso para el personal.',
      cardVsCash: 'Mixto: tarjetas en hoteles y tiendas; efectivo en billetes/monedas indispensable para templos, máquinas de ramen y puestos.',
      cashAdvice: 'Los cajeros automáticos (ATM) de los 7-Eleven y FamilyMart aceptan todas las tarjetas internacionales con comisiones muy bajas.'
    },
    apps: [
      { name: 'Google Maps', desc: 'Indica el andén exacto, coche recomendado y hora de salida de los trenes', category: 'mapas' },
      { name: 'Japan Travel (Navitime)', desc: 'Optimiza rutas cubiertas por el Japan Rail Pass', category: 'transporte' },
      { name: 'VoiceTra', desc: 'Traductor de voz instantáneo avalado por el gobierno japonés', category: 'general' },
      { name: 'Suica', desc: 'Pase digital integrado en la billetera de tu celular', category: 'pagos' }
    ],
    customTips: [
      {
        category: 'Etiqueta en Trenes',
        title: 'Silencio Absoluto en el Transporte',
        content: 'Pon tu teléfono en "Manner Mode" (vibración). Está prohibido hablar por teléfono dentro de trenes y vagones de metro.',
        badge: 'Cultura'
      },
      {
        category: 'Residuos',
        title: 'Casi no hay tachos de basura en la calle',
        content: 'Los japoneses llevan sus residuos en una pequeña bolsa hasta su hotel. Junto a las máquinas de bebidas hay depósitos exclusivos para botellas y latas.',
        badge: 'Costumbres'
      },
      {
        category: 'Tax Free',
        title: 'Compras Exentas de Impuestos (Tax Free 10%)',
        content: 'Lleva tu pasaporte físico siempre encima. En compras superiores a 5.000 JPY te descuentan el 10% del impuesto al consumo en caja.',
        badge: 'Compras'
      }
    ]
  },

  ES: {
    countryCode: 'ES',
    countryName: 'España',
    flagEmoji: '🇪🇸',
    city: 'Madrid / Barcelona',
    tagline: 'Guía de Movilidad & Tapas en España',
    intro: 'España cuenta con una de las redes de metro y trenes de alta velocidad más modernas de Europa. Excelente cobertura para caminar y tapear.',
    emergency: [
      { label: 'Emergencias Europeas', number: '112', desc: 'Policía, bomberos y sanitarios en toda la UE' },
      { label: 'Policía Nacional', number: '091', desc: 'Denuncias y seguridad ciudadana' },
      { label: 'Guardia Civil', number: '062', desc: 'Carreteras y zonas interurbanas' }
    ],
    transit: {
      name: 'Tarjeta Multi (Madrid) / T-Mobilitat (Barcelona)',
      type: 'Tarjeta sin contacto recargable',
      description: 'Permite cargar títulos de 10 viajes válidos para metro y autobús urbano con descuento por trasbordo.',
      rechargeMethod: 'En máquinas automáticas de cualquier estación de metro con tarjeta o efectivo.',
      howToPay: 'Acercar la tarjeta al lector del torniquete. En autobuses de Madrid también puedes pagar directo con tarjeta bancaria contactless.'
    },
    metroLines: [
      { code: 'L1', name: 'Línea 1 (Azul)', color: '#38bdf8', route: 'Pinar de Chamartín ↔ Valdecarros (Sol, Atocha y Gran Vía)' },
      { code: 'L2', name: 'Línea 2 (Roja)', color: '#ef4444', route: 'Las Rosas ↔ Cuatro Caminos (Retiro, Ópera y Sevilla)' },
      { code: 'L6', name: 'Línea 6 (Gris Circular)', color: '#64748b', route: 'Línea circular que conecta todas las líneas del metro madrileño' },
      { code: 'L10', name: 'Línea 10 (Azul Marino)', color: '#1d4ed8', route: 'Norte-Sur: Plaza de España, Tribunal y Santiago Bernabéu' }
    ],
    plugs: {
      plugTypes: ['Tipo C (Europlug 2 patas redondas)', 'Tipo F (Schuko con tierra lateral)'],
      voltage: '230V',
      frequency: '50Hz',
      adapterNeeded: 'Viajeros de América requieren adaptador de clavijas planas a redondas.'
    },
    money: {
      tippingPolicy: 'Opcional. Se suele redondear la cuenta o dejar 1€ a 2€ en cafés; 5% a 10% en restaurantes si el servicio fue excepcional.',
      cardVsCash: 'Casi 100% cashless. Se acepta tarjeta contactless, Apple Pay y Google Pay incluso para un café de 1,50€.',
      cashAdvice: 'Ten unos 20€ a 30€ en efectivo para pequeños quioscos o propinas voluntarias.'
    },
    apps: [
      { name: 'Citymapper', desc: 'La app más precisa para tiempos de metro, autobuses y alertas de incidencias', category: 'mapas' },
      { name: 'Google Maps', desc: 'Rutas a pie y horarios de comercios', category: 'mapas' },
      { name: 'Cabify & Uber', desc: 'Taxis y vehículos con conductor con precio cerrado', category: 'transporte' },
      { name: 'Renfe Cercanías', desc: 'Horarios de trenes para visitar Toledo, Segovia o Alcalá de Henares', category: 'transporte' }
    ],
    customTips: [
      {
        category: 'Horarios',
        title: 'Horarios de Almuerzo y Cena',
        content: 'El almuerzo se sirve de 13:30 a 16:00 y la cena a partir de las 20:30 o 21:00. Muchos restaurantes cierran su cocina entre las 16:30 y 20:00.',
        badge: 'Costumbres'
      },
      {
        category: 'Gastronomía',
        title: 'Cultura de la Tapa y Caña',
        content: 'Al pedir una bebida (cerveza/vino) en la mayoría de bares tradicionales de Madrid y Granada te sirven una tapa de cortesía incluida.',
        badge: 'Gastronomía'
      }
    ]
  },

  US: {
    countryCode: 'US',
    countryName: 'Estados Unidos',
    flagEmoji: '🇺🇸',
    city: 'Nueva York / Miami',
    tagline: 'Guía de Viaje & Pagos en Estados Unidos',
    intro: 'Moverse en EE.UU. combina sistemas de metro urbano masivos como el de Nueva York con la necesidad de vehículos compartidos en ciudades extensas.',
    emergency: [
      { label: 'Emergencias Integrales', number: '911', desc: 'Policía, bomberos y asistencia médica de urgencia' },
      { label: 'Información y Servicios', number: '311', desc: 'Servicios no urgentes de la ciudad (NYC y otras urbes)' }
    ],
    transit: {
      name: 'OMNY (NYC) / Tap to Pay',
      type: 'Pago contactless con tarjeta o smartphone',
      description: 'En el metro y autobuses de Nueva York ya no necesitas comprar MetroCard física: apoyas tu tarjeta de crédito o el móvil en el torniquete (OMNY).',
      rechargeMethod: 'Sin recargas previas: el cobro se realiza directo a tu tarjeta bancaria.',
      howToPay: 'Tope semanal automático OMNY: a partir del 12º viaje realizado en una misma semana con la misma tarjeta, los siguientes son gratis.'
    },
    plugs: {
      plugTypes: ['Tipo A (2 clavijas planas)', 'Tipo B (2 planas + 1 redonda de tierra)'],
      voltage: '120V',
      frequency: '60Hz',
      adapterNeeded: 'Estándar americano. Viajeros europeos o sudamericanos requieren adaptador.'
    },
    money: {
      tippingPolicy: 'Obligatoria socialmente en servicios y restaurantes: 18% (servicio estándar), 20% (bueno), 22%+ (excelente).',
      cardVsCash: 'Prácticamente 100% cashless. Muchas tiendas no aceptan billetes de $50 o $100.',
      cashAdvice: 'Mantén billetes de $1 y $5 para propinas rápidas de maleteros o personal de hotel.'
    },
    apps: [
      { name: 'Google Maps / Apple Maps', desc: 'Navegación paso a paso en metro y tráfico en tiempo real', category: 'mapas' },
      { name: 'Uber & Lyft', desc: 'Imprescindibles para traslados interurbanos y aeropuertos', category: 'transporte' },
      { name: 'Citymapper', desc: 'Mejor app para indicar salidas exactas del Subway de NY', category: 'transporte' },
      { name: 'Yelp', desc: 'Reseñas fiables de restaurantes con menús y precios', category: 'general' }
    ],
    customTips: [
      {
        category: 'Precios',
        title: 'Los precios en tienda NO incluyen impuestos',
        content: 'El precio exhibido en la etiqueta no tiene sumado el State Tax (ventas). Al pagar en caja verás un incremento del 7% al 10% según el estado.',
        badge: 'Compras'
      },
      {
        category: 'Seguridad',
        title: 'Cuidado con tus pertenencias en el metro',
        content: 'Evita viajar en vagones vacíos por la noche y mantente atento cerca del borde del andén.',
        badge: 'Seguridad'
      }
    ]
  },

  GB: {
    countryCode: 'GB',
    countryName: 'Reino Unido',
    flagEmoji: '🇬🇧',
    city: 'Londres',
    tagline: 'Guía de Movilidad & Rutas en Londres',
    intro: 'Londres tiene una de las redes de metro subterráneo más legendarias del mundo ("The Tube"). Es una ciudad prácticamente libre de dinero en efectivo.',
    emergency: [
      { label: 'Emergencias Nacionales', number: '999', desc: 'Policía, ambulancia y bomberos' },
      { label: 'Emergencias Europeas', number: '112', desc: 'Funciona exactamente igual que el 999' },
      { label: 'Policía No Urgente', number: '101', desc: 'Consultas o denuncias sin peligro inminente' }
    ],
    transit: {
      name: 'Contactless Directo / Oyster Card',
      type: 'Tarjeta bancaria o smartphone',
      description: 'No necesitas comprar Oyster física: apoya tu tarjeta de débito/crédito contactless o teléfono en los lectores amarillos del Tube y buses.',
      rechargeMethod: 'Tarifa directa por trayecto con tope diario ("Daily Cap"): viajas todo lo que quieras sin pagar más del límite fijado.',
      howToPay: '¡Los buses rojos londinenses NO aceptan dinero en efectivo bajo ninguna circunstancia!'
    },
    plugs: {
      plugTypes: ['Tipo G (3 clavijas rectangulares británicas)'],
      voltage: '230V',
      frequency: '50Hz',
      adapterNeeded: 'Estrictamente necesario si viajas desde fuera de Reino Unido.'
    },
    money: {
      tippingPolicy: '10% a 12.5% sugerido en restaurantes. En la mayoría de locales viene ya incluido en la factura como "Optional Service Charge".',
      cardVsCash: 'Londres es 99% libre de efectivo (Cashless). Puedes pagar hasta los baños públicos y cafés con tarjeta o reloj.',
      cashAdvice: 'No necesitas cambiar grandes sumas de Libras (£); con tarjeta bancaria internacional cubres todo.'
    },
    apps: [
      { name: 'Citymapper', desc: 'Nacida en Londres, es la reina absoluta para saber en qué vagón del Tube subir', category: 'mapas' },
      { name: 'TfL Go', desc: 'App oficial de Transport for London con estado de las líneas en vivo', category: 'transporte' },
      { name: 'Uber & FreeNow', desc: 'Para pedir traslados o el icónico Black Cab tradicional', category: 'transporte' }
    ],
    customTips: [
      {
        category: 'Etiqueta en el Tube',
        title: 'Pararse a la DERECHA en escaleras mecánicas',
        content: '"Stand on the right, walk on the left". Es la regla de oro en todo el metro londinense. Bloquear el lado izquierdo molesta a los locales.',
        badge: 'Cultura'
      },
      {
        category: 'Museos',
        title: 'Museos Nacionales Gratuitos',
        content: 'El British Museum, Natural History Museum, Science Museum y Tate Modern tienen entrada general 100% gratuita.',
        badge: 'Cultura'
      }
    ]
  }
};

/**
 * Genera una guía contextual y adaptada para cualquiera de los 51 países del Top 50.
 * Si el país tiene ficha dedicada (ej. AR, JP, ES, US, GB), la devuelve enriquecida;
 * si no, construye una guía confiable con estándares internacionales oficiales.
 */
export function getDestinationGuide(countryCode?: string, city?: string): DestinationGuide {
  const code = (countryCode || 'AR').toUpperCase();
  const dedicated = DESTINATION_GUIDES_CATALOG[code];

  if (dedicated) {
    if (city && city !== dedicated.city) {
      return { ...dedicated, city };
    }
    return dedicated;
  }

  // Buscar metadatos en GLOBAL_DESTINATIONS
  const countryMeta = GLOBAL_DESTINATIONS.find(c => c.code === code) || {
    code: 'AR',
    name: 'Destino Internacional',
    flag: '🌍',
    defaultCurrency: 'USD',
    approxRateUSD: 1,
    suggestedCities: ['Ciudad Principal']
  };

  const cityName = city || countryMeta.suggestedCities[0] || countryMeta.name;
  const isEurope = ['FR', 'IT', 'DE', 'PT', 'GR', 'CH', 'NL', 'AT', 'IE', 'BE', 'CZ', 'HU', 'PL', 'HR', 'SE', 'NO', 'DK', 'IS'].includes(code);
  const isLatinAmerica = ['MX', 'CO', 'BR', 'PE', 'CL', 'CR', 'PA', 'DO', 'EC', 'UY'].includes(code);

  const emergencyNumber = isEurope ? '112' : '911';

  return {
    countryCode: code,
    countryName: countryMeta.name,
    flagEmoji: countryMeta.flag,
    city: cityName,
    tagline: `Guía Esencial del Viajero en ${countryMeta.name}`,
    intro: `Consejos prácticos, movilidad urbana y datos esenciales para disfrutar tu estadía en ${cityName}, ${countryMeta.name}.`,
    emergency: [
      {
        label: 'Emergencias Integrales',
        number: emergencyNumber,
        desc: isEurope ? 'Número único europeo de auxilio (Policía, Sanitarios y Bomberos)' : 'Línea de respuesta inmediata 24/7'
      },
      {
        label: 'Policía Turística / Local',
        number: isEurope ? '112' : (code === 'CO' ? '123' : code === 'MX' ? '911' : emergencyNumber),
        desc: 'Atención a visitantes y seguridad'
      }
    ],
    transit: {
      name: `Transporte Público en ${cityName}`,
      type: 'Red de metro, buses y trenes urbanos',
      description: `Para moverte por ${cityName} puedes adquirir tarjetas de transporte en las estaciones principales o abonar en muchos casos con tarjeta contactless.`,
      rechargeMethod: 'En ventanillas, máquinas expendedoras de las terminales o mediante apps oficiales.',
      howToPay: 'Verifica si la ciudad ofrece pases turísticos de 24h, 48h o 72h con viajes ilimitados para mayor ahorro.'
    },
    plugs: {
      plugTypes: isEurope ? ['Tipo C (Europlug)', 'Tipo F (Schuko)'] : isLatinAmerica ? ['Tipo A', 'Tipo B'] : ['Tipo Universal'],
      voltage: isEurope ? '230V' : '110V - 127V',
      frequency: isEurope ? '50Hz' : '60Hz',
      adapterNeeded: 'Se recomienda portar siempre un adaptador de enchufe internacional universal en tu equipaje.'
    },
    money: {
      tippingPolicy: isEurope
        ? '5% a 10% opcional por buen servicio en restaurantes.'
        : isLatinAmerica
          ? '10% voluntario en restaurantes sugerido en la cuenta.'
          : 'Consulta la costumbre local en establecimientos gastronómicos.',
      cardVsCash: `Pagos en moneda local (${countryMeta.flag} ${countryMeta.defaultCurrency}). Las tarjetas de crédito y débito internacionales son ampliamente aceptadas en zonas urbanas.`,
      cashAdvice: `Lleva una pequeña reserva de efectivo en ${countryMeta.defaultCurrency} para transporte menor, propinas y tiendas tradicionales.`
    },
    apps: [
      { name: 'Google Maps', desc: 'Rutas a pie y transporte público en tiempo real', category: 'mapas' },
      { name: 'Uber / App Local de Taxi', desc: 'Traslados nocturnos fiables y seguros', category: 'transporte' },
      { name: 'Traductor de Google', desc: 'Traducción por cámara para menús y letreros', category: 'general' }
    ],
    customTips: [
      {
        category: 'Dinero & Divisas',
        title: `Cotización de Referencia (${countryMeta.defaultCurrency})`,
        content: `La divisa oficial es el ${countryMeta.defaultCurrency}. Consulta el ticker en el Header para ver la cotización actualizada frente al Dólar (USD).`,
        badge: 'Finanzas'
      },
      {
        category: 'Conectividad',
        title: 'eSIM o Chip Local',
        content: 'Consigue una eSIM internacional (Airalo, Holafly) o un chip SIM en el aeropuerto para tener internet constante.',
        badge: 'Tecnología'
      },
      {
        category: 'Salud & Asistencia',
        title: 'Seguro Médico de Viaje',
        content: 'Viaja siempre con cobertura médica internacional con asistencia telefónica 24 horas y telemedicina.',
        badge: 'Salud'
      }
    ]
  };
}

