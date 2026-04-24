/**
 * ============================================
 * Expense Tracker - Charts Module
 * Chart.js configurations and rendering
 * Student Project - CS101
 * ============================================
 */

const charts = {
    // Chart instances (to destroy before re-rendering)
    _trendChart: null,
    _categoryChart: null,

    /**
     * Common chart options
     */
    getCommonOptions() {
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#cbd5e1' : '#374151';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        font: { family: 'Inter', size: 12 },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: isDark ? '#f1f5f9' : '#111827',
                    bodyColor: isDark ? '#cbd5e1' : '#374151',
                    borderColor: isDark ? '#334155' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: (context) => {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            label += utils.formatCurrency(context.parsed.y !== undefined ? context.parsed.y : context.parsed);
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColor, font: { size: 11 } },
                    grid: { color: gridColor, drawBorder: false }
                },
                y: {
                    ticks: { 
                        color: textColor, 
                        font: { size: 11 },
                        callback: (value) => {
                            if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'k';
                            return '$' + value;
                        }
                    },
                    grid: { color: gridColor, drawBorder: false },
                    beginAtZero: true
                }
            }
        };
    },

    /**
     * Render the monthly trend chart (bar/line combo)
     */
    renderTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const period = parseInt(document.getElementById('chartPeriod')?.value || 6);
        const data = transactions.getMonthlyData(period);

        if (this._trendChart) {
            this._trendChart.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');

        this._trendChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: data.income,
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        label: 'Expenses',
                        data: data.expense,
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: '#ef4444',
                        borderWidth: 1,
                        borderRadius: 6,
                        borderSkipped: false,
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    }
                ]
            },
            options: {
                ...this.getCommonOptions(),
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    ...this.getCommonOptions().plugins,
                    tooltip: {
                        ...this.getCommonOptions().plugins.tooltip,
                        callbacks: {
                            ...this.getCommonOptions().plugins.tooltip.callbacks,
                            footer: (tooltipItems) => {
                                const income = tooltipItems.find(i => i.dataset.label === 'Income')?.parsed.y || 0;
                                const expense = tooltipItems.find(i => i.dataset.label === 'Expenses')?.parsed.y || 0;
                                const net = income - expense;
                                return `Net: ${net >= 0 ? '+' : ''}${utils.formatCurrency(net)}`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Render the category distribution doughnut chart
     */
    renderCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const data = transactions.getCategoryData();

        if (data.length === 0) {
            // Render empty state
            if (this._categoryChart) this._categoryChart.destroy();

            this._categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['No Data'],
                    datasets: [{
                        data: [1],
                        backgroundColor: ['#e5e7eb'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false }
                    }
                }
            });
            return;
        }

        if (this._categoryChart) {
            this._categoryChart.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');

        this._categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    data: data.map(d => d.amount),
                    backgroundColor: data.map(d => d.color),
                    borderWidth: 2,
                    borderColor: isDark ? '#1e293b' : '#ffffff',
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: isDark ? '#cbd5e1' : '#374151',
                            font: { family: 'Inter', size: 11 },
                            usePointStyle: true,
                            padding: 12,
                            boxWidth: 10
                        }
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        titleColor: isDark ? '#f1f5f9' : '#111827',
                        bodyColor: isDark ? '#cbd5e1' : '#374151',
                        borderColor: isDark ? '#334155' : '#e5e7eb',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${utils.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Update all charts (call when data changes)
     */
    updateAll() {
        this.renderTrendChart();
        this.renderCategoryChart();
    },

    /**
     * Destroy all chart instances
     */
    destroyAll() {
        if (this._trendChart) {
            this._trendChart.destroy();
            this._trendChart = null;
        }
        if (this._categoryChart) {
            this._categoryChart.destroy();
            this._categoryChart = null;
        }
    }
};

// Make charts globally available
window.charts = charts;
