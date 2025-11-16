# Architecture Overview

This document provides a high-level overview of VoxplanWeb's system architecture, explaining how different components work together to create an interactive goal visualization application.

## System Overview

VoxplanWeb is a full-stack TypeScript application with a React frontend and Express backend. Currently, the application is primarily client-side focused, with the backend prepared for future database integration and API expansion.

```
┌──────────────────────────────────────────────────────────┐
│                      Browser Client                       │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │            React Application Layer                  │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Pages: Home, NotFound                       │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Components                                   │  │  │
│  │  │  - TreeCanvas (ReactFlow container)          │  │  │
│  │  │  - GoalNode (custom nodes)                   │  │  │
│  │  │  - CommandWindow, AttributeWindow            │  │  │
│  │  │  - Header, HelpDialog                        │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │            State Management Layer                   │  │
│  │  - Zustand Stores                                   │  │
│  │    • treeStore: Goals, hierarchy, active node      │  │
│  │    • uiStore: UI mode, panel visibility            │  │
│  └────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │            Services & Utilities Layer               │  │
│  │  - Layout Algorithms (D3.js + custom logic)        │  │
│  │  - Query Client (TanStack React Query)             │  │
│  │  - Utility functions                                │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                             │
                             │ HTTP (Future API calls)
                             ▼
┌──────────────────────────────────────────────────────────┐
│                    Express Server                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │  HTTP Server                                        │  │
│  │  - Vite dev middleware (development)               │  │
│  │  - Static file serving (production)                │  │
│  │  - API routes (minimal, ready for expansion)      │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Storage Layer                                      │  │
│  │  - IStorage interface                               │  │
│  │  - MemStorage (in-memory, current)                 │  │
│  │  - Database (Drizzle ORM configured, future)       │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Core Architecture Layers

### 1. Frontend Application Layer

**Responsibility**: User interface and interaction logic

**Key Components**:
- **Pages**: Route-level components (`Home.tsx`, `not-found.tsx`)
- **Tree Components**: Visualization (`TreeCanvas.tsx`, `GoalNode.tsx`)
- **Window Components**: Panels (`CommandWindow.tsx`, `AttributeWindow.tsx`)
- **Layout Components**: Structure (`Header.tsx`)
- **Dialog Components**: Modals (`HelpDialog.tsx`)

**Technology**:
- React 18 with TypeScript
- Wouter for routing
- ReactFlow for tree visualization
- shadcn/ui component library
- TailwindCSS for styling

### 2. State Management Layer

**Responsibility**: Application state and business logic

**State Stores** (Zustand):

#### treeStore (client/src/stores/treeStore.ts:1)
Manages the entire goal tree structure:
```typescript
interface TreeState {
  goals: Map<number, Goal>;        // All goals indexed by ID
  nextId: number;                   // Auto-incrementing ID
  activeGoalId: number | null;      // Currently selected goal
  rootId: number | null;            // Root node ID
  layoutMode: LayoutMode;           // Current layout algorithm

  // CRUD operations
  addGoal(name, details, parentId): number
  updateGoal(id, updates): void
  deleteGoal(id): void

  // Navigation
  setActiveGoal(id): void
  navigateUp/Down/Left/Right(): void

  // Helpers
  getChildren(id): Goal[]
  getParent(id): Goal | null
  getSiblings(id): Goal[]
}
```

#### uiStore (client/src/stores/uiStore.ts:1)
Manages UI state:
```typescript
interface UIState {
  mode: 'command' | 'navigate' | 'voice';
  commandPanelVisible: boolean;
  attributePanelVisible: boolean;

  setMode(mode): void
  toggleCommandPanel(): void
  toggleAttributePanel(): void
}
```

**Design Pattern**:
- Normalized state (goals stored in a `Map<id, Goal>`)
- Single source of truth
- Immutable updates
- Direct state access (no Redux-style actions)

### 3. Visualization Layer

**Responsibility**: Transform tree data into visual representation

**ReactFlow Integration** (client/src/components/tree/TreeCanvas.tsx:1):
- Converts goal hierarchy to ReactFlow nodes and edges
- Applies layout algorithms to position nodes
- Manages drag-and-drop interactions
- Handles zoom/pan controls

**Layout Algorithms** (client/src/utils/layouts.ts:1):

1. **Tree Layout** (Reingold-Tilford):
   - Traditional hierarchical top-down tree
   - D3.js `tree()` algorithm
   - Optimal space utilization
   - Custom separation function for siblings vs cousins

2. **Spider Layout** (Radial):
   - Mind-map style radial layout
   - Angular sectoring for children
   - Evenly distributed around parent
   - Special handling for linear trees

3. **Vertical Layout**:
   - Alternating left/right stacks
   - Minimized horizontal space
   - Good for narrow displays

**Manual Position Preservation**:
- Each goal stores positions per layout mode
- Switching layouts preserves custom arrangements
- Drag-lock feature moves children with parent

### 4. Backend Server Layer

**Responsibility**: HTTP server, API endpoints, data persistence

**Current Implementation** (server/index.ts:1):
```typescript
// Express server with:
- Vite dev middleware (development mode)
- Static file serving (production mode)
- Request logging
- JSON body parsing
- Route registration (minimal)
```

**Storage Interface** (server/storage.ts:1):
```typescript
interface IStorage {
  getUser(id): Promise<User | undefined>
  getUserByUsername(username): Promise<User | undefined>
  createUser(user): Promise<User>
}

class MemStorage implements IStorage {
  // In-memory Map for user data
}
```

**Future Expansion**:
- API routes for goal CRUD (server/routes.ts ready)
- Database integration via Drizzle ORM
- WebSocket for real-time sync
- Authentication/authorization

## Data Flow

### Goal Creation Flow

```
User presses 'n' key
  ↓
Home.tsx keydown handler
  ↓
treeStore.addGoal(name, details, parentId)
  ↓
New Goal added to goals Map
nextId incremented
activeGoalId set to new goal
  ↓
TreeCanvas.tsx useEffect triggers
  ↓
buildNodesAndEdges() recalculates
  ↓
calculateLayout() applies algorithm
  ↓
ReactFlow re-renders with new nodes
  ↓
User sees new goal in tree
```

### Navigation Flow

```
User presses 'h' key (navigate left)
  ↓
Home.tsx keydown handler
  ↓
navigateLeft() function
  ↓
Gets siblings from treeStore
Finds current index
Sets activeGoalId to previous sibling
  ↓
TreeCanvas re-renders
  ↓
Active goal visual indicator updates (red pulsating)
Center view on new active goal (optional)
```

### Layout Switch Flow

```
User clicks layout toggle button
  ↓
TreeCanvas.handleToggleLayout()
  ↓
Shows confirmation dialog
User confirms
  ↓
treeStore.setLayoutMode(newMode)
  ↓
calculateLayout() uses new algorithm
Checks for saved manual positions per mode
Uses saved position or recalculates
  ↓
ReactFlow updates node positions
```

## Component Hierarchy

```
App.tsx
├── QueryClientProvider (TanStack React Query)
├── TooltipProvider (shadcn/ui)
├── Toaster (notifications)
└── Router (Wouter)
    ├── Route: /
    │   └── Home.tsx
    │       ├── Header
    │       │   ├── Mode indicator
    │       │   ├── Active goal breadcrumb
    │       │   └── Help button
    │       ├── TreeCanvas
    │       │   ├── ReactFlow
    │       │   │   ├── Background
    │       │   │   ├── Controls (zoom/pan)
    │       │   │   └── Nodes (GoalNode components)
    │       │   └── Layout toggle button
    │       ├── CommandWindow (floating)
    │       ├── AttributeWindow (floating)
    │       └── HelpDialog (modal)
    └── Route: * (404)
        └── NotFound
```

## Key Design Decisions

### 1. Client-Side State Management

**Decision**: Use Zustand with in-memory state, no backend integration yet

**Rationale**:
- Fast development iteration
- No database setup complexity
- Easy to add persistence later
- State persists during session

**Trade-offs**:
- Data lost on page refresh (acceptable for prototype)
- No multi-device sync
- Future migration needed for persistence

### 2. ReactFlow for Visualization

**Decision**: Use ReactFlow library instead of custom canvas rendering

**Rationale**:
- Mature library with zoom/pan/drag built-in
- Custom node support
- Performance optimized
- Handles edge routing

**Trade-offs**:
- Learning curve for ReactFlow API
- Some overhead for simple use cases
- Less control over low-level rendering

### 3. Multiple Layout Algorithms

**Decision**: Support three different layout modes (tree, spider, vertical)

**Rationale**:
- Different users prefer different visualizations
- Tree: traditional hierarchy
- Spider: mind-map style
- Vertical: space-efficient
- Preserved positions per mode

**Trade-offs**:
- More complex layout calculation logic
- Need to store positions for each mode
- More UI controls needed

### 4. Vim-Style Keyboard Navigation

**Decision**: Use `hjkl` keys for navigation instead of arrow keys

**Rationale**:
- Power users familiar with vim
- Keeps hands on home row
- Professional/developer aesthetic
- Arrow keys still work in input fields

**Trade-offs**:
- Learning curve for non-vim users
- Could confuse casual users
- Need help documentation

### 5. Drag-Lock by Default

**Decision**: When dragging a goal, its children move with it by default

**Rationale**:
- Preserves subtree structure
- Intuitive for most users
- Can be toggled per goal

**Trade-offs**:
- More complex drag logic
- Performance considerations for large trees
- Need to update all descendant positions

## Performance Considerations

### 1. Efficient Re-renders

- Zustand only re-renders components that use changed state
- React.memo on GoalNode components
- useMemo for expensive layout calculations
- Debounced position updates during drag

### 2. Large Tree Handling

Current implementation works well for:
- Up to ~100 goals (tested)
- Depth up to 5-6 levels

Potential optimizations for larger trees:
- Virtual scrolling for off-screen nodes
- Level-of-detail rendering (simplified distant nodes)
- Lazy loading of subtrees

### 3. Layout Calculation Performance

- Tree layout: O(n) using D3's efficient algorithm
- Spider layout: O(n) single-pass calculation
- Vertical layout: O(n) stack-based positioning

## Security Considerations

### Current State

- No authentication required
- All data client-side only
- No API endpoints exposed

### Future Requirements

When backend integration is added:
- JWT-based authentication
- CORS configuration
- Input validation (Zod schemas)
- SQL injection prevention (Drizzle ORM parameterized queries)
- XSS prevention (React's built-in escaping)

## Scalability

### Horizontal Scaling (Future)

The architecture is designed to scale:
- Stateless Express server (can run multiple instances)
- Database-backed storage (shared state)
- CDN for static assets
- Load balancer for API requests

### Database Design (Future)

Using Drizzle ORM with PostgreSQL:
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  details TEXT,
  parent_id UUID REFERENCES goals(id),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

Indexes for performance:
- `parent_id` for children queries
- `user_id` for user-specific trees

## Error Handling

### Frontend

- Try/catch blocks in async operations
- Error boundaries for React component errors (future)
- Toast notifications for user-facing errors
- Console logging for debugging

### Backend

- Express error middleware (server/index.ts:52)
- Graceful error responses
- Request logging for debugging

## Development vs Production

### Development Mode

```bash
npm run dev
```

- Vite dev server with HMR
- Source maps enabled
- Detailed error messages
- Hot reload on file changes

### Production Mode

```bash
npm run build
npm start
```

- Minified bundles
- Tree-shaking enabled
- Static file serving
- Optimized asset loading

## Future Architecture Evolution

### Planned Enhancements

1. **Database Integration**:
   - Drizzle ORM with PostgreSQL
   - Migration to server-side state
   - Persistent storage

2. **Real-time Sync**:
   - WebSocket integration
   - Multi-client synchronization
   - Conflict resolution

3. **Authentication**:
   - User accounts
   - JWT tokens
   - Protected API routes

4. **Voice Mode**:
   - Web Speech API integration
   - Voice command processing
   - Text-to-speech feedback

5. **File Import/Export**:
   - JSON format support
   - Compatibility with desktop app
   - Bulk operations

## Related Documentation

- [Tech Stack](./03-tech-stack.md) - Detailed technology explanations
- [Project Structure](./04-project-structure.md) - File organization
- [Data Flow](./07-data-flow.md) - Detailed state management
- [Design Patterns](./06-design-patterns.md) - Code patterns and conventions

---

**Next**: Learn about the specific technologies used in [Tech Stack](./03-tech-stack.md).
