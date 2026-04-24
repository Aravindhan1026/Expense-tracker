# 💰 Expense Tracker

**Student Project - CS101** | A comprehensive personal finance management application

---

## 📁 Project Structure

```
expense-tracker/
├── index.html          # Main HTML file with layout and modals
├── css/
│   ├── main.css        # Core styles, animations, and utilities
│   └── dark-mode.css   # Dark theme styles
├── js/
│   ├── config.js       # App constants, categories, demo data
│   ├── utils.js        # Helper functions (formatting, validation)
│   ├── storage.js      # localStorage management & import/export
│   ├── transactions.js # Business logic for transactions
│   ├── budget.js       # Budget tracking, alerts & insights
│   ├── charts.js       # Chart.js configurations & rendering
│   ├── ui.js           # DOM manipulation & user interactions
│   └── app.js          # Main application controller
└── README.md           # This file
```

---

## ✨ Features

### Core Features
- ✅ **Add/Edit/Delete Transactions** - Track income and expenses with descriptions
- ✅ **Categories** - 16 categories with icons and colors (10 expense + 6 income)
- ✅ **Recurring Transactions** - Mark transactions as monthly recurring
- ✅ **Search & Filter** - Search by description, filter by type/category
- ✅ **Sorting** - Sort by date (newest/oldest) or amount (high/low)
- ✅ **Pagination** - 10 items per page for clean viewing

### Analytics & Visualization
- 📊 **Monthly Trend Chart** - Bar chart showing income vs expenses over time (3/6/12 months)
- 📊 **Category Distribution** - Doughnut chart showing spending breakdown by category
- 📊 **Budget Progress Bars** - Visual budget tracking with color-coded alerts
- 📊 **Smart Insights** - AI-like suggestions based on spending patterns

### Budget Management
- 🎯 **Category Budgets** - Set monthly spending limits per category
- 🎯 **Budget Alerts** - Warning at 75%, danger at 90% of budget
- 🎯 **Pre-transaction Warnings** - Alert before adding an over-budget expense
- 🎯 **Budget Status Card** - Overall budget health at a glance

### Data Management
- 💾 **Local Storage** - All data persists in browser (no server needed)
- 💾 **Export JSON** - Full backup with transactions, budgets & settings
- 💾 **Export CSV** - Spreadsheet-compatible transaction export
- 💾 **Import JSON** - Restore from backup file
- 💾 **Demo Data** - Pre-loaded sample data for first-time users

### UI/UX
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🌙 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Smooth Animations** - Fade-in, slide, and scale transitions
- 🌙 **Toast Notifications** - Non-intrusive success/error messages
- 🌙 **Keyboard Shortcuts** - `Ctrl+N` to add transaction, `ESC` to close modals

---

## 🚀 How to Run

1. **Download** the project folder
2. **Open** `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari)
3. **No server required!** - It runs entirely client-side

> **Note:** Since the app uses `localStorage`, data is saved in your browser. Clearing browser data will erase your transactions.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic structure |
| **Tailwind CSS** | Utility-first styling (via CDN) |
| **Vanilla JavaScript** | All application logic (ES6+) |
| **Chart.js** | Data visualization |
| **Font Awesome** | Icons |
| **localStorage API** | Data persistence |

---

## 📊 Architecture

The app follows a **modular architecture** with clear separation of concerns:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│     UI      │────▶│  App Controller│───▶│   Storage   │
│  (ui.js)    │◀────│   (app.js)    │◀────│ (storage.js)│
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Charts    │     │ Transactions│     │   Budget    │
│ (charts.js) │     │(transactions.js)│  │ (budget.js) │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
                    ┌─────────────┐
                    │    Utils    │
                    │  (utils.js) │
                    └─────────────┘
```

---

## 📝 Code Quality

- **JSDoc Comments** - All functions documented with parameters and return types
- **Input Validation** - XSS protection, type checking, and range validation
- **Error Handling** - Graceful fallbacks for storage errors
- **Consistent Naming** - camelCase for variables, descriptive function names
- **No Dependencies** - Pure vanilla JS (except Chart.js & Tailwind CDN)

---

## 🎓 Learning Outcomes

This project demonstrates:
- **DOM Manipulation** - Dynamic content rendering and event handling
- **Data Structures** - Arrays, objects, and efficient data organization
- **Local Storage** - CRUD operations with browser persistence
- **Modular Design** - Separation of concerns across multiple files
- **Chart Integration** - Data visualization with Chart.js
- **Form Validation** - Client-side validation with user feedback
- **Responsive Design** - Mobile-first CSS with Tailwind
- **State Management** - Maintaining application state across modules

---

## 📄 License

This is a student project created for educational purposes.

---

**Created with ❤️ for CS101**
