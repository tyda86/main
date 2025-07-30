import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Plus, X } from 'lucide-react';

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ isOpen, onClose }) => {
  const { categories, addBudget, budgets } = useBudget();
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly',
  });

  const availableCategories = categories.filter(
    category => !budgets.some(budget => budget.category === category.name)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    addBudget({
      category: formData.category,
      amount: parseFloat(formData.amount),
      period: formData.period,
    });

    setFormData({
      category: '',
      amount: '',
      period: 'monthly',
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Budget</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="category" className="label">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select a category</option>
              {availableCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {availableCategories.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                All categories already have budgets assigned
              </p>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="label">
              Budget Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="input-field pl-7"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="period" className="label">
              Budget Period *
            </label>
            <select
              id="period"
              name="period"
              value={formData.period}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
              disabled={availableCategories.length === 0}
            >
              <Plus className="h-4 w-4" />
              <span>Add Budget</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;