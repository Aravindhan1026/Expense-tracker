/**
 * ============================================
 * Expense Tracker - Transactions Module
 * Business logic for transaction operations
 * Student Project - CS101
 * ============================================
 */

const transactions = {
    /**
     * Get all transactions with optional filtering and sorting
     * @param {Object} options - Filter options
     * @returns {Array} Filtered and sorted transactions
     */
    getAll(options = {}) {
        let result = storage.getTransactions();

        // Filter by type
        if (options.type && options.type !== 'all') {
            result = result.filter(t => t.type === options.type);
        }

        // Filter by category
        if (options.category && options.category !== 'all') {
            result = result.filter(t => t.category === options.category);
        }

        // Filter by search query
        if (options.search) {
            const query = options.search.toLowerCase();
            result = result.filter(t => 
                t.description.toLowerCase().includes(query) ||
                (CONFIG.CATEGORIES[t.category]?.label || '').toLowerCase().includes(query)
            );
        }

        // Filter by date range
        if (options.startDate) {
            result = result.filter(t => t.date >= options.startDate);
        }
        if (options.endDate) {
            result = result.filter(t => t.date <= options.endDate);
        }

        // Sort
        if (options.sortBy) {
            const [field, direction] = options.sortBy.split('-');
            result = utils.sortBy(result, field, direction);
        } else {
            // Default sort by date desc
            result = utils.sortBy(result, 'date', 'desc');
        }

        return result;
    },

    /**
     * Get transaction by ID
     * @param {string} id - Transaction ID
     * @returns {Object|null}
     */
    getById(id) {
        return storage.getTransactionById(id);
    },

    /**
     * Create a new transaction
     * @param {Object} data - Transaction data
     * @returns {Object} Result with success status and transaction/error
     */
    create(data) {
        // Validate
        const validation = utils.validateTransaction(data);
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        // Ensure category matches type
        const category = CONFIG.CATEGORIES[data.category];
        if (category && category.type !== data.type) {
            return { 
                success: false, 
                errors: [`Category "${category.label}" is not valid for ${data.type}`] 
            };
        }

        const transaction = storage.addTransaction({
            type: data.type,
            description: data.description.trim(),
            amount: parseFloat(data.amount),
            category: data.category,
            date: data.date,
            recurring: !!data.recurring
        });

        return { success: true, transaction };
    },

    /**
     * Update an existing transaction
     * @param {string} id - Transaction ID
     * @param {Object} data - Updated data
     * @returns {Object} Result object
     */
    update(id, data) {
        const existing = this.getById(id);
        if (!existing) {
            return { success: false, errors: ['Transaction not found'] };
        }

        const validation = utils.validateTransaction(data);
        if (!validation.valid) {
            return { success: false, errors: validation.errors };
        }

        const updated = storage.updateTransaction(id, {
            type: data.type,
            description: data.description.trim(),
            amount: parseFloat(data.amount),
            category: data.category,
            date: data.date,
            recurring: !!data.recurring
        });

        return { success: true, transaction: updated };
    },

    /**
     * Delete a transaction
     * @param {string} id - Transaction ID
     * @returns {boolean}
     */
    delete(id) {
        return storage.deleteTransaction(id);
    },

    // ==================== ANALYTICS ====================

    /**
     * Calculate summary statistics
     * @returns {Object} Summary with totals, counts, etc.
     */
    getSummary() {
        const all = storage.getTransactions();

        const income = all
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = all
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const incomeCount = all.filter(t => t.type === 'income').length;
        const expenseCount = all.filter(t => t.type === 'expense').length;

        // Calculate month-over-month change
        const currentMonth = new Date().toISOString().slice(0, 7);
        const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
            .toISOString().slice(0, 7);

        const currentMonthExpense = all
            .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);

        const lastMonthExpense = all
            .filter(t => t.type === 'expense' && t.date.startsWith(lastMonth))
            .reduce((sum, t) => sum + t.amount, 0);

        let trend = 0;
        if (lastMonthExpense > 0) {
            trend = ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
        }

        return {
            balance: income - expense,
            income,
            expense,
            incomeCount,
            expenseCount,
            totalCount: all.length,
            currentMonthExpense,
            lastMonthExpense,
            trend: Math.round(trend * 10) / 10
        };
    },

    /**
     * Get monthly breakdown for charts
     * @param {number} months - Number of months to include
     * @returns {Object} Monthly data
     */
    getMonthlyData(months = 6) {
        const all = storage.getTransactions();
        const monthList = utils.getLastMonths(months);

        const data = {};
        monthList.forEach(m => {
            data[m.key] = { income: 0, expense: 0, label: m.label };
        });

        all.forEach(t => {
            const key = utils.getMonthKey(t.date);
            if (data[key]) {
                data[key][t.type] += t.amount;
            }
        });

        return {
            labels: monthList.map(m => m.label),
            income: monthList.map(m => data[m.key].income),
            expense: monthList.map(m => data[m.key].expense)
        };
    },

    /**
     * Get category breakdown (expenses only)
     * @returns {Object} Category totals and percentages
     */
    getCategoryData() {
        const all = storage.getTransactions();
        const expenses = all.filter(t => t.type === 'expense');

        const totals = {};
        expenses.forEach(t => {
            totals[t.category] = (totals[t.category] || 0) + t.amount;
        });

        const totalExpense = Object.values(totals).reduce((a, b) => a + b, 0);

        return Object.entries(totals)
            .map(([category, amount]) => ({
                category,
                label: CONFIG.CATEGORIES[category]?.label || category,
                icon: CONFIG.CATEGORIES[category]?.icon || '📦',
                color: CONFIG.CATEGORIES[category]?.color || '#6b7280',
                amount,
                percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
            }))
            .sort((a, b) => b.amount - a.amount);
    },

    /**
     * Get spending by category for budget comparison
     * @param {string} monthKey - YYYY-MM (optional, defaults to current month)
     * @returns {Object} Category spending
     */
    getCategorySpending(monthKey = null) {
        const targetMonth = monthKey || new Date().toISOString().slice(0, 7);
        const all = storage.getTransactions();

        const spending = {};
        all
            .filter(t => t.type === 'expense' && t.date.startsWith(targetMonth))
            .forEach(t => {
                spending[t.category] = (spending[t.category] || 0) + t.amount;
            });

        return spending;
    },

    /**
     * Get recurring transactions
     * @returns {Array} Recurring transactions
     */
    getRecurring() {
        return storage.getTransactions().filter(t => t.recurring);
    },

    /**
     * Get recent transactions
     * @param {number} limit - Number to return
     * @returns {Array} Recent transactions
     */
    getRecent(limit = 5) {
        return this.getAll().slice(0, limit);
    }
};

// Make transactions globally available
window.transactions = transactions;
