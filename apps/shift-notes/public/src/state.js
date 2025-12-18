export class AppState {
    constructor() {
        this.patients = [];
        this.nurses = [];
        this.shiftNotes = [];
        this.isLocalMode = false;
    }

    async initialize() {
        try {
            await Promise.all([
                this.loadPatients(),
                this.loadNurses(),
                this.loadShiftNotes()
            ]);
        } catch (error) {
            console.error('Error initializing app state:', error);
            throw error;
        }
    }

    async loadPatients() {
        const response = await fetch('/data/patients.csv');
        const csvText = await response.text();
        this.patients = this.parseCSV(csvText);
    }

    async loadNurses() {
        const response = await fetch('/data/nurses.csv');
        const csvText = await response.text();
        this.nurses = this.parseCSV(csvText);
    }

    async loadShiftNotes() {
        try {
            const response = await fetch('/get_shift_notes');

            if (!response.ok) {
                this.isLocalMode = true;
                await this.loadShiftNotesLocal();
                return;
            }

            const data = await response.json();
            const notes = data.notes || [];

            if (notes.length === 0) {
                console.log('No notes in Netlify Blob, loading from local CSV');
                await this.loadShiftNotesLocal();
            } else {
                this.shiftNotes = notes;
            }
        } catch (error) {
            console.warn('Netlify function not available, using local mode');
            this.isLocalMode = true;
            await this.loadShiftNotesLocal();
        }
    }

    async loadShiftNotesLocal() {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`/data/shift_notes.csv?t=${timestamp}`);
            const csvText = await response.text();
            this.shiftNotes = this.parseCSV(csvText);
        } catch (error) {
            console.error('Error loading local shift notes:', error);
            this.shiftNotes = [];
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index].trim();
                });
                data.push(row);
            }
        }

        return data;
    }

    parseCSVLine(line) {
        const values = [];
        let currentValue = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }

        values.push(currentValue);
        return values;
    }

    getPatients() {
        return this.patients;
    }

    getNurses() {
        return this.nurses;
    }

    getShiftNotes(filters = {}) {
        let notes = [...this.shiftNotes];

        if (filters.nurseId) {
            notes = notes.filter(note => note.NID === filters.nurseId);
        }

        if (filters.shiftCode) {
            notes = notes.filter(note => note.ShiftCode === filters.shiftCode);
        }

        notes.sort((a, b) => {
            const dateA = new Date(a.CreatedAt || a.ShiftDate);
            const dateB = new Date(b.CreatedAt || b.ShiftDate);
            return dateB - dateA;
        });

        return notes;
    }

    getPatientName(pid) {
        const patient = this.patients.find(p => p.PID === pid);
        return patient ? patient.PatientName : 'Unknown';
    }

    getNurseName(nid) {
        const nurse = this.nurses.find(n => n.NID === nid);
        return nurse ? nurse.NurseName : 'Unknown';
    }

    async saveShiftNote(noteData) {
        if (this.isLocalMode) {
            throw new Error('LOCAL_MODE');
        }

        try {
            const response = await fetch('/save_shift_note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(noteData)
            });

            if (!response.ok) {
                throw new Error('Failed to save note');
            }

            const result = await response.json();

            await this.loadShiftNotes();

            return result;
        } catch (error) {
            console.error('Error saving shift note:', error);
            throw error;
        }
    }

    generateNoteId() {
        const existingIds = this.shiftNotes
            .map(note => parseInt(note.NoteID.replace('SN', '')))
            .filter(id => !isNaN(id));

        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        return `SN${String(maxId + 1).padStart(3, '0')}`;
    }
}
