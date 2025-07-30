import React from 'react';
import { useBudget } from '../context/BudgetContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { expenses, budgets, categories, getTotalExpenses } = useBudget();

  const totalExpenses = getTotalExpenses();
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const remainingBudget = totalBudget - totalExpenses;

  // Prepare data for charts
  const expensesByCategory = categories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category === category.name);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return {
      name: category.name,
      value: total,
      color: category.color,
    };
  }).filter(item => item.value > 0);

  const budgetVsSpent = budgets.map(budget => {
    const category = categories.find(cat => cat.name === budget.category);
    return {
      category: budget.category,
      budget: budget.amount,
      spent: budget.spent,
      remaining: budget.amount - budget.spent,
      color: category?.color || '#6b7280',
    };
  });

  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const overBudgetCategories = budgets.filter(budget => budget.spent > budget.amount);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${totalBudget.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining Budget</p>
              <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${remainingBudget.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <TrendingUp className={`h-6 w-6 ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Over Budget</p>
              <p className="text-2xl font-bold text-red-600">{overBudgetCategories.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No expenses to display
            </div>
          )}
        </div>

        {/* Budget vs Spent Bar Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Spent</h3>
          {budgetVsSpent.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetVsSpent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, '']} />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No budgets to display
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
        {recentExpenses.length > 0 ? (
          <div className="space-y-3">
            {recentExpenses.map((expense) => {
              const category = categories.find(cat => cat.name === expense.category);
              return (
                <div key={expense.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{category?.icon || '📦'}</div>
                    <div>
                      <p className="font-medium text-gray-900">{expense.title}</p>
                      <p className="text-sm text-gray-500">{expense.category} • {format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No expenses recorded yet
          </div>
        )}
      </div>

      {/* Over Budget Alerts */}
      {overBudgetCategories.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Budget Alerts</h3>
          </div>
          <div className="space-y-2">
            {overBudgetCategories.map((budget) => (
              <div key={budget.id} className="flex items-center justify-between py-2">
                <span className="text-red-800">{budget.category}</span>
                <span className="text-red-600 font-medium">
                  ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)} 
                  ({(((budget.spent - budget.amount) / budget.amount) * 100).toFixed(1)}% over)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;