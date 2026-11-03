export interface Trip {
  id: string;
  userId?: string | null;
  title: string;
  destinationCity: string;
  countryCode: string;
  flagEmoji: string;
  startDate: string;
  endDate: string;
  baseCurrency: string; // Ej: 'USD', 'EUR'
  localCurrency: string; // Ej: 'ARS', 'JPY', 'EUR'
  exchangeRate: number;
  budgetTotalBase: number;
  isActive?: boolean;
  notes?: string;
}

export interface DestinationCountry {
  code: string;
  name: string;
  flag: string;
  defaultCurrency: string;
  approxRateUSD: number;
  suggestedCities: string[];
}

export const GLOBAL_DESTINATIONS: DestinationCountry[] = [
  // América
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', defaultCurrency: 'ARS', approxRateUSD: 1540, suggestedCities: ['Buenos Aires', 'Bariloche', 'Mendoza', 'Iguazú', 'Ushuaia'] },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', defaultCurrency: 'USD', approxRateUSD: 1, suggestedCities: ['Nueva York', 'Miami', 'Orlando', 'San Francisco', 'Los Ángeles'] },
  { code: 'MX', name: 'México', flag: '🇲🇽', defaultCurrency: 'MXN', approxRateUSD: 19.5, suggestedCities: ['Ciudad de México', 'Cancún', 'Oaxaca', 'Guadalajara', 'Playa del Carmen'] },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', defaultCurrency: 'COP', approxRateUSD: 4150, suggestedCities: ['Medellín', 'Cartagena', 'Bogotá', 'Santa Marta', 'Cali'] },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', defaultCurrency: 'BRL', approxRateUSD: 5.6, suggestedCities: ['Río de Janeiro', 'São Paulo', 'Salvador', 'Florianópolis'] },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', defaultCurrency: 'PEN', approxRateUSD: 3.75, suggestedCities: ['Cusco', 'Lima', 'Arequipa', 'Valle Sagrado'] },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', defaultCurrency: 'CLP', approxRateUSD: 930, suggestedCities: ['Santiago', 'San Pedro de Atacama', 'Valparaíso', 'Torres del Paine'] },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦', defaultCurrency: 'CAD', approxRateUSD: 1.38, suggestedCities: ['Toronto', 'Vancouver', 'Montreal', 'Banff'] },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', defaultCurrency: 'CRC', approxRateUSD: 520, suggestedCities: ['San José', 'La Fortuna', 'Manuel Antonio', 'Monteverde'] },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦', defaultCurrency: 'USD', approxRateUSD: 1, suggestedCities: ['Ciudad de Panamá', 'Bocas del Toro', 'Boquete'] },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴', defaultCurrency: 'DOP', approxRateUSD: 60, suggestedCities: ['Punta Cana', 'Santo Domingo', 'Las Terrenas'] },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', defaultCurrency: 'USD', approxRateUSD: 1, suggestedCities: ['Quito', 'Galápagos', 'Cuenca', 'Guayaquil'] },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', defaultCurrency: 'UYU', approxRateUSD: 42, suggestedCities: ['Montevideo', 'Punta del Este', 'Colonia del Sacramento'] },

  // Europa
  { code: 'ES', name: 'España', flag: '🇪🇸', defaultCurrency: 'EUR', approxRateUSD: 0.92, suggestedCities: ['Madrid', 'Barcelona', 'Sevilla', 'Valencia', 'Granada'] },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', defaultCurrency: 'EUR', approxRateUSD: 0.92, suggestedCities: ['París', 'Niza', 'Lyon', 'Marsella', 'Burdeos'] },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', defaultCurrency: 'EUR', approxRateUSD: 0.92, suggestedCities: ['Roma', 'Florencia', 'Venecia', 'Milán', 'Nápoles'] },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', defaultCurrency: 'GBP', approxRateUSD: 0.79, suggestedCities: ['Londres', 'Edimburgo', 'Manchester', 'Bath', 'Oxford'] },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪', defaultCurrency: 'EUR', approxRateUSD: 0.92, suggestedCities: ['Berlín', 'Múnich', 'Frankfurt', 'Hamburgo', 'Colonia'] },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', defaultCurrency: 'EUR', approxRateUSD: 0.92, suggestedCities: ['Lisboa', 'Oporto', 'Sintra', 'Algarve', 'Madeira'] },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷', defaultCurrency: 'EUR', approxRateUSD: 0.92, suggestedCities: ['Atenas', 'Santorini', 'Miconos', 'Creta', 'Rodas'] },
  { code: 'CH', name: 'Suiza', flag: '🇨🇭', defaultCurrency: 'CHF', approxRateUSD: 0.87, suggestedCities: ['Zúrich', 'Ginebra', 'Lucerna', 'Interlaken', 'Zermatt'] },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱', defaultCurrency: 'EUR', approxRateUSD: 0.92, suggestedCities: ['Ámsterdam', 'Róterdam', 'Utrecht', 'La Haya'] },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', defaultCurrency: 'EUR', approxRateUSD: 0.92, suggestedCities: ['Viena', 'Salzburgo', 'Innsbruck', 'Hallstatt'] },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪', defaultCurrency: 'EUR', approxRateUSD: 0.92, suggestedCities: ['Dublín', 'Galway', 'Cork', 'Killarney'] },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪', defaultCurrency: 'EUR', approxRateUSD: 0.92, suggestedCities: ['Bruselas', 'Brujas', 'Gante', 'Amberes'] },
  { code: 'CZ', name: 'República Checa', flag: '🇨🇿', defaultCurrency: 'CZK', approxRateUSD: 23.5, suggestedCities: ['Praga', 'Český Krumlov', 'Brno'] },
  { code: 'HU', name: 'Hungría', flag: '🇭🇺', defaultCurrency: 'HUF', approxRateUSD: 365, suggestedCities: ['Budapest', 'Debrecen', 'Eger'] },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱', defaultCurrency: 'PLN', approxRateUSD: 4.05, suggestedCities: ['Cracovia', 'Varsovia', 'Gdansk', 'Wroclaw'] },
  { code: 'HR', name: 'Croacia', flag: '🇭🇷', defaultCurrency: 'EUR', approxRateUSD: 0.92, suggestedCities: ['Dubrovnik', 'Split', 'Zagreb', 'Zadar'] },
  { code: 'SE', name: 'Suecia', flag: '🇸🇪', defaultCurrency: 'SEK', approxRateUSD: 10.6, suggestedCities: ['Estocolmo', 'Gotemburgo', 'Malmö'] },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴', defaultCurrency: 'NOK', approxRateUSD: 11.0, suggestedCities: ['Oslo', 'Bergen', 'Tromsø', 'Stavanger'] },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰', defaultCurrency: 'DKK', approxRateUSD: 6.9, suggestedCities: ['Copenhague', 'Aarhus', 'Odense'] },
  { code: 'IS', name: 'Islandia', flag: '🇮🇸', defaultCurrency: 'ISK', approxRateUSD: 138, suggestedCities: ['Reikiavik', 'Akureyri', 'Vík'] },

  // Asia y Medio Oriente
  { code: 'JP', name: 'Japón', flag: '🇯🇵', defaultCurrency: 'JPY', approxRateUSD: 155, suggestedCities: ['Tokio', 'Kioto', 'Osaka', 'Nara', 'Hiroshima'] },
  { code: 'TH', name: 'Tailandia', flag: '🇹🇭', defaultCurrency: 'THB', approxRateUSD: 34.5, suggestedCities: ['Bangkok', 'Chiang Mai', 'Phuket', 'Krabi'] },
  { code: 'TR', name: 'Turquía', flag: '🇹🇷', defaultCurrency: 'TRY', approxRateUSD: 34.2, suggestedCities: ['Estambul', 'Capadocia', 'Antalya', 'Bodrum'] },
  { code: 'KR', name: 'Corea del Sur', flag: '🇰🇷', defaultCurrency: 'KRW', approxRateUSD: 1380, suggestedCities: ['Seúl', 'Busan', 'Jeju', 'Incheon'] },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', defaultCurrency: 'VND', approxRateUSD: 25400, suggestedCities: ['Hanói', 'Ho Chi Minh', 'Da Nang', 'Hoi An'] },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', defaultCurrency: 'IDR', approxRateUSD: 15700, suggestedCities: ['Bali', 'Yakarta', 'Lombok', 'Yogyakarta'] },
  { code: 'AE', name: 'Emiratos Árabes', flag: '🇦🇪', defaultCurrency: 'AED', approxRateUSD: 3.67, suggestedCities: ['Dubái', 'Abu Dhabi', 'Sharjah'] },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬', defaultCurrency: 'SGD', approxRateUSD: 1.33, suggestedCities: ['Singapur', 'Sentosa'] },
  { code: 'MY', name: 'Malasia', flag: '🇲🇾', defaultCurrency: 'MYR', approxRateUSD: 4.4, suggestedCities: ['Kuala Lumpur', 'Penang', 'Langkawi'] },
  { code: 'PH', name: 'Filipinas', flag: '🇵🇭', defaultCurrency: 'PHP', approxRateUSD: 58, suggestedCities: ['Manila', 'Cebú', 'Palawan', 'Borácay'] },
  { code: 'IN', name: 'India', flag: '🇮🇳', defaultCurrency: 'INR', approxRateUSD: 84, suggestedCities: ['Nueva Delhi', 'Mumbai', 'Jaipur', 'Goa'] },
  { code: 'CN', name: 'China', flag: '🇨🇳', defaultCurrency: 'CNY', approxRateUSD: 7.15, suggestedCities: ['Pekín', 'Shanghái', 'Xi\'an', 'Chengdu'] },
  { code: 'SA', name: 'Arabia Saudita', flag: '🇸🇦', defaultCurrency: 'SAR', approxRateUSD: 3.75, suggestedCities: ['Riad', 'Yeda', 'Medina'] },

  // África y Oceanía
  { code: 'EG', name: 'Egipto', flag: '🇪🇬', defaultCurrency: 'EGP', approxRateUSD: 49, suggestedCities: ['El Cairo', 'Lúxor', 'Asuán', 'Hurghada'] },
  { code: 'MA', name: 'Marruecos', flag: '🇲🇦', defaultCurrency: 'MAD', approxRateUSD: 9.8, suggestedCities: ['Marrakech', 'Casablanca', 'Fez', 'Chefchaouen'] },
  { code: 'ZA', name: 'Sudáfrica', flag: '🇿🇦', defaultCurrency: 'ZAR', approxRateUSD: 17.6, suggestedCities: ['Ciudad del Cabo', 'Johannesburgo', 'Durban'] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', defaultCurrency: 'AUD', approxRateUSD: 1.52, suggestedCities: ['Sídney', 'Melbourne', 'Brisbane', 'Perth'] },
  { code: 'NZ', name: 'Nueva Zelanda', flag: '🇳🇿', defaultCurrency: 'NZD', approxRateUSD: 1.68, suggestedCities: ['Auckland', 'Queenstown', 'Wellington', 'Christchurch'] }
];

export const DEFAULT_BA_TRIP: Trip = {
  id: 'trip-ba-2026',
  userId: 'user-admin-jools',
  title: 'Buenos Aires 2026',
  destinationCity: 'Buenos Aires',
  countryCode: 'AR',
  flagEmoji: '🇦🇷',
  startDate: '2026-10-10',
  endDate: '2026-10-23',
  baseCurrency: 'USD',
  localCurrency: 'ARS',
  exchangeRate: 1540,
  budgetTotalBase: 1000,
  isActive: true,
  notes: 'Viaje a Buenos Aires con estadía en casa de amiga. Itinerario día por día.'
};
