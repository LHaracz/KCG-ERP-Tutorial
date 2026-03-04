# KCG Ventures ERP (BotanIQals + MiniLeaf) — App Idea

## One-sentence summary
A production planning + inventory + costing ERP for a shared facility (BotanIQals + MiniLeaf) that replaces Google Sheets by generating production cycles, feasibility checks, tray schedules, and daily production reminders.

## What problem this solves
Right now production planning lives in complex Google Sheets with Apps Script. It works, but it's hard to scale, hard to audit, and hard to standardize across both BotanIQals and MiniLeaf. This app becomes the system-of-record for:
- production cycles and targets
- freeze dryer capacity feasibility
- raw material inventory and cycle counts
- microgreen growing parameters and yield tracking
- product BOMs (inputs per finished product)
- cost, revenue, and gross profit projections
- tray-level production schedules and daily task reminders

## Who uses it
- Production managers (plan cycles, approve feasibility, review cost/profit)
- Operators (log tray yields, follow tray plan tasks like soak/sow/light/harvest)
- Inventory/cycle count person (update on-hand and reconcile counts)

## Out of scope
- Customer transactions: no orders, invoices, payments, customers, shipping, POS (handled elsewhere)
- Full accounting system (we only track production-related costs and projected margins)
- Complex procurement workflows (purchase orders can be a later phase)

---

# Core user workflow (the “happy path”)

## 1) Set up the system (master data)
1. Enter/update **Freeze Dryer Calibration** (UI editable).
2. Maintain **Inventory Items** (raw materials + packaging + supplies), including cost/unit.
3. Maintain **Microgreen Guide** for each microgreen:
   - soak required?
   - germination days
   - grow days / days to harvest
   - sowing rate per tray
   - any other growing parameters needed for scheduling + email reminders
4. Maintain **Products** (finished goods), including selling price and shelf life.
5. For each product, build a **BOM (Bill of Materials)** by selecting inputs from inventory items and specifying the qty/unit per finished unit.

## 2) Plan a production cycle
1. Create a **Production Cycle** and set:
   - start date
   - end date (inclusive cycle window)
2. Enter planned output targets:
   - manually set target units for each product to produce in this cycle
3. The system calculates:
   - Freeze dryer feasibility (capacity vs required cycles within the window)
   - Resource feasibility (inventory sufficiency vs required inputs)
   - Projected cost incurred, revenue, and gross profit
   - A tray production plan (runs, trays per run, and dated tasks)

## 3) Execute production and log yields
- Use a **Yield Logging** page with two modes:
  - **Create new microgreen** (adds a new microgreen to the system quickly)
  - **Choose existing microgreen** (dropdown of existing microgreens)
- Submit tray-level harvest yields (fresh and optionally dried).
- The system calculates rolling averages per microgreen and uses them to improve planning.

## 4) Daily production reminders (optional but desired)
- The system should be able to email daily reminders (like Google Sheets Apps Script):
  - Soak today
  - Drain today
  - Sow today
  - Move to light today
  - Harvest today
- These reminders are derived from the tray plan and microgreen parameters.

---

# Key modules (pages)

## 1) Home / Dashboard
- Quick links to modules
- Summary of current/active production cycle(s)
- High-level feasibility status and shortages alerts

## 2) Freeze Dryer Calibration (separate page)
Editable UI (no code changes). Single calibration profile for now.

Fields:
- number_of_freeze_dryers
- trays_per_machine_per_cycle
- cycle_time_hours
- defrost_cleaning_hours
- operating_hours_per_day
- operating_days_per_week
- fresh_load_per_tray_g
- dry_matter_fraction

Derived values shown:
- hours_per_cycle
- per_cycle_fresh_capacity

## 3) Inventory Ledger + Cycle Count
Inventory Items:
- name, unit, cost_per_unit, quantity_on_hand, optional par_level
Cycle Count workflow:
- enter counted quantity (absolute)
- app computes delta and records an append-only adjustment log
- updates on-hand and records last_count_date
Adjustment types:
- purchase, usage, cycle_count, correction

## 4) Products + BOM Editor
Create new products and manage existing products.

Product fields:
- name
- unit (bottle, pouch, jar, etc.)
- sale_price_per_unit
- shelf_life_days (optional)
- notes

BOM Editor:
- show all inventory items
- user can add inputs to the product (select from list)
- set qty per unit + unit label
- save so product becomes usable in production planning

## 5) Microgreen Guide (master grow parameters)
Create and maintain microgreens with all variables needed for planning + email alerts.

Minimum fields:
- name (unique)
- soaking_required (boolean)
- germination_days
- days_to_harvest (or grow_days)
- sow_rate_g_per_tray
- optional: fresh_yield_estimate_g (or derived from yield entries)
- optional: notes

(Any microgreen-related variable in the legacy email reminder code should live here as a field.)

## 6) Yield Logging
Form supports:
- **Create new microgreen** button (quick create + select)
- **Choose existing microgreen** button (dropdown/search)
Fields:
- microgreen
- harvest_date
- fresh_yield_g
- dried_yield_g (optional)
- tray_identifier / run_identifier (optional)

Outputs:
- recent entries list
- rolling averages per microgreen (fresh + dried)

## 7) Production Cycles + Planner
Cycle creation:
- start_date
- end_date (inclusive)
- status (draft/planned/completed)

Targets:
- list of products and target units for the cycle

Planner output:
- Freeze dryer feasibility results
- Resource feasibility results (shortages)
- Projected costs, revenue, gross profit
- Generated tray production plan lines:
  - microgreen, run#, trays, soak/sow/light/harvest dates

## 8) Email Reminders (later phase)
- Settings page to configure recipient emails
- Daily email summarizing tasks derived from tray plan lines and microgreen parameters

---

# Freeze Dryer feasibility (core formulas)
Given:
- production_days = inclusive days between start and end
- hours_per_cycle = cycle_time_hours + defrost_cleaning_hours
- per_cycle_fresh_capacity = number_of_freeze_dryers * trays_per_machine_per_cycle * fresh_load_per_tray_g
- total_available_hours = production_days * operating_hours_per_day
- max_cycles_available = floor(total_available_hours / hours_per_cycle)

Compute:
- fresh_needed_g = dried_needed_g / dry_matter_fraction
- cycles_needed = fresh_needed_g / per_cycle_fresh_capacity
- feasible if max_cycles_available >= ceil(cycles_needed)

---

# Success criteria (v1)
- Users can create/edit calibration
- Users can create/edit microgreens
- Users can create/edit inventory items and cycle count them
- Users can create/edit products and BOMs
- Users can create a production cycle, set targets, and generate:
  - freeze dryer feasibility
  - inventory sufficiency/shortages
  - cost/revenue/profit projections
  - tray production schedule lines
- Users can log yields with the create/choose microgreen UX
- (Optional) email reminders can be implemented after core app works