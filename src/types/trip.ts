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
  suggestedCities: string[];
}

export const GLOBAL_DESTINATIONS: DestinationCountry[] = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', defaultCurrency: 'ARS', suggestedCities: ['Buenos Aires', 'Bariloche', 'Mendoza', 'Iguazú'] },
  { code: 'JP', name: 'Japón', flag: '🇯🇵', defaultCurrency: 'JPY', suggestedCities: ['Tokio', 'Kioto', 'Osaka', 'Nara'] },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', defaultCurrency: 'EUR', suggestedCities: ['París', 'Niza', 'Lyon', 'Marsella'] },
  { code: 'ES', name: 'España', flag: '🇪🇸', defaultCurrency: 'EUR', suggestedCities: ['Madrid', 'Barcelona', 'Sevilla', 'Valencia'] },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', defaultCurrency: 'USD', suggestedCities: ['Nueva York', 'Miami', 'Orlando', 'San Francisco'] },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', defaultCurrency: 'EUR', suggestedCities: ['Roma', 'Florencia', 'Venecia', 'Milán'] },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', defaultCurrency: 'COP', suggestedCities: ['Medellín', 'Cartagena', 'Bogotá', 'Santa Marta'] },
  { code: 'MX', name: 'México', flag: '🇲🇽', defaultCurrency: 'MXN', suggestedCities: ['Ciudad de México', 'Cancún', 'Oaxaca', 'Guadalajara'] },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', defaultCurrency: 'GBP', suggestedCities: ['Londres', 'Edimburgo', 'Manchester', 'Bath'] },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', defaultCurrency: 'BRL', suggestedCities: ['Río de Janeiro', 'São Paulo', 'Salvador', 'Florianópolis'] }
];

export const DEFAULT_BA_TRIP: Trip = {
  id: 'trip-ba-2026',
  userId: null,
  title: 'Buenos Aires 2026',
  destinationCity: 'Buenos Aires',
  countryCode: 'AR',
  flagEmoji: '🇦🇷',
  startDate: '2026-10-10',
  endDate: '2026-10-23',
  baseCurrency: 'USD',
  localCurrency: 'ARS',
  exchangeRate: 1280,
  budgetTotalBase: 1000,
  isActive: true,
  notes: 'Viaje a Buenos Aires con estadía en casa de amiga. Itinerario día por día.'
};
