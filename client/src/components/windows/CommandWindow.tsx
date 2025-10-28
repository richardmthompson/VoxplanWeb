import { useState, useRef, useEffect } from 'react';
import { useTreeStore } from '@/stores/treeStore';
import { useUIStore } from '@/stores/uiStore';
import { Terminal, Minimize2, Maximize2 } from 'lucide-react';

interface CommandWindowProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function CommandWindow({ isOpen, onToggle }: CommandWindowProps) {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([
    'VoxPlan Terminal v1.0',
    'Type "help" for available commands',
    ''
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const setMode = useUIStore((state) => state.setMode);
  const activeGoalId = useTreeStore((state) => state.activeGoalId);
  const addGoal = useTreeStore((state) => state.addGoal);
  const updateGoal = useTreeStore((state) => state.updateGoal);
  const deleteGoal = useTreeStore((state) => state.deleteGoal);
  const getGoal = useTreeStore((state) => state.getGoal);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = () => {
    if (!command.trim()) {
      setHistory((prev) => [...prev, 'voxplan > ', '']);
      setCommand('');
      return;
    }

    const cmd = command.trim().toLowerCase();
    setHistory((prev) => [...prev, `voxplan > ${command}`]);

    try {
      if (cmd === 'help') {
        setHistory((prev) => [...prev, 
          'Available commands:',
          '  root [name]     - Create root goal',
          '  child [name]    - Add child to active goal',
          '  sibling [name]  - Add sibling to active goal',
          '  edit [name]     - Rename active goal',
          '  delete          - Delete active goal',
          '  clear           - Clear terminal',
          '  exit            - Close terminal (or ESC key)',
          ''
        ]);
      } else if (cmd === 'exit') {
        setMode('navigate');
        onToggle();
        setHistory((prev) => [...prev, '✓ Exiting to Navigate mode', '']);
      } else if (cmd.startsWith('create root ') || cmd.startsWith('root ')) {
        const name = command.substring(cmd.indexOf(' ', cmd.indexOf(' ') + 1) + 1).trim();
        addGoal(name, '', null);
        setHistory((prev) => [...prev, `✓ Created root goal: ${name}`, '']);
      } else if (cmd.startsWith('create child ') || cmd.startsWith('child ')) {
        if (activeGoalId === null) {
          setHistory((prev) => [...prev, '✗ No active goal selected', '']);
        } else {
          const name = command.substring(cmd.indexOf(' ', cmd.indexOf(' ') + 1) + 1).trim();
          addGoal(name, '', activeGoalId);
          setHistory((prev) => [...prev, `✓ Created child goal: ${name}`, '']);
        }
      } else if (cmd.startsWith('create sibling ') || cmd.startsWith('sibling ')) {
        if (activeGoalId === null) {
          setHistory((prev) => [...prev, '✗ No active goal selected', '']);
        } else {
          const activeGoal = getGoal(activeGoalId);
          if (activeGoal?.parentId === null) {
            setHistory((prev) => [...prev, '✗ Cannot create sibling of root', '']);
          } else {
            const name = command.substring(cmd.indexOf(' ', cmd.indexOf(' ') + 1) + 1).trim();
            addGoal(name, '', activeGoal?.parentId ?? null);
            setHistory((prev) => [...prev, `✓ Created sibling goal: ${name}`, '']);
          }
        }
      } else if (cmd.startsWith('edit ')) {
        if (activeGoalId === null) {
          setHistory((prev) => [...prev, '✗ No active goal selected', '']);
        } else {
          const name = command.substring(5).trim();
          updateGoal(activeGoalId, { name });
          setHistory((prev) => [...prev, `✓ Updated goal name: ${name}`, '']);
        }
      } else if (cmd === 'delete') {
        if (activeGoalId === null) {
          setHistory((prev) => [...prev, '✗ No active goal selected', '']);
        } else {
          deleteGoal(activeGoalId);
          setHistory((prev) => [...prev, `✓ Deleted goal`, '']);
        }
      } else if (cmd === 'clear') {
        setHistory(['']);
      } else {
        setHistory((prev) => [...prev, `✗ Unknown command: ${cmd}`, '']);
      }
    } catch (error) {
      setHistory((prev) => [...prev, `✗ Error: ${error}`, '']);
    }

    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setMode('navigate');
      onToggle();
    }
  };

  return (
    <>
      {/* Minimized toolbar at bottom */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-4 left-4 flex items-center gap-2 px-4 py-2 bg-black/90 border border-green-500/50 rounded-lg text-green-400 hover:bg-black hover:border-green-400 transition-all shadow-lg"
          data-testid="button-open-terminal"
        >
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-mono">Command Mode (⌘C)</span>
        </button>
      )}

      {/* Expanded terminal window */}
      {isOpen && (
        <div 
          className="fixed bottom-4 left-4 flex flex-col bg-black/95 rounded-lg border border-green-500/30 overflow-hidden shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-8"
          style={{ width: '480px', height: '320px' }}
          data-testid="command-window"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border-b border-green-500/30">
            <Terminal className="w-4 h-4 text-green-500" />
            <span className="text-xs font-mono text-green-500">voxplan command mode</span>
            <div className="ml-auto flex gap-1.5 items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMode('navigate');
                  onToggle();
                }}
                className="hover:bg-green-500/20 p-1 rounded transition-colors"
                data-testid="button-minimize-terminal"
              >
                <Minimize2 className="w-3 h-3 text-green-500" />
              </button>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-sm text-green-400 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-green-500/30">
            {history.map((line, idx) => (
              <div
                key={idx}
                className={
                  line.startsWith('✓')
                    ? 'text-green-400'
                    : line.startsWith('✗')
                    ? 'text-red-400'
                    : line.startsWith('voxplan >')
                    ? 'text-green-500'
                    : 'text-green-400/80'
                }
              >
                {line || '\u00A0'}
              </div>
            ))}
            
            {/* Current Input Line */}
            <div className="flex items-center gap-2">
              <span className="text-green-500">voxplan &gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono caret-green-400 terminal-input"
                autoFocus
                data-testid="input-command"
              />
            </div>
            <div ref={historyEndRef} />
          </div>
        </div>
      )}
    </>
  );
}
