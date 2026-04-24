/**
 * ============================================
 * Expense Tracker - Main Application Controller
 * Entry point and app initialization
 * Student Project - CS101
 * ============================================
 */

const app = {
    /**
     * Initialize the application
     */
    init() {
        console.log(`%c${CONFIG.APP_NAME} v${CONFIG.VERSION}`, 'color: #6366f1; font-size: 20px; font-weight: bold;');
        console.log('%cStudent Project - CS101', 'color: #6b7280; font-style: italic;');
        console.log('Initializing modules...');

        // Initialize modules in order
        storage.init();
        ui.init();

        console.log('Application ready!');

        // Show welcome toast for first-time users
        const settings = storage.getSettings();
        if (settings.demoLoaded) {
            ui.showToast('Welcome! Demo data loaded. Start tracking your expenses!', 'info');
            storage.setSetting('demoLoaded', false);
        }
    },

    /**
     * Export data to JSON file
     */
    exportToJSON() {
        const json = storage.exportToJSON();
        const filename = `expense-tracker-backup-${utils.formatDateInput()}.json`;
        utils.downloadFile(json, filename, 'application/json');
        ui.showToast('Data exported to JSON file', 'success');
    },

    /**
     * Export data to CSV file
     */
    exportToCSV() {
        const csv = storage.exportToCSV();
        const filename = `expense-tracker-${utils.formatDateInput()}.csv`;
        utils.downloadFile(csv, filename, 'text/csv');
        ui.showToast('Transactions exported to CSV file', 'success');
    },

    /**
     * Import data from JSON file
     * @param {HTMLInputElement} input - File input element
     */
    importData(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = storage.importFromJSON(e.target.result);
            if (result.success) {
                ui.renderAll();
                ui.showToast(result.message, 'success');
            } else {
                ui.showToast(result.message, 'error');
            }
        };
        reader.onerror = () => {
            ui.showToast('Error reading file', 'error');
        };
        reader.readAsText(file);
        input.value = ''; // Reset
    },

    /**
     * Import data from CSV file
     * @param {HTMLInputElement} input - File input element
     */
    importCSV(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = storage.importFromCSV(e.target.result);
            if (result.success) {
                ui.renderAll();
                ui.showToast(result.message, 'success');
            } else {
                ui.showToast(result.message, 'error');
            }
        };
        reader.readAsText(file);
        input.value = '';
    },

    /**
     * Clear all data with confirmation
     */
    clearAll() {
        if (!confirm('WARNING: This will permanently delete ALL your data!\n\nAre you sure you want to continue?')) {
            return;
        }

        if (!confirm('This action CANNOT be undone. All transactions, budgets, and settings will be lost.\n\nType "DELETE" to confirm:')) {
            return;
        }

        storage.resetAll();
        ui.renderAll();
        ui.showToast('All data has been cleared', 'info');
    },

    /**
     * Reset to demo data
     */
    loadDemoData() {
        if (!confirm('This will replace all current data with demo data. Continue?')) return;

        storage._transactions = utils.deepClone(CONFIG.DEMO_DATA);
        storage._budgets = utils.deepClone(CONFIG.DEFAULT_BUDGETS);
        storage.saveAll();
        ui.renderAll();
        ui.showToast('Demo data loaded', 'success');
    }
};

// Make app globally available
window.app = app;

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Handle window resize for charts
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        charts.updateAll();
    }, 250);
});
