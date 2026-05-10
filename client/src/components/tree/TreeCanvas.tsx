import { useCallback, useEffect, useMemo, useRef, memo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useNodesInitialized,
} from 'reactflow';
import 'reactflow/dist/style.css';
import GoalNode, { GoalNodeData } from './GoalNode';
import { useTreeStore, Goal } from '@/stores/treeStore';
import { Button } from '@/components/ui/button';
import { Crosshair } from 'lucide-react';
import { getLayoutedElements } from '@/utils/layouts';

const nodeTypes = {
  goalNode: memo(GoalNode),
};

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

function TreeCanvasInner() {
  const reactFlow = useReactFlow();
  const { fitView, setCenter, zoomIn, zoomOut } = reactFlow;
  const goals = useTreeStore((state) => state.goals);
  const activeGoalId = useTreeStore((state) => state.activeGoalId);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const nodesInitialized = useNodesInitialized();
  const layoutDone = useRef(false);
  const prevActiveId = useRef<number | null>(null);

  const allGoals = useMemo(() => Array.from(goals.values()), [goals]);

  // Build nodes/edges only when goals change (NOT activeGoalId)
  const buildNodesAndEdges = useCallback(() => {
    const rfNodes: Node<GoalNodeData>[] = [];
    const rfEdges: Edge[] = [];

    if (goals.size === 0) return { nodes: rfNodes, edges: rfEdges };

    allGoals.forEach((goal) => {
      const nodeState = getNodeState(goal, allGoals);
      rfNodes.push({
        id: String(goal.id),
        type: 'goalNode',
        position: { x: 0, y: 0 },
        data: {
          id: goal.id,
          name: goal.name,
          details: goal.details,
          isActive: goal.id === activeGoalId,
          dept: goal.dept,
          status: goal.status,
          deadline: goal.deadline,
          nodeState,
        },
      });

      if (goal.parentId !== null) {
        rfEdges.push({
          id: `e-${goal.parentId}-${goal.id}`,
          source: String(goal.parentId),
          target: String(goal.id),
          style: { stroke: '#000', strokeWidth: 2 },
          type: 'smoothstep',
        });
      }
    });

    return { nodes: rfNodes, edges: rfEdges };
  }, [goals, allGoals, activeGoalId]);

  // Rebuild nodes when goals change
  useEffect(() => {
    layoutDone.current = false;
    const { nodes: n, edges: e } = buildNodesAndEdges();
    setNodes(n);
    setEdges(e);
  }, [goals, allGoals]);

  // Update only isActive flag when activeGoalId changes (no position reset)
  useEffect(() => {
    if (!layoutDone.current) return;
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isActive: n.id === String(activeGoalId) },
      })),
    );
  }, [activeGoalId, setNodes]);

  // Apply Dagre layout after nodes are measured
  useEffect(() => {
    if (!nodesInitialized || nodes.length === 0) return;
    if (layoutDone.current) return;
    const { nodes: layouted } = getLayoutedElements(nodes, edges, 'LR');
    setNodes(layouted);
    layoutDone.current = true;
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [nodesInitialized]);

  // Follow mode: pan to active node when it changes
  useEffect(() => {
    if (activeGoalId === null || !layoutDone.current) return;
    if (prevActiveId.current === activeGoalId) return;
    prevActiveId.current = activeGoalId;

    const timer = setTimeout(() => {
      const currentNodes = reactFlow.getNodes();
      const activeNode = currentNodes.find(n => n.id === String(activeGoalId));
      if (activeNode && (activeNode.position.x !== 0 || activeNode.position.y !== 0)) {
        setCenter(
          activeNode.position.x + 140,
          activeNode.position.y + 60,
          { zoom: 1, duration: 300 },
        );
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeGoalId, reactFlow, setCenter]);

  // Keyboard zoom controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut]);

  const handleCenterActive = () => {
    if (activeGoalId !== null) {
      const activeNode = nodes.find(n => n.id === String(activeGoalId));
      if (activeNode) {
        setCenter(activeNode.position.x + 140, activeNode.position.y + 60, { zoom: 1, duration: 500 });
      }
    }
  };

  return (
    <div className="w-full h-full relative" data-testid="tree-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls
          className="bg-card border border-card-border rounded-lg shadow-sm"
          showInteractive={false}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={handleCenterActive}
            disabled={activeGoalId === null}
            title="Center on active goal"
            data-testid="button-center-active"
          >
            <Crosshair className="w-4 h-4" />
          </Button>
        </div>
      </ReactFlow>
    </div>
  );
}

export default function TreeCanvas() {
  return (
    <ReactFlowProvider>
      <TreeCanvasInner />
    </ReactFlowProvider>
  );
}
