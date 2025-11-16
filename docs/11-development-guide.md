# Development Guide

This guide covers coding standards, best practices, and development workflows for contributing to VoxplanWeb.

## Development Environment

### Required Tools

- Node.js 18+
- npm 8+
- Git
- Code editor (VS Code recommended)

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

## Code Style and Standards

### TypeScript

**Strict Mode**: Enabled in `tsconfig.json`

**Type Annotations**:
```typescript
// ✅ Good: Explicit types for function parameters
function addGoal(name: string, parentId: number | null): number {
  // ...
}

// ✅ Good: Type inference for variables
const goals = new Map<number, Goal>();
const count = goals.size; // inferred as number

// ❌ Avoid: any type
const data: any = fetchData(); // Bad
```

**Interfaces vs Types**:
```typescript
// ✅ Use interface for object shapes
interface Goal {
  id: number;
  name: string;
}

// ✅ Use type for unions, intersections
type LayoutMode = 'tree' | 'spider' | 'vertical';
```

### React Components

**Function Components**:
```typescript
// ✅ Preferred: Function components with hooks
export function GoalNode({ data }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return <div>...</div>;
}

// ❌ Avoid: Class components
class GoalNode extends React.Component { }
```

**Props Definition**:
```typescript
interface Props {
  goalId: number;
  onSave?: () => void;  // Optional props marked with ?
}

export function Component({ goalId, onSave }: Props) {
  // ...
}
```

### Naming Conventions

**Files**:
- Components: `PascalCase.tsx` (e.g., `TreeCanvas.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-toast.ts`)
- Utilities: `camelCase.ts` (e.g., `layouts.ts`)
- Stores: `camelCase.ts` (e.g., `treeStore.ts`)

**Variables**:
```typescript
// camelCase for variables and functions
const activeGoal = getGoal(id);
const handleClick = () => {};

// PascalCase for components and classes
function TreeCanvas() {}
class StorageManager {}

// UPPER_SNAKE_CASE for constants
const MAX_DEPTH = 10;
const DEFAULT_SIZE = 100;
```

**Booleans**:
```typescript
// Prefix with is/has/should
const isActive = true;
const hasChildren = children.length > 0;
const shouldRender = isVisible && !isLoading;
```

### Import Organization

```typescript
// 1. React and external libraries
import { useState, useEffect } from 'react';
import { create } from 'zustand';

// 2. Internal components and hooks
import { Button } from '@/components/ui/button';
import { useTreeStore } from '@/stores/treeStore';

// 3. Types
import type { Goal, LayoutMode } from '@/types';

// 4. Utilities
import { cn } from '@/lib/utils';
```

### Code Formatting

**Indentation**: 2 spaces
**Line Length**: 80-100 characters (soft limit)
**Semicolons**: Required
**Quotes**: Single quotes for strings, double for JSX

```typescript
// ✅ Good formatting
const message = 'Hello world';
return <div className="container">...</div>;

// ❌ Avoid
const message = "Hello world"
return <div className='container'>...</div>
```

## Git Workflow

### Branch Naming

```bash
# Feature branches
feature/add-search-functionality
feature/voice-mode

# Bug fixes
fix/navigation-crash
fix/layout-spacing

# Documentation
docs/update-api-reference

# Refactoring
refactor/simplify-layouts
```

### Commit Messages

**Format**:
```
<type>: <subject>

<body (optional)>
```

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

**Examples**:
```bash
git commit -m "feat: add search functionality to command window"
git commit -m "fix: prevent crash when deleting root goal"
git commit -m "docs: update API reference with new endpoints"
git commit -m "refactor: extract layout calculation to separate module"
```

### Pull Request Process

1. **Create branch** from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes** and commit regularly

3. **Type check** before committing:
   ```bash
   npm run check
   ```

4. **Push to remote**:
   ```bash
   git push -u origin feature/my-feature
   ```

5. **Create Pull Request** on GitHub

6. **Code review** - Address feedback

7. **Merge** after approval

## Adding New Features

### Step-by-Step Process

**1. Plan the Feature**
- Define requirements clearly
- Sketch UI if visual component
- Identify affected files

**2. Create Branch**
```bash
git checkout -b feature/my-feature
```

**3. Implement Feature**

Example: Adding a new layout mode

```typescript
// 1. Update type definition (stores/treeStore.ts)
export type LayoutMode = 'tree' | 'spider' | 'vertical' | 'circular';

// 2. Add layout algorithm (utils/layouts.ts)
export function calculateCircularLayout(
  goals: Map<number, Goal>,
  rootId: number
): LayoutResult {
  // Implementation...
}

// 3. Update main calculator (utils/layouts.ts)
export function calculateLayout(...) {
  switch (layoutMode) {
    case 'circular':
      return calculateCircularLayout(goals, rootId);
    // ...
  }
}

// 4. Add UI control (components/tree/TreeCanvas.tsx)
// Add button with Circular layout icon
```

**4. Test Changes**
- Manual testing in browser
- Check different scenarios
- Verify edge cases

**5. Update Documentation**
- Update relevant .md files
- Add code comments
- Update type definitions

**6. Commit and Push**
```bash
git add .
git commit -m "feat: add circular layout mode"
git push -u origin feature/circular-layout
```

## Component Development

### Creating a New Component

**1. Create File**:
```bash
touch client/src/components/category/ComponentName.tsx
```

**2. Component Template**:
```typescript
import { useState } from 'react';

interface Props {
  // Define props
  goalId: number;
  onSave?: () => void;
}

export function ComponentName({ goalId, onSave }: Props) {
  // Hooks
  const [isEditing, setIsEditing] = useState(false);
  const goal = useTreeStore(state => state.getGoal(goalId));

  // Event handlers
  const handleSave = () => {
    onSave?.();
  };

  // Effects
  useEffect(() => {
    // Side effects
  }, []);

  // Render
  return (
    <div className="component-container">
      <h2>{goal?.name}</h2>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

**3. Export from index** (if creating a module):
```typescript
// components/category/index.ts
export { ComponentName } from './ComponentName';
```

## State Management

### Adding State to Store

**1. Define State Shape**:
```typescript
interface TreeState {
  // Existing state...
  searchQuery: string;  // New state
}
```

**2. Add Initial Value**:
```typescript
export const useTreeStore = create<TreeState>()((set, get) => ({
  searchQuery: '',  // Initial value
}));
```

**3. Add Actions**:
```typescript
setSearchQuery: (query: string) => {
  set({ searchQuery: query });
}
```

**4. Use in Components**:
```typescript
const searchQuery = useTreeStore(state => state.searchQuery);
const setSearchQuery = useTreeStore(state => state.setSearchQuery);
```

## Common Tasks

### Adding a Keyboard Shortcut

**File**: `client/src/pages/Home.tsx`

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (mode === 'navigate') {
      if (e.key === 'f') {  // New shortcut: 'f' for find
        e.preventDefault();
        setShowSearch(true);
      }
    }
  };
  // ...
}, [mode, setShowSearch]);
```

### Adding a New Window Panel

1. Create component in `components/windows/`
2. Add visibility state to `uiStore`
3. Add toggle function to `uiStore`
4. Import and render in `Home.tsx`
5. Add keyboard shortcut for toggle

### Modifying Layout Algorithm

**File**: `client/src/utils/layouts.ts`

```typescript
export function calculateTreeLayout(
  goals: Map<number, Goal>,
  rootId: number
): LayoutResult {
  // Modify spacing, separation, etc.
  const horizontalSpacing = 250;  // Changed from 200
  // ...
}
```

## Debugging

### Console Logging

```typescript
// State changes
console.log('Goals updated:', goals);

// Event handling
console.log('Key pressed:', e.key);

// Calculations
console.log('Layout result:', { nodes, edges });
```

### React DevTools

- Install React DevTools browser extension
- Inspect component props and state
- View component tree
- Track re-renders

### TypeScript Errors

```bash
# Check for type errors
npm run check

# Common fixes:
# - Add type annotations
# - Use type guards (if (x !== null))
# - Add optional chaining (obj?.prop)
```

## Performance Optimization

### Preventing Re-renders

```typescript
// ✅ Memoize expensive calculations
const layout = useMemo(
  () => calculateLayout(goals, rootId, mode),
  [goals, rootId, mode]
);

// ✅ Memoize callbacks
const handleClick = useCallback(() => {
  updateGoal(id, updates);
}, [id, updates]);

// ✅ Memoize components
export const GoalNode = memo(({ data }) => {
  return <div>...</div>;
});
```

### Zustand Selectors

```typescript
// ✅ Select specific values
const activeGoalId = useTreeStore(state => state.activeGoalId);

// ❌ Select entire store
const store = useTreeStore();  // Re-renders on any change
```

## Testing (Future)

### Unit Tests

```typescript
// Example test structure
describe('treeStore', () => {
  it('should add goal correctly', () => {
    const { result } = renderHook(() => useTreeStore());

    act(() => {
      result.current.addGoal('Test', '', null);
    });

    expect(result.current.goals.size).toBe(1);
  });
});
```

### E2E Tests

```typescript
// Example Playwright test
test('create and delete goal', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('n');
  await page.fill('[data-testid="goal-name"]', 'Test Goal');
  // ... more interactions
  expect(await page.textContent('.goal-node')).toBe('Test Goal');
});
```

## Troubleshooting

### Common Issues

**Issue**: Type errors in TypeScript
**Solution**: Run `npm run check` and fix errors

**Issue**: Component not re-rendering
**Solution**: Check Zustand selector, ensure dependencies in hooks

**Issue**: Styles not applying
**Solution**: Check Tailwind class names, ensure TailwindCSS compiled

**Issue**: Import path errors
**Solution**: Use `@/` alias, check `tsconfig.json` paths

## Resources

### Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [ReactFlow Docs](https://reactflow.dev)

### Internal Docs
- [Architecture Overview](./02-architecture-overview.md)
- [Design Patterns](./06-design-patterns.md)
- [Project Structure](./04-project-structure.md)

## Questions?

For questions about development:
1. Check existing documentation
2. Review similar code in the codebase
3. Ask the team
4. Create an issue for clarification

---

Happy coding!
