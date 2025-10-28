import CommandWindow from '../windows/CommandWindow';
import { useTreeStore } from '@/stores/treeStore';
import { useEffect } from 'react';

export default function CommandWindowExample() {
  const addGoal = useTreeStore((state) => state.addGoal);
  const clear = useTreeStore((state) => state.clear);

  useEffect(() => {
    clear();
    addGoal('Example Goal', 'This is an example goal for testing', null);
  }, [addGoal, clear]);

  return (
    <div className="w-80 h-screen p-4 bg-background">
      <CommandWindow />
    </div>
  );
}
