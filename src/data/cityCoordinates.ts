// Registro de coordenadas geográficas para ciudades y países del Top 50
export const CITY_COORDINATES: Record<string, [number, number]> = {
  // Argentina
  'buenos aires': [-34.6037, -58.3816],
  'bariloche': [-41.1335, -71.3103],
  'mendoza': [-32.8895, -68.8458],
  'iguazú': [-25.5991, -54.5735],
  'ushuaia': [-54.8019, -68.3030],

  // América del Norte y Central
  'nueva york': [40.7128, -74.0060],
  'new york': [40.7128, -74.0060],
  'miami': [25.7617, -80.1918],
  'orlando': [28.5383, -81.3792],
  'san francisco': [37.7749, -122.4194],
  'los ángeles': [34.0522, -118.2437],
  'los angeles': [34.0522, -118.2437],
  'ciudad de méxico': [19.4326, -99.1332],
  'cancún': [21.1619, -86.8515],
  'cancun': [21.1619, -86.8515],
  'oaxaca': [17.0732, -96.7266],
  'guadalajara': [20.6597, -103.3496],
  'playa del carmen': [20.6296, -87.0739],
  'toronto': [43.6532, -79.3832],
  'vancouver': [49.2827, -123.1207],
  'montreal': [45.5017, -73.5673],
  'san josé': [9.9281, -84.0907],
  'la fortuna': [10.4678, -84.6427],
  'ciudad de panamá': [8.9824, -79.5199],
  'punta cana': [18.5601, -68.3725],
  'santo domingo': [18.4861, -69.9312],

  // América del Sur
  'medellín': [6.2442, -75.5812],
  'medellin': [6.2442, -75.5812],
  'cartagena': [10.3910, -75.4794],
  'bogotá': [4.7110, -74.0721],
  'bogota': [4.7110, -74.0721],
  'santa marta': [11.2408, -74.1990],
  'cali': [3.4516, -76.5320],
  'río de janeiro': [-22.9068, -43.1729],
  'rio de janeiro': [-22.9068, -43.1729],
  'são paulo': [-23.5505, -46.6333],
  'sao paulo': [-23.5505, -46.6333],
  'salvador': [-12.9777, -38.5016],
  'florianópolis': [-27.5954, -48.5480],
  'cusco': [-13.5319, -71.9675],
  'lima': [-12.0464, -77.0428],
  'arequipa': [-16.4090, -71.5375],
  'santiago': [-33.4489, -70.6693],
  'quito': [-0.1807, -78.4678],
  'galápagos': [-0.9538, -90.9656],
  'montevideo': [-34.9011, -56.1645],
  'punta del este': [-34.9667, -54.9500],

  // Europa
  'madrid': [40.4168, -3.7038],
  'barcelona': [41.3879, 2.1699],
  'sevilla': [37.3891, -5.9845],
  'valencia': [39.4699, -0.3763],
  'granada': [37.1773, -3.5986],
  'parís': [48.8566, 2.3522],
  'paris': [48.8566, 2.3522],
  'niza': [43.7102, 7.2620],
  'lyon': [45.7640, 4.8357],
  'roma': [41.9028, 12.4964],
  'florencia': [43.7696, 11.2558],
  'venecia': [45.4408, 12.3155],
  'milán': [45.4642, 9.1900],
  'milan': [45.4642, 9.1900],
  'londres': [51.5074, -0.1278],
  'london': [51.5074, -0.1278],
  'edimburgo': [55.9533, -3.1883],
  'berlín': [52.5200, 13.4050],
  'berlin': [52.5200, 13.4050],
  'múnich': [48.1351, 11.5820],
  'munich': [48.1351, 11.5820],
  'lisboa': [38.7223, -9.1393],
  'oporto': [41.1579, -8.6291],
  'atenas': [37.9838, 23.7275],
  'santorini': [36.3932, 25.4615],
  'zúrich': [47.3769, 8.5417],
  'zurich': [47.3769, 8.5417],
  'ámsterdam': [52.3676, 4.9041],
  'amsterdam': [52.3676, 4.9041],
  'viena': [48.2082, 16.3738],
  'dublín': [53.3498, -6.2603],
  'dublin': [53.3498, -6.2603],
  'bruselas': [50.8503, 4.3517],
  'praga': [50.0755, 14.4378],
  'budapest': [47.4979, 19.0402],
  'cracovia': [50.0647, 19.9450],
  'varsovia': [52.2297, 21.0122],
  'dubrovnik': [42.6507, 18.0944],
  'estocolmo': [59.3293, 18.0686],
  'oslo': [59.9139, 10.7522],
  'copenhague': [55.6761, 12.5683],
  'reikiavik': [64.1466, -21.9426],

  // Asia y Medio Oriente
  'tokio': [35.6762, 139.6503],
  'tokyo': [35.6762, 139.6503],
  'kioto': [35.0116, 135.7681],
  'kyoto': [35.0116, 135.7681],
  'osaka': [34.6937, 135.5023],
  'bangkok': [13.7563, 100.5018],
  'chiang mai': [18.7883, 98.9853],
  'estambul': [41.0082, 28.9784],
  'istanbul': [41.0082, 28.9784],
  'seúl': [37.5665, 126.9780],
  'seoul': [37.5665, 126.9780],
  'hanói': [21.0285, 105.8542],
  'bali': [-8.4095, 115.1889],
  'dubái': [25.2048, 55.2708],
  'dubai': [25.2048, 55.2708],
  'singapur': [1.3521, 103.8198],
  'singapore': [1.3521, 103.8198],
  'kuala lumpur': [3.1390, 101.6869],
  'manila': [14.5995, 120.9842],
  'nueva delhi': [28.6139, 77.2090],
  'pekín': [39.9042, 116.4074],
  'beijing': [39.9042, 116.4074],
  'shanghái': [31.2304, 121.4737],
  'riad': [24.7136, 46.6753],

  // África y Oceanía
  'el cairo': [30.0444, 31.2357],
  'marrakech': [31.6295, -7.9811],
  'ciudad del cabo': [-33.9249, 18.4241],
  'sídney': [-33.8688, 151.2093],
  'sydney': [-33.8688, 151.2093],
  'melbourne': [-37.8136, 144.9631],
  'auckland': [-36.8485, 174.7633]
};

export const COUNTRY_DEFAULT_COORDS: Record<string, [number, number]> = {
  AR: [-34.6037, -58.3816], // Buenos Aires
  US: [40.7128, -74.0060],  // Nueva York
  MX: [19.4326, -99.1332],  // CDMX
  CO: [6.2442, -75.5812],   // Medellín
  BR: [-22.9068, -43.1729], // Río
  PE: [-13.5319, -71.9675], // Cusco
  CL: [-33.4489, -70.6693], // Santiago
  CA: [43.6532, -79.3832],  // Toronto
  CR: [9.9281, -84.0907],   // San José
  PA: [8.9824, -79.5199],   // Panamá
  DO: [18.5601, -68.3725],  // Punta Cana
  EC: [-0.1807, -78.4678],  // Quito
  UY: [-34.9011, -56.1645], // Montevideo
  ES: [40.4168, -3.7038],   // Madrid
  FR: [48.8566, 2.3522],    // París
  IT: [41.9028, 12.4964],   // Roma
  GB: [51.5074, -0.1278],   // Londres
  DE: [52.5200, 13.4050],   // Berlín
  PT: [38.7223, -9.1393],   // Lisboa
  GR: [37.9838, 23.7275],   // Atenas
  CH: [47.3769, 8.5417],    // Zúrich
  NL: [52.3676, 4.9041],    // Ámsterdam
  AT: [48.2082, 16.3738],   // Viena
  IE: [53.3498, -6.2603],   // Dublín
  BE: [50.8503, 4.3517],    // Bruselas
  CZ: [50.0755, 14.4378],   // Praga
  HU: [47.4979, 19.0402],   // Budapest
  PL: [50.0647, 19.9450],   // Cracovia
  HR: [42.6507, 18.0944],   // Dubrovnik
  SE: [59.3293, 18.0686],   // Estocolmo
  NO: [59.9139, 10.7522],   // Oslo
  DK: [55.6761, 12.5683],   // Copenhague
  IS: [64.1466, -21.9426],  // Reikiavik
  JP: [35.6762, 139.6503],  // Tokio
  TH: [13.7563, 100.5018],  // Bangkok
  TR: [41.0082, 28.9784],   // Estambul
  KR: [37.5665, 126.9780],  // Seúl
  VN: [21.0285, 105.8542],  // Hanói
  ID: [-8.4095, 115.1889],  // Bali
  AE: [25.2048, 55.2708],   // Dubái
  SG: [1.3521, 103.8198],   // Singapur
  MY: [3.1390, 101.6869],   // Kuala Lumpur
  PH: [14.5995, 120.9842],  // Manila
  IN: [28.6139, 77.2090],   // Nueva Delhi
  CN: [39.9042, 116.4074],  // Pekín
  SA: [24.7136, 46.6753],   // Riad
  EG: [30.0444, 31.2357],   // El Cairo
  MA: [31.6295, -7.9811],   // Marrakech
  ZA: [-33.9249, 18.4241],  // Ciudad del Cabo
  AU: [-33.8688, 151.2093], // Sídney
  NZ: [-36.8485, 174.7633]  // Auckland
};

/**
 * Obtiene las coordenadas [lat, lng] óptimas para centrar el mapa.
 * Busca primero por coincidencia de ciudad y luego por código de país.
 */
export function getDestinationCoordinates(city?: string, countryCode?: string): [number, number] {
  if (city) {
    const cleanCity = city.toLowerCase().trim();
    if (CITY_COORDINATES[cleanCity]) {
      return CITY_COORDINATES[cleanCity];
    }
    // Búsqueda parcial de ciudad
    const foundKey = Object.keys(CITY_COORDINATES).find(k => cleanCity.includes(k) || k.includes(cleanCity));
    if (foundKey) {
      return CITY_COORDINATES[foundKey];
    }
  }

  if (countryCode && COUNTRY_DEFAULT_COORDS[countryCode.toUpperCase()]) {
    return COUNTRY_DEFAULT_COORDS[countryCode.toUpperCase()];
  }

  // Fallback seguro: Buenos Aires
  return [-34.6037, -58.3816];
}

