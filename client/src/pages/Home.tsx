import { useEffect, useState, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useTreeStore } from '@/stores/treeStore';
import Header from '@/components/layout/Header';
import TreeCanvas from '@/components/tree/TreeCanvas';
import CommandWindow from '@/components/windows/CommandWindow';
import AttributeWindow from '@/components/windows/AttributeWindow';
import HelpDialog from '@/components/dialogs/HelpDialog';

export default function Home() {
  const [showHelp, setShowHelp] = useState(false);
  const [commandWindowOpen, setCommandWindowOpen] = useState(false);
  const [attributeWindowOpen, setAttributeWindowOpen] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const justCreatedGoalRef = useRef(false);
  
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const activeGoalId = useTreeStore((state) => state.activeGoalId);
  const goals = useTreeStore((state) => state.goals);
  const addGoal = useTreeStore((state) => state.addGoal);
  const deleteGoal = useTreeStore((state) => state.deleteGoal);
  const setActiveGoal = useTreeStore((state) => state.setActiveGoal);

  const navigateUp = () => {
    if (activeGoalId === null) return;
    const activeGoal = goals.get(activeGoalId);
    if (activeGoal?.parentId !== null && activeGoal?.parentId !== undefined) {
      setActiveGoal(activeGoal.parentId);
    }
  };

  const navigateDown = () => {
    if (activeGoalId === null) return;
    const children = Array.from(goals.values()).filter(g => g.parentId === activeGoalId);
    if (children.length > 0) {
      setActiveGoal(children[0].id);
    }
  };

  const navigateLeft = () => {
    if (activeGoalId === null) return;
    const activeGoal = goals.get(activeGoalId);
    if (activeGoal?.parentId === null || activeGoal?.parentId === undefined) return;
    
    const siblings = Array.from(goals.values())
      .filter(g => g.parentId === activeGoal.parentId)
      .sort((a, b) => a.id - b.id);
    
    const currentIndex = siblings.findIndex(g => g.id === activeGoalId);
    if (currentIndex > 0) {
      setActiveGoal(siblings[currentIndex - 1].id);
    }
  };

  const navigateRight = () => {
    if (activeGoalId === null) return;
    const activeGoal = goals.get(activeGoalId);
    if (activeGoal?.parentId === null || activeGoal?.parentId === undefined) return;
    
    const siblings = Array.from(goals.values())
      .filter(g => g.parentId === activeGoal.parentId)
      .sort((a, b) => a.id - b.id);
    
    const currentIndex = siblings.findIndex(g => g.id === activeGoalId);
    if (currentIndex < siblings.length - 1) {
      setActiveGoal(siblings[currentIndex + 1].id);
    }
  };

  // Auto-focus main container on mount to ensure keyboard shortcuts work
  useEffect(() => {
    mainContainerRef.current?.focus();
  }, []);

  // Open attributes window when a goal is created
  useEffect(() => {
    if (justCreatedGoalRef.current && activeGoalId !== null) {
      setAttributeWindowOpen(true);
      justCreatedGoalRef.current = false;
    }
  }, [activeGoalId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't process shortcuts if an input, textarea, or contenteditable element is focused
      const target = e.target as HTMLElement;
      
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      if (mode === 'navigate') {
        if (e.key === 'c') {
          e.preventDefault();
          setMode('command');
          setCommandWindowOpen(true);
        } else if (e.key === 'h') {
          e.preventDefault();
          navigateLeft();
        } else if (e.key === 'j') {
          e.preventDefault();
          navigateDown();
        } else if (e.key === 'k') {
          e.preventDefault();
          navigateUp();
        } else if (e.key === 'l') {
          e.preventDefault();
          navigateRight();
        } else if (e.key === 'n') {
          e.preventDefault();
          // If no goals exist, create a root node
          if (goals.size === 0) {
            justCreatedGoalRef.current = true;
            addGoal('New Root', '', null);
          } else if (activeGoalId !== null) {
            const activeGoal = goals.get(activeGoalId);
            if (activeGoal?.parentId !== null) {
              justCreatedGoalRef.current = true;
              addGoal('New Sibling', '', activeGoal?.parentId ?? null);
            }
          }
        } else if (e.key === 's') {
          e.preventDefault();
          if (activeGoalId !== null) {
            justCreatedGoalRef.current = true;
            addGoal('New Child', '', activeGoalId);
          }
        } else if (e.key === 'd') {
          e.preventDefault();
          if (activeGoalId !== null) {
            deleteGoal(activeGoalId);
          }
        } else if (e.key === 'a') {
          e.preventDefault();
          setAttributeWindowOpen(!attributeWindowOpen);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, navigateUp, navigateDown, navigateLeft, navigateRight, addGoal, deleteGoal, activeGoalId, goals, setMode, attributeWindowOpen]);

  return (
    <div 
      ref={mainContainerRef}
      className="h-screen flex flex-col outline-none" 
      tabIndex={0}
      onMouseDown={(e) => {
        // When clicking anywhere in the app, ensure main container has focus
        // This allows keyboard shortcuts to work even after clicking buttons
        if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          (e.currentTarget as HTMLElement).focus();
        }
      }}
    >
      <Header showHelp={showHelp} setShowHelp={setShowHelp} />
      
      {/* Full-screen TreeCanvas as background */}
      <div className="flex-1 relative">
        <TreeCanvas />
        
        {/* Floating Command Window */}
        <CommandWindow 
          isOpen={commandWindowOpen} 
          onToggle={() => {
            const newState = !commandWindowOpen;
            setCommandWindowOpen(newState);
            if (newState) {
              setMode('command');
            } else {
              setMode('navigate');
            }
          }}
          onGoalCreated={() => {
            justCreatedGoalRef.current = true;
          }}
        />
        
        {/* Floating Attribute Window */}
        <AttributeWindow 
          isOpen={attributeWindowOpen} 
          onToggle={() => setAttributeWindowOpen(!attributeWindowOpen)} 
        />
      </div>

      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
}
