# Phase B: VoxPlanWeb PRP Generation + Implementation

**STATUS: COMPLETED** — 2026-05-10. All 5 beads children closed (PAI-lmc.1–.5). Code committed as `cb48f74`.

Below is the original execution plan, preserved for reference.

## What To Do

1. Read `CLAUDE.md` — project outcome, directory structure, tech stack
2. Read `STRATEGY.md` — current approach, known issues, what we're doing/not doing
3. Read `docs/codebase-walkthrough.md` — full codebase analysis (every core file documented)
4. Read `docs/theme-reference.md` — AR Labs visual target (colors, fonts, node anatomy, CSS)
5. Read `docs/conventions.md` — tree semantics (hierarchy, edges, states, departments)
6. Read `docs/dagre-reactflow-patterns.md` — Dagre LR integration (code, gotchas, what to remove)
7. Read `docs/seed-data.ts` — 22 beads items mapped to Goal interface + helper functions

Then invoke: `/prp-commands:prp-base-create VoxPlanWeb Layout + Theme Rewrite`

PRP should reference all docs/ files as context. Everything needed is in this repo — no external repo access required.

## Beads Epic

`PAI-lmc` — VoxPlanWeb: Layout + Theme Rewrite (5 children)

Work through beads sequentially:
```
PAI-lmc.1  Replace D3 with Dagre LR        [open, P1]
PAI-lmc.2  AR Labs neo-brutalist theme      [open, P1, blocked by .1]
PAI-lmc.3  Seed with beads test data        [open, P1, blocked by .2]
PAI-lmc.4  Keyboard nav verify + enhance    [open, P2, blocked by .3]
PAI-lmc.5  Clean dead code                  [open, P3, independent]
```

For each bead: `bd update PAI-lmc.X --status in_progress` before starting, `bd close PAI-lmc.X -r "reason"` after completing. Close children before parent. Never use `--force` on `bd close`.

## Key Existing Code (Already Works — Don't Rebuild)

- **Keyboard nav h/j/k/l** already mapped in `client/src/pages/Home.tsx` lines 103-148
- **treeStore navigation** (up/down/left/right) already in `client/src/stores/treeStore.ts`
- **CommandWindow + AttributeWindow** — floating panels, already functional
- **ReactFlow Provider** wrapper in TreeCanvas.tsx — keep structure, change internals

## What Changes

| File | Action | Why |
|------|--------|-----|
| `client/src/utils/layouts.ts` | REWRITE | D3 → Dagre LR. See dagre-reactflow-patterns.md |
| `client/src/components/tree/GoalNode.tsx` | REWRITE | SVG shapes → div cards. See theme-reference.md |
| `client/src/components/tree/TreeCanvas.tsx` | MODIFY | Handle positions, edge type, remove layout toggle |
| `client/src/stores/treeStore.ts` | MODIFY | Extend Goal interface (dept, status, deadline). Remove totalheight, manualPositions, LayoutMode |
| `client/src/data/seedData.ts` | CREATE | Copy from docs/seed-data.ts into src |
| `client/src/pages/Home.tsx` | MODIFY | Verify keyboard after layout change, add follow mode |
| `tailwind.config.ts` | MODIFY | AR Labs colors + fonts |
| `client/src/index.css` | MODIFY | Theme variables |
| `client/src/components/layout/Header.tsx` | MODIFY | Rebrand to VoxPlanWeb + AR Labs style |
| `package.json` | MODIFY | Add `@dagrejs/dagre`, remove `d3-hierarchy` |
| `client/src/components/examples/*` | DELETE | 8 dead code files |

## Verification After Each Task

1. `npm run dev` — no errors
2. Open browser — tree renders
3. Use Playwright MCP to screenshot and verify:
   - LR layout (root left, leaves right)
   - Correct node colors (yellow root, mint active, white blocked)
   - Dept badges visible
   - Edges flow left-to-right, smoothstep routing
   - h/j/k/l navigation works
   - No phantom nodes, no layout jitter

## Rules

- Read `docs/` files before coding — they contain all design decisions
- Check `bd show PAI-lmc.X` before starting each task for deps
- Use Playwright to verify visual output — don't assume from code
- Don't add features not in the plan — no Supabase, no voice, no mobile
- Existing keyboard nav WORKS — verify, don't rewrite
