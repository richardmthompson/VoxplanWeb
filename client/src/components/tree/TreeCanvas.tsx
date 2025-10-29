import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Crosshair, Network, Radar } from 'lucide-react';
import { calculateLayout } from '@/utils/layouts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const nodeTypes = {
  goalNode: GoalNode,
};

function TreeCanvasInner() {
  const { fitView, setCenter, zoomIn, zoomOut } = useReactFlow();
  const goals = useTreeStore((state) => state.goals);
  const updateGoal = useTreeStore((state) => state.updateGoal);
  const activeGoalId = useTreeStore((state) => state.activeGoalId);
  const rootId = useTreeStore((state) => state.rootId);
  const layoutMode = useTreeStore((state) => state.layoutMode);
  const setLayoutMode = useTreeStore((state) => state.setLayoutMode);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showLayoutDialog, setShowLayoutDialog] = useState(false);
  const [pendingLayoutMode, setPendingLayoutMode] = useState<'tree' | 'spider' | null>(null);

  const buildNodesAndEdges = useCallback(() => {
    const nodes: Node<GoalNodeData>[] = [];
    const edges: Edge[] = [];

    if (goals.size === 0 || rootId === null) {
      return { nodes, edges };
    }

    // Calculate layout using the appropriate algorithm
    const layout = calculateLayout(goals, rootId, layoutMode);

    // Build nodes from layout
    layout.nodes.forEach((layoutNode) => {
      const goalId = parseInt(layoutNode.id);
      const goal = goals.get(goalId);
      if (!goal) return;

      nodes.push({
        id: layoutNode.id,
        type: 'goalNode',
        position: layoutNode.position,
        data: {
          id: goalId,
          name: goal.name,
          totalheight: goal.totalheight,
          isActive: goalId === activeGoalId,
          depth: layoutNode.depth,
        },
      });
    });

    // Build edges
    goals.forEach((goal) => {
      if (goal.parentId !== null) {
        edges.push({
          id: `e-${goal.parentId}-${goal.id}`,
          source: String(goal.parentId),
          target: String(goal.id),
          style: { stroke: '#000', strokeWidth: 2 },
          type: 'smoothstep',
        });
      }
    });

    return { nodes, edges };
  }, [goals, activeGoalId, rootId, layoutMode]);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildNodesAndEdges();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [buildNodesAndEdges, setNodes, setEdges]);

  useEffect(() => {
    if (nodes.length > 0 && layoutMode === 'tree') {
      // Only auto-fit for tree mode; spider mode has fixed spacing
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
    }
  }, [nodes.length, fitView, layoutMode]);

  // Keyboard zoom controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't process shortcuts if an input, textarea, or contenteditable element is focused
      const target = e.target as HTMLElement;
      
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

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

  const handleNodeDragStop = useCallback((event: any, node: Node) => {
    const goalId = parseInt(node.id);
    const goal = goals.get(goalId);
    if (goal) {
      // Save manual position for the current layout mode
      const manualPositions = {
        ...goal.manualPositions,
        [layoutMode]: node.position
      };
      updateGoal(goalId, { position: node.position, manualPositions });
    }
  }, [updateGoal, goals, layoutMode]);

  const handleCenterActive = () => {
    if (activeGoalId !== null) {
      const activeNode = nodes.find(n => n.id === String(activeGoalId));
      if (activeNode) {
        setCenter(activeNode.position.x, activeNode.position.y, { zoom: 1, duration: 500 });
      }
    }
  };

  const handleToggleLayout = () => {
    const newMode = layoutMode === 'tree' ? 'spider' : 'tree';
    setPendingLayoutMode(newMode);
    setShowLayoutDialog(true);
  };

  const handleConfirmLayoutChange = () => {
    if (pendingLayoutMode) {
      // Just switch the mode - layout calculators will use mode-specific manual positions
      // If a node doesn't have a manual position for the new mode, it will be recalculated
      setLayoutMode(pendingLayoutMode);
      setShowLayoutDialog(false);
      setPendingLayoutMode(null);
    }
  };

  const handleCancelLayoutChange = () => {
    setShowLayoutDialog(false);
    setPendingLayoutMode(null);
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
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={handleToggleLayout}
            title={`Switch to ${layoutMode === 'tree' ? 'spider' : 'tree'} layout`}
            data-testid="button-toggle-layout"
          >
            {layoutMode === 'tree' ? (
              <Radar className="w-4 h-4" />
            ) : (
              <Network className="w-4 h-4" />
            )}
          </Button>
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

      {/* Layout change confirmation dialog */}
      <AlertDialog open={showLayoutDialog} onOpenChange={setShowLayoutDialog}>
        <AlertDialogContent data-testid="dialog-layout-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Layout Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching to {pendingLayoutMode === 'tree' ? 'tree' : 'spider'} layout. Manual positions are preserved per layout, so you can switch back and forth without losing your custom arrangements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelLayoutChange} data-testid="button-cancel-layout">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLayoutChange} data-testid="button-confirm-layout">
              Switch Layout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
