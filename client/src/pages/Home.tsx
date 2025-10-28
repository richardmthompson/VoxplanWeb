import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import TreeCanvas from '@/components/tree/TreeCanvas';
import CommandWindow from '@/components/windows/CommandWindow';
import AttributeWindow from '@/components/windows/AttributeWindow';
import { useTreeStore } from '@/stores/treeStore';
import { useUIStore } from '@/stores/uiStore';

export default function Home() {
  const addGoal = useTreeStore((state) => state.addGoal);
  const goals = useTreeStore((state) => state.goals);
  const navigateUp = useTreeStore((state) => state.navigateUp);
  const navigateDown = useTreeStore((state) => state.navigateDown);
  const navigateLeft = useTreeStore((state) => state.navigateLeft);
  const navigateRight = useTreeStore((state) => state.navigateRight);
  const mode = useUIStore((state) => state.mode);

  useEffect(() => {
    if (goals.size === 0) {
      addGoal('My Life Goals', 'Top-level goals for my life', null);
    }
  }, [goals.size, addGoal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'navigate') return;

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateDown();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateRight();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, navigateUp, navigateDown, navigateLeft, navigateRight]);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 p-4 border-r bg-background overflow-auto">
          <CommandWindow />
        </div>
        
        <div className="flex-1 bg-background">
          <TreeCanvas />
        </div>
        
        <div className="w-96 p-4 border-l bg-background overflow-auto">
          <AttributeWindow />
        </div>
      </div>
    </div>
  );
}
