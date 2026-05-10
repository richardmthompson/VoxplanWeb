# Dagre + ReactFlow LR Layout Patterns

Research findings for replacing D3-hierarchy with Dagre in a ReactFlow v11 app.

## Installation

```bash
npm install @dagrejs/dagre
# Note: VoxPlanWeb uses `reactflow` v11.11.4 (old package name, NOT `@xyflow/react`)
# Imports should use: import { ... } from 'reactflow'
```

## Core Layout Function

```typescript
import dagre from '@dagrejs/dagre';
import { Position, Node, Edge } from 'reactflow';

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR',
) {
  const isHorizontal = direction === 'LR';
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 60,    // vertical gap between nodes on same rank
    ranksep: 120,   // horizontal gap between ranks (columns in LR)
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    // Use measured dimensions for variable-height nodes
    const width  = node.measured?.width  ?? 280;
    const height = node.measured?.height ?? 120;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    const width  = node.measured?.width  ?? 280;
    const height = node.measured?.height ?? 120;

    return {
      ...node,
      // CRITICAL: Dagre returns center-point; ReactFlow needs top-left corner
      position: { x: x - width / 2, y: y - height / 2 },
      // CRITICAL: Must set per-node, not just on Handle component
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      targetPosition: isHorizontal ? Position.Left  : Position.Top,
    };
  });

  return { nodes: layoutedNodes, edges };
}
```

## Custom Node with LR Handles

```tsx
import { Handle, Position } from 'reactflow';

export function GoalNode({ data }) {
  return (
    <div className="node-card" style={{ background: data.fillColor }}>
      <Handle type="target" position={Position.Left} />
      
      <div className="title">{data.name}</div>
      <div className="separator" />
      <div className="dept-badge">{data.dept}</div>
      <div className="status">{data.status}</div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
```

## Triggering Layout After Node Measurement

ReactFlow measures nodes asynchronously. Layout must run AFTER measurement:

```tsx
import { useNodesInitialized } from 'reactflow';

function TreeCanvas() {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const nodesInitialized = useNodesInitialized();

  useEffect(() => {
    if (!nodesInitialized) return;
    const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges, 'LR');
    setNodes(ln);
    setEdges(le);
  }, [nodesInitialized]);

  return <ReactFlow nodes={nodes} edges={edges} ... />;
}
```

## Edge Configuration

```typescript
// smoothstep is cleanest for LR trees
const edges = rawEdges.map(e => ({
  ...e,
  type: 'smoothstep',
}));
```

Avoid `straight` — it cuts through nodes when handles are on sides. `smoothstep` routes around nodes automatically.

## Known Gotchas

| Gotcha | Solution |
|--------|----------|
| Dagre x/y are center-point, not top-left | Subtract `width/2`, `height/2` from position |
| `node.measured` undefined on first render | Guard with `?? fallback`, use `useNodesInitialized` |
| Module-level dagreGraph retains stale nodes | Create new Graph instance per layout call, or clear with `setGraph({})` |
| `sourcePosition`/`targetPosition` not on nodes | Must set per-node in layout function — Handle component alone insufficient |
| Sub-flows (nested nodes) break dagre | Known issue — use elkjs if sub-flows needed (not needed for VoxPlanWeb) |
| Package name confusion | Use `@dagrejs/dagre` (scoped), NOT `dagre` (old unmaintained) |
| ReactFlow package name | VoxPlanWeb uses `reactflow` v11.11.4 (NOT `@xyflow/react`) |

## What to Remove from Current Codebase

- `d3-hierarchy` package from package.json
- All `d3.tree()`, `d3.hierarchy()` imports from layouts.ts
- Spider layout mode code (~130 lines)
- Vertical layout mode code (~90 lines)
- `LayoutMode` type from treeStore.ts
- `manualPositions` per-layout-mode storage
- `clearAllPositions` action
- Layout mode toggle button in TreeCanvas.tsx
- Layout confirmation dialog in TreeCanvas.tsx
