const state = {
    patients: [],
    hepList: [],
    dailyLog: [],
    selectedPatientId: null
};

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
        });
        data.push(row);
    }

    return data;
}

async function loadCSVData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}`);
        }
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        return [];
    }
}

// Try to load daily log from Netlify function first, fallback to local CSV
async function loadDailyLogData() {
    // Try Netlify function endpoint first
    try {
        const response = await fetch('/.netlify/functions/get_daily_log');
        if (response.ok) {
            const csvText = await response.text();
            return parseCSV(csvText);
        }
    } catch (error) {
        console.log('Netlify endpoint not available, using local CSV');
    }

    // Fallback to local CSV
    return loadCSVData('./data/daily_log.csv');
}

async function loadAllData() {
    // Fetch data from public/data/ directory (paths relative to index.html)
    // For daily log, try Netlify endpoint first, then fallback to local
    const [patients, hepList, dailyLog] = await Promise.all([
        loadCSVData('./data/patients.csv'),
        loadCSVData('./data/hep_list.csv'),
        loadDailyLogData()
    ]);

    state.patients = patients;
    state.hepList = hepList.map(exercise => ({
        ...exercise,
        TargetMinutesPerDay: parseInt(exercise.TargetMinutesPerDay, 10)
    }));
    state.dailyLog = dailyLog.map(log => ({
        ...log,
        MinutesCompleted: parseInt(log.MinutesCompleted, 10)
    }));

    return state;
}

// Reload daily log data (used after saving)
async function reloadDailyLog() {
    const dailyLog = await loadDailyLogData();
    state.dailyLog = dailyLog.map(log => ({
        ...log,
        MinutesCompleted: parseInt(log.MinutesCompleted, 10)
    }));
    return state.dailyLog;
}

function getPatientExercises(patientId) {
    const patientLogs = state.dailyLog.filter(log => log.PID === patientId);
    const exerciseIds = [...new Set(patientLogs.map(log => log.HEPID))];

    return state.hepList.filter(exercise => exerciseIds.includes(exercise.HEPID));
}

function getPatientLogForDate(patientId, date, hepId) {
    return state.dailyLog.find(
        log => log.PID === patientId && log.Date === date && log.HEPID === hepId
    );
}

function isCompliant(minutesCompleted, targetMinutes) {
    return minutesCompleted >= targetMinutes;
}

function getComplianceStatus(patientId, date, exercise) {
    const log = getPatientLogForDate(patientId, date, exercise.HEPID);

    if (!log) {
        return { status: 'empty', minutes: null };
    }

    const minutes = log.MinutesCompleted;
    const compliant = isCompliant(minutes, exercise.TargetMinutesPerDay);

    return {
        status: compliant ? 'green' : 'red',
        minutes: minutes
    };
}

function getUniqueDatesForPatient(patientId) {
    const patientLogs = state.dailyLog.filter(log => log.PID === patientId);
    const dates = [...new Set(patientLogs.map(log => log.Date))];
    return dates.sort();
}

function setSelectedPatient(patientId) {
    state.selectedPatientId = patientId;
}

function getSelectedPatient() {
    return state.patients.find(p => p.PID === state.selectedPatientId);
}

// Save daily log to Netlify function
async function saveDailyLog(pid, date, entries) {
    try {
        const response = await fetch('/.netlify/functions/save_daily_log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pid,
                date,
                entries
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save');
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        // Check if it's a network error (Netlify not available)
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            return {
                success: false,
                error: 'local',
                message: 'Saving requires Netlify deployment. In local mode, the logger does not persist.'
            };
        }

        return {
            success: false,
            error: 'server',
            message: error.message
        };
    }
}

export {
    state,
    loadAllData,
    reloadDailyLog,
    getPatientExercises,
    getComplianceStatus,
    getUniqueDatesForPatient,
    setSelectedPatient,
    getSelectedPatient,
    saveDailyLog
};
