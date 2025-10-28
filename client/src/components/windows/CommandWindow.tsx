import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTreeStore } from '@/stores/treeStore';
import { useUIStore } from '@/stores/uiStore';
import { Send } from 'lucide-react';

export default function CommandWindow() {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const mode = useUIStore((state) => state.mode);
  const activeGoalId = useTreeStore((state) => state.activeGoalId);
  const addGoal = useTreeStore((state) => state.addGoal);
  const updateGoal = useTreeStore((state) => state.updateGoal);
  const deleteGoal = useTreeStore((state) => state.deleteGoal);
  const getGoal = useTreeStore((state) => state.getGoal);

  const handleSubmit = () => {
    if (!command.trim()) return;

    const cmd = command.trim().toLowerCase();
    setHistory((prev) => [...prev, `> ${command}`]);

    try {
      if (cmd.startsWith('create root ') || cmd.startsWith('root ')) {
        const name = command.substring(cmd.indexOf(' ', cmd.indexOf(' ') + 1) + 1).trim();
        addGoal(name, '', null);
        setHistory((prev) => [...prev, `✓ Created root goal: ${name}`]);
      } else if (cmd.startsWith('create child ') || cmd.startsWith('child ')) {
        if (activeGoalId === null) {
          setHistory((prev) => [...prev, '✗ No active goal selected']);
        } else {
          const name = command.substring(cmd.indexOf(' ', cmd.indexOf(' ') + 1) + 1).trim();
          addGoal(name, '', activeGoalId);
          setHistory((prev) => [...prev, `✓ Created child goal: ${name}`]);
        }
      } else if (cmd.startsWith('create sibling ') || cmd.startsWith('sibling ')) {
        if (activeGoalId === null) {
          setHistory((prev) => [...prev, '✗ No active goal selected']);
        } else {
          const activeGoal = getGoal(activeGoalId);
          if (activeGoal?.parentId === null) {
            setHistory((prev) => [...prev, '✗ Cannot create sibling of root']);
          } else {
            const name = command.substring(cmd.indexOf(' ', cmd.indexOf(' ') + 1) + 1).trim();
            addGoal(name, '', activeGoal?.parentId ?? null);
            setHistory((prev) => [...prev, `✓ Created sibling goal: ${name}`]);
          }
        }
      } else if (cmd.startsWith('edit ')) {
        if (activeGoalId === null) {
          setHistory((prev) => [...prev, '✗ No active goal selected']);
        } else {
          const name = command.substring(5).trim();
          updateGoal(activeGoalId, { name });
          setHistory((prev) => [...prev, `✓ Updated goal name: ${name}`]);
        }
      } else if (cmd === 'delete') {
        if (activeGoalId === null) {
          setHistory((prev) => [...prev, '✗ No active goal selected']);
        } else {
          deleteGoal(activeGoalId);
          setHistory((prev) => [...prev, `✓ Deleted goal`]);
        }
      } else if (cmd === 'clear') {
        setHistory([]);
        setHistory((prev) => [...prev, '✓ History cleared']);
      } else {
        setHistory((prev) => [...prev, '✗ Unknown command']);
      }
    } catch (error) {
      setHistory((prev) => [...prev, `✗ Error: ${error}`]);
    }

    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="h-full flex flex-col" data-testid="command-window">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Commands</CardTitle>
        <Badge variant="secondary" className="font-mono text-xs" data-testid="mode-indicator">
          {mode.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <Textarea
            placeholder="Type a command...&#10;Examples:&#10;- create root My Goal&#10;- create child Sub Goal&#10;- edit New Name&#10;- delete"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="font-mono text-sm min-h-32 resize-none"
            data-testid="input-command"
          />
          <Button
            onClick={handleSubmit}
            className="w-full gap-2"
            data-testid="button-submit-command"
          >
            <Send className="w-4 h-4" />
            Execute
          </Button>
        </div>

        <div className="flex-1 max-h-64 overflow-y-auto border rounded-md p-3 bg-muted/50">
          <div className="space-y-1 font-mono text-xs" data-testid="command-history">
            {history.length === 0 ? (
              <p className="text-muted-foreground">Command history will appear here...</p>
            ) : (
              history.map((line, idx) => (
                <div
                  key={idx}
                  className={
                    line.startsWith('✓')
                      ? 'text-green-600 dark:text-green-400'
                      : line.startsWith('✗')
                      ? 'text-destructive'
                      : 'text-foreground'
                  }
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
