import React from 'react';
import { useBudget } from '../context/BudgetContext';
import { Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const BudgetList: React.FC = () => {
  const { budgets, categories, deleteBudget } = useBudget();

  const handleDelete = (id: string, category: string) => {
    if (window.confirm(`Are you sure you want to delete the budget for "${category}"?`)) {
      deleteBudget(id);
    }
  };

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Budgets</h2>
        <div className="mt-4 sm:mt-0 text-sm text-gray-600">
          {budgets.length} budget{budgets.length !== 1 ? 's' : ''} active
        </div>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const category = categories.find(cat => cat.name === budget.category);
            const progressPercentage = getProgressPercentage(budget.spent, budget.amount);
            const isOverBudget = budget.spent > budget.amount;
            const remaining = budget.amount - budget.spent;

            return (
              <div key={budget.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{category?.icon || '📦'}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                      <p className="text-sm text-gray-600 capitalize">{budget.period} budget</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isOverBudget ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : remaining <= budget.amount * 0.2 ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <button
                      onClick={() => handleDelete(budget.id, budget.category)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete budget"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Spent: ${budget.spent.toFixed(2)}</span>
                    <span>Budget: ${budget.amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(budget.spent, budget.amount)}`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className={`font-medium ${isOverBudget ? 'text-red-600' : remaining <= budget.amount * 0.2 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {isOverBudget 
                        ? `$${(budget.spent - budget.amount).toFixed(2)} over budget`
                        : `$${remaining.toFixed(2)} remaining`
                      }
                    </span>
                    <span className="text-gray-500">
                      {progressPercentage.toFixed(1)}% used
                    </span>
                  </div>
                </div>

                {/* Status Message */}
                {isOverBudget && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-800 font-medium">
                        You've exceeded your {budget.period} budget by ${(budget.spent - budget.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                
                {!isOverBudget && remaining <= budget.amount * 0.2 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-800 font-medium">
                        You're close to your budget limit. ${remaining.toFixed(2)} remaining.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card text-center py-12">
            <div className="text-gray-400 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets set</h3>
            <p className="text-gray-500">
              Create your first budget to start tracking your spending limits
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetList;