

# Shift Notes — Nursing Handoff Demo

## What this demo is about

Shift Notes is a **teaching-first demo** that shows how a real nursing workflow can be translated into a working application quickly, using intent-first design and lightweight tooling.

The clinical problem is universal:

> “What changed this shift, what needs attention next, and what should I watch out for?”

Instead of long verbal handoffs, scattered notes, or EHR screens full of noise, this demo captures **structured shift-change notes** that are easy to enter, easy to review, and easy to reason about.

This is **not an EHR**.  
It is a **live prototype** meant to teach how modern builders can shorten the feedback loop by showing working software instead of explaining ideas in slides.

---

## Who this is for

- Nursing faculty exploring applied AI and digital health
- MBA and product students learning to validate ideas through demos
- Builders learning how to ship realistic healthcare workflows quickly

---

## Start with intent (before code)

This demo began **without code**.

The first artifact was a spreadsheet-style sketch that clarified:
- What entities exist
- What nurses actually need to communicate during shift change
- What must be captured vs what can remain read-only

This mirrors how clinicians already think: tables, rows, dates, responsibility.

Below is the original intent sketch that defined the scope *before* implementation:

![Shift Notes Intent Sketch](./screenshots/sketch.png)

This sketch served as the **source of truth** for everything that followed.

---

## Data model (kept intentionally small)

The data model was derived directly from the sketch.

**Entities**

- **Patient**
  - PID, PatientName
- **Nurse**
  - NID, NurseName
- **ShiftNotes**
  - PID
  - NID
  - ShiftDate
  - ShiftCode (Day / Night)
  - A1 — What changed this shift?
  - A2 — What needs attention next shift?
  - A3 — Any watch-outs?
  - NoteID
  - CreatedAt

No relational database.  
No migrations.  
Just enough structure to support the workflow.

---

## Core user flows

### 1. Capture shift-change notes

A nurse:
1. Selects the **shift date** and **shift (day/night)**
2. Selects a **patient**
3. Answers three clinically meaningful questions (A1–A3)
4. Confirms identity via nurse selection
5. Saves the note

Each save appends a new row to `shift_notes.csv`.

---

### 2. Review notes by nurse

A nurse can:
- Filter notes by **nurse**
- Optionally filter by **shift**
- Review notes sorted by **most recent first**

This view answers:
> “What did I document, and what did I hand off?”

---

## Storage strategy (simple and transparent)

All data is stored as CSV using **Netlify Blobs**:

- `patients.csv` — read-only reference data
- `nurses.csv` — read-only reference data
- `shift_notes.csv` — append-only captured notes

Why CSV?
- Transparent and inspectable
- Easy to debug
- Ideal for teaching and demos
- No hidden persistence layer

---

## Architecture (thin by design)

- **Frontend:** Plain HTML, CSS, and vanilla JavaScript
- **State management:** Simple in-memory state module
- **Backend:** Netlify Functions
  - `get_shift_notes`
  - `save_shift_note`
- **Hosting:** Netlify

No heavy frameworks.  
No build-time magic.  
Everything is visible and understandable.

---

## Relationship to the HEP Tracker demo

Shift Notes follows the **same recipe** as the HEP Tracker demo:

1. Sketch the intent
2. Define entities, views, and storage
3. Build one tight user loop
4. Persist data with minimal backend logic
5. Deploy and learn from interaction

Different clinical domain.  
Same underlying playbook.

---

## Why this matters pedagogically

In many classrooms:
- Ideas die in PowerPoint
- Feedback arrives late
- “Prototypes” are static mockups

This demo demonstrates a different approach:
- Show a working URL
- Let users interact
- Learn from behavior, not speculation

Students stop guessing and start testing.

---

## What’s intentionally out of scope

To keep the demo focused and teachable:
- No authentication
- No editing or deleting notes
- No EHR integration
- No AI summarization or clinical decision support

Those are **future extensions**, not prerequisites for learning.

---

## Teaching takeaway

You do not need:
- Large teams
- Heavy infrastructure
- Months of planning

You need:
- A real problem
- Clear intent
- A tight feedback loop

This demo exists to make that tangible.