# VoxPlan Web App - Phase 1 Implementation PRP

---

## Goal

**Feature Goal**: Build a production-ready web application that replicates VoxPlan desktop app's core tree operations with real-time backend persistence, achieving feature parity for creating, viewing, editing, and navigating hierarchical goal structures.

**Deliverable**:
- Full-stack web application with Python FastAPI backend + React TypeScript frontend
- SQLite database persistence
- React Flow tree visualization with custom goal nodes
- entitree-flex automatic tree layout (supports variable node sizes)
- Complete CRUD operations with real-time WebSocket updates
- Working keyboard navigation and command interface

**Success Definition**:
- User can create/edit/delete goals with immediate backend persistence
- Tree visualization matches desktop app's visual appearance (colors, scaling, layout)
- Keyboard shortcuts work identically to desktop app
- All operations complete in <200ms
- 80%+ test coverage on backend and frontend

## User Persona

**Target User**: Goal-oriented individuals and productivity enthusiasts who currently use VoxPlan desktop app

**Use Case**: Daily goal planning and management with hierarchical task breakdown, accessing goals from any device via web browser

**User Journey**:
1. Open web app in browser (no installation)
2. See existing goal tree or start with root goal
3. Navigate tree using keyboard (Tab, arrows) or mouse clicks
4. Create child goals by typing commands ("new: Goal Name")
5. Edit goal details in attribute window
6. View tree update in real-time with smooth animations
7. Data persists automatically to backend database

**Pain Points Addressed**:
- Desktop app requires installation and isn't portable
- No cloud sync - goals stuck on one machine
- Can't access from mobile/tablet
- No collaboration features (future)

## Why

- **Business Value**: Modernize VoxPlan for web platform, enabling cross-device access and future multi-user features
- **Integration**: Prepares foundation for Phase 2+ features (voice, day planner, LLM integration)
- **Technical Debt**: Desktop Kivy framework has limited web support; fresh React/FastAPI stack is modern and maintainable
- **User Impact**: Users gain instant access from any device without installation, with automatic cloud backup

## What

### User-Visible Behavior

**Tree Visualization**:
- Hierarchical goal tree rendered with React Flow + entitree-flex layout
- Custom goal node components with:
  - Blue color for inactive goals (rgb(128, 179, 255))
  - Red color with pulsating animation for active goal (rgb(191, 33, 33))
  - Size scaling: 90% reduction per depth level (handled by entitree-flex)
  - White text centered in node
  - Smooth connections between parent and child nodes

**Command Window** (bottom-left):
- Text input for commands
- Command history (up/down arrows)
- Commands: `new: Name`, `rename: Name`, `details: Text`, `delete`, `parent`, `child 1`, `sibling 2`

**Attribute Window** (right side):
- Displays active goal's name and details
- Inline editing with auto-save

**Navigation**:
- Click goal to activate it
- Tab: next sibling
- Shift+Tab: previous sibling
- Up/Down arrows: parent/first child
- ESC: deselect active goal

**Real-Time Updates**:
- Operations reflect immediately in UI
- WebSocket broadcasts changes to other connected clients (future multi-user prep)

### Success Criteria

- [ ] User can create root goal on first visit
- [ ] User can create child goals under any parent
- [ ] User can navigate tree with keyboard shortcuts matching desktop app
- [ ] User can edit goal name and details with auto-save
- [ ] User can delete goals (with cascade delete of children)
- [ ] Active goal shows red with pulsating animation
- [ ] Tree layout calculates positions correctly using entitree-flex (no overlapping nodes)
- [ ] All operations persist to database and survive page refresh
- [ ] Backend responds to API calls within 200ms (p95)
- [ ] Frontend renders tree with 1000+ nodes without lag
- [ ] Zero console errors or warnings in browser
- [ ] All unit tests pass (80%+ coverage)

## All Needed Context

### Context Completeness Check

_This PRP provides: (1) Complete codebase reference from desktop app, (2) Exact patterns to follow for tree operations, (3) Data models with validation schemas, (4) API endpoint specifications, (5) React Flow + entitree-flex integration examples, (6) Testing strategies for both stacks._

### Documentation & References

```yaml
# MUST READ - Desktop App Source Code
- file: /Users/richardthompson/CODE/voxplan/desktop/voxplan.py
  why: Core VoxPlan class with tree operations (create, delete, navigate, edit)
  pattern: Command dictionary pattern, tree traversal algorithms
  gotcha: Uses anytree library - we'll use flat dictionary + parent_id references instead

- file: /Users/richardthompson/CODE/voxplan/desktop/goalnode.py
  why: Visual representation layer with size scaling and color logic
  pattern: 4-layer rendering (connection, border, node, label), pulsating animation
  gotcha: Kivy-specific positioning - translate to React Flow node positioning

- file: /Users/richardthompson/CODE/voxplan/desktop/voxplan-guiapp.py
  why: MVC controller, keyboard event routing
  pattern: Mode system (cmdMode, navMode), keyboard shortcuts
  gotcha: 908 lines - focus on keyboard handlers (lines 400-600), skip manual layout algorithms

- file: /Users/richardthompson/CODE/voxplan/.claude/PRPs/voxplan-language-agnostic-documentation.md
  why: Complete system specification extracted from desktop app
  section: All sections - this is the canonical reference
  critical: Part 5 (Key Algorithms), Part 6 (Design Patterns), Part 8 (Constraints)

- file: /Users/richardthompson/CODE/voxplan/.claude/PRPs/voxplan-web-architecture-proposal.md
  why: Approved architecture design with tech stack decisions
  section: API Design, Data Models, Component Structure
  critical: Normalized state structure, React Flow integration examples

# External Library Documentation
- url: https://reactflow.dev/learn
  why: React Flow custom node creation, edge styling
  critical: Custom node components, edge styling, position calculations

- url: https://github.com/codeledge/entitree-flex
  why: entitree-flex tree layout with variable node sizes
  critical: layoutFromMap() API, enableFlex option for variable sizes

- url: https://tanstack.com/query/latest/docs/framework/react/overview
  why: React Query for server state management and caching
  critical: useMutation optimistic updates, cache invalidation patterns

- url: https://fastapi.tiangolo.com/tutorial/
  why: FastAPI async endpoints, Pydantic validation, WebSocket support
  critical: Dependency injection pattern, async SQLAlchemy integration

- url: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
  why: Async SQLAlchemy patterns for FastAPI
  critical: AsyncSession usage, relationship loading strategies
```

### Current Codebase Tree

```bash
voxplan/  # Root directory (current state)
├── voxplan.py                  # Core VoxPlan class (160 lines) - MOVE to desktop/
├── goalnode.py                 # GoalNode visual component (289 lines) - MOVE to desktop/
├── voxplan-guiapp.py           # GUI controller (908 lines) - MOVE to desktop/
├── listener.py                 # Voice recognition (41 lines) - MOVE to desktop/
├── README.md                   # Project vision - UPDATE
├── .claude/
│   └── PRPs/
│       ├── voxplan-language-agnostic-documentation.md  # System spec
│       ├── voxplan-web-architecture-proposal.md         # Architecture
│       └── voxplan-web-phase1-implementation.md         # This PRP
└── data/
    └── example_tree.json       # Sample goal tree - KEEP at root
```

### Desired Codebase Tree (Post-Implementation)

```bash
voxplan/  # Repository root
│
├── desktop/                    # Existing Kivy app (moved here)
│   ├── voxplan.py              # Core VoxPlan class
│   ├── goalnode.py             # GoalNode visual component
│   ├── voxplan-guiapp.py       # GUI controller
│   ├── listener.py             # Voice recognition
│   ├── requirements.txt        # Desktop dependencies
│   └── README.md               # Desktop-specific setup
│
├── web/                        # New web application
│   ├── backend/                # Python FastAPI backend
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── config.py           # Settings (DATABASE_URL, etc.)
│   │   ├── requirements.txt    # Python dependencies
│   │   ├── pyproject.toml      # UV project config
│   │   ├── voxplan.db          # SQLite database (auto-created)
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py         # Dependency injection
│   │   │   ├── router.py       # Main router aggregation
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── goals.py    # Goal CRUD endpoints
│   │   │       ├── trees.py    # Tree operations
│   │   │       └── websocket.py # WebSocket endpoint
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── goal.py         # SQLAlchemy Goal model
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   └── goal.py         # Pydantic schemas
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── voxplan.py      # Core VoxPlan service
│   │   │   └── websocket_manager.py # WebSocket manager
│   │   │
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── base.py         # SQLAlchemy base
│   │   │   └── session.py      # Session management
│   │   │
│   │   ├── tests/
│   │   │   ├── __init__.py
│   │   │   ├── conftest.py     # Pytest fixtures
│   │   │   ├── test_goals.py   # Goal endpoint tests
│   │   │   └── test_voxplan_service.py # Service tests
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── json_import.py  # Desktop JSON import
│   │
│   └── frontend/               # React TypeScript frontend
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       │
│       ├── public/
│       │   └── favicon.ico
│       │
│       └── src/
│           ├── main.tsx        # App entry point
│           ├── App.tsx         # Root component
│           ├── vite-env.d.ts
│           │
│           ├── components/
│           │   ├── tree/
│           │   │   ├── TreeCanvas.tsx      # React Flow container
│           │   │   ├── GoalNode.tsx        # Custom node
│           │   │   └── TreeControls.tsx    # Zoom/pan controls
│           │   │
│           │   ├── windows/
│           │   │   ├── CommandWindow.tsx   # Command input
│           │   │   ├── AttributeWindow.tsx # Details editor
│           │   │   └── NavigationPanel.tsx # Breadcrumbs
│           │   │
│           │   └── common/
│           │       ├── Button.tsx          # Reusable button
│           │       ├── Input.tsx           # Reusable input
│           │       └── Layout.tsx          # Layout container
│           │
│           ├── stores/
│           │   ├── treeStore.ts    # Zustand tree state
│           │   └── uiStore.ts      # UI state
│           │
│           ├── hooks/
│           │   ├── useGoals.ts     # React Query hooks
│           │   ├── useTreeOperations.ts # Tree operations
│           │   ├── useKeyboard.ts  # Keyboard handling
│           │   └── useWebSocket.ts # WebSocket hook
│           │
│           ├── services/
│           │   ├── api.ts          # HTTP client
│           │   ├── websocket.ts    # WebSocket client
│           │   ├── treeLayout.ts   # entitree-flex wrapper
│           │   └── commands.ts     # Command parser
│           │
│           ├── utils/
│           │   ├── tree.ts         # Tree traversal
│           │   └── constants.ts    # Constants
│           │
│           ├── types/
│           │   ├── goal.ts         # Goal types
│           │   ├── tree.ts         # Tree types
│           │   └── api.ts          # API types
│           │
│           └── tests/
│               ├── setup.ts        # Vitest setup
│               └── components/
│                   └── GoalNode.test.tsx
│
├── data/                       # Shared data (both apps)
│   └── example_trees/
│
├── .claude/                    # Documentation
│   ├── CLAUDE.md               # Development guidelines
│   └── PRPs/
│       └── voxplan-web-phase1-implementation.md
│
├── README.md                   # Root README (both versions)
└── .gitignore                  # Ignore artifacts
```

### Known Gotchas & Library Quirks

```python
# CRITICAL: anytree (desktop app) vs flat dictionary (web app)
# Desktop app uses anytree Node structure with .parent and .children
# Web app uses flat dictionary with parent_id references

# Desktop (anytree):
node = Node(name="Goal", parent=parent_node)
children = node.children  # List of Node objects

# Web backend (SQLAlchemy):
goal = Goal(name="Goal", parent_id=parent.id)
children = session.query(Goal).filter_by(parent_id=goal.id).all()

# Web frontend (normalized state):
goals = { [id]: { id, name, parent_id }, ... }
children = Object.values(goals).filter(g => g.parent_id === parentId)
```

```typescript
// CRITICAL: entitree-flex handles layout automatically
// React Flow expects { x, y } positions in pixels
// entitree-flex calculates these for us with variable node sizes

// You provide: tree structure + node dimensions
const treeMap = {
  [goalId]: {
    id: goalId,
    width: 100,   // Individual node width
    height: 100,  // Individual node height
    children: [childId1, childId2],
  }
};

// entitree-flex calculates positions
const { nodes } = layoutFromMap(rootId, treeMap, {
  enableFlex: true,  // ✅ Enable variable sizes
  firstDegreeSpacing: 20,  // Sibling spacing
  secondDegreeSpacing: 100, // Depth spacing
});

// Result: nodes[i].x and nodes[i].y are calculated
```

```python
# CRITICAL: SQLAlchemy async patterns
# FastAPI uses async/await, so must use AsyncSession

# ❌ WRONG - Sync session in async context
def get_goals():
    session = Session()
    return session.query(Goal).all()

# ✅ CORRECT - Async session
async def get_goals():
    async with AsyncSession() as session:
        result = await session.execute(select(Goal))
        return result.scalars().all()
```

```typescript
// CRITICAL: React Query caching
// React Query caches by queryKey
// Must invalidate cache after mutations

const { mutate } = useMutation({
  mutationFn: createGoal,
  onSuccess: () => {
    // ✅ MUST invalidate to refetch
    queryClient.invalidateQueries(['goals']);
  },
});
```

```python
# CRITICAL: WebSocket broadcast
# When a goal is created/updated/deleted, broadcast to all connected clients
# Prevents stale data in multi-tab scenarios

@router.post("/api/v1/goals")
async def create_goal(goal: GoalCreate):
    new_goal = await voxplan_service.create_goal(goal)

    # ✅ Broadcast to WebSocket clients
    await ws_manager.broadcast("goal.created", new_goal.model_dump())

    return new_goal
```

## Implementation Blueprint

### Data Models and Structure

Create the core data models to ensure type safety and consistency.

```python
# web/backend/models/goal.py - SQLAlchemy ORM Model
from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4
from db.base import Base

class Goal(Base):
    """SQLAlchemy model for goal persistence"""
    __tablename__ = "goals"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Content
    name = Column(String(255), nullable=False, index=True)
    details = Column(Text, nullable=True)

    # Tree structure
    parent_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"), nullable=True, index=True)

    # Visual properties (stored but recalculated on frontend)
    position_x = Column(Float, nullable=True)
    position_y = Column(Float, nullable=True)
    totalheight = Column(Float, default=100.0)

    # State
    active = Column(Boolean, default=False, index=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships (for ORM convenience, not serialized to API)
    parent = relationship("Goal", remote_side=[id], back_populates="children")
    children = relationship("Goal", back_populates="parent", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Goal(id={self.id}, name='{self.name}', parent_id={self.parent_id})>"
```

```python
# web/backend/schemas/goal.py - Pydantic Schemas (API contracts)
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class GoalBase(BaseModel):
    """Base goal schema with common fields"""
    name: str = Field(..., min_length=1, max_length=255)
    details: Optional[str] = None
    totalheight: float = Field(default=100.0, gt=0)
    active: bool = False

class GoalCreate(GoalBase):
    """Schema for creating new goals"""
    parent_id: Optional[UUID] = None

class GoalUpdate(BaseModel):
    """Schema for updating goals - all fields optional"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    details: Optional[str] = None
    active: Optional[bool] = None

class Goal(GoalBase):
    """Complete goal schema returned by API"""
    id: UUID
    parent_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)  # Enable ORM mode

class TreeState(BaseModel):
    """Complete tree state snapshot"""
    goals: dict[str, Goal]  # Normalized: id -> goal
    root_id: Optional[str] = None
    active_id: Optional[str] = None
```

```typescript
// web/frontend/src/types/goal.ts - TypeScript types with Zod validation
import { z } from 'zod';

// Zod schemas (runtime validation)
export const goalBaseSchema = z.object({
  name: z.string().min(1).max(255),
  details: z.string().optional(),
  totalheight: z.number().positive().default(100),
  active: z.boolean().default(false),
});

export const goalCreateSchema = goalBaseSchema.extend({
  parentId: z.string().uuid().optional(),
});

export const goalSchema = goalBaseSchema.extend({
  id: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const treeStateSchema = z.object({
  goals: z.record(z.string().uuid(), goalSchema),
  rootId: z.string().uuid().optional(),
  activeId: z.string().uuid().optional(),
});

// TypeScript types (derived from Zod schemas)
export type Goal = z.infer<typeof goalSchema>;
export type GoalCreate = z.infer<typeof goalCreateSchema>;
export type TreeState = z.infer<typeof treeStateSchema>;

// React Flow node data type
export interface GoalNodeData {
  goal: Goal;
  depth: number;
  isActive: boolean;
  childCount: number;
}
```

### Implementation Tasks (Ordered by Dependencies)

```yaml
# ============================================
# PROJECT SETUP
# ============================================

Task 0: MIGRATE desktop app files
  - COMMAND: mkdir -p desktop web/backend web/frontend
  - MOVE: mv voxplan.py goalnode.py voxplan-guiapp.py listener.py desktop/
  - KEEP: data/ at root level (shared between desktop and web)
  - UPDATE: Root README.md to explain both versions
  - PLACEMENT: See "Desired Codebase Tree" section

# ============================================
# BACKEND IMPLEMENTATION
# ============================================

Task 1: CREATE web/backend/db/base.py
  - IMPLEMENT: SQLAlchemy Base class and async engine setup
  - PATTERN: Async SQLAlchemy with SQLite
  - NAMING: Base (declarative base), engine (async engine), AsyncSessionLocal
  - CODE:
      from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
      from sqlalchemy.orm import declarative_base
      DATABASE_URL = "sqlite+aiosqlite:///./voxplan.db"
      engine = create_async_engine(DATABASE_URL, echo=True)
      AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
      Base = declarative_base()

Task 2: CREATE web/backend/models/goal.py
  - IMPLEMENT: Goal SQLAlchemy model (see Data Models section above)
  - FOLLOW pattern: Standard SQLAlchemy model with relationships
  - NAMING: Goal class, snake_case columns
  - DEPENDENCIES: Imports Base from Task 1
  - PLACEMENT: web/backend/models/

Task 3: CREATE web/backend/schemas/goal.py
  - IMPLEMENT: Pydantic schemas (GoalBase, GoalCreate, GoalUpdate, Goal, TreeState)
  - FOLLOW pattern: Pydantic v2 with Field validators
  - NAMING: PascalCase for classes, snake_case for fields
  - PLACEMENT: web/backend/schemas/

Task 4: CREATE web/backend/db/session.py
  - IMPLEMENT: Database session dependency for FastAPI
  - PATTERN: Async context manager with dependency injection
  - CODE:
      async def get_db() -> AsyncGenerator[AsyncSession, None]:
          async with AsyncSessionLocal() as session:
              yield session
  - PLACEMENT: web/backend/db/

Task 5: CREATE web/backend/services/voxplan.py
  - IMPLEMENT: VoxPlanService class with async methods (create_goal, get_goal, update_goal, delete_goal, set_active, get_children, get_tree)
  - FOLLOW pattern: Port from desktop/voxplan.py (lines 30-160), convert to async
  - NAMING: VoxPlanService class, async def methods
  - CRITICAL: Cascade delete for children, recursive descendant deletion
  - DEPENDENCIES: Imports Goal model (Task 2), Goal schema (Task 3), AsyncSession (Task 4)
  - PLACEMENT: web/backend/services/
  - REFERENCE: See architecture proposal for complete implementation example

Task 6: CREATE web/backend/services/websocket_manager.py
  - IMPLEMENT: WebSocketManager class (connect, disconnect, broadcast methods)
  - PATTERN: Connection pooling with Set[WebSocket]
  - NAMING: WebSocketManager class, snake_case methods
  - PLACEMENT: web/backend/services/

Task 7: CREATE web/backend/api/deps.py
  - IMPLEMENT: FastAPI dependency functions (get_db, get_voxplan_service)
  - PATTERN: Dependency injection with Depends()
  - CODE:
      async def get_voxplan_service(db: AsyncSession = Depends(get_db)) -> VoxPlanService:
          return VoxPlanService(db)
  - PLACEMENT: web/backend/api/

Task 8: CREATE web/backend/api/routes/goals.py
  - IMPLEMENT: FastAPI router with goal CRUD endpoints
  - ENDPOINTS:
      GET    /api/v1/goals           # List all goals
      GET    /api/v1/goals/{goal_id} # Get single goal
      POST   /api/v1/goals           # Create goal
      PUT    /api/v1/goals/{goal_id} # Update goal
      DELETE /api/v1/goals/{goal_id} # Delete goal
      POST   /api/v1/goals/{goal_id}/activate  # Set active
      GET    /api/v1/goals/{goal_id}/children  # Get children
  - FOLLOW pattern: FastAPI async route handlers with dependency injection
  - NAMING: snake_case function names (get_goals, create_goal)
  - CRITICAL: Broadcast WebSocket events after mutations
  - DEPENDENCIES: VoxPlanService (Task 5), WebSocketManager (Task 6)
  - PLACEMENT: web/backend/api/routes/

Task 9: CREATE web/backend/api/routes/trees.py
  - IMPLEMENT: Tree-level operations endpoint
  - ENDPOINTS:
      GET /api/v1/trees/current  # Get entire tree as normalized dict
  - PATTERN: Return TreeState schema with all goals
  - PLACEMENT: web/backend/api/routes/

Task 10: CREATE web/backend/api/routes/websocket.py
  - IMPLEMENT: WebSocket endpoint for real-time updates
  - ENDPOINT: WS /ws
  - PATTERN: Accept connection, listen for messages, broadcast events
  - CODE:
      @router.websocket("/ws")
      async def websocket_endpoint(websocket: WebSocket):
          await ws_manager.connect(websocket)
          try:
              while True:
                  data = await websocket.receive_text()
                  # Handle incoming messages
          except WebSocketDisconnect:
              ws_manager.disconnect(websocket)
  - PLACEMENT: web/backend/api/routes/

Task 11: CREATE web/backend/api/router.py
  - IMPLEMENT: Main router that aggregates all route modules
  - PATTERN: Include routers with prefix
  - CODE:
      from api.routes import goals, trees, websocket
      api_router = APIRouter()
      api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
      api_router.include_router(trees.router, prefix="/trees", tags=["trees"])
      api_router.include_router(websocket.router, tags=["websocket"])
  - PLACEMENT: web/backend/api/

Task 12: CREATE web/backend/main.py
  - IMPLEMENT: FastAPI app entry point
  - PATTERN: Create app, include routers, add CORS middleware, create tables on startup
  - CODE:
      from fastapi import FastAPI
      from fastapi.middleware.cors import CORSMiddleware
      from api.router import api_router
      from db.base import engine, Base

      app = FastAPI(title="VoxPlan API")

      app.add_middleware(
          CORSMiddleware,
          allow_origins=["http://localhost:5173"],
          allow_credentials=True,
          allow_methods=["*"],
          allow_headers=["*"],
      )

      @app.on_event("startup")
      async def startup():
          async with engine.begin() as conn:
              await conn.run_sync(Base.metadata.create_all)

      app.include_router(api_router, prefix="/api/v1")
  - PLACEMENT: web/backend/

Task 13: CREATE web/backend/config.py
  - IMPLEMENT: Settings class with Pydantic BaseSettings
  - PATTERN: Environment variable loading
  - FIELDS: DATABASE_URL, CORS_ORIGINS, DEBUG
  - PLACEMENT: web/backend/

Task 14: CREATE web/backend/requirements.txt
  - LIST dependencies:
      fastapi==0.115.0
      uvicorn[standard]==0.31.0
      sqlalchemy[asyncio]==2.0.36
      aiosqlite==0.20.0
      pydantic==2.9.2
      pydantic-settings==2.6.0
  - PLACEMENT: web/backend/

# ============================================
# FRONTEND IMPLEMENTATION
# ============================================

Task 15: CREATE web/frontend/ project with Vite
  - COMMAND: cd web && npm create vite@latest frontend -- --template react-ts
  - INSTALL dependencies: cd frontend && npm install
  - ADD dependencies:
      npm install reactflow zustand immer zod @tanstack/react-query entitree-flex
  - CRITICAL: entitree-flex handles automatic tree layout with variable node sizes
  - PLACEMENT: web/frontend/ directory created

Task 16: CREATE web/frontend/src/types/goal.ts
  - IMPLEMENT: TypeScript types and Zod schemas (see Data Models section above)
  - NAMING: PascalCase for types, camelCase for fields
  - PLACEMENT: web/frontend/src/types/

Task 17: CREATE web/frontend/src/services/api.ts
  - IMPLEMENT: HTTP client wrapper around fetch
  - PATTERN: Base URL configuration, error handling, JSON parsing
  - CODE:
      const API_BASE = "http://localhost:8000/api/v1";

      export async function fetchGoals(): Promise<Goal[]> {
        const res = await fetch(`${API_BASE}/goals`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }

      export async function createGoal(data: GoalCreate): Promise<Goal> {
        const res = await fetch(`${API_BASE}/goals`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }
      // ... other API functions
  - PLACEMENT: web/frontend/src/services/

Task 18: CREATE web/frontend/src/services/websocket.ts
  - IMPLEMENT: WebSocket client with reconnection logic
  - PATTERN: Event emitter for WebSocket messages
  - CODE:
      class WebSocketClient {
        private ws: WebSocket | null = null;
        private listeners: Map<string, Set<Function>> = new Map();

        connect() {
          this.ws = new WebSocket("ws://localhost:8000/ws");
          this.ws.onmessage = (event) => {
            const { event: eventName, data } = JSON.parse(event.data);
            this.listeners.get(eventName)?.forEach(cb => cb(data));
          };
        }

        on(event: string, callback: Function) {
          if (!this.listeners.has(event)) this.listeners.set(event, new Set());
          this.listeners.get(event)!.add(callback);
        }
      }

      export const wsClient = new WebSocketClient();
  - PLACEMENT: web/frontend/src/services/

Task 19: CREATE web/frontend/src/stores/treeStore.ts
  - IMPLEMENT: Zustand store with Immer middleware
  - STATE: goals (normalized dict), rootId, activeId
  - ACTIONS: setGoals, addGoal, updateGoal, deleteGoal, setActive
  - SELECTORS: getChildren, getAncestors, getActiveNode
  - PATTERN: Normalized state with immer for immutable updates
  - REFERENCE: See architecture proposal for complete implementation
  - PLACEMENT: web/frontend/src/stores/

Task 20: CREATE web/frontend/src/hooks/useGoals.ts
  - IMPLEMENT: React Query hooks for goal operations
  - HOOKS:
      useGoals() - fetch all goals
      useCreateGoal() - create goal mutation
      useUpdateGoal() - update goal mutation
      useDeleteGoal() - delete goal mutation
      useActivateGoal() - set active mutation
  - PATTERN: React Query with cache invalidation on mutations
  - DEPENDENCIES: api.ts (Task 17), treeStore.ts (Task 19)
  - PLACEMENT: web/frontend/src/hooks/

Task 21: CREATE web/frontend/src/hooks/useWebSocket.ts
  - IMPLEMENT: React hook for WebSocket connection
  - PATTERN: useEffect to connect/disconnect, sync events to Zustand store
  - CODE:
      export function useWebSocket() {
        const addGoal = useTreeStore(state => state.addGoal);
        const updateGoal = useTreeStore(state => state.updateGoal);
        const deleteGoal = useTreeStore(state => state.deleteGoal);

        useEffect(() => {
          wsClient.connect();
          wsClient.on("goal.created", (goal) => addGoal(goal));
          wsClient.on("goal.updated", ({ id, goal }) => updateGoal(id, goal));
          wsClient.on("goal.deleted", ({ id }) => deleteGoal(id));

          return () => wsClient.disconnect();
        }, []);
      }
  - PLACEMENT: web/frontend/src/hooks/

Task 22: CREATE web/frontend/src/services/treeLayout.ts
  - IMPLEMENT: Tree positioning using entitree-flex library
  - FUNCTION: calculateNodePositions(goals: Record<string, Goal>) => Record<string, {x: number, y: number}>
  - ALGORITHM: Use entitree-flex layoutFromMap() with enableFlex: true for variable node sizes
  - CODE:
      import { layoutFromMap } from 'entitree-flex';

      export function calculateNodePositions(
        goals: Record<string, Goal>
      ): Record<string, { x: number; y: number }> {
        const root = Object.values(goals).find(g => !g.parentId);
        if (!root) return {};

        // Build tree map for entitree-flex
        const treeMap: Record<string, any> = {};
        Object.values(goals).forEach(goal => {
          const depth = calculateDepth(goal, goals);
          const height = 100 * Math.pow(0.9, depth); // 90% scaling per depth
          const width = height * 1.37;

          treeMap[goal.id] = {
            id: goal.id,
            width,   // Individual node width
            height,  // Individual node height
            children: Object.values(goals)
              .filter(g => g.parentId === goal.id)
              .map(g => g.id),
          };
        });

        // Let entitree-flex calculate positions
        const { nodes } = layoutFromMap(root.id, treeMap, {
          enableFlex: true,  // Enable variable node sizes
          firstDegreeSpacing: 20,  // Space between siblings
          secondDegreeSpacing: 100, // Space between depth levels
          direction: 'vertical',
        });

        // Convert to position format
        return Object.fromEntries(
          nodes.map(node => [node.id, { x: node.x, y: node.y }])
        );
      }

      function calculateDepth(goal: Goal, goals: Record<string, Goal>): number {
        let depth = 0;
        let current = goal;
        while (current.parentId) {
          depth++;
          current = goals[current.parentId];
          if (!current) break;
        }
        return depth;
      }
  - PATTERN: Wrapper around entitree-flex, no manual layout logic
  - DEPENDENCIES: entitree-flex library (Task 15)
  - PLACEMENT: web/frontend/src/services/

Task 23: CREATE web/frontend/src/components/tree/GoalNode.tsx
  - IMPLEMENT: Custom React Flow node component
  - PROPS: NodeProps<GoalNodeData> from reactflow
  - VISUAL: Blue/red coloring, size scaling (0.9^depth), white centered text, pulsating animation
  - PATTERN: Memo component for performance
  - CODE: See architecture proposal for complete implementation
  - PLACEMENT: web/frontend/src/components/tree/

Task 24: CREATE web/frontend/src/components/tree/TreeCanvas.tsx
  - IMPLEMENT: React Flow container with custom nodes
  - PATTERN: Convert Zustand state to React Flow nodes/edges, use entitree-flex positions
  - HOOKS: useTreeStore for goals, useMemo for nodes/edges conversion
  - DEPENDENCIES: treeLayout.ts (Task 22), GoalNode (Task 23)
  - CODE: See architecture proposal for complete implementation
  - PLACEMENT: web/frontend/src/components/tree/

Task 25: CREATE web/frontend/src/hooks/useKeyboard.ts
  - IMPLEMENT: Global keyboard event handler
  - SHORTCUTS: Tab, Shift+Tab, ArrowUp, ArrowDown, Escape
  - PATTERN: useEffect with window.addEventListener, return cleanup function
  - ACTIONS: Call Zustand store actions (setActive, navigate)
  - REFERENCE: Port from desktop/voxplan-guiapp.py keyboard handlers
  - PLACEMENT: web/frontend/src/hooks/

Task 26: CREATE web/frontend/src/components/windows/CommandWindow.tsx
  - IMPLEMENT: Text command input with history
  - STATE: command text, command history (array)
  - PATTERN: Controlled input, parse command on Enter, up/down for history
  - COMMANDS: "new: Name", "rename: Name", "details: Text", "delete", "parent", "child N"
  - PLACEMENT: web/frontend/src/components/windows/

Task 27: CREATE web/frontend/src/components/windows/AttributeWindow.tsx
  - IMPLEMENT: Goal details editor for active goal
  - PATTERN: Controlled inputs for name and details, auto-save on blur
  - HOOKS: useUpdateGoal mutation, useTreeStore for active goal
  - PLACEMENT: web/frontend/src/components/windows/

Task 28: CREATE web/frontend/src/App.tsx
  - IMPLEMENT: Root component with layout
  - LAYOUT: TreeCanvas (center), CommandWindow (bottom-left), AttributeWindow (right)
  - HOOKS: useGoals (fetch on mount), useWebSocket (real-time updates), useKeyboard (shortcuts)
  - PATTERN: React Query provider, Zustand store hydration
  - PLACEMENT: web/frontend/src/

Task 29: CREATE web/frontend/src/main.tsx
  - IMPLEMENT: App entry point with providers
  - PROVIDERS: QueryClientProvider
  - CODE:
      import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
      import App from './App';

      const queryClient = new QueryClient();

      ReactDOM.createRoot(document.getElementById('root')!).render(
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      );
  - PLACEMENT: web/frontend/src/

Task 30: CREATE web/frontend/src/utils/constants.ts
  - DEFINE: Color constants, size constants, spacing constants
  - VALUES:
      ACTIVE_COLOR = "rgb(191, 33, 33)"
      INACTIVE_COLOR = "rgb(128, 179, 255)"
      BASE_HEIGHT = 100
      SIZE_SCALE_FACTOR = 0.9
      VERTICAL_SPACING = 150
  - PLACEMENT: web/frontend/src/utils/

# ============================================
# TESTING IMPLEMENTATION
# ============================================

Task 31: CREATE web/backend/tests/conftest.py
  - IMPLEMENT: Pytest fixtures (test_db, test_client, sample_tree)
  - PATTERN: Async pytest fixtures with pytest-asyncio
  - FIXTURES:
      @pytest.fixture async def test_db() - in-memory SQLite database
      @pytest.fixture async def test_client() - httpx AsyncClient
      @pytest.fixture async def sample_tree() - pre-populated test tree
  - PLACEMENT: web/backend/tests/

Task 32: CREATE web/backend/tests/test_voxplan_service.py
  - IMPLEMENT: Unit tests for VoxPlanService methods
  - TESTS:
      test_create_goal() - creates goal and returns Goal schema
      test_delete_goal_cascades() - deletes children recursively
      test_set_active_deactivates_previous() - only one active at a time
      test_get_children() - returns direct children only
  - PATTERN: pytest with async tests, arrange-act-assert
  - COVERAGE: All public methods in VoxPlanService
  - PLACEMENT: web/backend/tests/

Task 33: CREATE web/backend/tests/test_goals.py
  - IMPLEMENT: Integration tests for goal API endpoints
  - TESTS:
      test_create_goal_endpoint() - POST /api/v1/goals returns 201
      test_get_goals_endpoint() - GET /api/v1/goals returns list
      test_update_goal_endpoint() - PUT /api/v1/goals/{id} returns updated goal
      test_delete_goal_endpoint() - DELETE /api/v1/goals/{id} returns 204
  - PATTERN: httpx AsyncClient with test_client fixture
  - PLACEMENT: web/backend/tests/

Task 34: CREATE web/frontend/src/tests/setup.ts
  - IMPLEMENT: Vitest setup with testing-library configuration
  - PATTERN: Global test utilities, mock providers
  - CODE:
      import { expect, afterEach } from 'vitest';
      import { cleanup } from '@testing-library/react';
      import '@testing-library/jest-dom';

      afterEach(() => {
        cleanup();
      });
  - PLACEMENT: web/frontend/src/tests/

Task 35: CREATE web/frontend/src/components/tree/__tests__/GoalNode.test.tsx
  - IMPLEMENT: Unit tests for GoalNode component
  - TESTS:
      test_renders_goal_name() - displays goal name
      test_applies_active_styling() - red color when active
      test_scales_size_by_depth() - correct size at depth 0, 1, 2
      test_pulsates_when_active() - animation applied
  - PATTERN: React Testing Library with render and screen
  - PLACEMENT: web/frontend/src/components/tree/__tests__/

Task 36: CREATE web/frontend/src/services/__tests__/treeLayout.test.ts
  - IMPLEMENT: Unit tests for treeLayout service (entitree-flex wrapper)
  - TESTS:
      test_returns_positions_for_all_goals() - all goals get positions
      test_handles_empty_tree() - returns empty object
      test_handles_single_root() - root gets position
      test_applies_correct_node_dimensions() - 90% scaling per depth
  - PATTERN: Pure function testing with Vitest
  - CRITICAL: Test wrapper logic, not entitree-flex internals (library is tested)
  - PLACEMENT: web/frontend/src/services/__tests__/
```

### Implementation Patterns & Key Details

```typescript
// Frontend Pattern: entitree-flex tree layout (SIMPLIFIED)
import { layoutFromMap } from 'entitree-flex';

export function calculateNodePositions(
  goals: Record<string, Goal>
): Record<string, { x: number; y: number }> {
  const root = Object.values(goals).find(g => !g.parentId);
  if (!root) return {};

  // Build tree structure for entitree-flex
  const treeMap: Record<string, any> = {};

  Object.values(goals).forEach(goal => {
    // Calculate depth for size scaling
    const depth = calculateDepth(goal, goals);
    const height = 100 * Math.pow(0.9, depth); // 90% per level
    const width = height * 1.37; // Aspect ratio

    treeMap[goal.id] = {
      id: goal.id,
      width,   // ✅ Variable width per node
      height,  // ✅ Variable height per node
      children: Object.values(goals)
        .filter(g => g.parentId === goal.id)
        .map(g => g.id),
    };
  });

  // ✅ entitree-flex calculates optimal positions
  const { nodes } = layoutFromMap(root.id, treeMap, {
    enableFlex: true,         // Variable node sizes
    firstDegreeSpacing: 20,   // Sibling spacing
    secondDegreeSpacing: 100, // Depth spacing
    direction: 'vertical',
  });

  // Convert to our format
  return Object.fromEntries(
    nodes.map(node => [node.id, { x: node.x, y: node.y }])
  );
}

// Helper: Calculate depth in tree
function calculateDepth(goal: Goal, goals: Record<string, Goal>): number {
  let depth = 0;
  let current = goal;
  while (current.parentId && goals[current.parentId]) {
    depth++;
    current = goals[current.parentId];
  }
  return depth;
}
```

```typescript
// Frontend Pattern: React Flow integration with entitree-flex
export function TreeCanvas() {
  const { goals, activeId } = useTreeStore();

  const { nodes, edges } = useMemo(() => {
    // ✅ Use entitree-flex for positions
    const positions = calculateNodePositions(goals);

    const nodes: Node<GoalNodeData>[] = Object.values(goals).map(goal => ({
      id: goal.id,
      type: 'goalNode',
      position: positions[goal.id] || { x: 0, y: 0 },  // ✅ From entitree-flex
      data: {
        goal,
        depth: calculateDepth(goal, goals),
        isActive: goal.id === activeId,
        childCount: Object.values(goals).filter(g => g.parentId === goal.id).length,
      },
    }));

    const edges: Edge[] = [];
    Object.values(goals).forEach(goal => {
      if (goal.parentId) {
        edges.push({
          id: `${goal.parentId}-${goal.id}`,
          source: goal.parentId,
          target: goal.id,
          type: 'smoothstep',
          animated: goal.id === activeId,
        });
      }
    });

    return { nodes, edges };
  }, [goals, activeId]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={{ goalNode: GoalNode }}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
```

_[Other implementation patterns from original PRP remain the same: Backend async SQLAlchemy, WebSocket broadcast, Zustand store, keyboard navigation, etc.]_

### Integration Points

```yaml
DATABASE:
  - file: web/backend/voxplan.db (SQLite file created automatically)
  - tables: goals (created by SQLAlchemy on startup)
  - indexes: parent_id, active (for query performance)

CONFIG:
  - web/backend/config.py: DATABASE_URL, CORS_ORIGINS
  - web/frontend/.env: VITE_API_URL="http://localhost:8000"

CORS:
  - backend must allow frontend origin
  - main.py: allow_origins=["http://localhost:5173"]
  - production: update to production frontend URL

WEBSOCKET:
  - endpoint: ws://localhost:8000/ws
  - protocol: JSON messages with { event, data }
  - events: goal.created, goal.updated, goal.deleted, goal.activated
```

## Validation Loop

### Level 1: Syntax & Style (Immediate Feedback)

Run after each file creation - fix before proceeding.

```bash
# Backend validation
cd web/backend

# Type checking
uv run mypy . --strict

# Linting and formatting
uv run ruff check . --fix
uv run ruff format .

# Expected: Zero errors

# Frontend validation
cd web/frontend

# Type checking
npm run tsc --noEmit

# Linting
npm run lint

# Expected: Zero errors
```

### Level 2: Unit Tests (Component Validation)

Test each component as it's created.

```bash
# Backend unit tests
cd web/backend

# Run all tests with coverage
uv run pytest tests/ -v --cov=. --cov-report=term-missing

# Run specific test file
uv run pytest tests/test_voxplan_service.py -v

# Expected: All tests pass, 80%+ coverage

# Frontend unit tests
cd web/frontend

# Run all tests
npm run test

# Run specific test
npm run test -- src/components/tree/__tests__/GoalNode.test.tsx

# Run with coverage
npm run test -- --coverage

# Expected: All tests pass, 80%+ coverage
```

### Level 3: Integration Testing (System Validation)

Validate full system with both servers running.

```bash
# Terminal 1: Start backend
cd web/backend
uv run uvicorn main:app --reload

# Terminal 2: Start frontend
cd web/frontend
npm run dev

# Terminal 3: Manual API testing
# Create root goal
curl -X POST http://localhost:8000/api/v1/goals \
  -H "Content-Type: application/json" \
  -d '{"name": "Root Goal", "details": "Test root", "parent_id": null}' \
  | jq .

# Get all goals
curl http://localhost:8000/api/v1/goals | jq .

# Browser testing
# Open http://localhost:5173 in browser
# Verify:
# - Tree renders with entitree-flex layout
# - Can click nodes to activate
# - Can type commands in command window
# - Can edit in attribute window
# - WebSocket updates work (open two tabs, edit in one, see update in other)

# Expected: All API calls succeed, frontend displays data correctly
```

## Final Validation Checklist

### Technical Validation

- [ ] All 4 validation levels completed successfully
- [ ] Backend tests pass: `cd web/backend && uv run pytest tests/ -v`
- [ ] Frontend tests pass: `cd web/frontend && npm run test`
- [ ] No linting errors: `uv run ruff check .` (backend), `npm run lint` (frontend)
- [ ] No type errors: `uv run mypy .` (backend), `npm run tsc --noEmit` (frontend)
- [ ] Both servers start without errors
- [ ] Database file created: `ls web/backend/voxplan.db`
- [ ] Desktop app still works: `cd desktop && python voxplan-guiapp.py`

### Feature Validation

- [ ] Can create root goal
- [ ] Can create child goals
- [ ] Can edit goal name and details
- [ ] Can delete goals (with children cascade)
- [ ] Can navigate with keyboard (Tab, arrows)
- [ ] Can activate goals by clicking
- [ ] Active goal shows red with pulsating animation
- [ ] Inactive goals show blue
- [ ] Tree layout uses entitree-flex (no overlapping nodes, proper spacing)
- [ ] Nodes scale correctly by depth (90% per level)
- [ ] Commands work: "new: Name", "rename: Name", "delete", etc.
- [ ] WebSocket updates work (open two tabs, edit in one, see in other)
- [ ] Data persists across page refresh

### Code Quality Validation

- [ ] Follows Python style guide (CLAUDE.md) for backend
- [ ] Follows TypeScript best practices for frontend
- [ ] File placement matches desired codebase tree (desktop/, web/)
- [ ] No hardcoded values (use constants)
- [ ] Error handling in place for API calls
- [ ] Loading states displayed during async operations
- [ ] Console shows no errors or warnings

### Documentation & Deployment

- [ ] README.md in desktop/, web/backend/, web/frontend/
- [ ] Root README.md explains both versions
- [ ] Environment variables documented
- [ ] API endpoints documented (FastAPI auto-generates at /docs)
- [ ] Component props documented with JSDoc comments

---

## Anti-Patterns to Avoid

- ❌ Don't write custom tree layout algorithms - use entitree-flex
- ❌ Don't use sync SQLAlchemy in async FastAPI context
- ❌ Don't forget to invalidate React Query cache after mutations
- ❌ Don't forget to broadcast WebSocket events on backend mutations
- ❌ Don't use index for React keys (use stable goal.id)
- ❌ Don't mutate Zustand state directly (use Immer or set functions)
- ❌ Don't forget cascade delete for children when deleting parent
- ❌ Don't hardcode colors/sizes (use constants from utils/constants.ts)
- ❌ Don't forget CORS configuration for frontend-backend communication
- ❌ Don't store derived state (calculate from normalized goals dict)

---

## Development Workflow Summary

```bash
# Initial setup (one-time)
# 1. Migrate desktop files
mkdir -p desktop web/backend web/frontend
mv voxplan.py goalnode.py voxplan-guiapp.py listener.py desktop/

# 2. Backend setup
cd web/backend
uv venv
uv sync

# 3. Frontend setup
cd web/frontend
npm install

# Daily development
# Terminal 1: Backend
cd web/backend
uv run uvicorn main:app --reload

# Terminal 2: Frontend
cd web/frontend
npm run dev

# Browser: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs (FastAPI auto-generated)

# Run tests
cd web/backend && uv run pytest
cd web/frontend && npm run test

# Before committing
cd web/backend && uv run ruff check . --fix && uv run mypy .
cd web/frontend && npm run lint && npm run tsc --noEmit
```

---

**End of Phase 1 PRP. After completing this phase, proceed with Phase 2 (Navigation & Commands) PRP.**
