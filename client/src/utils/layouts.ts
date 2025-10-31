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
 * Traditional hierarchical top-down tree layout using D3's Reingold-Tilford algorithm
 */
export function calculateTreeLayout(
  goals: Map<number, Goal>,
  rootId: number
): LayoutResult {
  const hierarchyData = buildHierarchy(goals, rootId);
  if (!hierarchyData) {
    return { nodes: [] };
  }

  const root = hierarchy(hierarchyData);

  // Configure D3 tree layout with Reingold-Tilford algorithm
  // nodeSize sets the spacing between node centers: [horizontal, vertical]
  // Root nodes: ~161px wide, ~118px tall (including label)
  // We need extra spacing to prevent overlaps, especially at root level
  const horizontalSpacing = 200; // Accommodates largest node (root ~161px) + clearance
  const verticalSpacing = 180;   // Accommodates node height + label + clearance
  
  const treeLayout = tree()
    .nodeSize([horizontalSpacing, verticalSpacing])
    .separation((a, b) => {
      // Siblings get 1x spacing, cousins get 1.5x spacing
      // This creates tighter clustering within sibling groups
      return a.parent === b.parent ? 1 : 1.5;
    });

  // Apply the layout algorithm
  treeLayout(root);

  // Convert D3's coordinate system to our visual coordinates
  // D3 outputs: x = horizontal breadth, y = vertical depth
  // We want: x = horizontal position, y = vertical position
  
  // Find bounds to center the tree
  let minX = Infinity;
  let maxX = -Infinity;
  
  root.each((node: any) => {
    if (node.x < minX) minX = node.x;
    if (node.x > maxX) maxX = node.x;
  });

  // Center the tree horizontally on the canvas
  const treeWidth = maxX - minX;
  const canvasCenterX = 600; // Center point for the canvas
  const offsetX = canvasCenterX - (minX + treeWidth / 2);
  const offsetY = 50; // Top margin

  const nodes: LayoutNode[] = [];

  root.each((node: any) => {
    const goal = node.data.goal;
    
    // Use saved position for tree mode if it exists, otherwise use D3's calculated position
    // Always use D3's depth to ensure consistency
    let position;
    if (goal.manualPositions?.tree) {
      position = goal.manualPositions.tree;
    } else {
      position = {
        x: node.x + offsetX,
        y: node.y + offsetY
      };
    }

    nodes.push({
      id: node.data.id,
      position,
      depth: node.depth, // Always use D3's calculated depth, even with manual positions
    });
  });

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
  const radiusPerLevel = 120; // Tighter radial spacing for better clustering

  const root = hierarchy(hierarchyData);
  
  // Calculate max depth to properly size the layout
  const maxDepth = root.height;

  // Create d3 tree layout with proper radius scaling
  const treeLayout = tree()
    .size([2 * Math.PI, maxDepth > 0 ? radiusPerLevel * maxDepth : radiusPerLevel])
    .separation((a, b) => {
      // Improved clustering: siblings closer, non-siblings further apart
      return a.parent === b.parent ? 0.8 : 2.5;
    });

  treeLayout(root);

  const nodes: LayoutNode[] = [];

  // For linear trees (single chain), spread nodes around the circle
  // For branching trees, use d3's calculated angles
  const isLinearTree = root.descendants().every((n: any) => {
    return n.children ? n.children.length <= 1 : true;
  });

  let linearNodeIndex = 0;
  const totalLinearNodes = root.descendants().length;

  root.each((node: any) => {
    const goal = node.data.goal;
    
    // Use saved position for spider mode if it exists, otherwise calculate radial position
    let position;
    if (goal.manualPositions?.spider) {
      position = goal.manualPositions.spider;
    } else {
      let angle;
      
      if (isLinearTree) {
        // For linear trees, evenly distribute nodes around the circle
        angle = (linearNodeIndex / Math.max(totalLinearNodes - 1, 1)) * (2 * Math.PI) - Math.PI / 2;
        linearNodeIndex++;
      } else {
        // For branching trees, use d3's calculated angle
        angle = node.x - Math.PI / 2; // Offset to start at top
      }
      
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
