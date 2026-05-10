# VoxPlanWeb Codebase Walkthrough

*2026-05-10T05:13:34Z by Showboat 0.6.1*
<!-- showboat-id: f3e0d861-5be8-4f3d-84cb-d50a1d09978c -->

Generated 2026-05-10 via Showboat from actual source files. Phase B rewrite complete — Dagre LR layout, AR Labs neo-brutalist theme, beads seed data, vim keyboard nav.

## Architecture

Client-server monorepo. React 18 + Express 4. Vite bundles frontend. Backend is scaffold-only (no routes, no persistence). All data lives in Zustand stores, seeded from static beads data on mount.

**Origin:** Built on Replit (Nov 2025). Migrated to local dev. Phase B rewrite (May 2026) replaced D3 layout with Dagre, Material Design with AR Labs neo-brutalist.

## Data Flow

```
seedData.ts → treeStore (Zustand Map<number, Goal>)
  → TreeCanvas builds ReactFlow nodes/edges
    → Dagre computes LR positions (layouts.ts)
      → GoalNode renders neo-brutalist cards
        → Keyboard nav (Home.tsx) updates activeGoalId
          → Follow mode pans canvas to active node
```

## Core Files

### Data Model — `client/src/stores/treeStore.ts` (192 lines)

Zustand store with `Map<number, Goal>` as primary data structure. The Goal interface defines every node in the tree:

```bash
sed -n '3,14p' client/src/stores/treeStore.ts
```

```output
export interface Goal {
  id: number;
  name: string;
  details: string;
  parentId: number | null;
  position: { x: number; y: number };
  dept?: string;
  status: 'open' | 'in_progress' | 'blocked' | 'closed';
  deadline?: string;
  beadsId?: string;
}

```

Key operations: `addGoal`, `updateGoal`, `deleteGoal`, `setActiveGoal`, `loadGoals` (bulk import from seed). Navigation: `navigateUp` (parent), `navigateDown` (first child), `navigateLeft` (prev sibling), `navigateRight` (next sibling). No persistence — `loadGoals` called once on mount with seed data.

### Layout Engine — `client/src/utils/layouts.ts` (50 lines)

Single Dagre LR layout function. Replaced the previous 360-line D3 file with three layout modes.

```bash
cat client/src/utils/layouts.ts
```

```output
import dagre from '@dagrejs/dagre';
import { Position, Node, Edge } from 'reactflow';

/**
 * Dagre LR layout — root on left, leaves on right.
 * Replaces D3 Reingold-Tilford (tree/spider/vertical modes removed).
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR',
) {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 120,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    const width = (node as any).width ?? 280;
    const height = (node as any).height ?? 120;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    const width = (node as any).width ?? 280;
    const height = (node as any).height ?? 120;

    return {
      ...node,
      position: { x: x - width / 2, y: y - height / 2 },
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
    };
  });

  return { nodes: layoutedNodes, edges };
}
```

Dagre creates a new graph per call (no stale state). Node dimensions default to 280×120 if not yet measured. Positions are center-point from Dagre, converted to top-left for ReactFlow. Source/target handle positions set per-node for LR direction.

### Canvas — `client/src/components/tree/TreeCanvas.tsx` (208 lines)

ReactFlow canvas wrapped in `ReactFlowProvider`. Key behaviors:

1. **Build phase**: Converts treeStore goals → ReactFlow nodes/edges. Computes `nodeState` (root/blocked/active/done/delegated) from goal status and children.
2. **Layout phase**: Waits for `useNodesInitialized()`, then applies Dagre layout once. Uses `layoutDone` ref to prevent re-layout on active node changes.
3. **Follow mode**: When `activeGoalId` changes, pans canvas to center on the active node.
4. **Active state updates**: When only activeGoalId changes (not goals), updates `isActive` flag without resetting positions.

```bash
sed -n '25,36p' client/src/components/tree/TreeCanvas.tsx
```

```output
function getNodeState(goal: Goal, allGoals: Goal[]): 'root' | 'blocked' | 'active' | 'done' | 'delegated' {
  if (goal.status === 'closed') return 'done';
  if (goal.parentId === null) return 'root';
  const children = allGoals.filter(g => g.parentId === goal.id);
  if (children.length > 0) {
    const allChildrenDone = children.every(c => c.status === 'closed');
    return allChildrenDone ? 'active' : 'blocked';
  }
  if (goal.status === 'blocked') return 'blocked';
  if (goal.status === 'in_progress') return 'active';
  return 'active';
}
```

Node state derivation: closed → done, null parentId → root, has children with any open → blocked, leaf with in_progress → active. Default fallback is active.

### Node Rendering — `client/src/components/tree/GoalNode.tsx` (105 lines)

Neo-brutalist div cards replacing the old depth-dependent SVG shapes. Each node is a rectangular card with:

```bash
sed -n '16,22p' client/src/components/tree/GoalNode.tsx
```

```output
const STATE_COLORS: Record<string, { fill: string; border: string; text: string }> = {
  root:      { fill: '#ffdd03', border: '3px solid #000', text: '#000' },
  blocked:   { fill: '#ffffff', border: '2px solid #000', text: '#000' },
  active:    { fill: '#62f6b5', border: '3px solid #000', text: '#000' },
  done:      { fill: '#d4edda', border: '2px solid #000', text: '#000' },
  delegated: { fill: '#9977ff', border: '3px solid #000', text: '#fff' },
};
```

Active node gets an orange glow ring (`0 0 0 4px #fff, 0 0 0 7px #ff9933, 0 0 16px 6px rgba(255,153,51,0.4)`). Inactive nodes get neo-brutalist box-shadow (`2px 2px 0px 0px rgba(0,0,0,1)`). Department badges are inline colored spans (JetBrains Mono 11px). Handles positioned Left (target) and Right (source) for LR layout.

### Main Page — `client/src/pages/Home.tsx` (170 lines)

Full-screen flex container: Header → TreeCanvas (flex-1) with floating CommandWindow and AttributeWindow overlaid.

**Keyboard handler** (navigate mode):
- `h/j/k/l` — vim-style tree navigation (left sibling, down child, up parent, right sibling)
- `n` — new sibling (or root if no goals)
- `s` — new child of active goal
- `d` — delete active goal
- `a` — toggle attribute window
- `c` — enter command mode
- `?` — help dialog

Seeds store with beads data on first mount (`goals.size === 0`).

### Header — `client/src/components/layout/Header.tsx` (151 lines)

Neo-brutalist toolbar with 3px black bottom border. Contains: title ("VoxPlanWeb"), mode switcher (Command/Navigate/Voice), breadcrumb trail (root → active path), node count badge (JetBrains Mono), help button. Below: legend row showing state colors (Root/Blocked/Active/Delegated/Done + dependency line).

### Command Window — `client/src/components/windows/CommandWindow.tsx` (239 lines)

Floating terminal-style panel (green-on-black, retro aesthetic). Fixed position bottom-left. Commands: root, child, sibling, edit, delete, current, clear, exit, help. Minimizes to a toolbar button when closed. ESC returns to navigate mode.

### Attribute Window — `client/src/components/windows/AttributeWindow.tsx` (170 lines)

Floating editor panel. Fixed position bottom-right. Shows name input + details textarea for active goal. Auto-focuses name field on open. Save button with toast notification. Minimizes to toolbar button.

### Seed Data — `client/src/data/seedData.ts` (234 lines)

22 goals from VOX beads database (snapshot 2026-05-10). 4 epics: Salesbot V2 (ENG), BD Pipeline Activation (BD), Content & Visibility (CONTENT), VoxPlanWeb Rewrite (RD). Plus 3 standalone items. Maps to Goal interface with default `position: {x:0, y:0}` (overwritten by Dagre).

## Supporting Files

- `client/src/stores/uiStore.ts` (26 lines) — Mode state (command/navigate/voice), panel visibility toggles
- `client/src/components/dialogs/HelpDialog.tsx` — Keyboard shortcut reference overlay
- `client/src/hooks/use-toast.ts` — Toast notification hook
- `server/index.ts` — Express scaffold, Vite dev middleware, no API routes
- `server/routes.ts` — Empty route file (placeholder)
- `server/storage.ts` — MemStorage class, User CRUD only, no Goal persistence

## Dependencies

Key: reactflow 11.11, zustand 5.0.8, @dagrejs/dagre, @radix-ui/* (full set), tailwindcss 3.4, lucide-react
Server: express 4.21, drizzle-orm, @neondatabase/serverless (unused)
