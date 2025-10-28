import { hierarchy, tree } from 'd3-hierarchy';
import { Goal, LayoutMode } from '@/stores/treeStore';

export interface LayoutNode {
  id: string;
  position: { x: number; y: number };
  depth: number;
}

export interface LayoutResult {
  nodes: LayoutNode[];
}

// Helper to build hierarchy structure from goals
function buildHierarchy(goals: Map<number, Goal>, rootId: number) {
  const goalMap = new Map(goals);
  
  function buildNode(id: number): any {
    const goal = goalMap.get(id);
    if (!goal) return null;
    
    const children = Array.from(goalMap.values())
      .filter(g => g.parentId === id)
      .sort((a, b) => a.id - b.id)
      .map(child => buildNode(child.id))
      .filter(Boolean);
    
    return {
      id: String(id),
      goal,
      children: children.length > 0 ? children : undefined
    };
  }
  
  return buildNode(rootId);
}

// Calculate depth for a node
function calculateDepth(goalId: number, goals: Map<number, Goal>): number {
  const goal = goals.get(goalId);
  if (!goal || goal.parentId === null) return 0;
  return 1 + calculateDepth(goal.parentId, goals);
}

/**
 * Traditional hierarchical top-down tree layout
 */
export function calculateTreeLayout(
  goals: Map<number, Goal>,
  rootId: number
): LayoutResult {
  const nodes: LayoutNode[] = [];
  
  const positionTree = (nodeId: number, x: number, y: number): number => {
    const goal = goals.get(nodeId);
    if (!goal) return x;

    const children = Array.from(goals.values())
      .filter(g => g.parentId === nodeId)
      .sort((a, b) => a.id - b.id);

    const depth = calculateDepth(nodeId, goals);

    // Use saved position for tree mode if it exists, otherwise use calculated position
    const nodePosition = goal.manualPositions?.tree
      ? goal.manualPositions.tree
      : { x, y };

    nodes.push({
      id: String(nodeId),
      position: nodePosition,
      depth,
    });

    if (children.length === 0) return x;

    const childSpacing = 200;
    const totalWidth = (children.length - 1) * childSpacing;
    let childX = x - totalWidth / 2;

    children.forEach((child) => {
      childX = positionTree(child.id, childX, y + 180);
      childX += childSpacing;
    });

    return x;
  };

  positionTree(rootId, 400, 50);
  
  return { nodes };
}

/**
 * Radial "spider" layout with children radiating outward
 */
export function calculateSpiderLayout(
  goals: Map<number, Goal>,
  rootId: number
): LayoutResult {
  const hierarchyData = buildHierarchy(goals, rootId);
  if (!hierarchyData) {
    return { nodes: [] };
  }

  // Center point for the spider layout
  const centerX = 600;
  const centerY = 400;
  const radiusPerLevel = 200; // Distance between levels

  const root = hierarchy(hierarchyData);
  
  // Calculate max depth to properly size the layout
  const maxDepth = root.height;

  // Create d3 tree layout with proper radius scaling
  const treeLayout = tree()
    .size([2 * Math.PI, maxDepth > 0 ? radiusPerLevel * maxDepth : radiusPerLevel])
    .separation((a, b) => {
      // More separation between non-siblings
      return a.parent === b.parent ? 1 : 2;
    });

  treeLayout(root);

  const nodes: LayoutNode[] = [];

  root.each((node: any) => {
    const goal = node.data.goal;
    
    // Use saved position for spider mode if it exists, otherwise calculate radial position
    let position;
    if (goal.manualPositions?.spider) {
      position = goal.manualPositions.spider;
    } else {
      // Convert polar coordinates to cartesian
      // Use depth-based radius to ensure even spacing between levels
      const angle = node.x - Math.PI / 2; // Offset to start at top
      const radius = node.depth * radiusPerLevel;
      
      position = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    }

    nodes.push({
      id: node.data.id,
      position,
      depth: node.depth,
    });
  });

  return { nodes };
}

/**
 * Main layout calculator that delegates to the appropriate algorithm
 */
export function calculateLayout(
  goals: Map<number, Goal>,
  rootId: number | null,
  layoutMode: LayoutMode
): LayoutResult {
  if (rootId === null || goals.size === 0) {
    return { nodes: [] };
  }

  switch (layoutMode) {
    case 'spider':
      return calculateSpiderLayout(goals, rootId);
    case 'tree':
    default:
      return calculateTreeLayout(goals, rootId);
  }
}
