import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useTreeStore } from '@/stores/treeStore';
import { Link, Unlink } from 'lucide-react';

export interface GoalNodeData {
  id: number;
  name: string;
  totalheight: number;
  isActive: boolean;
  depth: number;
  hasChildren: boolean;
  dragLocked: boolean;
}

// SVG shape components for different hierarchy levels
const ShapeRenderer = ({ 
  depth, 
  diameter, 
  isActive 
}: { 
  depth: number; 
  diameter: number; 
  isActive: boolean;
}) => {
  const activeColor = 'rgb(191, 33, 33)';
  const inactiveColor = 'rgb(128, 179, 255)';
  const ringColor = 'rgb(77, 102, 153)';
  const fillColor = isActive ? activeColor : inactiveColor;
  
  const size = diameter;
  const strokeWidth = 2;
  
  // Determine shape based on depth
  const getShape = () => {
    switch (depth) {
      case 0: // Root - Square
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {!isActive && (
              <rect 
                x={strokeWidth} 
                y={strokeWidth} 
                width={size - strokeWidth * 2} 
                height={size - strokeWidth * 2} 
                rx={4}
                fill={ringColor}
              />
            )}
            <rect 
              x={isActive ? 0 : strokeWidth + 2} 
              y={isActive ? 0 : strokeWidth + 2} 
              width={isActive ? size : size - (strokeWidth + 2) * 2} 
              height={isActive ? size : size - (strokeWidth + 2) * 2} 
              rx={4}
              fill={fillColor}
            />
          </svg>
        );
        
      case 1: // Level 1 - Circle
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {!isActive && (
              <circle 
                cx={size / 2} 
                cy={size / 2} 
                r={(size / 2) - strokeWidth} 
                fill={ringColor}
              />
            )}
            <circle 
              cx={size / 2} 
              cy={size / 2} 
              r={isActive ? (size / 2) : (size / 2) - strokeWidth - 2} 
              fill={fillColor}
            />
          </svg>
        );
        
      case 2: // Level 2 - Diamond
        const halfSize = size / 2;
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {!isActive && (
              <path 
                d={`M ${halfSize} ${strokeWidth} L ${size - strokeWidth} ${halfSize} L ${halfSize} ${size - strokeWidth} L ${strokeWidth} ${halfSize} Z`}
                fill={ringColor}
              />
            )}
            <path 
              d={isActive 
                ? `M ${halfSize} 0 L ${size} ${halfSize} L ${halfSize} ${size} L 0 ${halfSize} Z`
                : `M ${halfSize} ${strokeWidth + 2} L ${size - strokeWidth - 2} ${halfSize} L ${halfSize} ${size - strokeWidth - 2} L ${strokeWidth + 2} ${halfSize} Z`
              }
              fill={fillColor}
            />
          </svg>
        );
        
      case 3: // Level 3 - Triangle
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {!isActive && (
              <path 
                d={`M ${size / 2} ${strokeWidth} L ${size - strokeWidth} ${size - strokeWidth} L ${strokeWidth} ${size - strokeWidth} Z`}
                fill={ringColor}
              />
            )}
            <path 
              d={isActive
                ? `M ${size / 2} 0 L ${size} ${size} L 0 ${size} Z`
                : `M ${size / 2} ${strokeWidth + 2} L ${size - strokeWidth - 2} ${size - strokeWidth - 2} L ${strokeWidth + 2} ${size - strokeWidth - 2} Z`
              }
              fill={fillColor}
            />
          </svg>
        );
        
      default: // Level 4+ - Hexagon
        const cx = size / 2;
        const cy = size / 2;
        const r = isActive ? size / 2 : (size / 2) - strokeWidth - 2;
        const rRing = (size / 2) - strokeWidth;
        const points = (radius: number) => {
          const pts = [];
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            pts.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
          }
          return pts.join(' ');
        };
        
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {!isActive && (
              <polygon points={points(rRing)} fill={ringColor} />
            )}
            <polygon points={points(r)} fill={fillColor} />
          </svg>
        );
    }
  };
  
  return (
    <div 
      className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
      data-testid={`goal-shape-${depth}`}
    >
      {getShape()}
    </div>
  );
};

function GoalNode({ data }: NodeProps<GoalNodeData>) {
  const setActiveGoal = useTreeStore((state) => state.setActiveGoal);
  const updateGoal = useTreeStore((state) => state.updateGoal);
  
  const diameter = data.totalheight * 0.73;
  const fontSize = Math.round(data.totalheight * 0.2);
  const labelSpacing = diameter * 0.2;
  
  const handleClick = () => {
    setActiveGoal(data.id);
  };

  const toggleDragLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateGoal(data.id, { dragLocked: !data.dragLocked });
  };

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer"
      onClick={handleClick}
      style={{ width: diameter * 2 }}
      data-testid={`goal-node-${data.id}`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="relative flex items-center justify-center">
        <ShapeRenderer 
          depth={data.depth} 
          diameter={diameter} 
          isActive={data.isActive} 
        />
        
        {/* Lock/Unlock toggle for nodes with children */}
        {data.hasChildren && (
          <button
            onClick={toggleDragLock}
            className="nodrag absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors"
            title={data.dragLocked ? "Click to unlock (move parent only)" : "Click to lock (move children with parent)"}
            data-testid={`lock-toggle-${data.id}`}
          >
            {data.dragLocked ? (
              <Link className="w-3 h-3 text-foreground" />
            ) : (
              <Unlink className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
      
      <div
        className="text-center font-medium text-foreground max-w-40 truncate"
        style={{ fontSize: `${fontSize}px`, marginTop: `${labelSpacing}px` }}
        title={data.name}
        data-testid={`goal-label-${data.id}`}
      >
        {data.name}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="opacity-0" style={{ bottom: -4 }} />
    </div>
  );
}

export default memo(GoalNode);
