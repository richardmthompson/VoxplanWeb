# Core Features

This document describes the main features of VoxplanWeb, explaining what they do, how they work, and how to use them.

## Overview

VoxplanWeb provides an interactive tree-based goal management system with three primary capabilities:

1. **Tree Visualization** - Visual representation of goal hierarchies
2. **Keyboard Navigation** - Vim-style navigation through goals
3. **Goal Management** - Create, edit, delete, and organize goals

## 1. Tree Visualization

### What It Does

Displays goals as a hierarchical tree structure with multiple layout modes, allowing users to visualize relationships and navigate their goal hierarchy.

### Visual Representation

**Goal Nodes**:
- Circular nodes representing individual goals
- Size decreases with depth (hierarchy level)
- Active goal highlighted in red with pulsating animation
- Inactive goals shown in blue
- White border ring on inactive nodes

**Connections**:
- Lines connecting parent goals to children
- Smooth bezier curves for visual clarity
- Black stroke (2px width)

**Size Scaling** (client/src/stores/treeStore.ts:66-71):
```
Root (depth 0):  110px × 100%  = 110px
Level 1:         110px × 75%   = 82.5px
Level 2:         110px × 60%   = 66px
Level 3:         110px × 48%   = 52.8px
Level 4+:        110px × 40%   = 44px
```

Creates a dramatic visual hierarchy that clearly shows depth.

### Layout Modes

#### Tree Layout (Default)

Traditional hierarchical top-down tree using D3's Reingold-Tilford algorithm.

**Algorithm** (client/src/utils/layouts.ts:48-121):
- Optimal space utilization
- Siblings closer together than cousins
- Horizontal spacing: 200px between nodes
- Vertical spacing: 180px between levels
- Centered on canvas

**Best for**:
- Traditional org charts
- Clear parent-child relationships
- Deep hierarchies

**How to activate**: Click layout button until Tree icon (Network) shows

#### Spider Layout (Radial)

Mind-map style radial layout with angular sectoring.

**Algorithm** (client/src/utils/layouts.ts:127-240):
- Root at center
- Children distributed radially around parent
- Angular sectoring: each child gets a wedge of the circle
- Radius increases with depth (150px + 120px per level)
- Special handling for linear trees (evenly distributed)

**Best for**:
- Mind-mapping
- Brainstorming sessions
- Radial thinking patterns
- Balanced trees with many children

**How to activate**: Click layout button until Radar icon shows

#### Vertical Layout

Stacked left/right layout minimizing horizontal space.

**Algorithm** (client/src/utils/layouts.ts:245-337):
- Root at center
- Level 1 children alternate left/right
- Children stack vertically below parent
- Horizontal spacing: 180px from center
- Vertical spacing: 100px between stacked nodes

**Best for**:
- Narrow displays
- Linear workflows
- Sequential processes
- Limited horizontal space

**How to activate**: Click layout button until List icon shows

### Manual Positioning

**Drag-and-Drop**:
- Click and drag any goal node
- Children move with parent (drag-locked by default)
- Position saved per layout mode
- Switch layouts without losing custom positions

**Drag-Lock Feature** (client/src/stores/treeStore.ts:81):
- Default: `dragLocked: true`
- When enabled: moving parent moves entire subtree
- Preserves spatial relationships
- Implemented in TreeCanvas.tsx (client/src/components/tree/TreeCanvas.tsx:157-189)

### Zoom and Pan

**Controls**:
- Scroll wheel: Zoom in/out
- Click and drag background: Pan
- Zoom buttons: Bottom-right corner
- Keyboard: `+` to zoom in, `-` to zoom out

**Fit View**:
- Auto-fits tree on canvas when layout changes
- Padding: 20% of viewport
- Transition duration: 300ms

**Center Active**:
- Button to center view on active goal
- Zoom level: 1.0
- Smooth transition: 500ms

## 2. Keyboard Navigation

### Navigation Modes

#### Navigate Mode (Default)

Keyboard-first interaction mode inspired by vim.

**Activation**: Default mode when app loads, or press `Esc` from any other mode

**Visual Indicator**: Header shows "NAVIGATE MODE"

**Available Commands**:

| Key | Action | Description |
|-----|--------|-------------|
| `h` | Navigate Left | Move to previous sibling |
| `j` | Navigate Down | Move to first child |
| `k` | Navigate Up | Move to parent |
| `l` | Navigate Right | Move to next sibling |
| `n` | New Sibling | Create sibling goal (opens attribute window) |
| `s` | New Child | Create child of active goal |
| `d` | Delete | Delete active goal and descendants |
| `a` | Attributes | Toggle attribute editing window |
| `c` | Command | Switch to command mode |
| `?` | Help | Show keyboard shortcuts dialog |
| `+/=` | Zoom In | Increase canvas zoom |
| `-/_` | Zoom Out | Decrease canvas zoom |

**Implementation** (client/src/pages/Home.tsx:84-153):
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if typing in input field
    if (target is input/textarea) return;

    if (mode === 'navigate') {
      switch (e.key) {
        case 'h': navigateLeft(); break;
        case 'j': navigateDown(); break;
        // ... etc
      }
    }
  };
  window.addEventListener('keydown', handleKeyDown);
}, [mode, ...]);
```

#### Command Mode

Text-based command input (in development).

**Activation**: Press `c` in navigate mode

**Visual Indicator**: Command window opens

**Status**: Minimal implementation, ready for text command parsing

#### Voice Mode

Voice-controlled interaction (planned, not yet implemented).

**Activation**: Press `v` (future)

**Features** (planned):
- Speech recognition for commands
- Text-to-speech feedback
- Hands-free operation

### Navigation Behavior

**Sibling Navigation (h/l)**:
- Siblings sorted by ID (creation order)
- Wraps: No (stops at first/last)
- If no siblings: No action

**Vertical Navigation (k/j)**:
- Up (k): Goes to parent
- Down (j): Goes to first child (by ID)
- At root (k): No action
- No children (j): No action

**Smart Focus Management**:
- Typing in input/textarea: Navigation disabled
- Clicking canvas: Refocuses main container
- Enables shortcuts immediately after mouse clicks

## 3. Goal Management

### Creating Goals

**Method 1: Keyboard (Navigate Mode)**:
```
Press 'n' → Creates sibling of active goal
Press 's' → Creates child of active goal
```

**Method 2: Command Window**:
- Click command window or press 'c'
- Type commands (future implementation)

**Automatic Behaviors**:
- New goal becomes active immediately
- Attribute window opens automatically
- Name defaults to "New Sibling" or "New Child"
- Positioned by layout algorithm

**First Goal (Empty Tree)**:
- Press 'n' creates root goal
- Named "New Root" by default

### Editing Goals

**Attribute Window**:
- Toggle with 'a' key
- Opens automatically when goal created
- Fields:
  - Goal Name (required)
  - Details (optional, multi-line)

**Editing Process**:
1. Select goal (click or navigate)
2. Press 'a' to open attributes
3. Edit name and/or details
4. Click "Save Changes" or press Esc

**Real-time Updates**:
- Changes saved to treeStore immediately
- Tree re-renders with updated name
- No "save" required (auto-saves on close)

### Deleting Goals

**Keyboard**: Press 'd' in navigate mode

**Behavior**:
- Deletes active goal AND all descendants
- Cannot delete root goal (safety measure)
- Active goal changes to sibling or parent

**Deletion Precedence** (client/src/stores/treeStore.ts:107-133):
1. Previous sibling (if exists)
2. Next sibling (if exists)
3. Parent (fallback)
4. null (if was only goal)

**Undo**: Not yet implemented (future feature)

### Goal Hierarchy

**Parent-Child Relationships**:
- Each goal has zero or one parent
- Goals can have multiple children
- Root goal has `parentId: null`

**Depth Limitations**:
- No hard limit on depth
- Visual clarity decreases beyond depth 4-5
- All depths supported by layout algorithms

**ID System**:
- Auto-incrementing integer IDs
- IDs never reused
- nextId tracked in treeStore

## 4. Visual Feedback

### Active Goal Indicator

**Visual Changes**:
- Color: Changes from blue to red
- Animation: Pulsating effect
- Border: No border ring (inactive goals have rings)

**Header Breadcrumb**:
- Shows path to active goal
- Format: "Root > Parent > Active Goal"
- Truncates long names with ellipsis

### State Preservation

**Manual Positions**:
- Stored per layout mode
- Structure:
  ```typescript
  manualPositions: {
    tree: { x: 100, y: 200 },
    spider: { x: 300, y: 400 },
    vertical: { x: 150, y: 250 }
  }
  ```
- Switch layouts without losing arrangements

**Layout Mode Confirmation**:
- Dialog asks before switching
- Explains manual positions preserved
- Cancel to abort switch

## 5. Help System

### Help Dialog

**Activation**: Press `?` key

**Contents**:
- Keyboard shortcuts reference
- Navigation commands
- Goal management commands
- Zoom controls
- Mode switching

**Implementation**:
- Modal dialog (client/src/components/dialogs/HelpDialog.tsx)
- Radix AlertDialog component
- Always accessible from any mode

## 6. Window Management

### Floating Windows

**Command Window**:
- Position: Bottom-left
- Toggle: Click button or press 'c'
- Draggable: Yes
- Resizable: No

**Attribute Window**:
- Position: Bottom-right
- Toggle: Click button or press 'a'
- Auto-opens on goal creation
- Draggable: Yes
- Resizable: No

**Window State**:
- Visibility persisted in uiStore
- Windows can overlap
- Windows float above canvas

## 7. Responsive Design

### Desktop (Primary Target)

- Three-panel layout: Command, Tree, Attributes
- Full keyboard navigation
- Optimized for 1024px+ width

### Mobile/Tablet (Basic Support)

- Touch gestures work (tap, drag, pinch-zoom)
- Keyboard navigation unavailable
- Windows may overlap more
- Not primary use case

## Performance Characteristics

### Tested Tree Sizes

- **Small (1-20 goals)**: Instant
- **Medium (20-50 goals)**: Very fast
- **Large (50-100 goals)**: Fast
- **Very Large (100+ goals)**: Acceptable, some lag on drag

### Layout Calculation Speed

- Tree layout: < 10ms for 100 goals
- Spider layout: < 15ms for 100 goals
- Vertical layout: < 10ms for 100 goals

### Rendering Performance

- ReactFlow optimized for large graphs
- Nodes virtualized (off-screen not rendered)
- Re-renders minimized via Zustand selectors

## Known Limitations

### Current Version

- No persistence (data lost on refresh)
- No undo/redo
- No multi-select
- No copy/paste
- No search/filter
- No file import/export
- Command mode not functional
- Voice mode not implemented

See [Known Issues](./10-known-issues.md) for full list and workarounds.

## Usage Examples

### Example 1: Create a Project Plan

```
1. Press 'n' → Create root "Project: Website Redesign"
2. Press 's' → Create child "Phase 1: Research"
3. Press 's' → Create child "User Interviews"
4. Press 'k' → Navigate up to "Phase 1"
5. Press 'l' → Navigate right (nothing happens, only child)
6. Press 'n' → Create sibling "Phase 2: Design"
7. Drag nodes to arrange visually
```

### Example 2: Navigate a Deep Tree

```
1. Click/navigate to a deep goal (depth 4)
2. Press 'k' repeatedly → Navigate up to root
3. Press 'j' → Navigate down to first child
4. Press 'l' → Navigate to next sibling
5. Press layout button → Switch to spider view
```

### Example 3: Reorganize Tree

```
1. Click layout button → Switch to tree layout
2. Drag goals to custom positions
3. Click layout button → Switch to spider
4. Positions preserved for tree mode
5. Spider layout shows different arrangement
```

## Related Documentation

- [Architecture Overview](./02-architecture-overview.md) - How features are implemented
- [Data Flow](./07-data-flow.md) - State management for features
- [UI Components](./08-ui-components.md) - Component details
- [Known Issues](./10-known-issues.md) - Current limitations

---

**Next**: Learn about code patterns in [Design Patterns](./06-design-patterns.md).
