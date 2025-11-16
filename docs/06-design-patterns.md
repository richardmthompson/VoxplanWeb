# Design Patterns and Code Conventions

This document describes the coding patterns, architectural decisions, and conventions used throughout VoxplanWeb.

## State Management Patterns

### Zustand Store Pattern

**Structure**:
```typescript
export const useTreeStore = create<TreeState>()((set, get) => ({
  // State
  goals: new Map(),
  activeGoalId: null,

  // Actions
  addGoal: (name, details, parentId) => {
    const state = get();
    // ... logic
    set({ goals: newMap, activeGoalId: newId });
  },

  // Selectors/Helpers
  getChildren: (id) => {
    return Array.from(get().goals.values()).filter(g => g.parentId === id);
  }
}));
```

**Conventions**:
- State at top, actions below, helpers at bottom
- Use `get()` to read current state
- Use `set()` to update state
- Return values from actions when needed

### Normalized State Pattern

Goals stored in `Map<id, Goal>` instead of nested tree structure.

**Benefits**:
- O(1) lookups by ID
- Easy updates (no deep nesting)
- Prevents duplicate data
- Simpler state updates

**Example**:
```typescript
// ✅ Good: Normalized
goals: Map<number, Goal> = {
  1: { id: 1, name: "Root", parentId: null },
  2: { id: 2, name: "Child", parentId: 1 }
}

// ❌ Bad: Nested
goals = {
  id: 1,
  name: "Root",
  children: [
    { id: 2, name: "Child", children: [] }
  ]
}
```

## Component Patterns

### Hooks for Logic Separation

```typescript
// Component focuses on rendering
function Home() {
  const activeGoalId = useTreeStore(state => state.activeGoalId);
  const addGoal = useTreeStore(state => state.addGoal);

  useEffect(() => {
    // Side effect logic
  }, [dependencies]);

  return <div>...</div>;
}
```

### Memoization Pattern

```typescript
// Expensive calculations memoized
const { nodes, edges } = useMemo(() => {
  return buildNodesAndEdges();
}, [goals, activeGoalId, layoutMode]);

// Components memoized
const GoalNode = memo(({ data }) => {
  return <div>...</div>;
});
```

### Custom Hook Pattern

```typescript
// Extract reusable logic
function useKeyboardNavigation() {
  const navigate = useTreeStore(state => state.navigate);

  useEffect(() => {
    const handler = (e) => { /* ... */ };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}
```

## TypeScript Patterns

### Interface Definition

```typescript
// Prefer interfaces for object shapes
interface Goal {
  id: number;
  name: string;
  details: string;
  parentId: number | null;
}

// Use type for unions, intersections
type LayoutMode = 'tree' | 'spider' | 'vertical';
type Status = 'active' | 'inactive';
```

### Type Inference

```typescript
// Let TypeScript infer when obvious
const goals = new Map<number, Goal>(); // ✅
const name = goal.name; // string (inferred)

// Explicitly type when needed
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // ...
};
```

## React Patterns

### Component Organization

```typescript
// 1. Imports
import { useState } from 'react';
import { useTreeStore } from '@/stores/treeStore';

// 2. Types/Interfaces
interface Props {
  goalId: number;
}

// 3. Component
export function GoalEditor({ goalId }: Props) {
  // 4. Hooks
  const goal = useTreeStore(state => state.getGoal(goalId));
  const [editing, setEditing] = useState(false);

  // 5. Event handlers
  const handleSave = () => { /* ... */ };

  // 6. Effects
  useEffect(() => { /* ... */ }, []);

  // 7. Render
  return <div>...</div>;
}
```

### Event Handler Naming

```typescript
// Prefix with "handle"
const handleClick = () => {};
const handleSubmit = () => {};
const handleKeyDown = (e: KeyboardEvent) => {};

// Pass to components with "on" prefix
<Button onClick={handleClick} />
<Form onSubmit={handleSubmit} />
```

## Styling Patterns

### TailwindCSS Utility Classes

```typescript
// ✅ Prefer utility classes
<div className="flex items-center gap-4 p-6 bg-card rounded-lg">

// ❌ Avoid inline styles (except dynamic values)
<div style={{ padding: '24px' }}> // Bad

// ✅ OK for computed values
<div style={{ width: `${nodeWidth}px` }}> // Good
```

### Class Name Composition

```typescript
import { cn } from '@/lib/utils';

// Conditional classes
<Button className={cn(
  "base-class",
  isActive && "active-class",
  variant === 'primary' && "primary-class"
)} />
```

## Data Flow Patterns

### Unidirectional Data Flow

```
User Action → Event Handler → Store Update → Component Re-render
```

**Example**:
```typescript
// 1. User presses 'n'
<div onKeyDown={handleKeyDown} />

// 2. Handler calls store action
const handleKeyDown = (e) => {
  if (e.key === 'n') addGoal('New Goal', '', activeGoalId);
};

// 3. Store updates state
addGoal: (name, details, parentId) => {
  set({ goals: newGoals });
},

// 4. Component re-renders
const goals = useTreeStore(state => state.goals);
```

### Props vs State

**Props**: Data passed from parent
```typescript
<GoalNode data={goalData} />
```

**Local State**: Component-specific UI state
```typescript
const [isOpen, setIsOpen] = useState(false);
```

**Global State**: Shared across components
```typescript
const activeGoalId = useTreeStore(state => state.activeGoalId);
```

## Error Handling Patterns

### Try-Catch for Async Operations

```typescript
const handleSubmit = async () => {
  try {
    await saveGoal(goal);
  } catch (error) {
    console.error('Failed to save:', error);
    // Show toast notification
  }
};
```

### Defensive Checks

```typescript
// Check existence before accessing
const goal = goals.get(id);
if (!goal) return;

// Provide fallbacks
const name = goal.name || 'Untitled';
```

## Performance Patterns

### Avoid Unnecessary Re-renders

```typescript
// ✅ Select only what you need
const activeGoalId = useTreeStore(state => state.activeGoalId);

// ❌ Don't select entire store
const store = useTreeStore(); // Causes re-render on any change
```

### Debounce Expensive Operations

```typescript
const debouncedSave = useDebouncedCallback(
  (goal) => updateGoal(goal),
  500
);
```

### Memoize Expensive Calculations

```typescript
const layout = useMemo(
  () => calculateLayout(goals, rootId, mode),
  [goals, rootId, mode]
);
```

## File Organization

### Import Order

```typescript
// 1. External libraries
import React from 'react';
import { create } from 'zustand';

// 2. Internal modules
import { Button } from '@/components/ui/button';
import { useTreeStore } from '@/stores/treeStore';

// 3. Types
import type { Goal } from '@/types';

// 4. Styles (if separate)
import './styles.css';
```

### Export Patterns

```typescript
// Default export for components
export default function Home() {}

// Named exports for utilities
export { calculateLayout, calculateTreeLayout };

// Export types
export type { Goal, LayoutMode };
```

## Naming Conventions

### Variables and Functions

```typescript
// camelCase for variables and functions
const activeGoal = goals.get(id);
const handleClick = () => {};

// PascalCase for components
function GoalNode() {}
```

### Constants

```typescript
// UPPER_SNAKE_CASE for constants
const MAX_DEPTH = 10;
const DEFAULT_NODE_SIZE = 100;
```

### Boolean Variables

```typescript
// Prefix with is/has/should
const isActive = goal.id === activeGoalId;
const hasChildren = children.length > 0;
const shouldRender = isVisible && hasData;
```

## Code Documentation

### JSDoc Comments

```typescript
/**
 * Calculate tree layout using D3's Reingold-Tilford algorithm
 * @param goals - Map of all goals
 * @param rootId - ID of root goal
 * @returns Layout with positioned nodes
 */
export function calculateTreeLayout(
  goals: Map<number, Goal>,
  rootId: number
): LayoutResult {
  // ...
}
```

### Inline Comments

```typescript
// Use comments for "why" not "what"

// ✅ Good: Explains reasoning
// Siblings get tighter spacing than cousins for visual grouping
.separation((a, b) => a.parent === b.parent ? 1 : 1.5)

// ❌ Bad: States the obvious
// Set separation to 1 or 1.5
.separation((a, b) => a.parent === b.parent ? 1 : 1.5)
```

## Testing Patterns (Future)

### Unit Test Structure

```typescript
describe('treeStore', () => {
  it('should add goal with correct parent', () => {
    const { result } = renderHook(() => useTreeStore());

    act(() => {
      result.current.addGoal('Test', '', null);
    });

    expect(result.current.goals.size).toBe(1);
  });
});
```

## Anti-Patterns to Avoid

### ❌ Mutating State Directly

```typescript
// ❌ Bad
goals.get(id).name = 'New Name';

// ✅ Good
updateGoal(id, { name: 'New Name' });
```

### ❌ Prop Drilling

```typescript
// ❌ Bad: Passing through many levels
<Parent goalId={id}>
  <Middle goalId={id}>
    <Child goalId={id} />

// ✅ Good: Use store directly
const Child = () => {
  const goalId = useTreeStore(state => state.activeGoalId);
};
```

### ❌ Large Components

```typescript
// ❌ Bad: 500 line component

// ✅ Good: Break into smaller components
<Home>
  <Header />
  <TreeCanvas />
  <CommandWindow />
  <AttributeWindow />
</Home>
```

## Related Documentation

- [Architecture](./02-architecture-overview.md)
- [Data Flow](./07-data-flow.md)
- [Development Guide](./11-development-guide.md)
