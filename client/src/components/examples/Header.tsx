import Header from '../layout/Header';
import { useTreeStore } from '@/stores/treeStore';
import { useEffect } from 'react';

export default function HeaderExample() {
  const addGoal = useTreeStore((state) => state.addGoal);
  const setActiveGoal = useTreeStore((state) => state.setActiveGoal);
  const clear = useTreeStore((state) => state.clear);

  useEffect(() => {
    clear();
    const rootId = addGoal('Life Goals', 'Top-level goals', null);
    const childId = addGoal('Health', 'Fitness and wellness', rootId);
    setActiveGoal(childId);
  }, [addGoal, setActiveGoal, clear]);

  return (
    <div className="w-full">
      <Header />
    </div>
  );
}
