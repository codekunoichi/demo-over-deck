import {
    state,
    getPatientExercises,
    getComplianceStatus,
    getUniqueDatesForPatient
} from './state.js';

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
}

function renderPatientOptions() {
    const select = document.getElementById('patient-select');
    if (!select) return;

    select.innerHTML = '<option value="">Select a patient...</option>';

    state.patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.PID;
        option.textContent = patient.PatientName;
        select.appendChild(option);
    });
}

function generateWeekDates(startDate) {
    const dates = [];
    const start = new Date(startDate + 'T00:00:00');

    for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
    }

    return dates;
}

function renderComplianceGrid(patientId) {
    const tbody = document.getElementById('compliance-body');
    const thead = document.querySelector('.compliance-grid thead tr');

    if (!tbody || !thead) return;

    if (!patientId) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px; color: #999;">Please select a patient to view compliance data</td></tr>';
        return;
    }

    const exercises = getPatientExercises(patientId);

    if (exercises.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px; color: #999;">No exercise data found for this patient</td></tr>';
        return;
    }

    const uniqueDates = getUniqueDatesForPatient(patientId);

    let weekDates;
    if (uniqueDates.length > 0) {
        weekDates = generateWeekDates(uniqueDates[0]);
    } else {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        weekDates = generateWeekDates(`${year}-${month}-${day}`);
    }

    thead.innerHTML = '<th class="exercise-header">Exercise</th>';
    weekDates.forEach(date => {
        const th = document.createElement('th');
        th.className = 'date-header';
        th.textContent = formatDate(date);
        thead.appendChild(th);
    });

    tbody.innerHTML = '';

    exercises.forEach(exercise => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.className = 'exercise-name';
        nameCell.textContent = exercise.ExerciseName;
        row.appendChild(nameCell);

        weekDates.forEach(date => {
            const compliance = getComplianceStatus(patientId, date, exercise);
            const cell = document.createElement('td');
            cell.className = `status-cell ${compliance.status}`;

            if (compliance.status === 'empty') {
                cell.textContent = '-';
            } else {
                cell.textContent = compliance.minutes;
                cell.setAttribute('data-minutes', compliance.minutes);
                cell.setAttribute('data-date', date);
                cell.setAttribute('data-exercise', exercise.ExerciseName);
                cell.setAttribute('data-target', exercise.TargetMinutesPerDay);
            }

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

function showMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Patient Logger UI functions

function renderLoggerPatientOptions() {
    const select = document.getElementById('logger-patient-select');
    if (!select) return;

    select.innerHTML = '<option value="">Select a patient...</option>';

    state.patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.PID;
        option.textContent = patient.PatientName;
        select.appendChild(option);
    });
}

function getTodayISO() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function setLoggerDate() {
    const dateInput = document.getElementById('logger-date');
    if (dateInput) {
        dateInput.value = getTodayISO();
    }
}

function renderLoggerExercises() {
    const container = document.getElementById('logger-exercises');
    if (!container) return;

    container.innerHTML = '';

    // Show all exercises from hep_list (as specified in requirements)
    state.hepList.forEach(exercise => {
        const row = document.createElement('div');
        row.className = 'exercise-input-row';

        const label = document.createElement('label');
        label.textContent = exercise.ExerciseName;

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.placeholder = '0';
        input.dataset.hepid = exercise.HEPID;
        input.id = `exercise-${exercise.HEPID}`;

        const targetInfo = document.createElement('span');
        targetInfo.className = 'target-info';
        targetInfo.textContent = `Target: ${exercise.TargetMinutesPerDay} min`;

        row.appendChild(label);
        row.appendChild(input);
        row.appendChild(targetInfo);

        container.appendChild(row);
    });
}

function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Deactivate all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected view
    const viewElement = document.getElementById(`view-${viewName}`);
    if (viewElement) {
        viewElement.classList.add('active');
    }

    // Activate selected nav tab
    const tabElement = document.getElementById(`nav-${viewName}`);
    if (tabElement) {
        tabElement.classList.add('active');
    }
}

function showSaveMessage(message, type) {
    const messageElement = document.getElementById('save-message');
    if (!messageElement) return;

    messageElement.textContent = message;
    messageElement.className = `message ${type} show`;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 5000);
}

function hideSaveMessage() {
    const messageElement = document.getElementById('save-message');
    if (messageElement) {
        messageElement.classList.remove('show');
    }
}

export {
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
};
