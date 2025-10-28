# VoxPlan Web Architecture Proposal

## Executive Summary

**Architectural Approach**: Full-stack from Day 1 (Option A)
- **Backend**: Python FastAPI (leverages existing Python codebase, LLM-ready)
- **Frontend**: React 19 + TypeScript + Vite + React Flow
- **Scope**: Complete feature parity with desktop app, modernized for web
- **Deployment**: Vercel/Netlify (frontend), Railway/Render (backend)

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  React 19 + TypeScript + Vite + TanStack Router             │
│  React Flow (tree visualization) + Zustand (state)           │
└────────────────┬────────────────────────────────────────────┘
                 │ REST API + WebSocket
┌────────────────▼────────────────────────────────────────────┐
│                   Backend API Layer                          │
│  Python FastAPI + Pydantic v2 + uvicorn                     │
│  REST endpoints + WebSocket server                           │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  VoxPlan service (Python) - ported from voxplan.py          │
│  Tree operations + Command processing                        │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   Data Persistence Layer                     │
│  PostgreSQL (production) / SQLite (dev)                     │
│  SQLAlchemy ORM + Alembic migrations                        │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Stack
```yaml
Core:
  - React: 19.x (latest)
  - TypeScript: 5.x
  - Vite: 6.x (build tool)

State Management:
  - Zustand: 5.x (lightweight, immer middleware)
  - Immer: for immutable state updates

Visualization:
  - React Flow: 12.x (tree/graph visualization)
  - Custom node components for GoalNode rendering

Routing:
  - TanStack Router: 1.x (type-safe routing)

Validation:
  - Zod: 3.x (TypeScript-first schema validation)

Voice:
  - Web Speech API (native browser support)
  - Web Speech Recognition API

Storage:
  - IndexedDB via Dexie.js (offline cache)
  - React Query (server state synchronization)

Styling:
  - Tailwind CSS 4.x (utility-first)
  - CSS Modules for component-specific styles

Testing:
  - Vitest: unit tests
  - Playwright: e2e tests
  - React Testing Library: component tests

Build & Deploy:
  - Vite bundler
  - Vercel or Netlify (frontend hosting)
```

### Backend Stack
```yaml
Core:
  - Python: 3.11+
  - FastAPI: 0.115+ (async web framework)
  - Pydantic: 2.x (data validation)
  - uvicorn: ASGI server

Database:
  - PostgreSQL: 16+ (production)
  - SQLite: (development)
  - SQLAlchemy: 2.x (ORM)
  - Alembic: database migrations

Real-time:
  - WebSockets (FastAPI native support)
  - Server-Sent Events (for one-way updates)

Voice (Future):
  - espeakng: TTS generation
  - Vosk: speech recognition (if needed server-side)

LLM Integration (Phase 4):
  - OpenAI API or local models
  - LangChain for orchestration
  - Vector DB (Qdrant/Weaviate) for context

Testing:
  - pytest: unit/integration tests
  - pytest-asyncio: async test support
  - httpx: async HTTP client for tests

Deployment:
  - Railway, Render, or fly.io
  - Docker containerization
  - GitHub Actions CI/CD
```

## Data Models

### Backend Models (Python/Pydantic)

```python
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID, uuid4

class GoalBase(BaseModel):
    """Base goal model with common fields"""
    name: str = Field(..., min_length=1, max_length=255)
    details: Optional[str] = None
    position: Optional[tuple[float, float]] = None
    totalheight: float = Field(default=100.0, gt=0)
    active: bool = False

class GoalCreate(GoalBase):
    """Model for creating new goals"""
    parent_id: Optional[UUID] = None

class GoalUpdate(BaseModel):
    """Model for updating goals - all fields optional"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    details: Optional[str] = None
    position: Optional[tuple[float, float]] = None
    active: Optional[bool] = None

class Goal(GoalBase):
    """Complete goal model with database fields"""
    id: UUID = Field(default_factory=uuid4)
    parent_id: Optional[UUID] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: UUID  # Future: multi-user support

    # Tree structure (computed)
    children: List['Goal'] = []
    depth: int = 0

    model_config = ConfigDict(from_attributes=True)

class TreeState(BaseModel):
    """Complete tree state snapshot"""
    goals: dict[UUID, Goal]  # Normalized: id -> goal
    root_id: Optional[UUID] = None
    active_id: Optional[UUID] = None
    last_updated: datetime = Field(default_factory=datetime.utcnow)
```

### Frontend Models (TypeScript/Zod)

```typescript
import { z } from 'zod';

// Zod schemas mirror Pydantic models
export const goalBaseSchema = z.object({
  name: z.string().min(1).max(255),
  details: z.string().optional(),
  position: z.tuple([z.number(), z.number()]).optional(),
  totalheight: z.number().positive().default(100),
  active: z.boolean().default(false),
});

export const goalSchema = goalBaseSchema.extend({
  id: z.string().uuid(),
  parentId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  userId: z.string().uuid(),
});

export type Goal = z.infer<typeof goalSchema>;

// React Flow node type
export interface GoalNodeData {
  goal: Goal;
  children: Goal[];
  depth: number;
  isActive: boolean;
}

// Zustand store state
export interface TreeState {
  goals: Record<string, Goal>;  // Normalized
  rootId: string | null;
  activeId: string | null;
  lastUpdated: string;

  // Actions
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setActive: (id: string) => void;
}
```

## API Design

### REST Endpoints

```yaml
# Tree Operations
GET    /api/v1/trees/current         # Get current tree state
POST   /api/v1/trees                 # Create new tree
PUT    /api/v1/trees/{tree_id}       # Update tree metadata

# Goal CRUD
GET    /api/v1/goals                 # List all goals
GET    /api/v1/goals/{goal_id}       # Get single goal
POST   /api/v1/goals                 # Create goal
PUT    /api/v1/goals/{goal_id}       # Update goal
DELETE /api/v1/goals/{goal_id}       # Delete goal (and descendants)

# Goal Operations
POST   /api/v1/goals/{goal_id}/activate     # Set as active
POST   /api/v1/goals/{goal_id}/deactivate   # Deactivate
POST   /api/v1/goals/{goal_id}/move         # Move to new parent
GET    /api/v1/goals/{goal_id}/children     # Get children
GET    /api/v1/goals/{goal_id}/ancestors    # Get ancestor path
GET    /api/v1/goals/{goal_id}/descendants  # Get entire subtree

# File Operations
POST   /api/v1/files/save                   # Save tree to JSON
POST   /api/v1/files/load                   # Load tree from JSON
GET    /api/v1/files/export                 # Export as JSON

# Voice (Future - Phase 2)
POST   /api/v1/voice/tts                    # Text-to-speech
POST   /api/v1/voice/stt                    # Speech-to-text

# LLM Integration (Future - Phase 4)
POST   /api/v1/llm/generate-goals           # Generate goal suggestions
POST   /api/v1/llm/expand-goal              # Expand goal into subgoals
POST   /api/v1/llm/analyze-tree             # Analyze goal tree
```

### WebSocket Events

```yaml
# Client -> Server
ws.send:
  - goal.create: { parent_id, name, details }
  - goal.update: { id, updates }
  - goal.delete: { id }
  - goal.activate: { id }
  - goal.move: { id, new_parent_id }

# Server -> Client
ws.receive:
  - goal.created: { goal }
  - goal.updated: { id, goal }
  - goal.deleted: { id }
  - goal.activated: { id }
  - goal.moved: { id, new_parent_id }
  - tree.sync: { goals, root_id, active_id }  # Full sync
```

### Example API Interaction

```python
# Backend: FastAPI endpoint
from fastapi import APIRouter, HTTPException, WebSocket
from uuid import UUID

router = APIRouter(prefix="/api/v1/goals", tags=["goals"])

@router.post("/", response_model=Goal)
async def create_goal(
    goal_create: GoalCreate,
    db: Database = Depends(get_db),
    voxplan: VoxPlanService = Depends(get_voxplan_service)
) -> Goal:
    """Create a new goal node"""
    goal = await voxplan.create_goal(
        name=goal_create.name,
        parent_id=goal_create.parent_id,
        details=goal_create.details
    )

    # Broadcast to WebSocket clients
    await broadcast_event("goal.created", {"goal": goal.model_dump()})

    return goal

@router.get("/{goal_id}", response_model=Goal)
async def get_goal(
    goal_id: UUID,
    voxplan: VoxPlanService = Depends(get_voxplan_service)
) -> Goal:
    """Get a single goal by ID"""
    goal = await voxplan.get_goal(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal
```

```typescript
// Frontend: API client with React Query
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await fetch('/api/v1/goals');
      return goalListSchema.parse(await res.json());
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GoalCreate) => {
      const res = await fetch('/api/v1/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return goalSchema.parse(await res.json());
    },
    onSuccess: (newGoal) => {
      // Optimistic update
      queryClient.setQueryData(['goals'], (old: Goal[] = []) =>
        [...old, newGoal]
      );
    },
  });
}
```

## Frontend Architecture

### Component Structure

```
src/
├── main.tsx                      # App entry point
├── App.tsx                       # Root component
├── vite-env.d.ts                 # Vite type definitions
│
├── components/
│   ├── tree/
│   │   ├── TreeCanvas.tsx        # React Flow container
│   │   ├── GoalNode.tsx          # Custom React Flow node
│   │   ├── ConnectionLine.tsx    # Parent-child connections
│   │   └── TreeControls.tsx      # Zoom, pan, fit view
│   │
│   ├── windows/
│   │   ├── CommandWindow.tsx     # Text command input
│   │   ├── AttributeWindow.tsx   # Goal details editor
│   │   └── NavigationPanel.tsx   # Tree navigation
│   │
│   ├── voice/
│   │   ├── VoiceInput.tsx        # Speech recognition UI
│   │   └── VoiceOutput.tsx       # TTS controls
│   │
│   └── common/
│       ├── Button.tsx            # Reusable button
│       ├── Input.tsx             # Reusable input
│       └── Modal.tsx             # Modal dialog
│
├── stores/
│   ├── treeStore.ts              # Zustand store for tree state
│   ├── uiStore.ts                # UI state (mode, focused window)
│   └── voiceStore.ts             # Voice interaction state
│
├── hooks/
│   ├── useGoals.ts               # React Query hooks for goals
│   ├── useTreeOperations.ts      # Tree manipulation hooks
│   ├── useKeyboard.ts            # Keyboard event handling
│   ├── useVoice.ts               # Voice recognition/TTS
│   └── useWebSocket.ts           # WebSocket connection
│
├── services/
│   ├── api.ts                    # HTTP client (fetch wrapper)
│   ├── websocket.ts              # WebSocket client
│   ├── treeLayout.ts             # Tree positioning algorithms
│   ├── commands.ts               # Command parser
│   └── storage.ts                # IndexedDB offline cache
│
├── utils/
│   ├── tree.ts                   # Tree traversal utilities
│   ├── validation.ts             # Zod schemas
│   └── constants.ts              # App constants
│
└── types/
    ├── goal.ts                   # Goal type definitions
    ├── tree.ts                   # Tree type definitions
    └── api.ts                    # API response types
```

### State Management Strategy

```typescript
// stores/treeStore.ts - Zustand with Immer
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface TreeState {
  // Normalized state: flat dictionary + tree references
  goals: Record<string, Goal>;
  rootId: string | null;
  activeId: string | null;

  // Derived/computed (selectors)
  getChildren: (parentId: string) => Goal[];
  getAncestors: (goalId: string) => Goal[];
  getActiveNode: () => Goal | null;

  // Actions
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setActive: (id: string) => void;
  moveGoal: (id: string, newParentId: string) => void;
}

export const useTreeStore = create<TreeState>()(
  immer((set, get) => ({
    goals: {},
    rootId: null,
    activeId: null,

    getChildren: (parentId) => {
      return Object.values(get().goals).filter(g => g.parentId === parentId);
    },

    getAncestors: (goalId) => {
      const ancestors: Goal[] = [];
      let current = get().goals[goalId];
      while (current?.parentId) {
        current = get().goals[current.parentId];
        if (current) ancestors.unshift(current);
      }
      return ancestors;
    },

    getActiveNode: () => {
      const { activeId, goals } = get();
      return activeId ? goals[activeId] : null;
    },

    setGoals: (goalList) => set((state) => {
      state.goals = Object.fromEntries(goalList.map(g => [g.id, g]));
      state.rootId = goalList.find(g => !g.parentId)?.id || null;
    }),

    addGoal: (goal) => set((state) => {
      state.goals[goal.id] = goal;
    }),

    updateGoal: (id, updates) => set((state) => {
      if (state.goals[id]) {
        Object.assign(state.goals[id], updates);
      }
    }),

    deleteGoal: (id) => set((state) => {
      // Delete goal and all descendants
      const toDelete = new Set([id]);
      const findDescendants = (parentId: string) => {
        Object.values(state.goals).forEach(g => {
          if (g.parentId === parentId) {
            toDelete.add(g.id);
            findDescendants(g.id);
          }
        });
      };
      findDescendants(id);

      toDelete.forEach(gid => delete state.goals[gid]);

      if (state.activeId && toDelete.has(state.activeId)) {
        state.activeId = null;
      }
    }),

    setActive: (id) => set((state) => {
      // Deactivate current active
      if (state.activeId && state.goals[state.activeId]) {
        state.goals[state.activeId].active = false;
      }
      // Activate new
      if (state.goals[id]) {
        state.goals[id].active = true;
        state.activeId = id;
      }
    }),

    moveGoal: (id, newParentId) => set((state) => {
      if (state.goals[id]) {
        state.goals[id].parentId = newParentId;
      }
    }),
  }))
);
```

### React Flow Integration

```typescript
// components/tree/TreeCanvas.tsx
import ReactFlow, {
  Node, Edge, Background, Controls, MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GoalNode } from './GoalNode';
import { useTreeStore } from '@/stores/treeStore';
import { useMemo } from 'react';

const nodeTypes = {
  goalNode: GoalNode,
};

export function TreeCanvas() {
  const { goals, rootId } = useTreeStore();

  // Convert tree structure to React Flow nodes and edges
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    Object.values(goals).forEach((goal) => {
      // Calculate position using tree layout algorithm
      const position = calculateNodePosition(goal, goals);

      nodes.push({
        id: goal.id,
        type: 'goalNode',
        position,
        data: {
          goal,
          children: Object.values(goals).filter(g => g.parentId === goal.id),
          depth: calculateDepth(goal, goals),
          isActive: goal.active,
        },
      });

      // Create edge to parent
      if (goal.parentId) {
        edges.push({
          id: `${goal.parentId}-${goal.id}`,
          source: goal.parentId,
          target: goal.id,
          type: 'smoothstep',
          animated: goal.active,
        });
      }
    });

    return { nodes, edges };
  }, [goals]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

```typescript
// components/tree/GoalNode.tsx - Custom React Flow node
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import type { GoalNodeData } from '@/types/tree';
import { useTreeStore } from '@/stores/treeStore';

export const GoalNode = memo(({ data }: NodeProps<GoalNodeData>) => {
  const { goal, isActive, depth } = data;
  const setActive = useTreeStore((state) => state.setActive);

  // Size scaling: 90% per depth level (matching desktop app)
  const baseHeight = 100;
  const height = baseHeight * Math.pow(0.9, depth);
  const width = height * 1.37; // Aspect ratio from desktop app

  // Colors from desktop app
  const bgColor = isActive ? 'rgb(191, 33, 33)' : 'rgb(128, 179, 255)';

  return (
    <div
      onClick={() => setActive(goal.id)}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: bgColor,
        border: '2px solid #333',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        animation: isActive ? 'pulse 2s infinite' : 'none',
      }}
    >
      <div style={{
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '8px',
        fontSize: `${height * 0.15}px`,
      }}>
        {goal.name}
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
```

## Backend Architecture

### Service Layer Structure

```
backend/
├── main.py                       # FastAPI app entry point
├── config.py                     # Settings (Pydantic BaseSettings)
├── requirements.txt              # Dependencies (or use uv)
│
├── api/
│   ├── __init__.py
│   ├── deps.py                   # Dependency injection
│   ├── router.py                 # Main router aggregation
│   │
│   └── routes/
│       ├── __init__.py
│       ├── goals.py              # Goal CRUD endpoints
│       ├── trees.py              # Tree operations
│       ├── files.py              # File import/export
│       └── websocket.py          # WebSocket endpoint
│
├── models/
│   ├── __init__.py
│   ├── goal.py                   # SQLAlchemy Goal model
│   └── tree.py                   # SQLAlchemy Tree model
│
├── schemas/
│   ├── __init__.py
│   ├── goal.py                   # Pydantic schemas (API contracts)
│   └── tree.py                   # Pydantic tree schemas
│
├── services/
│   ├── __init__.py
│   ├── voxplan.py                # Core VoxPlan service (ported)
│   ├── tree_operations.py        # Tree manipulation logic
│   ├── command_parser.py         # Command parsing
│   └── websocket_manager.py      # WebSocket connection manager
│
├── db/
│   ├── __init__.py
│   ├── base.py                   # SQLAlchemy base
│   ├── session.py                # Database session management
│   └── migrations/               # Alembic migrations
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py               # Pytest fixtures
│   ├── test_goals.py             # Goal endpoint tests
│   ├── test_tree_operations.py   # Tree logic tests
│   └── test_websocket.py         # WebSocket tests
│
└── utils/
    ├── __init__.py
    ├── json_import.py            # Import from desktop app JSON
    └── tree_utils.py             # Tree traversal utilities
```

### Core Service Implementation

```python
# services/voxplan.py - Core VoxPlan service (ported from voxplan.py)
from typing import Optional, List
from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.goal import Goal as GoalModel
from schemas.goal import GoalCreate, GoalUpdate, Goal

class VoxPlanService:
    """
    Core VoxPlan service - handles all tree operations.
    Ported from desktop app's VoxPlan class.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.active_id: Optional[UUID] = None

    async def create_goal(
        self,
        name: str,
        parent_id: Optional[UUID] = None,
        details: Optional[str] = None
    ) -> Goal:
        """
        Create a new goal node.
        Maps to: VoxPlan.new_child() from desktop app
        """
        goal_model = GoalModel(
            id=uuid4(),
            name=name,
            details=details,
            parent_id=parent_id,
            active=False
        )

        self.db.add(goal_model)
        await self.db.commit()
        await self.db.refresh(goal_model)

        return Goal.model_validate(goal_model)

    async def get_goal(self, goal_id: UUID) -> Optional[Goal]:
        """Get a single goal by ID"""
        result = await self.db.execute(
            select(GoalModel).where(GoalModel.id == goal_id)
        )
        goal_model = result.scalar_one_or_none()
        return Goal.model_validate(goal_model) if goal_model else None

    async def update_goal(
        self,
        goal_id: UUID,
        updates: GoalUpdate
    ) -> Optional[Goal]:
        """
        Update goal attributes.
        Maps to: VoxPlan.edit() from desktop app
        """
        goal_model = await self.db.get(GoalModel, goal_id)
        if not goal_model:
            return None

        update_data = updates.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(goal_model, field, value)

        await self.db.commit()
        await self.db.refresh(goal_model)

        return Goal.model_validate(goal_model)

    async def delete_goal(self, goal_id: UUID) -> bool:
        """
        Delete goal and all descendants.
        Maps to: VoxPlan.delete() from desktop app
        """
        # Get all descendants recursively
        descendants = await self._get_descendants(goal_id)
        all_ids = [goal_id] + [d.id for d in descendants]

        # Delete all at once
        await self.db.execute(
            delete(GoalModel).where(GoalModel.id.in_(all_ids))
        )
        await self.db.commit()

        return True

    async def set_active(self, goal_id: UUID) -> Optional[Goal]:
        """
        Set a goal as active (deactivate previous).
        Maps to: VoxPlan.navigate() -> active node from desktop app
        """
        # Deactivate current active
        if self.active_id:
            old_active = await self.db.get(GoalModel, self.active_id)
            if old_active:
                old_active.active = False

        # Activate new
        new_active = await self.db.get(GoalModel, goal_id)
        if not new_active:
            return None

        new_active.active = True
        self.active_id = goal_id

        await self.db.commit()
        await self.db.refresh(new_active)

        return Goal.model_validate(new_active)

    async def get_children(self, parent_id: UUID) -> List[Goal]:
        """Get direct children of a goal"""
        result = await self.db.execute(
            select(GoalModel).where(GoalModel.parent_id == parent_id)
        )
        return [Goal.model_validate(g) for g in result.scalars().all()]

    async def get_tree(self) -> dict[UUID, Goal]:
        """Get entire tree as normalized dictionary"""
        result = await self.db.execute(select(GoalModel))
        goals = result.scalars().all()
        return {g.id: Goal.model_validate(g) for g in goals}

    async def _get_descendants(self, goal_id: UUID) -> List[GoalModel]:
        """Recursively get all descendants"""
        children = await self.db.execute(
            select(GoalModel).where(GoalModel.parent_id == goal_id)
        )
        descendants = list(children.scalars().all())

        for child in descendants:
            descendants.extend(await self._get_descendants(child.id))

        return descendants

    async def parse_command(self, command: str) -> dict:
        """
        Parse and execute text commands.
        Maps to: VoxPlan.parse() from desktop app
        """
        # Command parsing logic here
        # Example: "new goal: Fix bug" -> create_goal(name="Fix bug")
        pass
```

### Database Models

```python
# models/goal.py - SQLAlchemy model
from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4
from db.base import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)

    # Tree structure
    parent_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"), nullable=True)

    # Visual properties (stored but computed on frontend)
    position_x = Column(Float, nullable=True)
    position_y = Column(Float, nullable=True)
    totalheight = Column(Float, default=100.0)

    # State
    active = Column(Boolean, default=False)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Relationships
    parent = relationship("Goal", remote_side=[id], back_populates="children")
    children = relationship("Goal", back_populates="parent", cascade="all, delete-orphan")
    user = relationship("User", back_populates="goals")
```

### WebSocket Manager

```python
# services/websocket_manager.py
from typing import Dict, Set
from uuid import UUID
from fastapi import WebSocket
import json

class WebSocketManager:
    """Manage WebSocket connections for real-time updates"""

    def __init__(self):
        # user_id -> set of WebSocket connections
        self.connections: Dict[UUID, Set[WebSocket]] = {}

    async def connect(self, user_id: UUID, websocket: WebSocket):
        """Register new WebSocket connection"""
        await websocket.accept()

        if user_id not in self.connections:
            self.connections[user_id] = set()

        self.connections[user_id].add(websocket)

    def disconnect(self, user_id: UUID, websocket: WebSocket):
        """Remove WebSocket connection"""
        if user_id in self.connections:
            self.connections[user_id].discard(websocket)

            if not self.connections[user_id]:
                del self.connections[user_id]

    async def broadcast_to_user(self, user_id: UUID, event: str, data: dict):
        """Send event to all connections for a user"""
        if user_id not in self.connections:
            return

        message = json.dumps({"event": event, "data": data})

        # Send to all user's connections
        disconnected = set()
        for websocket in self.connections[user_id]:
            try:
                await websocket.send_text(message)
            except Exception:
                disconnected.add(websocket)

        # Clean up disconnected
        for ws in disconnected:
            self.disconnect(user_id, ws)

# Global manager instance
ws_manager = WebSocketManager()
```

## Development Phases (Full Feature Parity)

### Phase 1: Foundation (Weeks 1-6)

**Backend:**
- ✅ FastAPI project setup with uvicorn
- ✅ SQLAlchemy models (Goal, User, Tree)
- ✅ Alembic migrations
- ✅ PostgreSQL setup (local + production)
- ✅ VoxPlanService core implementation
- ✅ REST API endpoints (CRUD)
- ✅ WebSocket server setup
- ✅ pytest test suite (80%+ coverage)

**Frontend:**
- ✅ Vite + React + TypeScript setup
- ✅ Zustand store with normalized state
- ✅ React Flow integration
- ✅ Custom GoalNode component with scaling
- ✅ Tree layout algorithms (ported from desktop)
- ✅ React Query for server state
- ✅ WebSocket client connection
- ✅ Basic keyboard navigation
- ✅ Vitest + Playwright test setup

**Features:**
- ✅ Create, read, update, delete goals
- ✅ Parent-child relationships
- ✅ Set active goal (red pulsating)
- ✅ Tree visualization with proper scaling
- ✅ Real-time updates via WebSocket
- ✅ Basic command input (text)

**Deliverable**: Working tree CRUD with visualization

---

### Phase 2: Navigation & Commands (Weeks 7-10)

**Backend:**
- ✅ Command parser implementation
- ✅ Navigation operations (parent, child, sibling)
- ✅ Tree traversal endpoints

**Frontend:**
- ✅ Command window component
- ✅ Attribute window (goal details editor)
- ✅ Mode system (cmdMode, navMode)
- ✅ Keyboard shortcuts (Tab, Enter, arrows)
- ✅ Command history
- ✅ Context-sensitive suggestions

**Features:**
- ✅ Command-line interface (like desktop app)
- ✅ Navigation commands: "parent", "child 1", "sibling 2"
- ✅ Edit commands: "rename: New Name", "details: Details text"
- ✅ Tree commands: "new child: Name", "delete", "move to: ParentName"
- ✅ Keyboard shortcuts matching desktop app
- ✅ Active node focus follows commands

**Deliverable**: Full command-driven interaction

---

### Phase 3: Voice Integration (Weeks 11-14)

**Backend:**
- ✅ espeakng integration for TTS
- ✅ TTS API endpoint
- ✅ (Optional) Server-side STT with Vosk

**Frontend:**
- ✅ Web Speech API integration
- ✅ Voice command input
- ✅ Voice feedback (TTS)
- ✅ Voice mode UI (voxMode)
- ✅ Voice command parsing
- ✅ Audio visualizations

**Features:**
- ✅ Voice commands: "create new goal called Meeting"
- ✅ Voice navigation: "go to parent", "activate child two"
- ✅ Voice feedback for actions
- ✅ Push-to-talk or continuous listening
- ✅ Visual feedback for voice recognition

**Deliverable**: Full voice interaction parity

---

### Phase 4: Advanced Features (Weeks 15-18)

**Backend:**
- ✅ File import/export (JSON compatibility with desktop)
- ✅ Tree snapshots/versioning
- ✅ Undo/redo support

**Frontend:**
- ✅ File operations UI
- ✅ Drag-and-drop goal moving
- ✅ Undo/redo UI
- ✅ Tree visualization options (compact, expanded)
- ✅ Search and filter
- ✅ Export/import UI

**Features:**
- ✅ Load/save JSON files (desktop app compatibility)
- ✅ Drag goals to new parents
- ✅ Undo/redo for all operations
- ✅ Search goals by name/details
- ✅ Filter by depth, active status
- ✅ Export as JSON, PDF, markdown

**Deliverable**: Feature parity with desktop app

---

### Phase 5: Day Planner (Weeks 19-22)

**Backend:**
- ✅ Daily schedule data model
- ✅ Time block allocation
- ✅ Goal-to-schedule linking

**Frontend:**
- ✅ Day planner view (from README roadmap)
- ✅ Time block editor
- ✅ Drag goals to schedule
- ✅ Calendar integration

**Features:**
- ✅ Daily schedule view
- ✅ Allocate time blocks to goals
- ✅ Track progress through day
- ✅ Time tracking and logging

**Deliverable**: Day planner functionality

---

### Phase 6: LLM Integration (Weeks 23-26)

**Backend:**
- ✅ OpenAI API integration
- ✅ LLM prompt templates
- ✅ Goal generation service
- ✅ Tree analysis service
- ✅ Vector DB for context (Qdrant/Weaviate)

**Frontend:**
- ✅ AI suggestions UI
- ✅ Goal expansion interface
- ✅ Tree analysis visualizations

**Features:**
- ✅ Generate goal suggestions
- ✅ Expand goal into subgoals
- ✅ Analyze tree for gaps/duplicates
- ✅ Smart goal recommendations
- ✅ Natural language command parsing

**Deliverable**: AI-enhanced goal planning

---

### Phase 7: Polish & Deployment (Weeks 27-30)

**Backend:**
- ✅ Performance optimization
- ✅ Caching strategy (Redis)
- ✅ Rate limiting
- ✅ Monitoring (Sentry)
- ✅ Production deployment (Railway/Render)
- ✅ CI/CD pipeline (GitHub Actions)

**Frontend:**
- ✅ PWA setup (offline support)
- ✅ IndexedDB caching
- ✅ Performance optimization
- ✅ Responsive design
- ✅ Accessibility (WCAG AA)
- ✅ Deployment (Vercel/Netlify)

**Features:**
- ✅ Offline-first functionality
- ✅ Mobile-responsive design
- ✅ Touch gestures for mobile
- ✅ Dark mode
- ✅ Internationalization (i18n)
- ✅ User onboarding tutorial

**Deliverable**: Production-ready web app

## Data Synchronization Strategy

### Offline-First Architecture

```typescript
// Frontend: IndexedDB cache with Dexie.js
import Dexie, { Table } from 'dexie';

class VoxPlanDB extends Dexie {
  goals!: Table<Goal>;
  syncQueue!: Table<SyncOperation>;

  constructor() {
    super('VoxPlanDB');
    this.version(1).stores({
      goals: 'id, parentId, userId, updatedAt',
      syncQueue: '++id, operation, goalId, timestamp, synced',
    });
  }
}

const db = new VoxPlanDB();

// Sync queue for offline operations
interface SyncOperation {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  goalId: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

// Add operation to sync queue
async function queueOperation(op: Omit<SyncOperation, 'id'>) {
  await db.syncQueue.add(op);

  // Try to sync immediately if online
  if (navigator.onLine) {
    await syncToServer();
  }
}

// Sync queued operations to server
async function syncToServer() {
  const pending = await db.syncQueue
    .where('synced')
    .equals(false)
    .toArray();

  for (const op of pending) {
    try {
      // Send to server
      await fetch(`/api/v1/goals/${op.operation}`, {
        method: 'POST',
        body: JSON.stringify(op.data),
      });

      // Mark as synced
      await db.syncQueue.update(op.id!, { synced: true });
    } catch (err) {
      console.error('Sync failed:', err);
      // Will retry on next sync attempt
    }
  }
}

// Listen for online event to trigger sync
window.addEventListener('online', () => {
  syncToServer();
});
```

### Conflict Resolution

```typescript
// Simple last-write-wins with timestamp
interface Goal {
  id: string;
  updatedAt: string;  // ISO timestamp
  // ... other fields
}

async function resolveConflict(local: Goal, remote: Goal): Promise<Goal> {
  // Server timestamp wins
  if (new Date(remote.updatedAt) > new Date(local.updatedAt)) {
    return remote;
  }

  // Local is newer - push to server
  await fetch(`/api/v1/goals/${local.id}`, {
    method: 'PUT',
    body: JSON.stringify(local),
  });

  return local;
}
```

## Deployment Strategy

### Frontend Deployment (Vercel/Netlify)

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@api-url",
    "VITE_WS_URL": "@ws-url"
  }
}
```

```bash
# Deploy to Vercel
npx vercel --prod

# Or Netlify
npm run build
npx netlify deploy --prod --dir=dist
```

### Backend Deployment (Railway/Render)

```yaml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
restartPolicyType = "on-failure"

[env]
DATABASE_URL = "${{Postgres.DATABASE_URL}}"
REDIS_URL = "${{Redis.REDIS_URL}}"
```

```dockerfile
# Dockerfile (alternative to Railway's Nixpacks)
FROM python:3.11-slim

WORKDIR /app

# Install UV for fast dependency installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files
COPY pyproject.toml .
COPY requirements.txt .

# Install dependencies
RUN uv pip install --system -r requirements.txt

# Copy application
COPY . .

# Run database migrations
RUN alembic upgrade head

# Expose port
EXPOSE 8000

# Start server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Deploy to Railway
railway up

# Or Render
git push render main
```

### Database Migration

```bash
# Create new migration
alembic revision --autogenerate -m "Add goals table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Testing Strategy

### Backend Tests (pytest)

```python
# tests/test_goals.py
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_create_goal(async_client: AsyncClient, auth_headers: dict):
    """Test creating a new goal"""
    response = await async_client.post(
        "/api/v1/goals",
        json={
            "name": "Test Goal",
            "details": "Test details",
            "parent_id": None,
        },
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Goal"
    assert data["details"] == "Test details"
    assert "id" in data

@pytest.mark.asyncio
async def test_delete_goal_cascades_to_children(
    async_client: AsyncClient,
    auth_headers: dict,
    sample_tree: dict,
):
    """Test that deleting a goal deletes all descendants"""
    parent_id = sample_tree["parent_id"]
    child_ids = sample_tree["child_ids"]

    # Delete parent
    response = await async_client.delete(
        f"/api/v1/goals/{parent_id}",
        headers=auth_headers,
    )
    assert response.status_code == 204

    # Verify children are also deleted
    for child_id in child_ids:
        response = await async_client.get(
            f"/api/v1/goals/{child_id}",
            headers=auth_headers,
        )
        assert response.status_code == 404
```

### Frontend Tests (Vitest + Playwright)

```typescript
// src/components/tree/__tests__/GoalNode.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalNode } from '../GoalNode';

describe('GoalNode', () => {
  it('renders goal name', () => {
    const data = {
      goal: { id: '1', name: 'Test Goal', active: false },
      children: [],
      depth: 0,
      isActive: false,
    };

    render(<GoalNode data={data} />);
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
  });

  it('applies active styling when active', () => {
    const data = {
      goal: { id: '1', name: 'Test Goal', active: true },
      children: [],
      depth: 0,
      isActive: true,
    };

    const { container } = render(<GoalNode data={data} />);
    const node = container.firstChild as HTMLElement;

    expect(node.style.backgroundColor).toBe('rgb(191, 33, 33)');
  });

  it('scales size based on depth', () => {
    const data = {
      goal: { id: '1', name: 'Test Goal', active: false },
      children: [],
      depth: 2,
      isActive: false,
    };

    const { container } = render(<GoalNode data={data} />);
    const node = container.firstChild as HTMLElement;

    // Base height: 100, scaled by 0.9^2 = 81
    expect(node.style.height).toBe('81px');
  });
});
```

```typescript
// e2e/tree-operations.spec.ts - Playwright E2E test
import { test, expect } from '@playwright/test';

test.describe('Tree Operations', () => {
  test('create and delete goal', async ({ page }) => {
    await page.goto('/');

    // Create goal
    await page.fill('[data-testid="command-input"]', 'new: Test Goal');
    await page.press('[data-testid="command-input"]', 'Enter');

    // Verify goal appears
    await expect(page.locator('text=Test Goal')).toBeVisible();

    // Delete goal
    await page.click('text=Test Goal');
    await page.fill('[data-testid="command-input"]', 'delete');
    await page.press('[data-testid="command-input"]', 'Enter');

    // Verify goal is gone
    await expect(page.locator('text=Test Goal')).not.toBeVisible();
  });

  test('navigate tree with keyboard', async ({ page }) => {
    await page.goto('/');

    // Navigate with Tab
    await page.press('body', 'Tab');

    // Verify active node changes
    const activeNode = page.locator('[data-active="true"]');
    await expect(activeNode).toBeVisible();
  });
});
```

## Performance Considerations

### Frontend Optimization

```typescript
// Virtualize large trees with React Window
import { FixedSizeList as List } from 'react-window';

function VirtualizedTree({ goals }: { goals: Goal[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <GoalNode data={goals[index]} />
    </div>
  );

  return (
    <List
      height={window.innerHeight}
      itemCount={goals.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </List>
  );
}

// Debounce expensive operations
import { useDebouncedCallback } from 'use-debounce';

const debouncedSave = useDebouncedCallback(
  (goal: Goal) => updateGoal(goal),
  500
);

// Memoize expensive computations
const treeLayout = useMemo(() =>
  calculateTreeLayout(goals),
  [goals]
);
```

### Backend Optimization

```python
# Cache frequently accessed data
from functools import lru_cache
from cachetools import TTLCache

# In-memory cache with TTL
tree_cache = TTLCache(maxsize=100, ttl=300)  # 5 minutes

@router.get("/api/v1/goals")
async def get_goals(
    user_id: UUID,
    cache_key: str = Depends(get_cache_key)
):
    # Check cache first
    if cache_key in tree_cache:
        return tree_cache[cache_key]

    # Query database
    goals = await voxplan_service.get_tree()

    # Cache result
    tree_cache[cache_key] = goals

    return goals

# Use database indexes
# In models/goal.py:
class Goal(Base):
    __tablename__ = "goals"

    # Add indexes for common queries
    __table_args__ = (
        Index('idx_parent_id', 'parent_id'),
        Index('idx_user_id_active', 'user_id', 'active'),
    )
```

## Security Considerations

```python
# Backend: Authentication with JWT
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Verify JWT token and return current user"""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        # ... fetch user from database
        return user
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# Apply to protected routes
@router.get("/api/v1/goals")
async def get_goals(
    current_user: User = Depends(get_current_user)
):
    # User is authenticated
    pass
```

```typescript
// Frontend: Store JWT in httpOnly cookie (not localStorage)
// Set by backend:
// Set-Cookie: access_token=<jwt>; HttpOnly; Secure; SameSite=Strict

// Frontend makes requests with credentials
fetch('/api/v1/goals', {
  credentials: 'include',  // Send cookies
});
```

## Migration from Desktop App

### Data Import

```python
# backend/utils/json_import.py
import json
from typing import Dict, Any
from uuid import UUID, uuid4
from schemas.goal import Goal

async def import_desktop_json(file_path: str, user_id: UUID) -> Dict[str, Goal]:
    """Import tree from desktop app JSON format"""
    with open(file_path, 'r') as f:
        data = json.load(f)

    # Desktop app uses anytree format
    # Map old IDs to new UUIDs
    id_mapping: Dict[str, UUID] = {}
    goals: Dict[str, Goal] = {}

    def process_node(node_data: Dict[str, Any], parent_id: Optional[UUID] = None):
        old_id = node_data.get('goal_id')
        new_id = uuid4()
        id_mapping[old_id] = new_id

        goal = Goal(
            id=new_id,
            name=node_data['name'],
            details=node_data.get('details'),
            parent_id=parent_id,
            user_id=user_id,
            active=node_data.get('active', False),
        )

        goals[str(new_id)] = goal

        # Process children recursively
        for child in node_data.get('children', []):
            process_node(child, new_id)

    # Start from root
    process_node(data)

    return goals
```

### UI Migration Guide

Create a migration guide document for users transitioning from desktop to web:

```markdown
# Migration Guide: VoxPlan Desktop → Web

## Key Differences

1. **No Installation Required**: Access from any browser
2. **Cloud Sync**: Your goals sync across devices
3. **Offline Support**: Works offline via PWA
4. **Mobile Support**: Responsive design for phone/tablet

## Importing Your Data

1. In desktop app: File → Export → Save as JSON
2. In web app: Settings → Import → Upload JSON file
3. All goals, relationships, and details preserved

## Keyboard Shortcuts (Same!)

All keyboard shortcuts work identically:
- `Tab`: Navigate to next sibling
- `Enter`: Activate selected goal
- `Ctrl+N`: Create new child
- etc.

## Voice Commands (Improved!)

Voice commands now use native browser speech recognition:
- Click microphone icon or press `V`
- Speak command naturally
- Works offline with Web Speech API
</thinking>

I'll present the updated architecture proposal that incorporates your decisions. This comprehensive document covers the full-stack architecture with Python FastAPI backend from day one, React Flow for visualization, and a phased approach to achieve complete feature parity.

<function_calls>
<invoke name="Read">
<parameter name="file_path">/Users/richardthompson/CODE/voxplan/.claude/PRPs/voxplan-web-architecture-proposal.md