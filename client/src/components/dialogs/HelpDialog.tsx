import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Command, Navigation, Mic, Keyboard } from 'lucide-react';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutRowProps {
  keys: string[];
  description: string;
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        {keys.map((key, idx) => (
          <Badge
            key={idx}
            variant="outline"
            className="font-mono text-xs min-w-8 justify-center"
          >
            {key}
          </Badge>
        ))}
      </div>
      <div className="text-sm flex-1">{description}</div>
    </div>
  );
}

interface CommandRowProps {
  command: string;
  alias?: string;
  description: string;
}

function CommandRow({ command, alias, description }: CommandRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <code className="bg-muted px-2 py-0.5 rounded font-mono text-xs">
          {command}
        </code>
        {alias && (
          <span className="text-xs text-muted-foreground">
            or <code className="bg-muted px-2 py-0.5 rounded font-mono">{alias}</code>
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground ml-1">{description}</p>
    </div>
  );
}

export default function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-help">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Keyboard className="w-6 h-6" />
            VoxPlan Help
          </DialogTitle>
          <DialogDescription>
            Keyboard shortcuts and mode explanations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <section>
            <h3 className="text-lg font-semibold mb-3">Modes</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Command className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <div className="font-medium">Command Mode</div>
                  <p className="text-sm text-muted-foreground">
                    Type commands to create and manage goals. Use the command window on the left
                    to add child goals, edit names, or view details.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Navigation className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <div className="font-medium">Navigate Mode</div>
                  <p className="text-sm text-muted-foreground">
                    Use arrow keys to navigate through the goal tree. The active goal is
                    highlighted in red. Navigate to parents, children, and siblings easily.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mic className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium text-muted-foreground">Voice Mode (Coming Soon)</div>
                  <p className="text-sm text-muted-foreground">
                    Future feature for voice-controlled goal planning.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">Available Commands</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">COMMAND MODE</h4>
                <div className="space-y-2 text-sm">
                  <CommandRow
                    command="create root [name]"
                    alias="root [name]"
                    description="Create a new root goal"
                  />
                  <CommandRow
                    command="create child [name]"
                    alias="child [name]"
                    description="Add a child to the active goal"
                  />
                  <CommandRow
                    command="create sibling [name]"
                    alias="sibling [name]"
                    description="Add a sibling to the active goal"
                  />
                  <CommandRow
                    command="edit [new name]"
                    description="Rename the active goal"
                  />
                  <CommandRow
                    command="delete"
                    description="Delete the active goal (cannot delete root)"
                  />
                  <CommandRow
                    command="clear"
                    description="Clear command history"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">NAVIGATE MODE - NAVIGATION</h4>
                <div className="space-y-2">
                  <ShortcutRow
                    keys={['↑', 'k']}
                    description="Navigate to parent goal"
                  />
                  <ShortcutRow
                    keys={['↓', 'j']}
                    description="Navigate to first child goal"
                  />
                  <ShortcutRow
                    keys={['←', 'h']}
                    description="Navigate to left sibling"
                  />
                  <ShortcutRow
                    keys={['→', 'l']}
                    description="Navigate to right sibling"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">NAVIGATE MODE - ACTIONS</h4>
                <div className="space-y-2">
                  <ShortcutRow
                    keys={['n']}
                    description="Create new sibling goal"
                  />
                  <ShortcutRow
                    keys={['s']}
                    description="Create new child (sub) goal"
                  />
                  <ShortcutRow
                    keys={['d']}
                    description="Delete active goal"
                  />
                  <ShortcutRow
                    keys={['c']}
                    description="Switch to Command Mode"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">GLOBAL SHORTCUTS</h4>
                <div className="space-y-2">
                  <ShortcutRow
                    keys={['?']}
                    description="Toggle this help dialog"
                  />
                  <ShortcutRow
                    keys={['Enter']}
                    description="Execute command (in command window)"
                  />
                  <ShortcutRow
                    keys={['Esc']}
                    description="Exit input field / Return to navigation"
                  />
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Click <strong>Navigate Mode</strong> in the header (or press <code className="bg-muted px-1 rounded">c</code> to switch to Command Mode)</li>
              <li>Use arrow keys or <code className="bg-muted px-1 rounded">h/j/k/l</code> to navigate the tree</li>
              <li>Press <code className="bg-muted px-1 rounded">s</code> to create a child goal or <code className="bg-muted px-1 rounded">n</code> for a sibling</li>
              <li>Press <code className="bg-muted px-1 rounded">c</code> to switch to Command Mode for text-based commands</li>
              <li>Use the <strong>Attribute Panel</strong> on the right to edit detailed information</li>
            </ol>
          </section>
          
          <section>
            <h3 className="text-lg font-semibold mb-3">Tips</h3>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li><strong>Navigate Mode</strong> is fastest for quick goal creation using keyboard shortcuts</li>
              <li><strong>Command Mode</strong> is better for complex operations with descriptive names</li>
              <li>The active goal is shown in red on the tree and in the header breadcrumb</li>
              <li>Click any goal node to instantly select it (works in any mode)</li>
              <li>Use Vim keys (<code className="bg-muted px-1 rounded">h/j/k/l</code>) for efficient navigation without leaving home row</li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
