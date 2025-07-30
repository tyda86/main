import React, { useState } from 'react';
import { BudgetProvider } from './context/BudgetContext';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import BudgetForm from './components/BudgetForm';
import ExpenseList from './components/ExpenseList';
import BudgetList from './components/BudgetList';
import { 
  BarChart3, 
  Plus, 
  Receipt, 
  Target, 
  Home,
  Menu,
  X
} from 'lucide-react';

type TabType = 'dashboard' | 'expenses' | 'budgets';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'expenses', name: 'Expenses', icon: Receipt },
    { id: 'budgets', name: 'Budgets', icon: Target },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <ExpenseList />;
      case 'budgets':
        return <BudgetList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <BudgetProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Budget Manager</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-8 px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-8 left-4 right-4 space-y-3">
            <button
              onClick={() => setShowExpenseForm(true)}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Expense</span>
            </button>
            <button
              onClick={() => setShowBudgetForm(true)}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Budget</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeTab}
                </h2>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="btn-primary hidden sm:flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Expense</span>
                </button>
                <button
                  onClick={() => setShowBudgetForm(true)}
                  className="btn-secondary hidden sm:flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Budget</span>
                </button>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>

        {/* Modals */}
        <ExpenseForm 
          isOpen={showExpenseForm} 
          onClose={() => setShowExpenseForm(false)} 
        />
        <BudgetForm 
          isOpen={showBudgetForm} 
          onClose={() => setShowBudgetForm(false)} 
        />
      </div>
    </BudgetProvider>
  );
}

export default App;