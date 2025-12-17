# HEP Tracker - Testing Guide

## Test Environment Setup

### Local Testing
```bash
cd apps/hep-tracker/public
python3 -m http.server 8080
```
Open: `http://localhost:8080`

### Netlify Testing
Deploy to Netlify and test at your site URL.

## Part 1: Weekly Tracker Tests

### Expected Behavior by Patient

#### P001 - Alex Morgan
**Exercises:** 3 (Ankle Range of Motion, Quadriceps Strengthening, Shoulder Flexibility Stretch)
**Date Range:** 12/01 - 12/03 (will show 7-day week starting 12/01)

| Exercise | Target | 12/01 | 12/02 | 12/03 | 12/04-12/07 |
|----------|--------|-------|-------|-------|-------------|
| Ankle Range of Motion | 10 | 10 (🟢) | 0 (🔴) | 10 (🟢) | - |
| Quadriceps Strengthening | 15 | 15 (🟢) | 10 (🔴) | 15 (🟢) | - |
| Shoulder Flexibility Stretch | 10 | 5 (🔴) | 0 (🔴) | 10 (🟢) | - |

#### P002 - Jamie Lee
**Exercises:** 1 (Ankle Range of Motion)
**Date Range:** 12/01 - 12/02 (will show 7-day week starting 12/01)

| Exercise | Target | 12/01 | 12/02 | 12/03-12/07 |
|----------|--------|-------|-------|-------------|
| Ankle Range of Motion | 10 | 5 (🔴) | 10 (🟢) | - |

#### P003 - Chris Patel
**Exercises:** 1 (Quadriceps Strengthening)
**Date Range:** 12/02 only (will show 7-day week starting 12/02)

| Exercise | Target | 12/02 | 12/03-12/08 |
|----------|--------|-------|-------------|
| Quadriceps Strengthening | 15 | 15 (🟢) | - |

### Color Legend
- 🟢 **Green**: MinutesCompleted >= TargetMinutesPerDay (compliant)
- 🔴 **Red**: MinutesCompleted < TargetMinutesPerDay (not compliant)
- **Gray "-"**: No data logged for that date/exercise

### Weekly Tracker Test Steps

1. **Initial Load:**
   - [ ] Page loads without errors
   - [ ] Navigation tabs visible (Weekly Tracker, Patient Logger)
   - [ ] Weekly Tracker view is active by default
   - [ ] Patient dropdown shows "Select a patient..."
   - [ ] Table shows placeholder message

2. **Patient Selection:**
   - [ ] Dropdown populated with 3 patients (Alex Morgan, Jamie Lee, Chris Patel)
   - [ ] Select "Alex Morgan" → Table shows 3 exercises with compliance data
   - [ ] Select "Jamie Lee" → Table updates to 1 exercise
   - [ ] Select "Chris Patel" → Table updates to 1 exercise
   - [ ] Select "Select a patient..." → Shows placeholder message

3. **Dynamic Rendering:**
   - [ ] No hardcoded patient options in HTML
   - [ ] No hardcoded table rows in HTML
   - [ ] Table rows change based on selected patient
   - [ ] Cell colors match expected compliance (green/red/gray)
   - [ ] Numbers in cells match MinutesCompleted from data

4. **Compliance Rules:**
   - [ ] Green cells: MinutesCompleted >= TargetMinutesPerDay
   - [ ] Red cells: MinutesCompleted < TargetMinutesPerDay
   - [ ] Gray cells with "-": No data for that date/exercise

## Part 2: Patient Logger Tests

### Patient Logger Test Steps (Local Mode)

1. **Navigation:**
   - [ ] Click "Patient Logger" tab
   - [ ] View switches to Patient Logger
   - [ ] Tab becomes active (visual highlight)

2. **Form Rendering:**
   - [ ] Patient dropdown populated (3 patients)
   - [ ] Date field shows today's date in YYYY-MM-DD format
   - [ ] Date field is read-only (cannot edit)
   - [ ] All 3 exercises displayed with input fields
   - [ ] Each exercise shows target minutes
   - [ ] Save button visible and enabled

3. **Validation:**
   - [ ] Click Save without selecting patient → Error message
   - [ ] Select patient but enter no minutes → Error message
   - [ ] Enter negative number → Should reject (min=0)

4. **Local Mode Save:**
   - [ ] Select patient "P001 - Alex Morgan"
   - [ ] Enter minutes for at least one exercise (e.g., H001: 12)
   - [ ] Click Save
   - [ ] Message shows: "Saving requires Netlify deployment. In local mode, the logger does not persist."
   - [ ] Message type is "info" (blue background)
   - [ ] App does not crash
   - [ ] Can continue using the app

5. **Navigation After Failed Save:**
   - [ ] Weekly Tracker still works
   - [ ] Can switch back to Patient Logger
   - [ ] Form fields reset or maintain state

### Patient Logger Test Steps (Netlify Deployment)

1. **Form Submission:**
   - [ ] Select patient "P001 - Alex Morgan"
   - [ ] Enter minutes for exercises:
     - Ankle Range of Motion: 8
     - Quadriceps Strengthening: 20
     - Shoulder Flexibility Stretch: 12
   - [ ] Click Save
   - [ ] Save button disables during save
   - [ ] "Saving..." message appears

2. **Success Flow:**
   - [ ] "Daily log saved successfully!" message appears (green)
   - [ ] After ~1 second, view switches to Weekly Tracker
   - [ ] Patient dropdown shows "Alex Morgan" (pre-selected)
   - [ ] Compliance grid shows updated data for today

3. **Data Verification:**
   - [ ] Today's date column shows new minutes
   - [ ] Compliance colors correct based on new data
   - [ ] Grid includes today in the date range
   - [ ] Other patients' data unaffected

4. **Persistence:**
   - [ ] Refresh page (F5)
   - [ ] Select "Alex Morgan" in Weekly Tracker
   - [ ] Today's data still shows saved values
   - [ ] Data persists across browser sessions

5. **Upsert Logic:**
   - [ ] Go to Patient Logger
   - [ ] Select same patient, same date (today)
   - [ ] Enter different minutes for same exercises
   - [ ] Click Save
   - [ ] Switch to Weekly Tracker
   - [ ] Verify minutes are updated (not duplicated)

6. **Multiple Patients:**
   - [ ] Log data for P002 - Jamie Lee
   - [ ] Verify save succeeds
   - [ ] Check Weekly Tracker for Jamie Lee
   - [ ] Verify P001's data still intact

## Part 3: Integration Tests

### Navigation Flow
- [ ] Switch between Weekly Tracker and Patient Logger multiple times
- [ ] Verify no JavaScript errors in console
- [ ] Verify data loads correctly each time
- [ ] Verify UI state is maintained appropriately

### Data Consistency
- [ ] Log data for patient in Patient Logger
- [ ] Switch to Weekly Tracker
- [ ] Verify compliance grid shows new data immediately
- [ ] Verify colors update based on compliance rules
- [ ] Refresh page and verify data persists (Netlify only)

### Error Handling
- [ ] Disconnect from internet (simulate offline)
- [ ] Try to save in Patient Logger
- [ ] Verify appropriate error message
- [ ] Reconnect and verify app recovers

### Edge Cases
- [ ] Enter 0 minutes for all exercises → Should save successfully
- [ ] Enter exactly target minutes → Should show green
- [ ] Enter target - 1 minutes → Should show red
- [ ] Enter very large number (999) → Should accept
- [ ] Leave some exercises empty, fill others → Should save only filled exercises

## Part 4: Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

Verify:
- [ ] Navigation works
- [ ] Forms render correctly
- [ ] Date picker shows correctly
- [ ] Save functionality works
- [ ] No console errors

## Part 5: Responsive Design

Test at different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

Verify:
- [ ] Layout adapts appropriately
- [ ] Navigation usable
- [ ] Forms usable
- [ ] Tables scrollable if needed
- [ ] Buttons accessible

## Test Data Summary

### Seed Data (Initial State)
```csv
PID,Date,HEPID,MinutesCompleted
P001,2025-12-01,H001,10
P001,2025-12-01,H002,15
P001,2025-12-01,H003,5
P001,2025-12-02,H001,0
P001,2025-12-02,H002,10
P001,2025-12-02,H003,0
P001,2025-12-03,H001,10
P001,2025-12-03,H002,15
P001,2025-12-03,H003,10
P002,2025-12-01,H001,5
P002,2025-12-02,H001,10
P003,2025-12-02,H002,15
```

### Exercise Definitions
```csv
HEPID,ExerciseName,TargetMinutesPerDay
H001,Ankle Range of Motion,10
H002,Quadriceps Strengthening,15
H003,Shoulder Flexibility Stretch,10
```

### Patients
```csv
PID,PatientName
P001,Alex Morgan
P002,Jamie Lee
P003,Chris Patel
```

## Success Criteria

### Local Mode
✅ All features work except persistence
✅ Friendly error message on save attempt
✅ No crashes or console errors
✅ Weekly Tracker fully functional

### Netlify Deployment
✅ All local mode features work
✅ Patient Logger saves persist
✅ Data updates immediately in Weekly Tracker
✅ Data persists across sessions
✅ Upsert logic works correctly
✅ Multiple patients can log data

## Known Limitations (By Design)

- Local mode does not persist Patient Logger data
- Shows all exercises regardless of patient assignment
- No authentication or multi-user support
- No ability to edit or delete historical entries
- No validation of reasonable minute values (accepts 0-999+)
