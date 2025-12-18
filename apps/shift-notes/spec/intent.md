# Shift Notes App — Intent

## Purpose
The Shift Notes app is a **teaching demo** for nursing and healthcare faculty to illustrate how a simple, intent-driven workflow can be turned into a working application quickly.  
The goal is not to build a production EHR module, but to demonstrate:

- How shift-to-shift communication can be structured
- How lightweight tools can reduce cognitive load during handoffs
- How AI-assisted development can move from sketch → data model → working app within tight timeboxes

This app focuses on **clarity, continuity, and safety** during nurse shift changes.

---

## Why This Matters Clinically
Shift-to-shift handoff failures are a known source of patient safety risk.
This demo intentionally:
- Reduces narrative overload
- Forces prioritization
- Makes responsibility explicit (who wrote what, when)
- Preserves context across time

The goal is not documentation volume, but shared situational awareness.

---

## Non-Goals (Explicitly Out of Scope)
To keep the demo focused and teachable, the following are intentionally excluded:

- Authentication / login
- Role-based access control
- Editing or deleting notes
- Free-form tagging or NLP summarization
- Integration with EHR systems
- HIPAA-grade security controls (this is a demo only)

---

## Core Concept
A nurse finishing a shift records **structured handoff notes** for a patient.  
A nurse starting a shift can quickly review what changed, what needs attention, and any watch-outs — without reading long narrative notes.

The structure mirrors how nurses already think and communicate during handoffs.

---

## Entities

### Patient
- `PID`
- `PatientName`

Source: `public/data/patients.csv` (read-only)

---

### Nurse
- `NID`
- `NurseName`

Source: `public/data/nurses.csv` (read-only)

---

### ShiftNotes
Captured and persisted records.

Fields:
- `NoteID` (generated)
- `PID`
- `NID`
- `ShiftDate` (YYYY-MM-DD)
- `ShiftCode` (Day / Night)
- `A1` — What changed this shift?
- `A2` — What needs attention next shift?
- `A3` — Any watch-outs?
- `CreatedAt` (ISO timestamp)

Persistence: Netlify Blob as CSV (`shift_notes.csv`)

---

## Views

### 1. Shift Change Note Capture
Primary data-entry screen.

Fields:
- Shift Date (defaults to today)
- Shift Code (Day / Night)
- Patient (dropdown)
- Nurse (dropdown)
- A1 textarea
- A2 textarea
- A3 textarea
- Save button

Behavior:
- Validate required fields before save
- On save:
  - Persist note via Netlify Function
  - Auto-generate `NoteID` and `CreatedAt`
  - Navigate to Notes List view
  - Pre-filter list to the same Nurse and ShiftCode

---

### 2. Shift Notes List (By Nurse)
Review screen for incoming or historical notes.

Controls:
- Nurse dropdown (required)
- Shift Code filter (All / Day / Night)

Table columns:
- Patient Name
- What Changed This Shift (A1)
- What Needs Attention Next Shift (A2)
- Any Watch-Outs (A3)
- Shift Date
- Shift Code

Sorting:
- Default: newest first (`CreatedAt` descending)

---

## Data & Storage Strategy

### Read-only CSVs
Loaded client-side:
- `patients.csv`
- `nurses.csv`

### Writable CSV (Netlify Blob)
- `shift_notes.csv`

Notes:
- CSV is treated as append-only
- If blob does not exist, functions must initialize it with headers
- No overwrites or deletes

---

## Netlify Functions

### get_shift_notes
- Returns contents of `shift_notes.csv`
- If blob is missing, return header row only

### save_shift_note
- Accepts JSON payload
- Appends a single row to CSV
- Generates `NoteID` and `CreatedAt` server-side if missing
- Returns success response only (no complex validation)

---

## Local Development Expectations
When running locally (e.g., `python3 -m http.server`):

- App must load patients and nurses
- App must not crash due to missing Netlify functions
- Saving should show a friendly message:
  > “Saving requires Netlify deployment. Local mode does not persist notes.”

---

## Teaching Outcomes
This demo is intended to show:

- How spreadsheets naturally translate into data models
- How intent-first design prevents overengineering
- How nurses’ real workflows can be respected in software
- How MVPs can be built in hours — not weeks — using modern tools

---

## Visual Reference
See the original spreadsheet sketch used to define scope and layout:

`public/assets/sketch.png`

This sketch is the **source of truth** for UI structure.
