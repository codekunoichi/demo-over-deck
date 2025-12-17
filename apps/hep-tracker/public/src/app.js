import { loadAllData, setSelectedPatient, saveDailyLog, reloadDailyLog } from './state.js';
import {
    renderPatientOptions,
    renderComplianceGrid,
    showMessage,
    renderLoggerPatientOptions,
    setLoggerDate,
    renderLoggerExercises,
    switchView,
    showSaveMessage,
    hideSaveMessage,
    getTodayISO
} from './ui.js';

function setupEventListeners() {
    // Weekly Tracker: Patient dropdown change
    const patientSelect = document.getElementById('patient-select');
    if (patientSelect) {
        patientSelect.addEventListener('change', (event) => {
            const patientId = event.target.value;
            setSelectedPatient(patientId);
            renderComplianceGrid(patientId);
        });
    }

    // Navigation tabs
    const navWeekly = document.getElementById('nav-weekly');
    const navLogger = document.getElementById('nav-logger');

    if (navWeekly) {
        navWeekly.addEventListener('click', () => {
            switchView('weekly');
        });
    }

    if (navLogger) {
        navLogger.addEventListener('click', () => {
            switchView('logger');
            // Refresh logger view when switching to it
            renderLoggerPatientOptions();
            setLoggerDate();
            renderLoggerExercises();
        });
    }

    // Patient Logger: Save button
    const saveBtn = document.getElementById('save-log-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSave);
    }
}

async function handleSave() {
    hideSaveMessage();

    const patientSelect = document.getElementById('logger-patient-select');
    const dateInput = document.getElementById('logger-date');

    const pid = patientSelect.value;
    const date = dateInput.value;

    if (!pid) {
        showSaveMessage('Please select a patient', 'error');
        return;
    }

    // Collect exercise entries
    const entries = [];
    const exerciseInputs = document.querySelectorAll('#logger-exercises input[type="number"]');

    exerciseInputs.forEach(input => {
        const minutes = input.value;
        if (minutes !== '' && minutes !== null) {
            const minutesNum = parseInt(minutes, 10);
            if (!isNaN(minutesNum) && minutesNum >= 0) {
                entries.push({
                    hepid: input.dataset.hepid,
                    minutes: minutesNum
                });
            }
        }
    });

    if (entries.length === 0) {
        showSaveMessage('Please enter minutes for at least one exercise', 'error');
        return;
    }

    // Disable save button during save
    const saveBtn = document.getElementById('save-log-btn');
    saveBtn.disabled = true;
    showSaveMessage('Saving...', 'info');

    // Save to Netlify
    const result = await saveDailyLog(pid, date, entries);

    saveBtn.disabled = false;

    if (result.success) {
        showSaveMessage('Daily log saved successfully!', 'success');

        // Reload daily log data
        await reloadDailyLog();

        // Wait a moment before switching views
        setTimeout(() => {
            // Switch to Weekly Tracker view
            switchView('weekly');

            // Update the patient dropdown to show the patient we just saved
            const weeklyPatientSelect = document.getElementById('patient-select');
            if (weeklyPatientSelect) {
                weeklyPatientSelect.value = pid;
                setSelectedPatient(pid);
                renderComplianceGrid(pid);
            }
        }, 1000);
    } else {
        if (result.error === 'local') {
            showSaveMessage(result.message, 'info');
        } else {
            showSaveMessage('Error saving: ' + result.message, 'error');
        }
    }
}

async function initApp() {
    try {
        showMessage('Loading data...');

        await loadAllData();

        // Initialize Weekly Tracker view
        renderPatientOptions();
        renderComplianceGrid(null);

        // Initialize Patient Logger view
        renderLoggerPatientOptions();
        setLoggerDate();
        renderLoggerExercises();

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
