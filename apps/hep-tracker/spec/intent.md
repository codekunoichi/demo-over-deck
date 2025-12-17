# HEP Tracker – Intent

## Purpose
Create a simple demo application that shows how a Physical Therapist and a patient can track Home Exercise Program (HEP) compliance using a lightweight, non-EHR tool.

This is a demo to illustrate possibility and product thinking, not a production system.

Review the `../public/assets/sketch.png` file for the outline of the UI mockup grid.

## Core Insight
Entities are nouns (data).  
Views are screens (actions).  
Storage is where truth lives.

## Primary Users
- Physical Therapist (sets the program)
- Patient (logs daily activity)

## Core Problem
PTs prescribe exercises, but have poor visibility into whether patients actually complete them between visits.

Current EHRs do not provide a simple, patient-friendly compliance view that can be quickly demonstrated or iterated on.

## Non-Goals
- No billing
- No authentication
- No PHI
- No EHR integration
- No notifications or reminders

## Data Model (Entities)
- Patient (PID, Name)
- Exercise / HEP (HEPID, Name, TargetMinutesPerDay)
- Assignment (PID, HEPID, TargetMinutesPerDay)
- Daily Log (PID, Date, HEPID, MinutesCompleted)

Notes:
- `MinutesCompleted` is the primary stored outcome (integer, required).
- `Done` is derived from `MinutesCompleted > 0` and is not stored.

## Views
### 1. PT Setup View
- Select patient
- Prescribe exercises
- Set target minutes per day per exercise

### 2. Patient Daily Entry View
- Date auto-filled
- Log minutes completed for the day

### 3. Weekly Compliance View
- Calendar-style layout
- Green if `MinutesCompleted >= TargetMinutesPerDay`
- Red otherwise

### 4. Day Drill-Down View
- Show minutes completed
- Show Done / Not Done status (derived)

## Business Rules
- A day is green if `MinutesCompleted >= TargetMinutesPerDay`
- A day is red otherwise
- Done / Not Done is a visualization, not stored state

## Storage
- CSV files for demo data (`patients.csv`, `hep_list.csv`, `daily_log.csv`)
- Browser localStorage for persistence
- No backend services

## Assumptions
- Demo uses fake data only
- Patient list is mocked
- Designed to be deployable as a static site

## Non-Goals (Explicit)
- Authentication and user management
- Clinician dashboards
- Analytics or reporting
- Writing back to an EHR