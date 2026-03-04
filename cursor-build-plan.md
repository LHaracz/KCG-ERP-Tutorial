# Cursor Build Plan — BotanIQals ERP

This document outlines the step-by-step development sequence for building the BotanIQals ERP system using Cursor.

---

# Phase 1 — Project Foundation

1. Create Next.js project
2. Configure Tailwind
3. Install Supabase client
4. Create environment variables
5. Configure Supabase connection utilities

Goal: working application skeleton.

---

# Phase 2 — Database Setup

Create tables:

freeze_dryer_calibration  
tray_yield_logs  
yield_statistics  
batch_plans  
inventory_items  
inventory_transactions  
finished_goods_batches  

Seed initial freeze dryer calibration row.

Goal: persistent system configuration.

---

# Phase 3 — Freeze Dryer Calibration UI

Create page:

/calibration/freeze-dryer

Features:

Editable inputs:
- freeze dryer count
- trays per cycle
- cycle time
- cleaning time
- operating hours per day
- fresh load per tray
- dry matter fraction

Derived read-only fields:
- hours per cycle
- per-cycle capacity

Goal: allow operational variables to be changed without modifying code.

---

# Phase 4 — Feasibility Engine

Implement calculation module.

Inputs:

production_start_date  
production_end_date  
total_fresh_needed  

Outputs:

production_days  
hours_needed  
cycles_needed  
max_cycles_available  
feasible_flag  
shortage_cycles  
shortage_hours  

Goal: replicate spreadsheet freeze dryer model in application code.

---

# Phase 5 — Yield Logging System

Create page:

/yield-log

Features:

form submission per tray harvest.

Fields:

microgreen type  
harvest date  
fresh weight  
optional dried weight  

Goal: collect yield observations.

---

# Phase 6 — Yield Statistics

Aggregate yield logs to produce:

avg fresh yield per tray  
avg dried yield per tray  

Goal: feed accurate yield data into planning calculations.

---

# Phase 7 — Batch Planner

Create page:

/batch-planner

Inputs:

target ingredient  
target dried weight  
production start date  
production end date  

Outputs:

fresh required  
trays required  
cycles required  
hours required  
feasible freeze dryer  

Goal: translate ingredient targets into production plans.

---

# Phase 8 — Inventory Ledger

Create pages:

/inventory  
/inventory/transactions  

Features:

inventory item list  
manual adjustments  
ledger history  

Goal: maintain traceable inventory.

---

# Phase 9 — Inventory Sufficiency Check

Before batch approval:

compare required inputs vs inventory on hand.

Return shortages.

Goal: prevent planning batches that cannot be executed.

---

# Phase 10 — Finished Goods Tracking

Create production output records.

Fields:

batch id  
product name  
quantity produced  
production date  
expiration date  

Goal: trace finished products.

---

# Phase 11 — Dashboard

Create dashboard summarizing:

inventory levels  
upcoming batches  
freeze dryer utilization  
yield trends  

Goal: provide operational visibility.

---

# Phase 12 — Future Expansion

Cosmetics production tracking  
MiniLeaf production scheduling  
automated alerts  
AI-assisted planning

---

# Development Principles

- No hardcoded production assumptions
- append-only ledgers for traceability
- modular service architecture
- spreadsheet-style configurability