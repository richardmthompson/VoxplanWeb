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
            <h3 className="text-lg font-semibold mb-3">Keyboard Shortcuts</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">NAVIGATE MODE</h4>
                <div className="space-y-2">
                  <ShortcutRow
                    keys={['↑']}
                    description="Navigate to parent goal"
                  />
                  <ShortcutRow
                    keys={['↓']}
                    description="Navigate to first child goal"
                  />
                  <ShortcutRow
                    keys={['←']}
                    description="Navigate to left sibling"
                  />
                  <ShortcutRow
                    keys={['→']}
                    description="Navigate to right sibling"
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">GLOBAL</h4>
                <div className="space-y-2">
                  <ShortcutRow
                    keys={['?']}
                    description="Toggle this help dialog"
                  />
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-3">Getting Started</h3>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Start in <strong>Command Mode</strong> and add child goals using the command window</li>
              <li>Switch to <strong>Navigate Mode</strong> to explore your goal tree with arrow keys</li>
              <li>Click on any goal node to select it</li>
              <li>Use the attribute panel on the right to view and edit goal details</li>
              <li>Use the center button in the tree canvas to focus on the active goal</li>
            </ol>
          </section>

          <Separator />

          <section className="text-xs text-muted-foreground">
            <p>
              <strong>Tip:</strong> The active goal is always shown in the breadcrumb in the header
              and highlighted in red on the tree canvas.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
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
