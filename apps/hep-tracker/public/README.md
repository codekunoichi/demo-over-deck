# HEP Tracker

Home Exercise Program Tracker - Demo application for Physical Therapists and patients to track exercise compliance.

## Features

### 1. Weekly Tracker
View weekly compliance for a selected patient:
- Calendar-style grid showing exercises and dates
- Color-coded compliance (green = compliant, red = not compliant)
- Dynamic rendering from CSV data

### 2. Patient Logger
Log daily exercise minutes for a patient:
- Select patient and enter minutes per exercise
- Date auto-filled to today
- Saves to Netlify Blob storage (persists across sessions)
- Falls back gracefully in local development mode

## Quick Start

### Local Development

```bash
cd apps/hep-tracker/public
python3 -m http.server 8080
```

Then open your browser to: `http://localhost:8080`

**Note:** In local mode, the Patient Logger will show a friendly message that saving requires Netlify deployment. All other features work normally.

### Netlify Deployment

1. **Install dependencies:**
   ```bash
   cd apps/hep-tracker
   npm install
   ```

2. **Deploy to Netlify:**
   ```bash
   netlify deploy --prod
   ```

   Or connect your Git repository to Netlify for automatic deployments.

3. **Access your app:**
   Visit your Netlify site URL to use the full app with data persistence.

## How It Works

### Weekly Tracker View

1. **On page load:**
   - CSV files are loaded (local or from Netlify Blob storage)
   - Patient dropdown is populated from `patients.csv`
   - Empty table is displayed with "Select a patient" message

2. **When selecting a patient:**
   - Table dynamically renders exercises for that patient
   - Exercises determined from `daily_log.csv` entries
   - Week dates generated starting from patient's first log entry

3. **Color coding:**
   - **Green**: MinutesCompleted >= TargetMinutesPerDay
   - **Red**: MinutesCompleted < TargetMinutesPerDay
   - **Gray with "-"**: No log entry for that date/exercise

### Patient Logger View

1. **Select patient** from dropdown
2. **Date auto-filled** to today (YYYY-MM-DD)
3. **Enter minutes** for each exercise (all exercises shown)
4. **Click Save** to persist data
5. **After save:** Automatically switches to Weekly Tracker showing updated data

## File Structure

```
apps/hep-tracker/
├── netlify/
│   └── functions/
│       ├── get_daily_log.js       # GET endpoint for daily log CSV
│       └── save_daily_log.js      # POST endpoint to save entries
├── public/
│   ├── index.html                 # Main HTML with navigation
│   ├── style.css                  # All styling
│   ├── src/
│   │   ├── app.js                # Controller and event wiring
│   │   ├── state.js              # Data loading with Netlify fallback
│   │   └── ui.js                 # DOM rendering functions
│   └── data/
│       ├── patients.csv          # Patient list (seed data)
│       ├── hep_list.csv          # Exercise definitions
│       └── daily_log.csv         # Patient activity logs (seed data)
├── netlify.toml                   # Netlify configuration
└── package.json                   # Dependencies (@netlify/blobs)
```

## Data Persistence

### Local Mode
- Reads from `./data/*.csv` files
- No persistence for new entries
- Shows friendly message when attempting to save

### Netlify Deployment
- Uses Netlify Blob storage for `daily_log.csv`
- Full CRUD operations supported
- Upsert logic: updates existing entries, appends new ones
- Data persists across sessions and deploys

## API Endpoints (Netlify Only)

### GET /.netlify/functions/get_daily_log
Returns the current daily log as CSV text.

### POST /.netlify/functions/save_daily_log
Saves daily log entries for a patient.

**Request Body:**
```json
{
  "pid": "P001",
  "date": "2025-12-17",
  "entries": [
    {"hepid": "H001", "minutes": 10},
    {"hepid": "H002", "minutes": 15}
  ]
}
```

## Architecture

### JavaScript Modules
- **app.js**: Controller and event wiring
  - Navigation switching
  - Event listeners for patient selection and save
  - App initialization

- **state.js**: Data loading and state management
  - CSV parsing
  - Netlify function integration with fallback
  - Business logic for compliance calculation

- **ui.js**: DOM rendering functions
  - Patient dropdown rendering
  - Compliance grid generation
  - Patient Logger form rendering

### Data Flow: Save Operation
1. User enters minutes and clicks Save
2. `app.js` collects entries and calls `saveDailyLog()`
3. `state.js` POSTs to Netlify function
4. Netlify function upserts data in Blob storage
5. `state.js` reloads daily log data
6. `app.js` switches to Weekly Tracker view
7. `ui.js` renders updated compliance grid

## Testing

See [TESTING.md](../TESTING.md) for detailed testing procedures and expected results.

## Deployment Notes

### Netlify Configuration
The `netlify.toml` file configures:
- Publish directory: `public`
- Functions directory: `netlify/functions`

### Dependencies
- `@netlify/blobs`: For serverless blob storage
- No other runtime dependencies

### Environment Variables
None required! Netlify Blobs work automatically when deployed.

## Troubleshooting

### "Saving requires Netlify deployment" message
- **Expected behavior** in local mode
- Deploy to Netlify for full persistence features

### Data not updating after save
- Check browser console for errors
- Verify Netlify functions are deployed
- Confirm blob storage is accessible

### Weekly Tracker not showing new data
- Ensure page reloaded after save
- Check that patient is selected in dropdown
- Verify compliance grid is re-rendering

## Non-Goals

This is a demo application. The following are explicitly not implemented:
- Authentication and user management
- PHI (Protected Health Information) handling
- EHR integration
- Billing or insurance
- Email notifications or reminders
- Analytics or reporting dashboards
