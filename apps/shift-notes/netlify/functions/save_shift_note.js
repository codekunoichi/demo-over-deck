import { getStore } from '@netlify/blobs';

export const config = {
    path: "/save_shift_note"
};

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    try {
        const noteData = await req.json();

        const { NoteID, PID, NID, ShiftDate, ShiftCode, A1, A2, A3, CreatedAt } = noteData;

        if (!PID || !NID || !ShiftDate || !ShiftCode || !A1 || !A2) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const store = getStore('shift-notes');

        let csvContent = await store.get('shift_notes.csv');

        if (!csvContent) {
            // First time: load seed data from local CSV
            try {
                const seedUrl = `${new URL(req.url).origin}/data/shift_notes.csv`;
                const seedResponse = await fetch(seedUrl);
                if (seedResponse.ok) {
                    csvContent = await seedResponse.text();
                    console.log('Initialized Netlify Blob with seed data from local CSV');
                } else {
                    csvContent = 'NoteID,PID,NID,ShiftDate,ShiftCode,A1,A2,A3,CreatedAt\n';
                }
            } catch (error) {
                console.error('Error loading seed data:', error);
                csvContent = 'NoteID,PID,NID,ShiftDate,ShiftCode,A1,A2,A3,CreatedAt\n';
            }
        }

        const generatedNoteId = NoteID || generateNoteId(csvContent);
        const generatedCreatedAt = CreatedAt || new Date().toISOString();

        const escapedA1 = escapeCSVField(A1);
        const escapedA2 = escapeCSVField(A2);
        const escapedA3 = escapeCSVField(A3 || '');

        const newLine = `${generatedNoteId},${PID},${NID},${ShiftDate},${ShiftCode},${escapedA1},${escapedA2},${escapedA3},${generatedCreatedAt}\n`;

        csvContent += newLine;

        await store.set('shift_notes.csv', csvContent);

        return new Response(JSON.stringify({
            success: true,
            noteId: generatedNoteId,
            message: 'Note saved successfully'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error saving shift note:', error);

        return new Response(JSON.stringify({ error: 'Failed to save note', message: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

function generateNoteId(csvContent) {
    const lines = csvContent.trim().split('\n');
    const existingIds = [];

    for (let i = 1; i < lines.length; i++) {
        const firstField = lines[i].split(',')[0];
        const idNumber = parseInt(firstField.replace('SN', ''));
        if (!isNaN(idNumber)) {
            existingIds.push(idNumber);
        }
    }

    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return `SN${String(maxId + 1).padStart(3, '0')}`;
}

function escapeCSVField(field) {
    if (!field) return '';

    const stringField = String(field);

    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }

    return stringField;
}
