export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default?: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

