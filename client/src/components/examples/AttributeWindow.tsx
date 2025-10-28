import AttributeWindow from '../windows/AttributeWindow';
import { useTreeStore } from '@/stores/treeStore';
import { useEffect } from 'react';

export default function AttributeWindowExample() {
  const addGoal = useTreeStore((state) => state.addGoal);
  const setActiveGoal = useTreeStore((state) => state.setActiveGoal);
  const clear = useTreeStore((state) => state.clear);

  useEffect(() => {
    clear();
    const id = addGoal('Sample Goal', 'This goal demonstrates the attribute editor with sample content', null);
    setActiveGoal(id);
  }, [addGoal, setActiveGoal, clear]);

  return (
    <div className="w-96 h-screen p-4 bg-background">
      <AttributeWindow />
    </div>
  );
}
