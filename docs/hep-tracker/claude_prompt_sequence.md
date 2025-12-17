> This document is intentionally raw.
> It reflects the actual prompts, mistakes, and fixes used to build a working MVP.

## Step 1: Static HTML Weekly Tracker
- First paste the intial-prompt-template.md

## Step 2: Dynamic Patient Weekly Tracker and onchange function

- Next lets make it dynamic

```
Please implement patient switching and dynamic rendering using the existing CSV files. Do not add new features beyond what is described. Ask clarifying questions only if something blocks implementation.

Context and files:
	•	UI files:
	•	apps/hep-tracker/public/index.html
	•	apps/hep-tracker/public/style.css
	•	JS files (use this separation):
	•	apps/hep-tracker/src/app.js (controller and wiring)
	•	apps/hep-tracker/src/state.js (data loading and in-memory state)
	•	apps/hep-tracker/src/ui.js (DOM rendering)
	•	Data files (source of truth):
	•	apps/hep-tracker/data/patients.csv
	•	apps/hep-tracker/data/hep_list.csv
	•	apps/hep-tracker/data/daily_log.csv

Required behavior:
	1.	On page load:
	•	Load and parse patients.csv, hep_list.csv, and daily_log.csv.
	•	Populate the patient dropdown from patients.csv (no hardcoded options).
	•	Default to the first patient in the list (or keep “Select a patient” if that is what you prefer, but choose one and implement consistently).
	2.	When the patient dropdown changes:
	•	Re-render the “Weekly Compliance View” table for the selected patient only.
	•	Use the patient’s assigned HEP exercises from hep_list.csv (keyed by PID and HEPID).
	•	For each exercise and each date column in the displayed week, look up minutes from daily_log.csv (PID, Date, HEPID, MinutesCompleted).
	•	Show “-” when there is no row in daily_log.csv for that PID, date, HEPID.
	3.	Coloring rules:
	•	Green if MinutesCompleted >= TargetMinutesPerDay for that exercise.
	•	Red if MinutesCompleted < TargetMinutesPerDay OR MinutesCompleted is 0.
	•	No-data style (neutral) if there is no entry (render as “-”).
	4.	Week/date columns:
	•	For now, you can keep the existing 7 date headers already in the HTML.
	•	But the table body must be fully generated from data each time the patient changes.
	•	Do not keep the hardcoded rows in index.html. Replace them with a placeholder container (<tbody id="compliance-body"></tbody>) and render rows from JS.

Implementation notes:
	•	Use fetch() to load the CSVs.
	•	Since this is static hosting, ensure the fetch paths work relative to public/index.html. If needed, copy CSVs into public/data/ or adjust paths, but pick a clean approach and implement it fully.
	•	Add a small CSV parser (simple split-based is fine).
	•	Keep the code readable and comment key assumptions.

Deliverable:
	•	After changes, selecting a different patient in the dropdown updates the table rows and cell colors based on the CSV data.

```

## Step 3 Patient Logger

```
Claude Code Prompt: Patient Logger with Real Save on Netlify + Weekly Tracker Refresh

Read this carefully. Do not add features not listed. Ask clarifying questions only if something blocks implementation.

Objective

Implement a Patient Logger screen that:
	1.	lets a user select a patient and enter minutes for today per exercise
	2.	saves persistently on Netlify (not localStorage)
	3.	immediately updates the Weekly Compliance View for that patient after Save

Existing files (edit as needed)
	•	apps/hep-tracker/public/index.html
	•	apps/hep-tracker/public/style.css
	•	apps/hep-tracker/public/src/app.js
	•	apps/hep-tracker/public/src/ui.js
	•	apps/hep-tracker/public/src/state.js

Data files and schema (existing)

CSV schema for daily logs is:
PID,Date,HEPID,MinutesCompleted

Date format is ISO YYYY-MM-DD (example: 2025-12-01).

Current loading (important)

The app currently loads CSVs from:
	•	./data/patients.csv
	•	./data/hep_list.csv
	•	./data/daily_log.csv

This is fine for local read-only mode.

Critical constraint

A browser cannot write to public/data/daily_log.csv. To support real Save, implement persistence using Netlify Functions and a simple storage mechanism.

Required approach (Netlify)

Add Netlify functions under:
	•	apps/hep-tracker/netlify/functions/get_daily_log.js
	•	apps/hep-tracker/netlify/functions/save_daily_log.js

Use Netlify Blob storage (preferred) to store the CSV text for daily_log.csv under a single key, for example daily_log.csv.

Endpoints:
	•	GET /.netlify/functions/get_daily_log
	•	returns CSV text with header + rows
	•	if no blob exists yet, return the seeded local CSV contents (or at minimum return header)
	•	POST /.netlify/functions/save_daily_log
	•	accepts JSON payload:


{
  "pid": "P001",
  "date": "2025-12-04",
  "entries": [
    {"hepid": "H001", "minutes": 10},
    {"hepid": "H002", "minutes": 15}
  ]
}



	•	server must upsert rows (PID + Date + HEPID unique). If row exists, overwrite MinutesCompleted; else append.
	•	returns updated CSV (or success + updated CSV)

App behavior requirements

A) Weekly Compliance View (existing)
	•	Patient dropdown must re-render the table when changed.
	•	The table should be generated from state and data, not hardcoded rows.
	•	Use existing rules:
	•	green if MinutesCompleted >= TargetMinutesPerDay
	•	red if < TargetMinutesPerDay
	•	neutral if no data

B) Patient Logger View (new)
	•	Add navigation: “Weekly Tracker” and “Patient Logger”
	•	Patient Logger UI:
	•	Patient dropdown populated from patients.csv
	•	Date auto-filled to today (YYYY-MM-DD)
	•	Show exercises from hep_list.csv (for demo, show all exercises; do not invent assignment logic)
	•	For each exercise: input minutes (number, min 0)
	•	Save button

C) Save flow
When user clicks Save:
	1.	Collect entries for all exercises where minutes is a valid number (including 0).
	2.	Call POST /.netlify/functions/save_daily_log with payload.
	3.	After save succeeds:
	•	Reload daily log data by calling GET /.netlify/functions/get_daily_log
	•	Update in-memory state.dailyLog
	•	Switch back to Weekly Tracker view
	•	Ensure the Weekly Tracker shows the selected patient and reflects the new minutes for today

Local development behavior

This must still run locally using python3 -m http.server:
	•	Weekly view should load local CSVs and work normally.
	•	Patient Logger Save should detect that /.netlify/functions/* is not available locally and show a clear message:
“Saving requires Netlify deployment. In local mode, the logger does not persist.”
	•	Do not crash locally.

Implementation details
	•	You may refactor state.js to support two data sources:
	•	Try function endpoint first for daily logs
	•	Fallback to local ./data/daily_log.csv if endpoint unavailable
	•	Keep code readable and commented.
	•	Do not introduce frameworks.

Deliverable checklist
	•	Weekly patient dropdown change correctly rerenders table
	•	Patient Logger renders and collects minutes
	•	Save persists on Netlify (not localStorage)
	•	After Save, Weekly view updates immediately with new data
	•	Local mode works without persistence and shows a friendly message on Save

Start by implementing: navigation + patient logger UI skeleton, then Netlify functions, then wire save, then weekly refresh.
```


## Step 4 - Polish

Observing the Date was fixed in demo to 12/01 We updated the function requesting rolling current week framing.

```
 Its working, [Image #1] One tiny fix needed is when I save it displays from 12/01, so its dropping the 12/17, may be we display a 
rolling window of 30 days? [Image #2] 
```

The Image #1 is the CSV displaying the 12/17 log entires. Image #2 displaying the 12/01 Picture.

## Reflection Notes

- Think longer yourself on what instructions to give so that its clear to ClaudeCode on your intent.
- The efficacy and accuracy of your code will be directly proportional to clarity of the prompt you provided.

## Tips and Tricks

- Use ChatGPT to brainstorming partner on crafting structured prompt for Claude Code, instead of "Write me a CSV for patient logger and save it." 
- The time you put in your upfront thinking will save a lot of time in actual workflow clarity when Claude delivers the HTML mockup
- Netlify is a new tool and you will find yourself in a lot of wierd error situation. Logs are your friends. Don't be intimidated by them, they are here to help you. Browse and click around Netlify Project and links you have to familiarize yourself.
- Debug one small issue at a time not the whole thing broken.

## Mental Models That Finally Clicked

1. Netlify is not "just hosting"
   - Static files and serverless functions live in different worlds
   - You must be explicit about how the browser reaches functions

2. Logs are not errors
   - Logs are evidence
   - A 404 is information, not failure

3. Do not debug infrastructure first
   - Hit the endpoint directly in the browser
   - If the URL works there, the bug is in your frontend assumptions

4. Fix contracts, not symptoms
   - Redirects hide broken mental models
   - Correct paths teach the system how to behave

## What We Deliberately Did NOT Do

- We did not add authentication
- We did not add a backend database
- We did not introduce frameworks
- We did not optimize for scale

This demo optimizes for:
- clarity of thought
- correctness of flow
- confidence in iteration

Scale comes later.

## If You’re Stuck

Ask yourself:
1. Can I explain what the system is supposed to do in one sentence?
2. Can I hit the URL directly in the browser?
3. Do I know where my data is actually stored?
4. Am I fixing the cause or hiding the symptom?

If not, stop coding and write.