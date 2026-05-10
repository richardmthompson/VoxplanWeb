# VoxPlanWeb

**Location:** `~/CODE/VoxplanWeb/`
**Purpose:** Visual dependency tree interface for VOX goal management. React Flow canvas rendering beads task DAG.
**Status:** Phase B complete — Dagre LR layout, AR Labs theme, seed data, keyboard nav all working
**Parent project:** VOX OS (`vox-systems-inc/VOX-OS/` in VOX repo)

---

## Outcome

A browser-accessible dependency tree viewer that renders the same goal hierarchy managed by beads. Dagre LR layout (root left, leaves right), neo-brutalist AR Labs theme, vim-style keyboard navigation. Accessible from any device. Eventually connected to shared Postgres backend.

## Current Strategy

See **STRATEGY.md** for approach and next steps.

## Directory Structure

```
VoxplanWeb/
├── CLAUDE.md              # This file — outcome + navigation
├── STRATEGY.md            # Current approach, next steps
├── docs/                  # Reference docs
│   ├── codebase-walkthrough.md  # Full codebase analysis
│   ├── theme-reference.md       # AR Labs visual spec (implemented)
│   ├── conventions.md           # Tree semantics (hierarchy, edges, states)
│   ├── dagre-reactflow-patterns.md  # Dagre integration reference
│   └── PHASE-B-PLAN.md         # Completed execution plan (archived)
├── client/
│   └── src/
│       ├── components/
│       │   ├── tree/      # TreeCanvas.tsx, GoalNode.tsx (core rendering)
│       │   ├── windows/   # CommandWindow, AttributeWindow
│       │   ├── layout/    # Header (legend, breadcrumb, mode switcher)
│       │   ├── dialogs/   # HelpDialog
│       │   └── ui/        # shadcn/ui components
│       ├── stores/        # treeStore.ts (Zustand), uiStore.ts
│       ├── data/          # seedData.ts (22 beads items)
│       ├── utils/         # layouts.ts (Dagre LR layout)
│       ├── pages/         # Home.tsx (main page + keyboard handler)
│       └── hooks/         # use-mobile, use-toast
├── server/                # Express scaffold — routes empty, no persistence
├── shared/                # Schema (User only — no Goal schema on server)
└── package.json           # React 18, ReactFlow 11, Zustand, Dagre, Vite
```

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Canvas | ReactFlow 11 | Custom GoalNode (div cards), smoothstep edges, LR handles |
| State | Zustand 5 | treeStore (goals Map), uiStore (mode, panels) |
| Layout | @dagrejs/dagre | LR direction, 60px nodesep, 120px ranksep |
| Styling | Tailwind 3.4 + Radix UI | AR Labs neo-brutalist theme, Outfit + JetBrains Mono |
| Server | Express 4.21 | Scaffold only — no routes, no persistence |
| Build | Vite 5.4 + esbuild | `npm run dev` for client+server |

## Key Files

| File | Lines | What it does |
|------|-------|-------------|
| `client/src/stores/treeStore.ts` | 192 | Goal data model (Map), tree operations, hjkl navigation |
| `client/src/components/tree/TreeCanvas.tsx` | 208 | ReactFlow canvas, Dagre layout, follow mode, zoom |
| `client/src/components/tree/GoalNode.tsx` | 105 | Neo-brutalist card nodes, state colors, dept badges |
| `client/src/utils/layouts.ts` | 50 | Dagre LR layout function |
| `client/src/pages/Home.tsx` | 170 | Main page — canvas + floating windows + keyboard |
| `client/src/data/seedData.ts` | 234 | 22 beads items mapped to Goal interface |
| `client/src/components/layout/Header.tsx` | 151 | Title, mode switcher, breadcrumb, legend, node count |
| `client/src/components/windows/CommandWindow.tsx` | 239 | Terminal-style command input with history |
| `client/src/components/windows/AttributeWindow.tsx` | 170 | Floating editor for goal name/details |

## Data Model

```typescript
interface Goal {
  id: number;
  name: string;
  details: string;
  parentId: number | null;
  position: { x: number; y: number };
  dept?: string;                                    // eng, rd, bd, content, product
  status: 'open' | 'in_progress' | 'blocked' | 'closed';
  deadline?: string;                                // YYYY-MM-DD
  beadsId?: string;                                 // e.g. PAI-9ji
}
```

No backend persistence. Goals seeded from `seedData.ts` on mount, live in Zustand store (browser memory only).

## Remaining Known Issues

1. **No persistence:** Refresh reloads seed data. No backend API.
2. **Seed data static:** Hardcoded snapshot from 2026-05-10. Not synced with live beads.

## Related (in VOX repo)

| What | Where |
|------|-------|
| VOX OS product spec | `vox-systems-inc/VOX-OS/VOX-OS.md` |
| VOX OS index + build path | `vox-systems-inc/VOX-OS/CLAUDE.md` |
| Session tree conventions | `.claude/skills/session-tree/CONVENTIONS.md` |
| Session tree viewer PRP | `working/2026-04-28-centralized-session-tree-viewer.md` |
| Beads reference (rules) | `.claude/rules/beads-reference.md` |
| Current beads state | `bd list --status=all --long` |
| AR Labs theme reference | Session tree HTML files in `scratchpad/session-trees/` |
| Phase B screenshots | `scratchpad/2026-05-10-voxplanweb/` (17 PNGs) |
