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
 * Radial "spider" layout with explicit angular sectoring
 * Implements industry-standard algorithm from mind-mapping research
 */
export function calculateSpiderLayout(
  goals: Map<number, Goal>,
  rootId: number
): LayoutResult {
  const hierarchyData = buildHierarchy(goals, rootId);
  if (!hierarchyData) {
    return { nodes: [] };
  }

  const root = hierarchy(hierarchyData);
  const nodes: LayoutNode[] = [];

  // Center point for the spider layout
  const centerX = 600;
  const centerY = 400;
  const initialRadius = 150;     // Distance from center to first level
  const radiusIncrement = 120;    // Distance added per level
  
  // Recursive layout function with explicit angular sectoring
  const layoutSubtree = (
    node: any,
    centerAngle: number,
    angularSpan: number,
    radius: number
  ) => {
    const goal = node.data.goal;
    let position: { x: number; y: number };
    
    // Use saved position if it exists
    if (goal.manualPositions?.spider) {
      position = goal.manualPositions.spider;
    } else {
      // Position at center of allocated angular wedge
      const angle = centerAngle;
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
    
    // Layout children with subdivided wedges
    if (node.children && node.children.length > 0) {
      const childAngularSpan = angularSpan / node.children.length;
      const childRadius = radius + radiusIncrement;
      
      node.children.forEach((child: any, index: number) => {
        // Calculate center angle for this child's wedge
        // Start from left edge of parent's wedge and move rightward
        const childCenterAngle = centerAngle - (angularSpan / 2) + childAngularSpan * (index + 0.5);
        
        layoutSubtree(child, childCenterAngle, childAngularSpan, childRadius);
      });
    }
  };
  
  // Add root node first
  const rootGoal = root.data.goal;
  nodes.push({
    id: root.data.id,
    position: rootGoal.manualPositions?.spider || { x: centerX, y: centerY },
    depth: 0,
  });
  
  // Handle special case: single linear chain
  // Spread nodes evenly around the circle for better appearance
  const isLinearTree = root.descendants().every((n: any) => {
    return n.children ? n.children.length <= 1 : true;
  });
  
  if (isLinearTree && root.children && root.children.length > 0) {
    // Special layout for linear trees: spread around full circle
    // Skip root (already added), process descendants
    const descendants = root.descendants().slice(1); // Skip root
    descendants.forEach((node: any, index: number) => {
      const goal = node.data.goal;
      let position: { x: number; y: number };
      
      if (goal.manualPositions?.spider) {
        position = goal.manualPositions.spider;
      } else {
        // Distribute evenly around circle, starting at top
        const angle = ((index + 1) / (descendants.length + 1)) * (2 * Math.PI) - Math.PI / 2;
        const radius = node.depth * radiusIncrement;
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
  } else if (root.children && root.children.length > 0) {
    // For branching trees: use angular sectoring
    // Level 1 children get even distribution around full circle
    const level1AngleSpan = (2 * Math.PI) / root.children.length;
    
    root.children.forEach((child: any, index: number) => {
      const childCenterAngle = level1AngleSpan * index;
      layoutSubtree(child, childCenterAngle, level1AngleSpan, initialRadius);
    });
  }

  return { nodes };
}

/**
 * Vertical mind-map layout with alternating left/right stacks
 */
export function calculateVerticalLayout(
  goals: Map<number, Goal>,
  rootId: number
): LayoutResult {
  const nodes: LayoutNode[] = [];
  const hierarchyData = buildHierarchy(goals, rootId);
  if (!hierarchyData) {
    return { nodes: [] };
  }

  const root = hierarchy(hierarchyData);
  
  // Root at center
  const centerX = 600;
  const centerY = 300;
  
  // Minimal horizontal spacing - just enough for clean connection lines
  const horizontalSpacing = 180; // Distance from root to first level stacks
  const verticalSpacing = 100;   // Vertical spacing between stacked nodes
  
  // Track vertical positions for each stack (left and right)
  const stackPositions: Map<string, number> = new Map();
  
  const layoutNode = (node: any, parentX: number, parentY: number, stackDirection: 'left' | 'right' | 'center', stackKey: string) => {
    const goal = node.data.goal;
    let position: { x: number; y: number };
    
    // Use saved position if it exists
    if (goal.manualPositions?.vertical) {
      position = goal.manualPositions.vertical;
    } else {
      if (node.depth === 0) {
        // Root at center
        position = { x: centerX, y: centerY };
      } else if (node.depth === 1) {
        // Level 1: Alternate left/right stacks
        const childIndex = node.parent.children.indexOf(node);
        const isRight = childIndex % 2 === 0;
        const direction = isRight ? 'right' : 'left';
        const xOffset = isRight ? horizontalSpacing : -horizontalSpacing;
        
        // Start first child of each stack at parent's Y position
        const stackKey = direction;
        const currentStackY = stackPositions.get(stackKey) ?? centerY;
        
        position = {
          x: centerX + xOffset,
          y: currentStackY
        };
        
        // Update stack position for next sibling
        stackPositions.set(stackKey, currentStackY + verticalSpacing);
        
        // Process children with same direction
        if (node.children) {
          node.children.forEach((child: any) => {
            layoutNode(child, position.x, position.y, direction, stackKey);
          });
        }
      } else {
        // Level 2+: Stack vertically below parent in same horizontal direction
        const parentStackKey = stackKey + '-' + node.parent.data.id;
        const currentStackY = stackPositions.get(parentStackKey) ?? parentY;
        
        position = {
          x: parentX,
          y: currentStackY
        };
        
        // Update stack position for next sibling
        stackPositions.set(parentStackKey, currentStackY + verticalSpacing);
        
        // Process children with same direction
        if (node.children) {
          node.children.forEach((child: any) => {
            layoutNode(child, position.x, position.y, stackDirection, parentStackKey);
          });
        }
      }
    }
    
    nodes.push({
      id: node.data.id,
      position,
      depth: node.depth,
    });
  };
  
  // Start layout from root
  layoutNode(root, centerX, centerY, 'center', 'root');
  
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
    case 'vertical':
      return calculateVerticalLayout(goals, rootId);
    case 'tree':
    default:
      return calculateTreeLayout(goals, rootId);
  }
}
