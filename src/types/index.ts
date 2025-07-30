export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface BudgetContextType {
  expenses: Expense[];
  budgets: Budget[];
  categories: Category[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getTotalExpenses: () => number;
  getExpensesByCategory: (category: string) => Expense[];
  getBudgetByCategory: (category: string) => Budget | undefined;
}