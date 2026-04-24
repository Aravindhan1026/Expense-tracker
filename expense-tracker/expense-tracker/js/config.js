/**
 * ============================================
 * Expense Tracker - Configuration Module
 * Contains all constants, categories, and app settings
 * Student Project - CS101
 * ============================================
 */

const CONFIG = {
    // App Info
    APP_NAME: 'Expense Tracker',
    VERSION: '1.0.0',
    STORAGE_KEY: 'expense_tracker_data_v1',
    BUDGET_KEY: 'expense_tracker_budgets_v1',
    SETTINGS_KEY: 'expense_tracker_settings_v1',

    // Pagination
    ITEMS_PER_PAGE: 10,

    // Date Format
    DATE_FORMAT: 'YYYY-MM-DD',
    DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',

    // Currency
    CURRENCY_LOCALE: 'en-US',
    CURRENCY_CODE: 'USD',

    // Categories with metadata
    CATEGORIES: {
        // Expense Categories
        food: {
            id: 'food',
            label: 'Food & Dining',
            icon: '🍔',
            color: '#f59e0b',
            type: 'expense',
            description: 'Restaurants, groceries, and food delivery'
        },
        transport: {
            id: 'transport',
            label: 'Transportation',
            icon: '🚗',
            color: '#3b82f6',
            type: 'expense',
            description: 'Gas, public transit, rideshare, and vehicle maintenance'
        },
        shopping: {
            id: 'shopping',
            label: 'Shopping',
            icon: '🛍️',
            color: '#ec4899',
            type: 'expense',
            description: 'Clothing, electronics, and personal items'
        },
        entertainment: {
            id: 'entertainment',
            label: 'Entertainment',
            icon: '🎬',
            color: '#8b5cf6',
            type: 'expense',
            description: 'Movies, games, hobbies, and subscriptions'
        },
        bills: {
            id: 'bills',
            label: 'Bills & Utilities',
            icon: '📄',
            color: '#ef4444',
            type: 'expense',
            description: 'Rent, electricity, water, internet, and phone'
        },
        health: {
            id: 'health',
            label: 'Health & Medical',
            icon: '🏥',
            color: '#10b981',
            type: 'expense',
            description: 'Doctor visits, pharmacy, and insurance'
        },
        travel: {
            id: 'travel',
            label: 'Travel',
            icon: '✈️',
            color: '#06b6d4',
            type: 'expense',
            description: 'Flights, hotels, and vacation expenses'
        },
        education: {
            id: 'education',
            label: 'Education',
            icon: '📚',
            color: '#f97316',
            type: 'expense',
            description: 'Tuition, books, and courses'
        },
        home: {
            id: 'home',
            label: 'Home & Garden',
            icon: '🏠',
            color: '#84cc16',
            type: 'expense',
            description: 'Furniture, repairs, and maintenance'
        },
        personal: {
            id: 'personal',
            label: 'Personal Care',
            icon: '💇',
            color: '#d946ef',
            type: 'expense',
            description: 'Haircuts, cosmetics, and gym'
        },

        // Income Categories
        salary: {
            id: 'salary',
            label: 'Salary',
            icon: '💼',
            color: '#10b981',
            type: 'income',
            description: 'Regular employment income'
        },
        freelance: {
            id: 'freelance',
            label: 'Freelance',
            icon: '💻',
            color: '#6366f1',
            type: 'income',
            description: 'Contract work and side projects'
        },
        investment: {
            id: 'investment',
            label: 'Investments',
            icon: '📈',
            color: '#84cc16',
            type: 'income',
            description: 'Dividends, interest, and capital gains'
        },
        gift: {
            id: 'gift',
            label: 'Gifts',
            icon: '🎁',
            color: '#f43f5e',
            type: 'income',
            description: 'Money received as gifts'
        },
        refund: {
            id: 'refund',
            label: 'Refunds',
            icon: '↩️',
            color: '#06b6d4',
            type: 'income',
            description: 'Returned purchases and reimbursements'
        },
        other_income: {
            id: 'other_income',
            label: 'Other Income',
            icon: '💰',
            color: '#14b8a6',
            type: 'income',
            description: 'Miscellaneous income sources'
        }
    },

    // Budget Alert Thresholds (percentage)
    BUDGET_ALERT_WARNING: 75,   // Yellow warning at 75%
    BUDGET_ALERT_DANGER: 90,    // Red alert at 90%

    // Demo Data for first-time users
    DEMO_DATA: [
        {
            id: 'demo-1',
            type: 'income',
            description: 'Monthly Salary',
            amount: 4500.00,
            category: 'salary',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
            recurring: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo-2',
            type: 'expense',
            description: 'Weekly Groceries',
            amount: 156.43,
            category: 'food',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 3).toISOString().split('T')[0],
            recurring: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo-3',
            type: 'expense',
            description: 'Netflix Subscription',
            amount: 15.99,
            category: 'entertainment',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().split('T')[0],
            recurring: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo-4',
            type: 'expense',
            description: 'Gas Station',
            amount: 45.00,
            category: 'transport',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 7).toISOString().split('T')[0],
            recurring: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo-5',
            type: 'expense',
            description: 'Electric Bill',
            amount: 120.50,
            category: 'bills',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split('T')[0],
            recurring: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo-6',
            type: 'income',
            description: 'Freelance Project',
            amount: 800.00,
            category: 'freelance',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 12).toISOString().split('T')[0],
            recurring: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo-7',
            type: 'expense',
            description: 'New Headphones',
            amount: 199.99,
            category: 'shopping',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 14).toISOString().split('T')[0],
            recurring: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 'demo-8',
            type: 'expense',
            description: 'Doctor Visit',
            amount: 75.00,
            category: 'health',
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 16).toISOString().split('T')[0],
            recurring: false,
            createdAt: new Date().toISOString()
        }
    ],

    // Default Budgets
    DEFAULT_BUDGETS: {
        food: 600,
        transport: 300,
        shopping: 400,
        entertainment: 150,
        bills: 1500,
        health: 200,
        travel: 500,
        education: 300,
        home: 250,
        personal: 150
    }
};

// Make CONFIG globally available
window.CONFIG = CONFIG;
