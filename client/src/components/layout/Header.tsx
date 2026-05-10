import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/uiStore';
import { useTreeStore } from '@/stores/treeStore';
import { Command, Navigation, Mic, HelpCircle } from 'lucide-react';
import HelpDialog from '@/components/dialogs/HelpDialog';

interface HeaderProps {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

const LEGEND = [
  { label: 'Root', color: '#ffdd03' },
  { label: 'Blocked', color: '#ffffff' },
  { label: 'Active', color: '#62f6b5' },
  { label: 'Delegated', color: '#9977ff' },
  { label: 'Done', color: '#d4edda' },
];

export default function Header({ showHelp, setShowHelp }: HeaderProps) {
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
    <header
      className="px-6 py-3 bg-white flex flex-col gap-2"
      style={{ borderBottom: '3px solid #000', fontFamily: "'Outfit', sans-serif" }}
      data-testid="header"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
            VoxPlanWeb
          </h1>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={mode === 'command' ? 'default' : 'ghost'}
              onClick={() => setMode('command')}
              className="gap-2 min-w-24"
              style={{ border: mode === 'command' ? '2px solid #000' : undefined }}
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
              style={{ border: mode === 'navigate' ? '2px solid #000' : undefined }}
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
              style={{ border: mode === 'voice' ? '2px solid #000' : undefined }}
              data-testid="button-mode-voice"
            >
              <Mic className="w-4 h-4" />
              Voice
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {activeGoal && (
            <div className="max-w-md truncate" title={getBreadcrumb()} data-testid="text-breadcrumb">
              <span style={{ color: '#888' }}>Active:</span>{' '}
              <span style={{ fontWeight: 500 }}>{getBreadcrumb()}</span>
            </div>
          )}
          <span
            style={{
              background: '#fff',
              border: '2px solid #000',
              padding: '3px 10px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)',
            }}
            data-testid="text-total-nodes"
          >
            {totalNodes} {totalNodes === 1 ? 'node' : 'nodes'}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowHelp(true)}
            title="Help (Press ?)"
            data-testid="button-help"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Legend row */}
      <div className="flex items-center gap-4" style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
        {LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                background: item.color,
                border: '1px solid #000',
              }}
            />
            <span>{item.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <span style={{ display: 'inline-block', width: 20, height: 2, background: '#000' }} />
          <span>dependency</span>
        </div>
      </div>

      <HelpDialog open={showHelp} onOpenChange={setShowHelp} />
    </header>
  );
}
