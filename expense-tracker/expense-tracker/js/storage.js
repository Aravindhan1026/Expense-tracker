/**
 * ============================================
 * Expense Tracker - Storage Module
 * Handles localStorage, import/export, and data persistence
 * Student Project - CS101
 * ============================================
 */

const storage = {
    // Cache for in-memory data
    _transactions: null,
    _budgets: null,
    _settings: null,

    /**
     * Initialize storage and load data
     */
    init() {
        console.log('[Storage] Initializing...');

        // Check if first time user
        if (!localStorage.getItem(CONFIG.STORAGE_KEY)) {
            console.log('[Storage] First time user detected, loading demo data');
            this._transactions = utils.deepClone(CONFIG.DEMO_DATA);
            this._budgets = utils.deepClone(CONFIG.DEFAULT_BUDGETS);
            this._settings = { darkMode: false, demoLoaded: true };
            this.saveAll();
        } else {
            this.loadAll();
        }

        console.log(`[Storage] Loaded ${this._transactions.length} transactions`);
    },

    /**
     * Load all data from localStorage
     */
    loadAll() {
        try {
            const transactionsData = localStorage.getItem(CONFIG.STORAGE_KEY);
            const budgetsData = localStorage.getItem(CONFIG.BUDGET_KEY);
            const settingsData = localStorage.getItem(CONFIG.SETTINGS_KEY);

            this._transactions = transactionsData ? JSON.parse(transactionsData) : [];
            this._budgets = budgetsData ? JSON.parse(budgetsData) : utils.deepClone(CONFIG.DEFAULT_BUDGETS);
            this._settings = settingsData ? JSON.parse(settingsData) : { darkMode: false };
        } catch (error) {
            console.error('[Storage] Error loading data:', error);
            this._transactions = [];
            this._budgets = utils.deepClone(CONFIG.DEFAULT_BUDGETS);
            this._settings = { darkMode: false };
        }
    },

    /**
     * Save all data to localStorage
     */
    saveAll() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this._transactions));
            localStorage.setItem(CONFIG.BUDGET_KEY, JSON.stringify(this._budgets));
            localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(this._settings));
        } catch (error) {
            console.error('[Storage] Error saving data:', error);
            if (error.name === 'QuotaExceededError') {
                alert('Storage limit reached! Please export and clear some data.');
            }
        }
    },

    // ==================== TRANSACTIONS ====================

    /**
     * Get all transactions
     * @returns {Array} All transactions
     */
    getTransactions() {
        return utils.deepClone(this._transactions);
    },

    /**
     * Get transaction by ID
     * @param {string} id - Transaction ID
     * @returns {Object|null} Transaction object or null
     */
    getTransactionById(id) {
        return this._transactions.find(t => t.id === id) || null;
    },

    /**
     * Add a new transaction
     * @param {Object} transaction - Transaction to add
     * @returns {Object} Added transaction with generated ID
     */
    addTransaction(transaction) {
        const newTransaction = {
            ...transaction,
            id: utils.generateId(),
            createdAt: new Date().toISOString()
        };

        this._transactions.unshift(newTransaction);
        this.saveTransactions();
        return newTransaction;
    },

    /**
     * Update an existing transaction
     * @param {string} id - Transaction ID
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated transaction or null
     */
    updateTransaction(id, updates) {
        const index = this._transactions.findIndex(t => t.id === id);
        if (index === -1) return null;

        this._transactions[index] = {
            ...this._transactions[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveTransactions();
        return this._transactions[index];
    },

    /**
     * Delete a transaction
     * @param {string} id - Transaction ID to delete
     * @returns {boolean} Success status
     */
    deleteTransaction(id) {
        const initialLength = this._transactions.length;
        this._transactions = this._transactions.filter(t => t.id !== id);

        if (this._transactions.length < initialLength) {
            this.saveTransactions();
            return true;
        }
        return false;
    },

    /**
     * Save only transactions
     */
    saveTransactions() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this._transactions));
        } catch (error) {
            console.error('[Storage] Error saving transactions:', error);
        }
    },

    /**
     * Clear all transactions
     */
    clearTransactions() {
        this._transactions = [];
        this.saveTransactions();
    },

    // ==================== BUDGETS ====================

    /**
     * Get all budgets
     * @returns {Object} Budget object { category: amount }
     */
    getBudgets() {
        return utils.deepClone(this._budgets);
    },

    /**
     * Get budget for specific category
     * @param {string} category - Category ID
     * @returns {number|null} Budget amount or null
     */
    getBudget(category) {
        return this._budgets[category] || null;
    },

    /**
     * Set budget for a category
     * @param {string} category - Category ID
     * @param {number} amount - Budget amount
     */
    setBudget(category, amount) {
        if (amount > 0) {
            this._budgets[category] = amount;
        } else {
            delete this._budgets[category];
        }
        this.saveBudgets();
    },

    /**
     * Save multiple budgets at once
     * @param {Object} budgets - Budget object
     */
    setBudgets(budgets) {
        this._budgets = {};
        Object.entries(budgets).forEach(([category, amount]) => {
            if (amount > 0) {
                this._budgets[category] = amount;
            }
        });
        this.saveBudgets();
    },

    /**
     * Save budgets to localStorage
     */
    saveBudgets() {
        try {
            localStorage.setItem(CONFIG.BUDGET_KEY, JSON.stringify(this._budgets));
        } catch (error) {
            console.error('[Storage] Error saving budgets:', error);
        }
    },

    // ==================== SETTINGS ====================

    /**
     * Get app settings
     * @returns {Object} Settings object
     */
    getSettings() {
        return utils.deepClone(this._settings);
    },

    /**
     * Update a setting
     * @param {string} key - Setting key
     * @param {*} value - Setting value
     */
    setSetting(key, value) {
        this._settings[key] = value;
        this.saveSettings();
    },

    /**
     * Save settings
     */
    saveSettings() {
        try {
            localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(this._settings));
        } catch (error) {
            console.error('[Storage] Error saving settings:', error);
        }
    },

    // ==================== IMPORT / EXPORT ====================

    /**
     * Export all data as JSON
     * @returns {string} JSON string
     */
    exportToJSON() {
        const exportData = {
            app: CONFIG.APP_NAME,
            version: CONFIG.VERSION,
            exportedAt: new Date().toISOString(),
            transactions: this._transactions,
            budgets: this._budgets,
            settings: this._settings
        };
        return JSON.stringify(exportData, null, 2);
    },

    /**
     * Export transactions as CSV
     * @returns {string} CSV string
     */
    exportToCSV() {
        const headers = ['date', 'type', 'category', 'description', 'amount', 'recurring'];
        const rows = this._transactions.map(t => ({
            date: t.date,
            type: t.type,
            category: CONFIG.CATEGORIES[t.category]?.label || t.category,
            description: t.description,
            amount: t.amount.toFixed(2),
            recurring: t.recurring ? 'Yes' : 'No'
        }));
        return utils.convertToCSV(rows, headers);
    },

    /**
     * Import data from JSON string
     * @param {string} jsonString - JSON data
     * @returns {Object} { success: boolean, message: string, count: number }
     */
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // Validate structure
            if (!data.transactions || !Array.isArray(data.transactions)) {
                return { success: false, message: 'Invalid file format: missing transactions array', count: 0 };
            }

            // Validate each transaction
            const validTransactions = [];
            for (const t of data.transactions) {
                const validation = utils.validateTransaction(t);
                if (validation.valid) {
                    validTransactions.push({
                        id: t.id || utils.generateId(),
                        type: t.type,
                        description: t.description,
                        amount: parseFloat(t.amount),
                        category: t.category,
                        date: t.date,
                        recurring: !!t.recurring,
                        createdAt: t.createdAt || new Date().toISOString()
                    });
                }
            }

            // Merge or replace (here we replace for simplicity)
            this._transactions = validTransactions;

            if (data.budgets) {
                this._budgets = data.budgets;
            }

            this.saveAll();

            return {
                success: true,
                message: `Successfully imported ${validTransactions.length} transactions`,
                count: validTransactions.length
            };
        } catch (error) {
            console.error('[Storage] Import error:', error);
            return { success: false, message: 'Error parsing file: ' + error.message, count: 0 };
        }
    },

    /**
     * Import from CSV (basic implementation)
     * @param {string} csvString - CSV content
     * @returns {Object} Import result
     */
    importFromCSV(csvString) {
        const lines = csvString.trim().split('\n');
        if (lines.length < 2) {
            return { success: false, message: 'CSV file is empty', count: 0 };
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const transactions = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row = {};
            headers.forEach((h, idx) => row[h] = values[idx]);

            // Find category ID from label
            let categoryId = row.category;
            for (const [key, cat] of Object.entries(CONFIG.CATEGORIES)) {
                if (cat.label === row.category) {
                    categoryId = key;
                    break;
                }
            }

            const t = {
                type: row.type,
                description: row.description,
                amount: parseFloat(row.amount),
                category: categoryId,
                date: row.date,
                recurring: row.recurring?.toLowerCase() === 'yes'
            };

            const validation = utils.validateTransaction(t);
            if (validation.valid) {
                transactions.push({
                    ...t,
                    id: utils.generateId(),
                    createdAt: new Date().toISOString()
                });
            }
        }

        this._transactions = [...this._transactions, ...transactions];
        this.saveTransactions();

        return {
            success: true,
            message: `Imported ${transactions.length} transactions from CSV`,
            count: transactions.length
        };
    },

    /**
     * Reset all data to defaults
     */
    resetAll() {
        this._transactions = [];
        this._budgets = utils.deepClone(CONFIG.DEFAULT_BUDGETS);
        this._settings = { darkMode: false };
        this.saveAll();
    }
};

// Make storage globally available
window.storage = storage;
