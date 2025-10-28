import { useCallback, useEffect, useMemo } from 'react';
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
  NodeChange,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import GoalNode, { GoalNodeData } from './GoalNode';
import { useTreeStore } from '@/stores/treeStore';
import { Button } from '@/components/ui/button';
import { Crosshair } from 'lucide-react';

const nodeTypes = {
  goalNode: GoalNode,
};

function TreeCanvasInner() {
  const { fitView, setCenter } = useReactFlow();
  const goals = useTreeStore((state) => state.goals);
  const updateGoal = useTreeStore((state) => state.updateGoal);
  const activeGoalId = useTreeStore((state) => state.activeGoalId);
  const rootId = useTreeStore((state) => state.rootId);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const calculateDepth = useCallback((goalId: number, goalsMap: Map<number, any>): number => {
    const goal = goalsMap.get(goalId);
    if (!goal || goal.parentId === null) return 0;
    return 1 + calculateDepth(goal.parentId, goalsMap);
  }, []);

  const buildNodesAndEdges = useCallback(() => {
    const nodes: Node<GoalNodeData>[] = [];
    const edges: Edge[] = [];

    if (goals.size === 0) {
      return { nodes, edges };
    }

    const positionTree = (nodeId: number, x: number, y: number, level: number): number => {
      const goal = goals.get(nodeId);
      if (!goal) return x;

      const children = Array.from(goals.values())
        .filter(g => g.parentId === nodeId)
        .sort((a, b) => a.id - b.id);

      const depth = calculateDepth(nodeId, goals);

      nodes.push({
        id: String(nodeId),
        type: 'goalNode',
        position: { x, y },
        data: {
          id: nodeId,
          name: goal.name,
          totalheight: goal.totalheight,
          isActive: nodeId === activeGoalId,
          depth,
        },
      });

      if (children.length === 0) return x;

      const childSpacing = 200;
      const totalWidth = (children.length - 1) * childSpacing;
      let childX = x - totalWidth / 2;

      children.forEach((child) => {
        edges.push({
          id: `e-${nodeId}-${child.id}`,
          source: String(nodeId),
          target: String(child.id),
          style: { stroke: '#000', strokeWidth: 2 },
          type: 'smoothstep',
        });

        childX = positionTree(child.id, childX, y + 180, level + 1);
        childX += childSpacing;
      });

      return x;
    };

    if (rootId !== null) {
      positionTree(rootId, 400, 50, 0);
    }

    return { nodes, edges };
  }, [goals, activeGoalId, rootId, calculateDepth]);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildNodesAndEdges();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [buildNodesAndEdges, setNodes, setEdges]);

  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
    }
  }, [nodes.length, fitView]);

  const handleNodeDragStop = useCallback((event: any, node: Node) => {
    const goalId = parseInt(node.id);
    updateGoal(goalId, { position: node.position });
  }, [updateGoal]);

  const handleCenterActive = () => {
    if (activeGoalId !== null) {
      const activeNode = nodes.find(n => n.id === String(activeGoalId));
      if (activeNode) {
        setCenter(activeNode.position.x, activeNode.position.y, { zoom: 1, duration: 500 });
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
        onNodeDragStop={handleNodeDragStop}
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
        <div className="absolute bottom-4 right-4 z-10">
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
