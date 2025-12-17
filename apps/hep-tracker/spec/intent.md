# HEP Tracker – Intent

## Goal
Create a simple demo application that shows how a Physical Therapist and a patient can track Home Exercise Program compliance using a lightweight, non-EHR tool.

This is a demo to illustrate possibility, not a production system.

Review the ../public/assets/sketch.png file for the outline of the UI Mockup Grid.

## Primary User
- Physical Therapist (sets program)
- Patient (logs daily activity)

## Core Problem
PTs prescribe exercises, but have poor visibility into whether patients actually complete them between visits.

Current EHRs do not provide a simple, patient-friendly compliance view.

## Non-Goals
- No billing
- No authentication
- No PHI
- No EHR integration

## Data Model (High-Level)
- Patient
- Exercise (HEP)
- Assignment (PT → Patient)
- Daily Log (Patient activity)

## Key Views
1. PT Setup View  
   - Select patient  
   - Prescribe exercises  
   - Set target minutes per day

2. Patient Daily Entry  
   - Date auto-filled  
   - Log minutes per exercise  

3. Weekly Compliance View  
   - Color-coded days  
   - Green if target met  
   - Red if not met  

4. Day Drill-Down  
   - Per-exercise completion details

## Rules
- A day is green if total minutes ≥ target minutes
- A day is red otherwise
- Data is stored locally in CSV or browser storage

## Assumptions
- Demo uses fake data
- No backend services
- Designed to be deployable as a static site