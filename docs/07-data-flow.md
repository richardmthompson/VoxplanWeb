# Data Flow and State Management

This document explains how data flows through VoxplanWeb and how state is managed.

## State Architecture

### State Layers

```
┌─────────────────────────────────────┐
│     Component Local State           │  ← UI-only state (modals, inputs)
├─────────────────────────────────────┤
│     Global UI State (uiStore)       │  ← Mode, panel visibility
├─────────────────────────────────────┤
│     Application State (treeStore)   │  ← Goals, hierarchy, active node
├─────────────────────────────────────┤
│     Server State (React Query)      │  ← Future: API data caching
└─────────────────────────────────────┘
```

## Tree Store (treeStore)

### State Structure

```typescript
interface TreeState {
  // Core data
  goals: Map<number, Goal>;    // Normalized goal storage
  nextId: number;               // Auto-increment ID counter
  activeGoalId: number | null;  // Currently selected goal
  rootId: number | null;        // Root node reference
  layoutMode: LayoutMode;       // Current layout algorithm

  // Actions (mutations)
  addGoal(name, details, parentId): number
  updateGoal(id, updates): void
  deleteGoal(id): void
  setActiveGoal(id): void

  // Navigation
  navigateUp/Down/Left/Right(): void

  // Helpers (derived data)
  getGoal(id): Goal | undefined
  getChildren(id): Goal[]
  getParent(id): Goal | null
  getSiblings(id): Goal[]
}
```

### Goal Data Model

```typescript
interface Goal {
  id: number;                   // Unique identifier
  name: string;                 // Display name
  details: string;              // Description
  parentId: number | null;      // Parent reference (null for root)
  totalheight: number;          // Visual size (scaled by depth)
  position: { x: number; y: number };  // Current position
  manualPositions?: {           // Saved positions per layout
    tree?: { x: number; y: number };
    spider?: { x: number; y: number };
    vertical?: { x: number; y: number };
  };
  dragLocked?: boolean;         // Children move with parent?
}
```

## UI Store (uiStore)

### State Structure

```typescript
interface UIState {
  mode: 'command' | 'navigate' | 'voice';  // Interaction mode
  commandPanelVisible: boolean;             // Command window open?
  attributePanelVisible: boolean;           // Attribute window open?

  setMode(mode): void
  toggleCommandPanel(): void
  toggleAttributePanel(): void
}
```

## Data Flow Examples

### Example 1: Creating a Goal

```
┌─────────────────────────────────────────────────────┐
│ 1. User Event                                        │
│    User presses 'n' key                             │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ 2. Event Handler (Home.tsx:120)                     │
│    handleKeyDown() detects 'n' key                  │
│    if (e.key === 'n') addGoal(...)                  │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ 3. Store Action (treeStore.ts:52)                   │
│    addGoal() creates new Goal object                │
│    - Assigns next ID                                │
│    - Calculates size based on depth                 │
│    - Sets as active goal                            │
│    - Adds to goals Map                              │
│    set({ goals: newMap, activeGoalId: id })         │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ 4. Component Re-render (TreeCanvas.tsx)             │
│    useTreeStore() detects state change              │
│    buildNodesAndEdges() recalculates                │
│    ReactFlow receives new nodes array               │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ 5. Visual Update                                     │
│    New goal node appears in tree                    │
│    Highlighted in red (active)                      │
│    Attribute window opens                           │
└─────────────────────────────────────────────────────┘
```

### Example 2: Navigating the Tree

```
User presses 'h' (navigate left)
  ↓
Home.tsx handleKeyDown()
  ↓
navigateLeft() function
  ↓
treeStore.getSiblings(activeGoalId)
  → Returns array of siblings
  ↓
Find current index in siblings
  ↓
treeStore.setActiveGoal(previousSibling.id)
  ↓
TreeCanvas re-renders
  ↓
Previous node turns blue, new node turns red
```

### Example 3: Editing a Goal

```
User clicks goal → setActiveGoal(clickedId)
User presses 'a' → setAttributeWindowOpen(true)
User edits name field → Local state (useState)
User saves → updateGoal(id, { name: newName })
TreeCanvas re-renders → Node shows new name
```

## State Update Patterns

### Immutable Updates (Zustand Pattern)

```typescript
// Creating new Map for immutability
addGoal: (name, details, parentId) => {
  const state = get();
  const newGoals = new Map(state.goals);  // Copy
  newGoals.set(id, newGoal);              // Modify copy
  set({ goals: newGoals });               // Replace state
}
```

### Batch Updates

```typescript
// Multiple state changes in one set() call
addGoal: () => {
  set({
    goals: newGoals,
    nextId: nextId + 1,
    activeGoalId: newId,
    rootId: rootId ?? newId
  });
}
```

## Derived Data

### Computed Values (Helpers)

```typescript
// Not stored in state, calculated on demand
getChildren: (id) => {
  return Array.from(get().goals.values())
    .filter(g => g.parentId === id)
    .sort((a, b) => a.id - b.id);
}

// Used by components
const children = useTreeStore(state => state.getChildren(goalId));
```

### Memoized Calculations

```typescript
// Component-level memoization
const { nodes, edges } = useMemo(() => {
  const layout = calculateLayout(goals, rootId, layoutMode);
  return buildNodesAndEdges(layout);
}, [goals, rootId, layoutMode]);
```

## Reactivity and Re-renders

### Selector Pattern

```typescript
// ✅ Good: Only re-renders when activeGoalId changes
const activeGoalId = useTreeStore(state => state.activeGoalId);

// ❌ Bad: Re-renders on ANY state change
const { activeGoalId } = useTreeStore();
```

### Multiple Selectors

```typescript
// Each selector is independent
const goals = useTreeStore(state => state.goals);
const activeGoalId = useTreeStore(state => state.activeGoalId);
const layoutMode = useTreeStore(state => state.layoutMode);
// Component re-renders only when these specific values change
```

## State Persistence (Future)

### Current: In-Memory Only

State lost on page refresh.

### Planned: Multiple Persistence Layers

```
┌─────────────────────────────────┐
│  Client State (Zustand)         │
│  - Immediate updates             │
│  - Optimistic UI                 │
└────────┬────────────────────────┘
         │
         ↓ sync
┌─────────────────────────────────┐
│  Local Storage / IndexedDB      │
│  - Offline support               │
│  - Fast recovery on refresh      │
└────────┬────────────────────────┘
         │
         ↓ sync when online
┌─────────────────────────────────┐
│  Server Database (PostgreSQL)   │
│  - Persistent storage            │
│  - Multi-device sync             │
└─────────────────────────────────┘
```

## State Debugging

### Zustand DevTools

```typescript
// Add devtools middleware (future)
import { devtools } from 'zustand/middleware';

export const useTreeStore = create(
  devtools((set, get) => ({ ... }))
);
```

### React DevTools

- Inspect component props and state
- View Zustand store state
- Track re-renders

### Console Logging

```typescript
// Debug state changes
addGoal: (name, details, parentId) => {
  console.log('Adding goal:', { name, parentId });
  const newState = { ... };
  console.log('New state:', newState);
  set(newState);
}
```

## Related Documentation

- [Architecture Overview](./02-architecture-overview.md)
- [Design Patterns](./06-design-patterns.md)
- [Core Features](./05-core-features.md)
