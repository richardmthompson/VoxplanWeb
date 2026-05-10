# VoxPlanWeb — Strategy

**Last Updated:** 2026-05-10

---

## Current Strategy — "Interface Refinements"

**Since:** 2026-05-10

### Why This Strategy

Phase B (layout + theme rewrite) is complete. The visual foundation works — Dagre LR layout, AR Labs neo-brutalist theme, seed data, keyboard nav. Before connecting to a backend or adding features, refine the interface based on actual usage.

### What We're Doing

- TBD — pending grill-me session to identify specific refinements

### What We're NOT Doing (This Phase)

- Supabase/Postgres backend
- VOX Agent API integration
- Voice interface connection
- Mobile responsive (desktop-first)
- Multi-user / authentication

---

## Strategy Log

### 2026-05-10: Phase B Complete → Interface Refinements

**Context:** Phase B rewrite (PAI-lmc epic, 5 children) completed. All core visual work done: Dagre LR layout, AR Labs theme, seed data, keyboard nav, dead code cleanup. Previous agent closed beads but did not commit code or update docs — remediated this session with proper commit and doc updates.

**Rationale:** Visual foundation is solid. Iterate on interface polish before adding infrastructure (persistence, backend). Cheaper to refine the UI while it's pure client-side.

### 2026-05-10: Initial Strategy Set — "Fix Layout, Theme, Seed Data"

**Context:** VoxPlanWeb existed as a Replit-originated React Flow app. Layout broken (D3), theme wrong (Material Design 3), no persistence. Decision: fix what exists before connecting to distributed backend.

**Rationale:** Proven UI components (ReactFlow, Zustand, tree operations) shouldn't be discarded. Fix the visual layer first, verify it matches session tree conventions, then connect to data backend.

**Outcome:** Completed. All 5 beads children closed. Code committed as `cb48f74`.

---

## Remaining Known Issues (Prioritized)

1. **P2 — No persistence:** Data lives in Zustand only, seeded from static file. Next phase: backend.
2. **P2 — Seed data static:** Hardcoded snapshot, not synced with live beads.
3. **P3 — Node anatomy incomplete:** Cards show title, dept badge, status, deadline. Missing: allocation %, depends/releases metadata from theme-reference.md spec.
