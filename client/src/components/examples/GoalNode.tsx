import GoalNode from '../tree/GoalNode';
import { ReactFlowProvider } from 'reactflow';

export default function GoalNodeExample() {
  const mockData = {
    id: 1,
    name: 'Complete Project',
    totalheight: 109.6,
    isActive: true,
    depth: 0,
  };

  return (
    <ReactFlowProvider>
      <div className="p-8 bg-background">
        <GoalNode
          id="1"
          type="goalNode"
          data={mockData}
          selected={false}
          isConnectable={true}
          xPos={0}
          yPos={0}
          zIndex={0}
          dragging={false}
        />
      </div>
    </ReactFlowProvider>
  );
}
