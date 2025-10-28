import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTreeStore } from '@/stores/treeStore';
import { FileText, Minimize2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AttributeWindowProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function AttributeWindow({ isOpen, onToggle }: AttributeWindowProps) {
  const activeGoalId = useTreeStore((state) => state.activeGoalId);
  const getGoal = useTreeStore((state) => state.getGoal);
  const updateGoal = useTreeStore((state) => state.updateGoal);
  const { toast } = useToast();

  const activeGoal = activeGoalId !== null ? getGoal(activeGoalId) : null;

  const [name, setName] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (activeGoal) {
      setName(activeGoal.name);
      setDetails(activeGoal.details);
    } else {
      setName('');
      setDetails('');
    }
  }, [activeGoal]);

  const handleSave = () => {
    if (activeGoalId !== null) {
      updateGoal(activeGoalId, { name, details });
      toast({
        title: 'Goal Updated',
        description: 'Changes saved successfully',
      });
    }
  };

  return (
    <>
      {/* Minimized toolbar at bottom right */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover-elevate active-elevate-2 transition-all shadow-lg"
          data-testid="button-open-attributes"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Attributes (a)</span>
        </button>
      )}

      {/* Expanded attribute window */}
      {isOpen && (
        <div 
          className="fixed bottom-4 right-4 flex flex-col bg-card border border-border rounded-lg overflow-hidden shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-8"
          style={{ width: '384px', height: '400px' }}
          data-testid="attribute-window"
        >
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <h3 className="text-sm font-semibold">Goal Attributes</h3>
            </div>
            <button
              onClick={onToggle}
              className="hover:bg-accent p-1.5 rounded transition-colors"
              data-testid="button-minimize-attributes"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Window Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeGoal ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="goal-name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="goal-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Goal name..."
                    className="w-full"
                    data-testid="input-goal-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-details" className="text-sm font-medium">
                    Details
                  </Label>
                  <Textarea
                    id="goal-details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Additional details and notes..."
                    className="min-h-32 resize-vertical"
                    data-testid="input-goal-details"
                  />
                </div>

                <div className="pt-2 space-y-2 text-xs text-muted-foreground border-t">
                  <div data-testid="text-goal-id">
                    <span className="font-medium">ID:</span> {activeGoal.id}
                  </div>
                  <div data-testid="text-goal-depth">
                    <span className="font-medium">Parent:</span>{' '}
                    {activeGoal.parentId ?? 'Root'}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="gap-2"
                    data-testid="button-save-goal"
                  >
                    Save
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm text-center">
                  Select a goal to view<br />and edit its attributes
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
