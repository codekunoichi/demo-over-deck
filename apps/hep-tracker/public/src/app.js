import { loadAllData, setSelectedPatient } from './state.js';
import { renderPatientOptions, renderComplianceGrid, showMessage } from './ui.js';

function setupEventListeners() {
    const patientSelect = document.getElementById('patient-select');

    if (patientSelect) {
        patientSelect.addEventListener('change', (event) => {
            const patientId = event.target.value;
            setSelectedPatient(patientId);
            renderComplianceGrid(patientId);
        });
    }
}

async function initApp() {
    try {
        showMessage('Loading data...');

        await loadAllData();

        renderPatientOptions();
        renderComplianceGrid(null);

        setupEventListeners();

        showMessage('App initialized successfully', 'success');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showMessage('Failed to load application data', 'error');
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

export { initApp };
