# HEP Tracker - Testing Guide

## Expected Behavior by Patient

### P001 - Alex Morgan
**Exercises:** 3 (Ankle Range of Motion, Quadriceps Strengthening, Shoulder Flexibility Stretch)
**Date Range:** 12/01 - 12/03 (will show 7-day week starting 12/01)

| Exercise | Target | 12/01 | 12/02 | 12/03 | 12/04-12/07 |
|----------|--------|-------|-------|-------|-------------|
| Ankle Range of Motion | 10 | 10 (🟢) | 0 (🔴) | 10 (🟢) | - |
| Quadriceps Strengthening | 15 | 15 (🟢) | 10 (🔴) | 15 (🟢) | - |
| Shoulder Flexibility Stretch | 10 | 5 (🔴) | 0 (🔴) | 10 (🟢) | - |

### P002 - Jamie Lee
**Exercises:** 1 (Ankle Range of Motion)
**Date Range:** 12/01 - 12/02 (will show 7-day week starting 12/01)

| Exercise | Target | 12/01 | 12/02 | 12/03-12/07 |
|----------|--------|-------|-------|-------------|
| Ankle Range of Motion | 10 | 5 (🔴) | 10 (🟢) | - |

### P003 - Chris Patel
**Exercises:** 1 (Quadriceps Strengthening)
**Date Range:** 12/02 only (will show 7-day week starting 12/02)

| Exercise | Target | 12/02 | 12/03-12/08 |
|----------|--------|-------|-------------|
| Quadriceps Strengthening | 15 | 15 (🟢) | - |

## Color Legend
- 🟢 **Green**: MinutesCompleted >= TargetMinutesPerDay (compliant)
- 🔴 **Red**: MinutesCompleted < TargetMinutesPerDay (not compliant)
- **Gray "-"**: No data logged for that date/exercise

## Test Steps

1. **Start the server:**
   ```bash
   cd apps/hep-tracker/public
   python3 -m http.server 8080
   ```

2. **Open browser:** http://localhost:8080

3. **Open browser console** (F12) to see loading messages

4. **Test patient switching:**
   - Default: Should show "Please select a patient to view compliance data"
   - Select "Alex Morgan": Table updates with 3 exercises, 7 date columns
   - Select "Jamie Lee": Table updates with 1 exercise, different dates
   - Select "Chris Patel": Table updates with 1 exercise
   - Select back to "Select a patient...": Shows placeholder message again

5. **Verify dynamic rendering:**
   - Patient dropdown is populated from CSV (3 patients)
   - Table rows change based on selected patient
   - Cell colors match the expected compliance (green/red/gray)
   - Numbers in cells match MinutesCompleted from daily_log.csv

## Implementation Notes

- No hardcoded patient options in HTML ✓
- No hardcoded table rows in HTML ✓
- All data loaded from CSV files ✓
- Dynamic rendering on patient selection ✓
- Compliance rules correctly applied ✓
