# UI Components

This document provides a reference for all UI components used in VoxplanWeb.

## Component Library: shadcn/ui

VoxplanWeb uses [shadcn/ui](https://ui.shadcn.com/), a collection of reusable components built with:
- **Radix UI** - Accessible primitives
- **TailwindCSS** - Styling
- **TypeScript** - Type safety

All components are in `client/src/components/ui/`.

## Core Application Components

### TreeCanvas

**Location**: `client/src/components/tree/TreeCanvas.tsx`

**Purpose**: Main tree visualization container using ReactFlow

**Props**: None (uses stores)

**Features**:
- ReactFlow integration
- Layout algorithm selection
- Zoom/pan controls
- Background dots pattern
- Center active goal button
- Layout toggle button

### GoalNode

**Location**: `client/src/components/tree/GoalNode.tsx`

**Purpose**: Custom ReactFlow node for displaying goals

**Props**:
```typescript
interface GoalNodeData {
  id: number;
  name: string;
  totalheight: number;
  isActive: boolean;
  depth: number;
  hasChildren: boolean;
  dragLocked: boolean;
}
```

**Visual States**:
- **Active**: Red background, pulsating animation, no border
- **Inactive**: Blue background, white border ring

### CommandWindow

**Location**: `client/src/components/windows/CommandWindow.tsx`

**Purpose**: Floating command input panel

**Props**:
```typescript
interface Props {
  isOpen: boolean;
  onToggle: () => void;
  onGoalCreated: () => void;
}
```

**Features**:
- Draggable window
- Text input area
- Submit button
- Command history (future)

### AttributeWindow

**Location**: `client/src/components/windows/AttributeWindow.tsx`

**Purpose**: Goal editing panel

**Props**:
```typescript
interface Props {
  isOpen: boolean;
  onToggle: () => void;
}
```

**Fields**:
- Goal Name (required)
- Details (optional, textarea)

**Features**:
- Auto-opens on goal creation
- Edits active goal
- Save/cancel buttons

### Header

**Location**: `client/src/components/layout/Header.tsx`

**Purpose**: Application header bar

**Features**:
- Mode indicator (NAVIGATE MODE / COMMAND MODE)
- Active goal breadcrumb
- Help button (?)

### HelpDialog

**Location**: `client/src/components/dialogs/HelpDialog.tsx`

**Purpose**: Keyboard shortcuts reference

**Props**:
```typescript
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Content**: Complete list of keyboard shortcuts and commands

## shadcn/ui Components

### Button

**Usage**:
```typescript
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
```

**Variants**:
- `default` - Primary button
- `secondary` - Secondary button
- `outline` - Outlined button
- `ghost` - Transparent button
- `destructive` - Red/danger button

**Sizes**:
- `default` - Standard size
- `sm` - Small
- `lg` - Large
- `icon` - Icon-only (square)

### Input

**Usage**:
```typescript
import { Input } from '@/components/ui/input';

<Input type="text" placeholder="Enter name..." />
```

### Textarea

**Usage**:
```typescript
import { Textarea } from '@/components/ui/textarea';

<Textarea placeholder="Enter details..." rows={4} />
```

### Label

**Usage**:
```typescript
import { Label } from '@/components/ui/label';

<Label htmlFor="name">Goal Name</Label>
<Input id="name" />
```

### Dialog / AlertDialog

**Usage**:
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Toast

**Usage**:
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
  title: "Success",
  description: "Goal created successfully",
});
```

**Variants**:
- Default (info)
- `destructive` (error)

### Tooltip

**Usage**:
```typescript
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

<Tooltip>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent>
    <p>Helpful information</p>
  </TooltipContent>
</Tooltip>
```

## Utility Functions

### cn() - Class Name Helper

**Location**: `client/src/lib/utils.ts`

**Purpose**: Merge Tailwind classes intelligently

**Usage**:
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === 'primary' && "text-white bg-blue-500"
)} />
```

## Styling Conventions

### TailwindCSS Classes

Common patterns used throughout the app:

**Layout**:
- `flex items-center gap-4` - Horizontal layout with spacing
- `flex-col` - Vertical layout
- `w-full h-full` - Full width/height

**Spacing**:
- `p-4` - Padding 16px
- `p-6` - Padding 24px
- `gap-2` - Gap 8px
- `gap-4` - Gap 16px

**Colors**:
- `bg-card` - Card background
- `bg-background` - Page background
- `text-foreground` - Default text color
- `border` - Default border color

**Borders**:
- `rounded-lg` - Rounded corners (8px)
- `border` - 1px border

**Shadows**:
- `shadow-sm` - Small shadow
- `shadow-md` - Medium shadow
- `shadow-lg` - Large shadow

## Icon Library: Lucide React

**Installation**: Already included

**Usage**:
```typescript
import { Crosshair, Network, Radar, List } from 'lucide-react';

<Button size="icon">
  <Crosshair className="w-4 h-4" />
</Button>
```

**Icons used**:
- `Crosshair` - Center active goal
- `Network` - Tree layout mode
- `Radar` - Spider layout mode
- `List` - Vertical layout mode

## Component Development Guidelines

### Creating New Components

1. **Location**: Place in appropriate subdirectory
   - `components/tree/` - Tree-related
   - `components/windows/` - Floating panels
   - `components/ui/` - Reusable UI (shadcn)

2. **Structure**:
```typescript
import { useState } from 'react';

interface Props {
  // Define props
}

export function ComponentName({ prop1, prop2 }: Props) {
  const [state, setState] = useState();

  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

3. **Naming**: PascalCase, descriptive

4. **Exports**: Default export for components

### Styling Best Practices

- Use Tailwind utilities first
- Use `cn()` for conditional classes
- Avoid inline styles except for dynamic values
- Keep responsive design in mind (`md:`, `lg:` breakpoints)

## Related Documentation

- [Design Patterns](./06-design-patterns.md)
- [Development Guide](./11-development-guide.md)
- [Core Features](./05-core-features.md)
