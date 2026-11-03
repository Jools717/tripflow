export interface ExpenseCategory {
  id: string;
  tripId?: string;
  userId?: string;
  name: string;
  icon: string;
  color: string;
  is_default?: boolean;
}

export interface ChecklistItem {
  id: string;
  tripId?: string;
  userId?: string;
  text: string;
  category: string;
  completed: boolean;
}
