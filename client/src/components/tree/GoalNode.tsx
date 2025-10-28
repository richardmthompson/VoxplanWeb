import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useTreeStore } from '@/stores/treeStore';

export interface GoalNodeData {
  id: number;
  name: string;
  totalheight: number;
  isActive: boolean;
  depth: number;
}

function GoalNode({ data }: NodeProps<GoalNodeData>) {
  const setActiveGoal = useTreeStore((state) => state.setActiveGoal);
  
  const diameter = data.totalheight * 0.73;
  const fontSize = Math.round(data.totalheight * 0.2);
  const labelSpacing = diameter;
  
  const handleClick = () => {
    setActiveGoal(data.id);
  };

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer"
      onClick={handleClick}
      style={{ width: diameter * 2, minHeight: diameter + labelSpacing + fontSize * 2 }}
      data-testid={`goal-node-${data.id}`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="relative flex items-center justify-center">
        {!data.isActive && (
          <div
            className="absolute rounded-full"
            style={{
              width: diameter + 4,
              height: diameter + 4,
              backgroundColor: 'rgb(77, 102, 153)',
            }}
          />
        )}
        
        <div
          className={`rounded-full flex items-center justify-center transition-all duration-300 ${
            data.isActive ? 'scale-110' : ''
          }`}
          style={{
            width: diameter,
            height: diameter,
            backgroundColor: data.isActive ? 'rgb(191, 33, 33)' : 'rgb(128, 179, 255)',
          }}
          data-testid={`goal-circle-${data.id}`}
        />
      </div>
      
      <div
        className="text-center font-medium text-foreground mt-2 max-w-40 truncate"
        style={{ fontSize: `${fontSize}px`, marginTop: `${labelSpacing * 0.2}px` }}
        title={data.name}
        data-testid={`goal-label-${data.id}`}
      >
        {data.name}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

export default memo(GoalNode);
