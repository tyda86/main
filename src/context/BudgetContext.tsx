import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Expense, Budget, Category, BudgetContextType } from '../types';

// Default categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#f59e0b', icon: '🍽️' },
  { id: '2', name: 'Transportation', color: '#3b82f6', icon: '🚗' },
  { id: '3', name: 'Shopping', color: '#ec4899', icon: '🛍️' },
  { id: '4', name: 'Entertainment', color: '#8b5cf6', icon: '🎬' },
  { id: '5', name: 'Bills & Utilities', color: '#ef4444', icon: '💡' },
  { id: '6', name: 'Healthcare', color: '#10b981', icon: '🏥' },
  { id: '7', name: 'Education', color: '#06b6d4', icon: '📚' },
  { id: '8', name: 'Travel', color: '#f97316', icon: '✈️' },
  { id: '9', name: 'Other', color: '#6b7280', icon: '📦' },
];

interface BudgetState {
  expenses: Expense[];
  budgets: Budget[];
  categories: Category[];
}

type BudgetAction =
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: { id: string; expense: Partial<Expense> } }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: { id: string; budget: Partial<Budget> } }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_INITIAL_DATA'; payload: BudgetState };

const budgetReducer = (state: BudgetState, action: BudgetAction): BudgetState => {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense =>
          expense.id === action.payload.id
            ? { ...expense, ...action.payload.expense }
            : expense
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, action.payload] };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(budget =>
          budget.id === action.payload.id
            ? { ...budget, ...action.payload.budget }
            : budget
        ),
      };
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.id !== action.payload),
      };
    case 'SET_INITIAL_DATA':
      return action.payload;
    default:
      return state;
  }
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, {
    expenses: [],
    budgets: [],
    categories: defaultCategories,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('budgetAppData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({
          type: 'SET_INITIAL_DATA',
          payload: {
            expenses: parsedData.expenses || [],
            budgets: parsedData.budgets || [],
            categories: parsedData.categories || defaultCategories,
          },
        });
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('budgetAppData', JSON.stringify(state));
  }, [state]);

  // Calculate spent amount for budgets
  const calculateSpentAmount = (category: string): number => {
    return state.expenses
      .filter(expense => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });

    // Update budget spent amount
    const budget = state.budgets.find(b => b.category === expense.category);
    if (budget) {
      const newSpent = calculateSpentAmount(expense.category) + expense.amount;
      dispatch({
        type: 'UPDATE_BUDGET',
        payload: { id: budget.id, budget: { spent: newSpent } },
      });
    }
  };

  const updateExpense = (id: string, expense: Partial<Expense>) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: { id, expense } });
  };

  const deleteExpense = (id: string) => {
    const expense = state.expenses.find(e => e.id === id);
    dispatch({ type: 'DELETE_EXPENSE', payload: id });

    // Update budget spent amount
    if (expense) {
      const budget = state.budgets.find(b => b.category === expense.category);
      if (budget) {
        const newSpent = calculateSpentAmount(expense.category) - expense.amount;
        dispatch({
          type: 'UPDATE_BUDGET',
          payload: { id: budget.id, budget: { spent: Math.max(0, newSpent) } },
        });
      }
    }
  };

  const addBudget = (budget: Omit<Budget, 'id' | 'spent'>) => {
    const spent = calculateSpentAmount(budget.category);
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      spent,
    };
    dispatch({ type: 'ADD_BUDGET', payload: newBudget });
  };

  const updateBudget = (id: string, budget: Partial<Budget>) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: { id, budget } });
  };

  const deleteBudget = (id: string) => {
    dispatch({ type: 'DELETE_BUDGET', payload: id });
  };

  const getTotalExpenses = (): number => {
    return state.expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByCategory = (category: string): Expense[] => {
    return state.expenses.filter(expense => expense.category === category);
  };

  const getBudgetByCategory = (category: string): Budget | undefined => {
    return state.budgets.find(budget => budget.category === category);
  };

  const value: BudgetContextType = {
    expenses: state.expenses,
    budgets: state.budgets,
    categories: state.categories,
    addExpense,
    updateExpense,
    deleteExpense,
    addBudget,
    updateBudget,
    deleteBudget,
    getTotalExpenses,
    getExpensesByCategory,
    getBudgetByCategory,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};