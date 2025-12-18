import { AppState } from './state.js';
import { UI } from './ui.js';

class App {
    constructor() {
        this.state = new AppState();
        this.ui = null;
    }

    async initialize() {
        try {
            await this.state.initialize();

            this.ui = new UI(this.state);

            this.ui.populateDropdowns();
            this.ui.setupNavigation();
            this.ui.setupFilters();

            this.ui.setupFormSubmit(this.handleFormSubmit.bind(this));

            console.log('Shift Notes app initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            alert('Failed to load application. Please refresh the page.');
        }
    }

    async handleFormSubmit(formData) {
        try {
            if (this.state.isLocalMode) {
                this.ui.showError('Saving requires Netlify deployment. Local mode does not persist notes.');
                return;
            }

            const noteData = {
                ...formData,
                NoteID: this.state.generateNoteId(),
                CreatedAt: new Date().toISOString()
            };

            await this.state.saveShiftNote(noteData);

            this.ui.showSuccess();
            this.ui.resetForm();

            setTimeout(() => {
                this.ui.switchToListView(formData.NID, formData.ShiftCode);
            }, 1000);

        } catch (error) {
            console.error('Error saving note:', error);

            if (error.message === 'LOCAL_MODE') {
                this.ui.showError('Saving requires Netlify deployment. Local mode does not persist notes.');
            } else {
                this.ui.showError('Error saving note. Please try again.');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.initialize();
});
