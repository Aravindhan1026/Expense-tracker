/**
 * ============================================
 * Expense Tracker - UI Module
 * DOM manipulation, rendering, and user interactions
 * Student Project - CS101
 * ============================================
 */

const ui = {
    // State
    currentPage: 1,
    editingId: null,
    searchQuery: '',

    /**
     * Initialize UI
     */
    init() {
        this.setupEventListeners();
        this.setupDarkMode();
        this.populateCategoryFilters();
        this.renderAll();
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Search with debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce((e) => {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.renderTransactions();
            }, 300));
        }

        // Transaction form submit
        const form = document.getElementById('transactionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }

        // Type radio buttons - update category options
        document.querySelectorAll('input[name="type"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateCategoryOptions());
        });

        // Dark mode toggle
        const darkToggle = document.getElementById('darkModeToggle');
        if (darkToggle) {
            darkToggle.addEventListener('click', () => this.toggleDarkMode());
        }

        // Close modals on backdrop click
        ['transactionModal', 'budgetModal'].forEach(id => {
            const modal = document.getElementById(id);
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        if (id === 'transactionModal') this.closeTransactionModal();
                        else this.closeBudgetModal();
                    }
                });
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to close modals
            if (e.key === 'Escape') {
                this.closeTransactionModal();
                this.closeBudgetModal();
            }
            // Ctrl/Cmd + N to add new transaction
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.openTransactionModal();
            }
        });
    },

    /**
     * Setup dark mode from saved settings
     */
    setupDarkMode() {
        const settings = storage.getSettings();
        if (settings.darkMode) {
            document.documentElement.classList.add('dark');
            this.updateDarkModeIcon(true);
        }
    },

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        storage.setSetting('darkMode', isDark);
        this.updateDarkModeIcon(isDark);
        // Re-render charts to update colors
        setTimeout(() => charts.updateAll(), 300);
    },

    /**
     * Update dark mode toggle icon
     */
    updateDarkModeIcon(isDark) {
        const toggle = document.getElementById('darkModeToggle');
        if (!toggle) return;
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.className = isDark ? 'fas fa-sun text-amber-400' : 'fas fa-moon text-gray-600';
        }
    },

    /**
     * Populate category dropdowns
     */
    populateCategoryFilters() {
        const filterSelect = document.getElementById('filterCategory');
        const formSelect = document.getElementById('categoryInput');

        const expenseCats = Object.entries(CONFIG.CATEGORIES)
            .filter(([_, cat]) => cat.type === 'expense')
            .map(([key, cat]) => ({ key, ...cat }));

        const incomeCats = Object.entries(CONFIG.CATEGORIES)
            .filter(([_, cat]) => cat.type === 'income')
            .map(([key, cat]) => ({ key, ...cat }));

        // Filter dropdown (all categories)
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="all">All Categories</option>' +
                '<optgroup label="Expenses">' +
                expenseCats.map(c => `<option value="${c.key}">${c.icon} ${c.label}</option>`).join('') +
                '</optgroup>' +
                '<optgroup label="Income">' +
                incomeCats.map(c => `<option value="${c.key}">${c.icon} ${c.label}</option>`).join('') +
                '</optgroup>';
        }

        // Form dropdown (will be updated based on type)
        this.updateCategoryOptions();
    },

    /**
     * Update category options based on selected type
     */
    updateCategoryOptions() {
        const type = document.querySelector('input[name="type"]:checked')?.value || 'expense';
        const select = document.getElementById('categoryInput');
        if (!select) return;

        const cats = Object.entries(CONFIG.CATEGORIES)
            .filter(([_, cat]) => cat.type === type)
            .map(([key, cat]) => ({ key, ...cat }));

        select.innerHTML = cats.map(c => 
            `<option value="${c.key}">${c.icon} ${c.label}</option>`
        ).join('');
    },

    // ==================== RENDERING ====================

    /**
     * Render everything
     */
    renderAll() {
        this.renderSummary();
        this.renderTransactions();
        this.renderBudgets();
        this.renderInsights();
        charts.updateAll();
    },

    /**
     * Render summary cards
     */
    renderSummary() {
        const summary = transactions.getSummary();

        // Balance
        const balanceEl = document.getElementById('displayBalance');
        if (balanceEl) {
            balanceEl.textContent = utils.formatCurrency(summary.balance);
            balanceEl.className = `text-2xl font-bold ${summary.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`;
        }

        // Income
        const incomeEl = document.getElementById('displayIncome');
        if (incomeEl) incomeEl.textContent = utils.formatCurrency(summary.income);

        // Expense
        const expenseEl = document.getElementById('displayExpense');
        if (expenseEl) expenseEl.textContent = utils.formatCurrency(summary.expense);

        // Counts
        const incomeCountEl = document.getElementById('incomeCount');
        if (incomeCountEl) incomeCountEl.textContent = summary.incomeCount;

        const expenseCountEl = document.getElementById('expenseCount');
        if (expenseCountEl) expenseCountEl.textContent = summary.expenseCount;

        // Trend
        const trendEl = document.getElementById('balanceTrend');
        if (trendEl) {
            if (summary.trend > 0) {
                trendEl.innerHTML = `<span class="text-red-500 font-medium">↑ ${summary.trend}%</span> <span class="text-gray-500">vs last month</span>`;
            } else if (summary.trend < 0) {
                trendEl.innerHTML = `<span class="text-emerald-500 font-medium">↓ ${Math.abs(summary.trend)}%</span> <span class="text-gray-500">vs last month</span>`;
            } else {
                trendEl.innerHTML = '<span class="text-gray-500">No change vs last month</span>';
            }
        }

        // Budget status
        const budgetSummary = budget.getSummary();
        const budgetStatusEl = document.getElementById('budgetStatus');
        const budgetProgressEl = document.getElementById('budgetProgress');

        if (budgetStatusEl) {
            if (budgetSummary.totalBudget > 0) {
                const remaining = budgetSummary.totalBudget - budgetSummary.totalSpent;
                budgetStatusEl.textContent = utils.formatCurrency(Math.abs(remaining));
                budgetStatusEl.className = `text-2xl font-bold ${remaining >= 0 ? 'text-gray-900' : 'text-red-600'}`;
            } else {
                budgetStatusEl.textContent = 'No Budget';
                budgetStatusEl.className = 'text-2xl font-bold text-gray-400';
            }
        }

        if (budgetProgressEl) {
            if (budgetSummary.totalBudget > 0) {
                const pct = Math.min(100, budgetSummary.percentage);
                budgetProgressEl.style.width = pct + '%';
                budgetProgressEl.className = `h-2 rounded-full transition-all duration-500 ${
                    pct >= 90 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                }`;
            } else {
                budgetProgressEl.style.width = '0%';
            }
        }
    },

    /**
     * Render transactions table with pagination
     */
    renderTransactions() {
        const tbody = document.getElementById('transactionsTableBody');
        const emptyState = document.getElementById('emptyState');
        const paginationInfo = document.getElementById('paginationInfo');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (!tbody) return;

        // Get filter values
        const filterType = document.getElementById('filterType')?.value || 'all';
        const filterCategory = document.getElementById('filterCategory')?.value || 'all';
        const sortBy = document.getElementById('sortBy')?.value || 'date-desc';

        // Get filtered transactions
        const allTransactions = transactions.getAll({
            type: filterType,
            category: filterCategory,
            search: this.searchQuery,
            sortBy
        });

        // Pagination
        const totalItems = allTransactions.length;
        const totalPages = Math.ceil(totalItems / CONFIG.ITEMS_PER_PAGE);
        const startIndex = (this.currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
        const paginatedItems = allTransactions.slice(startIndex, startIndex + CONFIG.ITEMS_PER_PAGE);

        // Update pagination UI
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${totalItems > 0 ? startIndex + 1 : 0}-${Math.min(startIndex + CONFIG.ITEMS_PER_PAGE, totalItems)} of ${totalItems} transactions`;
        }
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;

        // Empty state
        if (totalItems === 0) {
            tbody.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        // Render rows
        tbody.innerHTML = paginatedItems.map((t, index) => {
            const cat = CONFIG.CATEGORIES[t.category] || CONFIG.CATEGORIES.other_income;
            const isIncome = t.type === 'income';
            const delay = index * 50; // Stagger animation

            return `
                <tr class="transaction-row animate-fade-in" style="animation-delay: ${delay}ms">
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${utils.formatDate(t.date)}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <span class="category-badge" style="background-color: ${cat.color}20; color: ${cat.color}">
                            <span>${cat.icon}</span>
                            <span>${cat.label}</span>
                        </span>
                    </td>
                    <td class="px-4 py-3">
                        <div class="text-sm text-gray-900">${utils.escapeHtml(t.description)}</div>
                        ${t.recurring ? '<span class="text-xs text-gray-400"><i class="fas fa-sync-alt mr-1"></i>Recurring</span>' : ''}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                            ${isIncome ? 'Income' : 'Expense'}
                        </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-right">
                        <span class="text-sm font-semibold ${isIncome ? 'text-emerald-600' : 'text-red-600'}">
                            ${isIncome ? '+' : '-'}${utils.formatCurrency(t.amount)}
                        </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-center">
                        <div class="action-buttons flex items-center justify-center gap-2">
                            <button onclick="ui.editTransaction('${t.id}')" 
                                class="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit">
                                <i class="fas fa-pen text-sm"></i>
                            </button>
                            <button onclick="ui.deleteTransaction('${t.id}')" 
                                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Render budget progress bars
     */
    renderBudgets() {
        const container = document.getElementById('budgetList');
        if (!container) return;

        const status = budget.getStatus();

        if (status.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-bullseye text-3xl mb-2"></i>
                    <p class="text-sm">No budgets set yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = status.map((item, index) => {
            const barColor = utils.getProgressColor(item.percentage);
            const isOver = item.percentage > 100;

            return `
                <div class="animate-fade-in" style="animation-delay: ${index * 50}ms">
                    <div class="flex justify-between items-center mb-1">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">${item.icon}</span>
                            <span class="text-sm font-medium text-gray-700">${item.label}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-sm font-semibold ${isOver ? 'text-red-600' : 'text-gray-900'}">
                                ${utils.formatCurrency(item.spent)}
                            </span>
                            <span class="text-xs text-gray-400"> / ${utils.formatCurrency(item.limit)}</span>
                        </div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div class="h-2.5 rounded-full transition-all duration-700 relative" 
                             style="width: ${Math.min(100, item.percentage)}%; background-color: ${barColor}">
                        </div>
                    </div>
                    <div class="flex justify-between mt-0.5">
                        <span class="text-xs ${isOver ? 'text-red-500 font-medium' : 'text-gray-400'}">
                            ${item.percentage.toFixed(0)}% used
                        </span>
                        <span class="text-xs ${item.remaining < 0 ? 'text-red-500' : 'text-gray-400'}">
                            ${item.remaining < 0 ? 'Over by ' : ''}${utils.formatCurrency(Math.abs(item.remaining))} ${item.remaining >= 0 ? 'left' : ''}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Render insights
     */
    renderInsights() {
        const container = document.getElementById('insightsList');
        if (!container) return;

        const insights = budget.getInsights();

        if (insights.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-lightbulb text-3xl mb-2"></i>
                    <p class="text-sm">Add more transactions to see insights</p>
                </div>
            `;
            return;
        }

        const typeColors = {
            success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            warning: 'bg-amber-50 border-amber-200 text-amber-800',
            caution: 'bg-orange-50 border-orange-200 text-orange-800',
            danger: 'bg-red-50 border-red-200 text-red-800'
        };

        container.innerHTML = insights.map((insight, index) => `
            <div class="p-3 rounded-xl border ${typeColors[insight.type] || typeColors.info} animate-fade-in" 
                 style="animation-delay: ${index * 100}ms">
                <div class="flex items-start gap-3">
                    <span class="text-xl">${insight.icon}</span>
                    <div>
                        <h4 class="font-semibold text-sm">${insight.title}</h4>
                        <p class="text-xs mt-0.5 opacity-90">${insight.message}</p>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // ==================== MODALS ====================

    /**
     * Open transaction modal (add mode)
     */
    openTransactionModal() {
        this.editingId = null;
        document.getElementById('modalTitle').textContent = 'Add Transaction';
        document.getElementById('transactionForm').reset();
        document.querySelector('input[value="expense"]').checked = true;
        document.getElementById('dateInput').value = utils.formatDateInput();
        this.updateCategoryOptions();

        const modal = document.getElementById('transactionModal');
        const content = document.getElementById('transactionModalContent');
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        setTimeout(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);

        document.getElementById('descInput').focus();
    },

    /**
     * Open transaction modal (edit mode)
     * @param {string} id - Transaction ID
     */
    editTransaction(id) {
        const t = transactions.getById(id);
        if (!t) return;

        this.editingId = id;
        document.getElementById('modalTitle').textContent = 'Edit Transaction';
        document.getElementById('transactionId').value = id;
        document.getElementById('descInput').value = t.description;
        document.getElementById('amountInput').value = t.amount;
        document.getElementById('dateInput').value = t.date;
        document.getElementById('recurringInput').checked = t.recurring;

        // Set type and update categories
        document.querySelector(`input[value="${t.type}"]`).checked = true;
        this.updateCategoryOptions();
        document.getElementById('categoryInput').value = t.category;

        const modal = document.getElementById('transactionModal');
        const content = document.getElementById('transactionModalContent');
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        setTimeout(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    },

    /**
     * Close transaction modal
     */
    closeTransactionModal() {
        const modal = document.getElementById('transactionModal');
        const content = document.getElementById('transactionModalContent');

        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            this.editingId = null;
        }, 300);
    },

    /**
     * Handle form submission
     */
    handleFormSubmit() {
        const data = {
            type: document.querySelector('input[name="type"]:checked').value,
            description: document.getElementById('descInput').value,
            amount: parseFloat(document.getElementById('amountInput').value),
            category: document.getElementById('categoryInput').value,
            date: document.getElementById('dateInput').value,
            recurring: document.getElementById('recurringInput').checked
        };

        // Check budget before saving
        const budgetAlert = budget.checkTransaction(data);
        if (budgetAlert && !this.editingId) {
            if (!confirm(`${budgetAlert.message}\n\nDo you want to proceed?`)) {
                return;
            }
        }

        let result;
        if (this.editingId) {
            result = transactions.update(this.editingId, data);
        } else {
            result = transactions.create(data);
        }

        if (result.success) {
            this.closeTransactionModal();
            this.renderAll();
            this.showToast(
                this.editingId ? 'Transaction updated!' : 'Transaction added!',
                'success'
            );
        } else {
            this.showToast(result.errors.join(', '), 'error');
        }
    },

    /**
     * Delete transaction with confirmation
     * @param {string} id - Transaction ID
     */
    deleteTransaction(id) {
        const t = transactions.getById(id);
        if (!t) return;

        if (confirm(`Delete "${t.description}" (${utils.formatCurrency(t.amount)})?\nThis action cannot be undone.`)) {
            if (transactions.delete(id)) {
                this.renderAll();
                this.showToast('Transaction deleted', 'info');
            }
        }
    },

    /**
     * Open budget settings modal
     */
    openBudgetModal() {
        const budgets = storage.getBudgets();
        const container = document.getElementById('budgetFormList');

        const expenseCats = Object.entries(CONFIG.CATEGORIES)
            .filter(([_, cat]) => cat.type === 'expense')
            .map(([key, cat]) => ({ key, ...cat }));

        container.innerHTML = expenseCats.map(cat => `
            <div class="flex items-center gap-3">
                <span class="text-xl w-8">${cat.icon}</span>
                <label class="flex-1 text-sm text-gray-700">${cat.label}</label>
                <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" 
                        class="budget-input w-32 pl-7 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        data-category="${cat.key}"
                        value="${budgets[cat.key] || ''}"
                        min="0"
                        step="0.01"
                        placeholder="No limit">
                </div>
            </div>
        `).join('');

        const modal = document.getElementById('budgetModal');
        const content = document.getElementById('budgetModalContent');
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        setTimeout(() => {
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
    },

    /**
     * Close budget modal
     */
    closeBudgetModal() {
        const modal = document.getElementById('budgetModal');
        const content = document.getElementById('budgetModalContent');

        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    },

    // ==================== PAGINATION ====================

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTransactions();
        }
    },

    nextPage() {
        const allTransactions = transactions.getAll({
            type: document.getElementById('filterType')?.value || 'all',
            category: document.getElementById('filterCategory')?.value || 'all',
            search: this.searchQuery,
            sortBy: document.getElementById('sortBy')?.value || 'date-desc'
        });
        const totalPages = Math.ceil(allTransactions.length / CONFIG.ITEMS_PER_PAGE);

        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTransactions();
        }
    },

    // ==================== TOAST NOTIFICATIONS ====================

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - success, error, info, warning
     */
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = {
            success: 'fa-check-circle text-emerald-500',
            error: 'fa-exclamation-circle text-red-500',
            info: 'fa-info-circle text-blue-500',
            warning: 'fa-exclamation-triangle text-amber-500'
        };

        const bgColors = {
            success: 'bg-white border-emerald-200',
            error: 'bg-white border-red-200',
            info: 'bg-white border-blue-200',
            warning: 'bg-white border-amber-200'
        };

        const toast = document.createElement('div');
        toast.className = `toast flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${bgColors[type]} min-w-[300px]`;
        toast.innerHTML = `
            <i class="fas ${icons[type]} text-lg"></i>
            <span class="text-sm text-gray-800 font-medium">${utils.escapeHtml(message)}</span>
            <button onclick="this.parentElement.remove()" class="ml-auto text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

// Make ui globally available
window.ui = ui;
