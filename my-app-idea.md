# KCG Ventures ERP

## Project Name
**KCG Ventures ERP**

## Purpose
KCG Ventures ERP is a production planning and inventory management system designed to manage all operations occurring under a shared production facility. The system integrates production planning, freeze-dryer capacity modeling, ingredient yield tracking, and inventory management into a single application.

The goal is to replace complex Google Sheets workflows with a structured application while preserving the flexibility of spreadsheet-style configuration.

The system will eventually support both **KCG Ventures** supplement production and **MiniLeaf** microgreens production.

---

# Core Objectives

1. Allow production planning based on **target ingredient batch size**.
2. Calculate **freeze dryer feasibility** based on equipment calibration and production window.
3. Track **yield data from individual trays** via form submissions.
4. Maintain **inventory ledgers** and ensure required inputs are available before production.
5. Allow **all operational variables to be configurable through the UI**, not hard-coded.
6. Track all production batches and finished goods for traceability.

---

# Key System Constraints

## 1. No Hardcoded Production Variables
All variables used in production calculations must be editable through the application interface.

Examples include:

- number of freeze dryers
- trays per machine per cycle
- freeze drying cycle duration
- cleaning/defrost time
- fresh load per tray
- dry matter fraction

These will be stored in the database and edited via a **Freeze Dryer Calibration page**.

---

## 2. Production Window Uses Explicit Dates

Production feasibility must be calculated based on:

production_days = (production_end_date - production_start_date) + 1

Days are **inclusive**, matching the behavior currently used in spreadsheets.

---

## 3. Feasibility Requires Two Conditions

A production batch is only feasible if:

### Condition 1 — Freeze Dryer Capacity
The freeze dryer must be able to process the required amount of fresh material within the production window.

### Condition 2 — Inventory Availability
All required inputs must exist in inventory at sufficient quantities.

---

# Core Modules

## 1. Freeze Dryer Calibration

Page where operational assumptions are editable.

Editable fields include:

- number of freeze dryers
- trays per machine per cycle
- cycle time (hours)
- defrost / cleaning time (hours)
- operating hours per day
- operating days per week
- fresh load per tray (g)
- dry matter fraction

Derived fields (read-only):

- hours per cycle
- per-cycle fresh capacity
- total available hours for selected window
- maximum cycles possible

Only **one calibration profile exists for now**, but system design should allow multiple profiles in the future.

---

# 2. Yield Logging

Yield data is collected via a form submission after each tray harvest.

Each entry records:

- microgreen type
- tray harvest date
- fresh harvested weight
- optional dried output weight
- tray identifier (optional)

The system calculates rolling averages:

- average fresh yield per tray
- average dried yield per tray

These averages are used when estimating production requirements.

---

# 3. Batch Planner

Production batches are created based on a **target dried ingredient amount**.

Example:

Target: 5000g broccoli powder

The planner calculates:

- fresh weight required
- trays required
- freeze dryer cycles required
- total hours required

Inputs:

- production start date
- production end date
- target ingredient
- target dried weight

Outputs:

- trays required
- cycles required
- hours required
- feasibility status

---

# 4. Freeze Dryer Feasibility Model

Derived values:

hours_per_cycle = cycle_time + defrost_time

per_cycle_fresh_capacity =
freeze_dryers *
trays_per_machine_per_cycle *
fresh_load_per_tray

total_available_hours =
production_days * operating_hours_per_day

max_cycles_available =
floor(total_available_hours / hours_per_cycle)

cycles_needed =
fresh_needed / per_cycle_fresh_capacity

Feasible if:

max_cycles_available >= ceil(cycles_needed)

If not feasible, system reports:

- shortage cycles
- shortage hours
- shortage fresh material capacity

---

# 5. Inventory Ledger

Inventory must track all consumable resources including:

- ingredients
- packaging
- production materials

Inventory tables include:

### inventory_items

id  
name  
unit  
quantity_on_hand  

### inventory_transactions

Append-only ledger recording:

- purchase receipts
- consumption
- adjustments

This ensures traceability and prevents double-counting.

---

# 6. Inventory Sufficiency Check

Before production begins the system must verify:

required_quantity <= quantity_on_hand

For all required materials.

If shortages exist the system returns:

item  
required  
available  
shortage  

This acts as the second feasibility gate.

---

# 7. Finished Goods Tracking

Production outputs must be logged as batches.

Each batch records:

batch_id  
product_name  
quantity_produced  
date_produced  
expiration_date  

Expiration dates are calculated using product shelf life rules.

---

# Long-Term Expansion

Future phases of the system will integrate additional operations.

### Cosmetics Production

Batch tracking for:

- toothpaste
- chewing gum
- mineral mouth rinse

Including:

- formulations
- packaging requirements
- batch traceability

---

### MiniLeaf Integration

The system will also support microgreens production including:

- tray scheduling
- sowing dates
- germination periods
- harvest tracking
- production alerts

Eventually the ERP will track **all production activities under one roof**.

---

# Technology Stack (Proposed)

Frontend  
Next.js  
React  
Tailwind  

Backend  
Supabase  
Postgres  

Hosting  
Vercel  

Development Environment  
Cursor IDE  

---

# Design Philosophy

The system should behave like a **structured spreadsheet with guardrails**.

Key principles:

- editable operational parameters
- clear production traceability
- append-only ledgers for critical data
- no hardcoded assumptions
- modular expansion capability

---

# Target Users

Primary users include:

- KCG Ventures production managers
- MiniLeaf production operators
- founders managing planning and inventory

The system should be usable by small teams with minimal training.