import { getStore } from '@netlify/blobs';

export default async (req, context) => {
    try {
        const store = getStore('shift-notes');

        let csvContent = await store.get('shift_notes.csv');

        if (!csvContent) {
            csvContent = 'NoteID,PID,NID,ShiftDate,ShiftCode,A1,A2,A3,CreatedAt\n';
            await store.set('shift_notes.csv', csvContent);
        }

        const notes = parseCSV(csvContent);

        return new Response(JSON.stringify({ notes }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching shift notes:', error);

        return new Response(JSON.stringify({ error: 'Failed to fetch notes' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
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

function parseCSVLine(line) {
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
