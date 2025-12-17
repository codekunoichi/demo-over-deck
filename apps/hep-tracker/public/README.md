# HEP Tracker - Weekly Compliance View

## Quick Start

To run the application locally:

```bash
cd public
python3 -m http.server 8080
```

Then open your browser to: `http://localhost:8080`

## How It Works

1. **On page load:**
   - CSV files are loaded from `./data/` directory
   - Patient dropdown is populated from `patients.csv`
   - Empty table is displayed with "Select a patient" message

2. **When selecting a patient:**
   - Table dynamically renders exercises assigned to that patient
   - Exercises are determined from `daily_log.csv` entries for that patient
   - Week dates are generated starting from the patient's first log entry

3. **Color coding:**
   - **Green**: MinutesCompleted >= TargetMinutesPerDay
   - **Red**: MinutesCompleted < TargetMinutesPerDay
   - **Gray with "-"**: No log entry for that date/exercise

## File Structure

```
public/
├── index.html          # Main HTML page
├── style.css           # All styling
├── src/
│   ├── app.js         # Controller and event wiring
│   ├── state.js       # Data loading and state management
│   └── ui.js          # DOM rendering functions
└── data/
    ├── patients.csv   # Patient list
    ├── hep_list.csv   # Exercise definitions
    └── daily_log.csv  # Patient activity logs
```

## Testing the Implementation

1. Start the server
2. Open browser to http://localhost:8080
3. Open browser console (F12) to see loading messages
4. Select "Alex Morgan" from dropdown - should show 3 exercises with compliance data
5. Select "Jamie Lee" - should show 1 exercise with different data
6. Select "Chris Patel" - should show 1 exercise
7. Select back to "Select a patient..." - should show placeholder message

## Data Flow

1. `app.js` initializes the application
2. `state.js` fetches and parses CSV files
3. `ui.js` renders the dropdown options
4. User selects a patient → event listener fires
5. `state.js` filters exercises and logs for that patient
6. `ui.js` generates the compliance grid dynamically
7. Business rules applied: green if minutes >= target, red otherwise
