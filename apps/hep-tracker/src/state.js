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

async function loadAllData() {
    // Fetch data from public/data/ directory (paths relative to index.html)
    const [patients, hepList, dailyLog] = await Promise.all([
        loadCSVData('./data/patients.csv'),
        loadCSVData('./data/hep_list.csv'),
        loadCSVData('./data/daily_log.csv')
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

export {
    state,
    loadAllData,
    getPatientExercises,
    getComplianceStatus,
    getUniqueDatesForPatient,
    setSelectedPatient,
    getSelectedPatient
};
