import TreeCanvas from '../tree/TreeCanvas';
import { useTreeStore } from '@/stores/treeStore';
import { useEffect } from 'react';

export default function TreeCanvasExample() {
  const addGoal = useTreeStore((state) => state.addGoal);
  const clear = useTreeStore((state) => state.clear);

  useEffect(() => {
    clear();
    const rootId = addGoal('Career Goals', 'Professional development path', null);
    addGoal('Learn React', 'Master React and TypeScript', rootId);
    addGoal('Build Portfolio', 'Create 5 showcase projects', rootId);
    addGoal('Get Certified', 'AWS Solutions Architect', rootId);
  }, [addGoal, clear]);

  return (
    <div className="w-full h-screen">
      <TreeCanvas />
    </div>
  );
}
