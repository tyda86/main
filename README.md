# Budget & Expense Manager

A modern, responsive web application for tracking personal expenses and managing budgets. Built with React, TypeScript, and Tailwind CSS.

![Budget Manager Screenshot](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=Budget+%26+Expense+Manager)

## ✨ Features

### 📊 Dashboard
- **Overview Statistics**: Total expenses, total budget, remaining budget, and over-budget alerts
- **Visual Charts**: Interactive pie chart for expenses by category and bar chart for budget vs spent comparison
- **Recent Expenses**: Quick view of the latest 5 expenses
- **Budget Alerts**: Real-time notifications when budgets are exceeded

### 💰 Expense Management
- **Add Expenses**: Easy-to-use form with category selection, amount, date, and description
- **Expense List**: Comprehensive list with search, filter, and sort capabilities
- **Categories**: Pre-defined categories with emojis (Food & Dining, Transportation, Shopping, etc.)
- **Search & Filter**: Find expenses by title, description, or category
- **Delete Expenses**: Remove unwanted expense entries

### 🎯 Budget Management
- **Set Budgets**: Create budgets for different categories with weekly, monthly, or yearly periods
- **Budget Tracking**: Visual progress bars showing spent vs budgeted amounts
- **Budget Alerts**: Color-coded status indicators (green, yellow, red) based on spending
- **Over-Budget Warnings**: Automatic alerts when spending exceeds budget limits

### 💾 Data Persistence
- **Local Storage**: All data is automatically saved to browser's local storage
- **Auto-Save**: Changes are saved immediately without manual intervention
- **Data Recovery**: Data persists between browser sessions

### 📱 Responsive Design
- **Mobile-First**: Optimized for mobile devices with collapsible sidebar
- **Tablet & Desktop**: Responsive layout that adapts to all screen sizes
- **Modern UI**: Clean, professional interface with smooth animations

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budget-expense-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for modern icons
- **Date Handling**: date-fns for date formatting
- **Build Tool**: Vite for fast development and building
- **State Management**: React Context API with useReducer

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Dashboard.tsx    # Main dashboard with charts and stats
│   ├── ExpenseForm.tsx  # Modal form for adding expenses
│   ├── BudgetForm.tsx   # Modal form for adding budgets
│   ├── ExpenseList.tsx  # List view of all expenses
│   └── BudgetList.tsx   # List view of all budgets
├── context/             # Context API for state management
│   └── BudgetContext.tsx
├── types/               # TypeScript type definitions
│   └── index.ts
├── App.tsx              # Main app component with navigation
├── main.tsx            # React entry point
└── index.css           # Global styles and Tailwind imports
```

## 🎨 Features Overview

### Categories
The app comes with 9 pre-defined expense categories:
- 🍽️ Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎬 Entertainment
- 💡 Bills & Utilities
- 🏥 Healthcare
- 📚 Education
- ✈️ Travel
- 📦 Other

### Budget Periods
You can set budgets for different time periods:
- **Weekly**: Track weekly spending limits
- **Monthly**: Most common budget period
- **Yearly**: Long-term budget planning

### Data Visualization
- **Pie Chart**: Shows expense distribution by category
- **Bar Chart**: Compares budgeted vs actual spending
- **Progress Bars**: Visual budget utilization indicators

## 🔧 Customization

### Adding New Categories
To add new expense categories, modify the `defaultCategories` array in `src/context/BudgetContext.tsx`:

```typescript
const defaultCategories: Category[] = [
  // ... existing categories
  { id: '10', name: 'New Category', color: '#your-color', icon: '🆕' },
];
```

### Styling
The app uses Tailwind CSS with custom utility classes defined in `src/index.css`. You can customize colors, spacing, and other design tokens in `tailwind.config.js`.

## 📱 Usage Guide

### Adding Your First Expense
1. Click "Add Expense" button in the sidebar or top bar
2. Fill in the expense details (title, amount, category, date)
3. Optionally add a description
4. Click "Add Expense" to save

### Setting Up Budgets
1. Click "Add Budget" button
2. Select a category (only categories without existing budgets are shown)
3. Set the budget amount and period
4. Click "Add Budget" to save

### Monitoring Your Spending
- Visit the Dashboard to see your overall financial status
- Check the "Budgets" tab to see detailed progress for each category
- Use the "Expenses" tab to search and filter your spending history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Data is stored locally in browser storage (not synced across devices)
- No export/import functionality currently available
- Limited to pre-defined categories

## 🚧 Future Enhancements

- [ ] Data export/import (CSV, JSON)
- [ ] Custom category creation
- [ ] Recurring expense templates
- [ ] Multiple currency support
- [ ] Cloud sync capabilities
- [ ] Expense receipt photo uploads
- [ ] Advanced reporting and analytics
- [ ] Budget recommendations based on spending patterns

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.

---

**Happy budgeting! 💰📊**