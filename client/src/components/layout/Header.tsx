import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/uiStore';
import { useTreeStore } from '@/stores/treeStore';
import { Command, Navigation, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const activeGoalId = useTreeStore((state) => state.activeGoalId);
  const getGoal = useTreeStore((state) => state.getGoal);
  const goals = useTreeStore((state) => state.goals);

  const activeGoal = activeGoalId !== null ? getGoal(activeGoalId) : null;

  const getBreadcrumb = () => {
    if (!activeGoal) return '';
    
    const path: string[] = [];
    let current = activeGoal;
    
    while (current) {
      path.unshift(current.name);
      if (current.parentId === null) break;
      const parent = goals.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    
    return path.join(' > ');
  };

  const totalNodes = goals.size;

  return (
    <header className="h-16 px-8 py-4 border-b bg-card flex items-center justify-between" data-testid="header">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">VoxPlan</h1>
          <p className="text-xs text-muted-foreground">Hierarchical Goal Planning</p>
        </div>
        
        <div className="flex items-center gap-2 border-l pl-6">
          <Button
            size="sm"
            variant={mode === 'command' ? 'default' : 'ghost'}
            onClick={() => setMode('command')}
            className="gap-2 min-w-24"
            data-testid="button-mode-command"
          >
            <Command className="w-4 h-4" />
            Command
          </Button>
          <Button
            size="sm"
            variant={mode === 'navigate' ? 'default' : 'ghost'}
            onClick={() => setMode('navigate')}
            className="gap-2 min-w-24"
            data-testid="button-mode-navigate"
          >
            <Navigation className="w-4 h-4" />
            Navigate
          </Button>
          <Button
            size="sm"
            variant={mode === 'voice' ? 'default' : 'ghost'}
            onClick={() => setMode('voice')}
            className="gap-2 min-w-24"
            data-testid="button-mode-voice"
          >
            <Mic className="w-4 h-4" />
            Voice
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-sm">
          {activeGoal && (
            <div className="max-w-md truncate" title={getBreadcrumb()} data-testid="text-breadcrumb">
              <span className="text-muted-foreground">Active:</span>{' '}
              <span className="font-medium">{getBreadcrumb()}</span>
            </div>
          )}
          <Badge variant="secondary" className="tabular-nums" data-testid="text-total-nodes">
            {totalNodes} {totalNodes === 1 ? 'node' : 'nodes'}
          </Badge>
        </div>
      </div>
    </header>
  );
}
