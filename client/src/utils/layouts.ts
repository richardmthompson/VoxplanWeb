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
