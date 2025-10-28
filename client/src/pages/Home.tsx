import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import TreeCanvas from '@/components/tree/TreeCanvas';
import CommandWindow from '@/components/windows/CommandWindow';
import AttributeWindow from '@/components/windows/AttributeWindow';
import { useTreeStore } from '@/stores/treeStore';
import { useUIStore } from '@/stores/uiStore';

export default function Home() {
  const addGoal = useTreeStore((state) => state.addGoal);
  const updateGoal = useTreeStore((state) => state.updateGoal);
  const deleteGoal = useTreeStore((state) => state.deleteGoal);
  const activeGoalId = useTreeStore((state) => state.activeGoalId);
  const goals = useTreeStore((state) => state.goals);
  const navigateUp = useTreeStore((state) => state.navigateUp);
  const navigateDown = useTreeStore((state) => state.navigateDown);
  const navigateLeft = useTreeStore((state) => state.navigateLeft);
  const navigateRight = useTreeStore((state) => state.navigateRight);
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (goals.size === 0) {
      addGoal('My Life Goals', 'Top-level goals for my life', null);
    }
  }, [goals.size, addGoal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Global shortcuts (work in any mode)
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      if (e.key === '/' && e.shiftKey) {
        e.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      if (mode !== 'navigate') return;

      // Navigate mode shortcuts
      switch (e.key) {
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          navigateUp();
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          navigateDown();
          break;
        case 'ArrowLeft':
        case 'h':
          e.preventDefault();
          navigateLeft();
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          navigateRight();
          break;
        case 'n':
          e.preventDefault();
          if (activeGoalId !== null) {
            const activeGoal = goals.get(activeGoalId);
            if (activeGoal && activeGoal.parentId !== null) {
              addGoal('New Sibling', '', activeGoal.parentId);
            }
          }
          break;
        case 's':
          e.preventDefault();
          if (activeGoalId !== null) {
            addGoal('New Child', '', activeGoalId);
          }
          break;
        case 'd':
          e.preventDefault();
          if (activeGoalId !== null) {
            deleteGoal(activeGoalId);
          }
          break;
        case 'c':
          e.preventDefault();
          setMode('command');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, navigateUp, navigateDown, navigateLeft, navigateRight, addGoal, deleteGoal, activeGoalId, goals, setMode]);

  return (
    <div className="h-screen flex flex-col">
      <Header showHelp={showHelp} setShowHelp={setShowHelp} />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex flex-col gap-4 p-4 border-r bg-background">
          <div className="h-80">
            <CommandWindow />
          </div>
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
