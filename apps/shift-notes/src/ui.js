export class UI {
    constructor(state) {
        this.state = state;
        this.elements = {};
        this.initializeElements();
    }

    initializeElements() {
        this.elements = {
            viewCapture: document.getElementById('view-capture'),
            viewList: document.getElementById('view-list'),
            noteForm: document.getElementById('note-form'),
            shiftDate: document.getElementById('shift-date'),
            shiftCode: document.getElementById('shift-code'),
            patient: document.getElementById('patient'),
            nurse: document.getElementById('nurse'),
            a1: document.getElementById('a1'),
            a2: document.getElementById('a2'),
            a3: document.getElementById('a3'),
            filterNurse: document.getElementById('filter-nurse'),
            filterShift: document.getElementById('filter-shift'),
            notesTableContainer: document.getElementById('notes-table-container'),
            localModeAlert: document.getElementById('local-mode-alert'),
            successMessage: document.getElementById('success-message'),
            errorMessage: document.getElementById('error-message'),
            navButtons: document.querySelectorAll('.nav-btn')
        };
    }

    setupNavigation() {
        this.elements.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const viewName = btn.dataset.view;
                this.switchView(viewName);
            });
        });
    }

    switchView(viewName) {
        this.elements.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        this.elements.viewCapture.classList.toggle('active', viewName === 'capture');
        this.elements.viewList.classList.toggle('active', viewName === 'list');

        if (viewName === 'list') {
            this.renderNotesList();
        }

        this.hideAlerts();
    }

    populateDropdowns() {
        const patients = this.state.getPatients();
        const nurses = this.state.getNurses();

        this.populateSelect(this.elements.patient, patients, 'PID', 'PatientName');
        this.populateSelect(this.elements.nurse, nurses, 'NID', 'NurseName');
        this.populateSelect(this.elements.filterNurse, nurses, 'NID', 'NurseName');

        this.elements.shiftDate.valueAsDate = new Date();

        if (this.state.isLocalMode) {
            this.elements.localModeAlert.style.display = 'block';
        }
    }

    populateSelect(selectElement, items, valueField, textField) {
        const currentValue = selectElement.value;
        const defaultOption = selectElement.querySelector('option[value=""]');

        selectElement.innerHTML = '';

        if (defaultOption) {
            selectElement.appendChild(defaultOption);
        }

        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            selectElement.appendChild(option);
        });

        if (currentValue) {
            selectElement.value = currentValue;
        }
    }

    setupFormSubmit(onSubmit) {
        this.elements.noteForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                PID: this.elements.patient.value,
                NID: this.elements.nurse.value,
                ShiftDate: this.elements.shiftDate.value,
                ShiftCode: this.elements.shiftCode.value,
                A1: this.elements.a1.value,
                A2: this.elements.a2.value,
                A3: this.elements.a3.value
            };

            await onSubmit(formData);
        });
    }

    setupFilters() {
        this.elements.filterNurse.addEventListener('change', () => {
            this.renderNotesList();
        });

        this.elements.filterShift.addEventListener('change', () => {
            this.renderNotesList();
        });
    }

    renderNotesList() {
        const nurseId = this.elements.filterNurse.value;
        const shiftCode = this.elements.filterShift.value;

        if (!nurseId) {
            this.showEmptyState('Select a nurse to view shift notes');
            return;
        }

        const filters = { nurseId };
        if (shiftCode) {
            filters.shiftCode = shiftCode;
        }

        const notes = this.state.getShiftNotes(filters);

        if (notes.length === 0) {
            this.showEmptyState('No shift notes found for the selected filters');
            return;
        }

        this.renderNotesTable(notes);
    }

    renderNotesTable(notes) {
        const table = document.createElement('table');

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Patient Name</th>
                <th>What Changed This Shift</th>
                <th>What Needs Attention Next Shift</th>
                <th>Any Watch-Outs</th>
                <th>Shift Date</th>
                <th>Shift Code</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        notes.forEach(note => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${this.state.getPatientName(note.PID)}</strong></td>
                <td>${this.escapeHtml(note.A1)}</td>
                <td>${this.escapeHtml(note.A2)}</td>
                <td>${this.escapeHtml(note.A3) || '-'}</td>
                <td>${this.formatDate(note.ShiftDate)}</td>
                <td>${note.ShiftCode}</td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        this.elements.notesTableContainer.innerHTML = '';
        this.elements.notesTableContainer.appendChild(table);
    }

    showEmptyState(message) {
        this.elements.notesTableContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">=Ë</div>
                <p>${message}</p>
            </div>
        `;
    }

    resetForm() {
        this.elements.noteForm.reset();
        this.elements.shiftDate.valueAsDate = new Date();
    }

    showSuccess() {
        this.hideAlerts();
        this.elements.successMessage.style.display = 'block';
        setTimeout(() => {
            this.elements.successMessage.style.display = 'none';
        }, 5000);
    }

    showError(message) {
        this.hideAlerts();
        this.elements.errorMessage.textContent = message || 'Error saving note. Please try again.';
        this.elements.errorMessage.style.display = 'block';
    }

    hideAlerts() {
        this.elements.successMessage.style.display = 'none';
        this.elements.errorMessage.style.display = 'none';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    switchToListView(nurseId, shiftCode) {
        this.switchView('list');

        if (nurseId) {
            this.elements.filterNurse.value = nurseId;
        }
        if (shiftCode) {
            this.elements.filterShift.value = shiftCode;
        }

        this.renderNotesList();
    }
}
