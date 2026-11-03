export type ActivityType = 'plan' | 'compras' | 'nota';

export type ActivityPeriod = 'mañana' | 'tarde' | 'noche';

export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
}

export interface Activity {
  id: string;
  tripId?: string;
  userId?: string;
  dayNumber: number;
  time: string;
  period: ActivityPeriod | string;
  title: string;
  barrio: string;
  category: string;
  address?: string;
  coords?: [number, number] | null;
  type?: ActivityType;
  items?: PurchaseItem[];
  note?: string;
  description?: string;
  tip?: string;
  withFriend: boolean;
  completed: boolean;
  costEstimatedARS: number;
}
