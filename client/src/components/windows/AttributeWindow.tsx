import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTreeStore } from '@/stores/treeStore';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AttributeWindow() {
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
    <Card className="h-full flex flex-col" data-testid="attribute-window">
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg font-semibold">Goal Attributes</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pt-6 space-y-4">
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
                className="min-h-40 resize-vertical"
                data-testid="input-goal-details"
              />
            </div>

            <div className="pt-2 space-y-2">
              <div className="text-sm text-muted-foreground space-y-1">
                <div data-testid="text-goal-id">
                  <span className="font-medium">ID:</span> {activeGoal.id}
                </div>
                <div data-testid="text-goal-depth">
                  <span className="font-medium">Parent ID:</span>{' '}
                  {activeGoal.parentId ?? 'None (Root)'}
                </div>
                <div data-testid="text-goal-height">
                  <span className="font-medium">Height:</span>{' '}
                  {activeGoal.totalheight.toFixed(1)}px
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                onClick={handleSave}
                className="gap-2"
                data-testid="button-save-goal"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              Select a goal to view and edit its attributes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
