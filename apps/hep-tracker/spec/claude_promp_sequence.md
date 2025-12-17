- First paste the intial-promopt-template.md
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