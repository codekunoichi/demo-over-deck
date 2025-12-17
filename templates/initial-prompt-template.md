If anything in the intent is ambiguous, stop and ask a clarifying question before writing code.

Read this intent carefully. Do not add features not listed. Ask clarifying questions only if something blocks implementation.

Use @spec/intent.md as the source of truth. The UI sketch referenced in the intent is @public/assets/sketch.png.

Project structure and responsibilities:
	•	Rewrite @public/index.html (it is currently empty). Start by generating the static HTML for the Weekly Compliance View using the sketch as reference.
	•	Put all styling in @public/style.css and reference it from index.html.
	•	JavaScript architecture:
	•	@src/state.js = model/state and data access
	•	@src/ui.js = view rendering helpers
	•	@src/app.js = controller/wiring, event listeners, app boot

Data sources:
	•	Use the CSV files in @data/ as the demo data sources:
	•	@data/patients.csv
	•	@data/hep_list.csv
	•	@data/daily_log.csv
	•	Do not invent a backend. Use only static-site friendly approaches (CSV fetch + in-memory + browser localStorage).
	•	If you need to create sample rows in the CSVs for the demo, edit the existing files in @data/ rather than creating new data files.

Implementation order:
	1.	Weekly Compliance View: static HTML + CSS layout matching the sketch (no interactivity yet).
	2.	Then wire the view to data from the CSVs and state logic (green/red rules) using the existing JS files.

Keep the scope strictly to what is in the intent.