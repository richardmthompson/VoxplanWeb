import { useState, useRef, useEffect } from 'react';
import { useTreeStore } from '@/stores/treeStore';
import { useUIStore } from '@/stores/uiStore';
import { Terminal } from 'lucide-react';

export default function CommandWindow() {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([
    'VoxPlan Terminal v1.0',
    'Type "help" for available commands',
    ''
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const mode = useUIStore((state) => state.mode);
  const activeGoalId = useTreeStore((state) => state.activeGoalId);
  const addGoal = useTreeStore((state) => state.addGoal);
  const updateGoal = useTreeStore((state) => state.updateGoal);
  const deleteGoal = useTreeStore((state) => state.deleteGoal);
  const getGoal = useTreeStore((state) => state.getGoal);

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
          ''
        ]);
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
    }
  };

  return (
    <div 
      className="h-full flex flex-col bg-black/95 rounded-lg border border-green-500/30 overflow-hidden"
      data-testid="command-window"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border-b border-green-500/30">
        <Terminal className="w-4 h-4 text-green-500" />
        <span className="text-xs font-mono text-green-500">voxplan terminal</span>
        <div className="ml-auto flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
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
            className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono caret-green-400"
            autoFocus
            data-testid="input-command"
            style={{
              caretShape: 'block'
            }}
          />
        </div>
        <div ref={historyEndRef} />
      </div>
    </div>
  );
}
