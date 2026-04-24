/**
 * ============================================
 * Expense Tracker - Budget Module
 * Budget management, alerts, and insights
 * Student Project - CS101
 * ============================================
 */

const budget = {
    /**
     * Get current budget status for all categories
     * @returns {Array} Budget status items
     */
    getStatus() {
        const budgets = storage.getBudgets();
        const spending = transactions.getCategorySpending();

        return Object.entries(budgets)
            .map(([category, limit]) => {
                const spent = spending[category] || 0;
                const percentage = limit > 0 ? (spent / limit) * 100 : 0;
                const remaining = limit - spent;

                return {
                    category,
                    label: CONFIG.CATEGORIES[category]?.label || category,
                    icon: CONFIG.CATEGORIES[category]?.icon || '📦',
                    color: CONFIG.CATEGORIES[category]?.color || '#6b7280',
                    limit,
                    spent,
                    remaining,
                    percentage: Math.round(percentage * 10) / 10,
                    status: this.getStatusLabel(percentage)
                };
            })
            .sort((a, b) => b.percentage - a.percentage);
    },

    /**
     * Get overall budget summary
     * @returns {Object} Summary with total budget, spent, remaining
     */
    getSummary() {
        const budgets = storage.getBudgets();
        const spending = transactions.getCategorySpending();

        const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);
        const totalSpent = Object.keys(budgets).reduce((sum, cat) => {
            return sum + (spending[cat] || 0);
        }, 0);

        return {
            totalBudget,
            totalSpent,
            remaining: totalBudget - totalSpent,
            percentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
        };
    },

    /**
     * Get status label based on percentage
     * @param {number} percentage - Spending percentage
     * @returns {string} Status label
     */
    getStatusLabel(percentage) {
        if (percentage >= CONFIG.BUDGET_ALERT_DANGER) return 'danger';
        if (percentage >= CONFIG.BUDGET_ALERT_WARNING) return 'warning';
        return 'good';
    },

    /**
     * Get alert messages for over-budget categories
     * @returns {Array} Alert objects
     */
    getAlerts() {
        const status = this.getStatus();
        return status.filter(s => s.status !== 'good');
    },

    /**
     * Generate spending insights
     * @returns {Array} Insight messages
     */
    getInsights() {
        const insights = [];
        const summary = transactions.getSummary();
        const categoryData = transactions.getCategoryData();
        const budgetStatus = this.getStatus();

        // Top spending category
        if (categoryData.length > 0) {
            const top = categoryData[0];
            insights.push({
                type: 'info',
                icon: '💡',
                title: 'Top Spending',
                message: `Your highest spending is on ${top.label} at ${utils.formatCurrency(top.amount)} (${top.percentage.toFixed(1)}%)`
            });
        }

        // Budget alerts
        const alerts = budgetStatus.filter(s => s.status === 'danger');
        if (alerts.length > 0) {
            alerts.forEach(a => {
                insights.push({
                    type: 'warning',
                    icon: '⚠️',
                    title: 'Budget Alert',
                    message: `You've exceeded your ${a.label} budget by ${utils.formatCurrency(Math.abs(a.remaining))}`
                });
            });
        }

        const warnings = budgetStatus.filter(s => s.status === 'warning' && s.status !== 'danger');
        if (warnings.length > 0) {
            const w = warnings[0];
            insights.push({
                type: 'caution',
                icon: '📊',
                title: 'Approaching Limit',
                message: `You've used ${w.percentage.toFixed(0)}% of your ${w.label} budget`
            });
        }

        // Monthly trend
        if (summary.trend > 10) {
            insights.push({
                type: 'warning',
                icon: '📈',
                title: 'Spending Up',
                message: `Your spending is up ${summary.trend}% compared to last month`
            });
        } else if (summary.trend < -10) {
            insights.push({
                type: 'success',
                icon: '📉',
                title: 'Spending Down',
                message: `Great job! Your spending is down ${Math.abs(summary.trend)}% from last month`
            });
        }

        // Savings rate
        if (summary.income > 0) {
            const savingsRate = ((summary.income - summary.expense) / summary.income) * 100;
            if (savingsRate > 20) {
                insights.push({
                    type: 'success',
                    icon: '🎉',
                    title: 'Great Savings!',
                    message: `You're saving ${savingsRate.toFixed(1)}% of your income`
                });
            } else if (savingsRate < 0) {
                insights.push({
                    type: 'danger',
                    icon: '💸',
                    title: 'Overspending',
                    message: `You're spending ${Math.abs(savingsRate).toFixed(1)}% more than you earn`
                });
            }
        }

        // Recurring transactions reminder
        const recurring = transactions.getRecurring();
        if (recurring.length > 0) {
            const recurringTotal = recurring
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            if (recurringTotal > 0) {
                insights.push({
                    type: 'info',
                    icon: '🔄',
                    title: 'Recurring Expenses',
                    message: `You have ${recurring.length} recurring transactions totaling ${utils.formatCurrency(recurringTotal)}/month`
                });
            }
        }

        return insights;
    },

    /**
     * Save budgets from form data
     */
    saveBudgets() {
        const inputs = document.querySelectorAll('.budget-input');
        const budgets = {};

        inputs.forEach(input => {
            const category = input.dataset.category;
            const value = parseFloat(input.value);
            if (value > 0) {
                budgets[category] = value;
            }
        });

        storage.setBudgets(budgets);
        ui.showToast('Budgets updated successfully!', 'success');
        ui.closeBudgetModal();
        ui.renderAll();
    },

    /**
     * Check if a transaction would exceed budget
     * @param {Object} transaction - Transaction to check
     * @returns {Object|null} Alert object or null
     */
    checkTransaction(transaction) {
        if (transaction.type !== 'expense') return null;

        const budgetLimit = storage.getBudget(transaction.category);
        if (!budgetLimit) return null;

        const currentSpending = transactions.getCategorySpending()[transaction.category] || 0;
        const projectedTotal = currentSpending + transaction.amount;
        const percentage = (projectedTotal / budgetLimit) * 100;

        if (percentage > 100) {
            return {
                type: 'danger',
                message: `This transaction will exceed your ${CONFIG.CATEGORIES[transaction.category]?.label} budget by ${utils.formatCurrency(projectedTotal - budgetLimit)}`
            };
        } else if (percentage > CONFIG.BUDGET_ALERT_WARNING) {
            return {
                type: 'warning',
                message: `This transaction will use ${percentage.toFixed(0)}% of your ${CONFIG.CATEGORIES[transaction.category]?.label} budget`
            };
        }

        return null;
    }
};

// Make budget globally available
window.budget = budget;
