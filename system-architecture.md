# KCG Ventures ERP — System Architecture (Bootcamp Stack)

## Goal
Build a production planning ERP for BotanIQals + MiniLeaf that replaces Google Sheets planning, feasibility checks, tray scheduling, yield logging, and inventory tracking—without handling customer/POS workflows.

## Tech stack (bootcamp-required)
- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS
- InstantDB (`@instantdb/react`) for database + auth (Magic Code)
- Vercel for deployment
- GitHub for version control

> Note: Email reminders are an optional phase and may require additional infrastructure (email provider + scheduled job/cron).

---

# Architecture overview

## Frontend (Next.js App Router)
- Provides UI pages for each module.
- Uses shared layout with navigation.
- Uses InstantDB React hooks for queries/mutations.
- Authenticated routes are protected via an AuthGuard pattern.

## Backend / Database (InstantDB)
- Stores all entities: calibration, microgreens, yields, products, BOM lines, inventory, adjustments, production cycles, targets, tray plan lines.
- Handles authentication via Magic Code.
- Permissions ensure users only see and edit allowed records.

---

# Core entities (data model)

## Calibration
Purpose: user-editable operational assumptions for the freeze dryer.

Fields:
- number_of_freeze_dryers
- trays_per_machine_per_cycle
- cycle_time_hours
- defrost_cleaning_hours
- operating_hours_per_day
- operating_days_per_week
- fresh_load_per_tray_g
- dry_matter_fraction

Rules:
- Single calibration profile for v1 (one per user or one global; choose and enforce explicitly in implementation).

Derived UI metrics:
- hours_per_cycle
- per_cycle_fresh_capacity

---

## Microgreens (Microgreen Guide)
Purpose: master grow parameters used for scheduling and reminders.

Fields (minimum):
- name (unique)
- soaking_required (boolean)
- germination_days
- days_to_harvest
- sow_rate_g_per_tray
- notes (optional)

Optional additional fields (recommended):
- default_soak_offset_days (typically 1 day before sowing)
- light_offset_days (computed from germination_days but can be overridden)
- harvest_offset_days (computed from days_to_harvest but can be overridden)
- any additional microgreen variables needed for reminder logic

---

## Yield Entries
Purpose: tray-level observations used for yield averages and planning.

Fields:
- microgreen (link)
- harvest_date (ISO string)
- fresh_yield_g
- dried_yield_g (optional)
- tray_identifier (optional)
- created_at

Computed:
- rolling averages per microgreen (fresh and dried)

UX requirement:
- Yield form has two actions:
  - Create new microgreen (inline create)
  - Choose existing microgreen (dropdown/search)

---

## Inventory Items + Adjustments (cycle count + audit)
Inventory Items fields:
- name (unique)
- unit
- cost_per_unit
- quantity_on_hand
- par_level (optional)
- last_count_date (optional)

Inventory Adjustments fields (append-only log):
- inventory_item (link)
- adjustment_type ("purchase","usage","cycle_count","correction")
- quantity_delta
- note (optional)
- created_at

Rules:
- quantity_on_hand updates based on adjustments.
- Cycle count sets absolute counted quantity and creates delta adjustment.

---

## Products + BOM
Products fields:
- name (unique)
- unit
- sale_price_per_unit
- shelf_life_days (optional)
- notes (optional)

BOM Lines fields:
- product (link)
- inventory_item (link)
- qty_per_unit
- unit_label (string)

Rules:
- Users can create new products.
- Users can add any inventory item as an input.
- BOM is used in planning to compute required resources and cost.

---

## Production Cycles + Targets + Plan Lines
Production Cycle fields:
- start_date (ISO)
- end_date (ISO)
- status ("draft","planned","completed")
- created_at

Production Target fields:
- production_cycle (link)
- product (link)
- target_units

Production Plan Lines fields (generated output):
- production_cycle (link)
- microgreen (link)
- run_number
- trays_this_run
- soak_date (optional ISO)
- sow_date (ISO)
- light_date (ISO)
- harvest_date (ISO)

---

# Business logic / Calculations

## 1) Inclusive production window
Compute production days:
- `production_days = floor((end - start)/ms_per_day) + 1`

## 2) Freeze dryer feasibility
Using calibration:
- hours_per_cycle = cycle_time_hours + defrost_cleaning_hours
- per_cycle_fresh_capacity = number_of_freeze_dryers * trays_per_machine_per_cycle * fresh_load_per_tray_g
- total_available_hours = production_days * operating_hours_per_day
- max_cycles_available = floor(total_available_hours / hours_per_cycle)

Convert target dried requirement → fresh requirement:
- fresh_needed_g = dried_needed_g / dry_matter_fraction

Compute cycles needed:
- cycles_needed = fresh_needed_g / per_cycle_fresh_capacity
- feasible if max_cycles_available >= ceil(cycles_needed)

## 3) Resource feasibility (inventory sufficiency)
For each production target:
- required_qty(item) = sum_over_products(target_units * bom.qty_per_unit)
Compare:
- shortage = max(0, required_qty - quantity_on_hand)

Output:
- shortages table (item, required, on_hand, shortage, unit)

## 4) Cost + Revenue + Gross Profit projections
- material_cost = sum(required_qty * cost_per_unit)
- revenue = sum(target_units * sale_price_per_unit)
- gross_profit = revenue - material_cost

Output per cycle:
- totals + per-product breakdown

## 5) Tray plan generation (Google Sheets-like scheduling)
Inputs:
- microgreen guide parameters (soak_required, germination_days, days_to_harvest, sow_rate)
- yield averages (fresh yield per tray) OR fallback defaults
- cycle window (start/end)
- mapping from required ingredient powder to microgreen

Outputs:
- production_plan_lines with run#, trays, and soak/sow/light/harvest dates

Reminder logic depends on:
- soak date (day before sow if soaking_required)
- sow date
- light date (sow + germination_days)
- harvest date (from plan line)

---

# UI pages (routes)

## Public
- `/login` — Magic Code login

## Protected
- `/` — dashboard
- `/calibration` — edit calibration
- `/microgreens` — microgreen guide CRUD
- `/yield` — yield logging + averages
- `/products` — products CRUD + BOM editor
- `/inventory` — inventory CRUD + adjustments + cycle count
- `/cycles` — list/create cycles + set targets
- `/cycles/[id]/plan` — feasibility + shortages + cost/profit + generate tray plan
- `/settings/notifications` (optional) — email recipients, enable/disable reminders

---

# Permissions / Security (InstantDB)
- Only authenticated users can access production data.
- Users can only read/write records they own unless we later introduce an organization/shared facility model.
- No sensitive credentials are stored client-side.

---

# Email reminders (optional phase)
Goal:
- Daily email listing tasks due today:
  - soak, drain, sow, move to light, harvest
Derived from:
- production_plan_lines + microgreen guide parameters

Implementation options:
1) Email provider (Resend/SendGrid/Postmark) + scheduled cron (Vercel Cron)
2) Gmail API OAuth (more setup)
3) SMTP Gmail (least reliable)

Recommended for reliability:
- Provider + cron

---

# Phased build plan (high level)

## Phase 1 (foundation)
- Auth + navigation + schema
- Calibration page
- Microgreens CRUD
- Inventory CRUD + adjustments basics
- Products CRUD + BOM editor basics

## Phase 2 (planning)
- Production cycles + targets
- Feasibility calculations
- Resource sufficiency + shortages
- Cost/revenue/profit projections

## Phase 3 (tray schedule + yields)
- Tray plan generation
- Persist plan lines
- Yield logging UX (create vs choose microgreen)
- Rolling averages and planning improvements

## Phase 4 (notifications)
- Notification settings
- Email generation from today’s plan lines
- Scheduling via cron