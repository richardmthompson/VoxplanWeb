# Project Structure

This document explains the organization of the VoxplanWeb codebase, describing what each directory and key file contains.

## Repository Overview

```
VoxplanWeb/
├── client/                  # Frontend React application
├── server/                  # Backend Express server
├── shared/                  # Code shared between client and server
├── docs/                    # Documentation (this directory)
├── meta/                    # Research and design documents
├── attached_assets/         # Architectural proposals and screenshots
├── components.json          # shadcn/ui configuration
├── design_guidelines.md     # UI/UX design specifications
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
├── tailwind.config.ts       # TailwindCSS theming
├── drizzle.config.ts        # Drizzle ORM configuration
└── postcss.config.js        # PostCSS configuration
```

## Client Directory (`client/`)

Frontend React application code.

###client/public/
```
client/public/
└── favicon.png              # Application icon
```

Static assets served directly without processing.

### client/src/

Main application source code.

#### Component Organization

```
client/src/components/
├── dialogs/                 # Modal dialog components
│   └── HelpDialog.tsx      # Keyboard shortcuts help
│
├── examples/                # Example/prototype components
│   ├── AttributeWindow.tsx # Old attribute window implementation
│   ├── CommandWindow.tsx   # Old command window implementation
│   ├── GoalNode.tsx        # Old goal node implementation
│   ├── Header.tsx          # Old header implementation
│   ├── Home.tsx            # Old home page implementation
│   └── TreeCanvas.tsx      # Old tree canvas implementation
│
├── layout/                  # Layout components
│   └── Header.tsx          # App header with mode indicator
│
├── tree/                    # Tree visualization components
│   ├── TreeCanvas.tsx      # ReactFlow container (client/src/components/tree/TreeCanvas.tsx:37)
│   └── GoalNode.tsx        # Custom ReactFlow node (client/src/components/tree/GoalNode.tsx:1)
│
├── ui/                      # shadcn/ui component library
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── alert.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── tooltip.tsx
│   └── ... (40+ components)
│
└── windows/                 # Floating window panels
    ├── CommandWindow.tsx   # Command input panel
    └── AttributeWindow.tsx # Goal editing panel
```

**Component Guidelines**:
- `dialogs/` - Modal overlays using Radix AlertDialog
- `layout/` - Top-level structural components
- `tree/` - Core visualization components (actively used)
- `ui/` - Reusable UI primitives from shadcn/ui
- `windows/` - Floating panel windows
- `examples/` - Old implementations kept for reference (not used)

#### State Management

```
client/src/stores/
├── treeStore.ts            # Goal tree state (client/src/stores/treeStore.ts:1)
└── uiStore.ts              # UI mode and panel visibility (client/src/stores/uiStore.ts:1)
```

**treeStore** manages:
- Goal hierarchy (Map<id, Goal>)
- Active goal tracking
- CRUD operations
- Navigation logic
- Layout mode selection

**uiStore** manages:
- Current mode (navigate/command/voice)
- Panel visibility states

#### Pages

```
client/src/pages/
├── Home.tsx                # Main application page (client/src/pages/Home.tsx:1)
└── not-found.tsx           # 404 page
```

**Home.tsx** responsibilities:
- Keyboard event handling
- Window state management
- Rendering main layout
- Navigation logic

#### Utilities

```
client/src/utils/
└── layouts.ts              # Layout algorithms (client/src/utils/layouts.ts:1)
```

Contains three layout algorithms:
- `calculateTreeLayout()` - D3 Reingold-Tilford
- `calculateSpiderLayout()` - Radial/mind-map
- `calculateVerticalLayout()` - Stacked left/right
- `calculateLayout()` - Dispatcher function

#### Libraries

```
client/src/lib/
├── queryClient.ts          # TanStack React Query setup
└── utils.ts                # Helper functions (cn, etc.)
```

**queryClient.ts**: Configures React Query for server state
**utils.ts**: Common utilities, mainly `cn()` for class names

#### Hooks

```
client/src/hooks/
├── use-mobile.tsx          # Mobile detection hook
└── use-toast.ts            # Toast notification hook
```

#### Entry Files

```
client/src/
├── main.tsx                # Application entry point
├── App.tsx                 # Root component
└── index.css               # Global styles and Tailwind directives
```

**main.tsx**: Mounts React app to DOM
**App.tsx**: Providers, routing, global components
**index.css**: Tailwind base styles, custom CSS variables

#### HTML Template

```
client/
└── index.html              # HTML entry point for Vite
```

## Server Directory (`server/`)

Backend Express server code.

```
server/
├── index.ts                # Server entry point (server/index.ts:1)
├── routes.ts               # API route registration (server/routes.ts:1)
├── storage.ts              # Storage interface and in-memory implementation (server/storage.ts:1)
├── db.ts                   # Database setup (future use)
└── vite.ts                 # Vite dev server integration
```

### Server Files Explained

**index.ts** (server/index.ts:1):
- Express app configuration
- Middleware setup (JSON parsing, logging)
- Vite dev server integration
- HTTP server creation
- Port binding (default 5000)

**routes.ts** (server/routes.ts:1):
- API route registration
- Currently minimal (ready for expansion)
- Returns HTTP server instance

**storage.ts** (server/storage.ts:1):
- `IStorage` interface definition
- `MemStorage` in-memory implementation
- User CRUD operations
- Future: Database-backed implementation

**vite.ts**:
- Vite dev middleware for development
- Static file serving for production
- HMR support

**db.ts**:
- Database connection setup (future)
- Currently unused

## Shared Directory (`shared/`)

Code shared between client and server.

```
shared/
└── schema.ts               # Database schema and types (shared/schema.ts:1)
```

Contains:
- Drizzle ORM table definitions
- Zod validation schemas
- TypeScript type exports

Currently defines:
- `users` table schema
- `User` and `InsertUser` types

## Configuration Files

### Root Level Config

**package.json**:
- Dependencies (frontend + backend)
- npm scripts (dev, build, start, check)
- Metadata (name, version, license)

**tsconfig.json**:
- TypeScript compiler options
- Strict type checking enabled
- Path aliases (`@/` → `client/src/`)
- Module resolution settings

**vite.config.ts**:
- Vite build configuration
- React plugin setup
- Replit-specific plugins
- Dev server settings

**tailwind.config.ts**:
- TailwindCSS theme customization
- Color palette extensions
- Plugin configuration
- Content paths for purging

**drizzle.config.ts**:
- Drizzle ORM configuration
- Database connection settings (Neon PostgreSQL)
- Schema file location
- Output directory for migrations

**postcss.config.js**:
- PostCSS plugins
- TailwindCSS processing
- Autoprefixer configuration

**components.json**:
- shadcn/ui configuration
- Component style (default)
- Tailwind base color
- Path aliases for components

## Documentation Directory (`docs/`)

Project documentation (this directory).

```
docs/
├── README.md                        # Documentation index
├── 01-getting-started.md           # Setup and installation
├── 02-architecture-overview.md     # System design
├── 03-tech-stack.md                # Technologies explained
├── 04-project-structure.md         # This file
├── 05-core-features.md             # Feature documentation
├── 06-design-patterns.md           # Code patterns
├── 07-data-flow.md                 # State management
├── 08-ui-components.md             # Component library
├── 09-api-reference.md             # API endpoints
├── 10-known-issues.md              # Current limitations
├── 11-development-guide.md         # Development practices
└── diagrams/                        # Architecture diagrams (future)
```

## Research and Planning (`meta/` and `attached_assets/`)

### meta/
```
meta/
├── tree-layout-research.md         # Tree layout algorithm research
└── radial-layout-research.md       # Radial layout research
```

Contains research notes on layout algorithms and design approaches.

### attached_assets/
```
attached_assets/
├── voxplan-web-architecture-proposal_*.md  # Architecture planning
├── voxplan-language-agnostic-documentation_*.md  # Original spec
├── voxplan-web-phase1-implementation_*.md   # Phase 1 plan
└── Screenshot*.png                          # UI mockups
```

Original planning documents and architecture proposals.

## Design Documentation

**design_guidelines.md** (root):
- Material Design 3 principles
- Typography system
- Layout specifications
- Component dimensions
- Interaction patterns
- Responsive breakpoints
- Accessibility guidelines

## Git and Version Control

```
.gitignore                  # Files excluded from git
.git/                       # Git repository data
```

Ignored files/directories:
- `node_modules/`
- `dist/`
- `.env`
- Build artifacts
- IDE files

## Build Output (Not in Repo)

```
dist/                       # Production build output (gitignored)
├── assets/                 # Bundled JS/CSS
├── index.html             # Optimized HTML
└── index.js               # Server bundle
```

Generated by `npm run build`.

```
node_modules/               # Installed dependencies (gitignored)
```

Generated by `npm install`.

## File Naming Conventions

### TypeScript Files
- **Components**: PascalCase (e.g., `TreeCanvas.tsx`)
- **Stores**: camelCase (e.g., `treeStore.ts`)
- **Utilities**: camelCase (e.g., `layouts.ts`)
- **Pages**: PascalCase (e.g., `Home.tsx`)
- **Hooks**: kebab-case with `use-` prefix (e.g., `use-toast.ts`)

### Configuration Files
- Lowercase with extensions (e.g., `vite.config.ts`)
- JSON files lowercase (e.g., `package.json`)
- Markdown uppercase (e.g., `README.md`)

## Import Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

```typescript
import { Button } from '@/components/ui/button';
import { useTreeStore } from '@/stores/treeStore';
import { calculateLayout } from '@/utils/layouts';
```

`@/` resolves to `client/src/`

## Key File Relationships

### Data Flow Through Files

1. **User interacts** → `client/src/pages/Home.tsx`
2. **State updates** → `client/src/stores/treeStore.ts`
3. **Layout calculated** → `client/src/utils/layouts.ts`
4. **Tree renders** → `client/src/components/tree/TreeCanvas.tsx`
5. **Nodes render** → `client/src/components/tree/GoalNode.tsx`

### Style System

1. **Base config** → `tailwind.config.ts`
2. **Global styles** → `client/src/index.css`
3. **Component styles** → TailwindCSS classes in components
4. **UI primitives** → `client/src/components/ui/*.tsx`

### Build Process

1. **Entry** → `client/index.html`
2. **App mount** → `client/src/main.tsx`
3. **Build tool** → `vite.config.ts`
4. **Output** → `dist/`

## Finding Code by Feature

### Tree Visualization
- Layout algorithms: `client/src/utils/layouts.ts`
- Canvas container: `client/src/components/tree/TreeCanvas.tsx`
- Node rendering: `client/src/components/tree/GoalNode.tsx`
- State: `client/src/stores/treeStore.ts`

### Keyboard Navigation
- Event handling: `client/src/pages/Home.tsx` (lines 84-153)
- State updates: `client/src/stores/treeStore.ts`

### Command Window
- Component: `client/src/components/windows/CommandWindow.tsx`
- State: `client/src/stores/uiStore.ts`

### Goal Editing
- Component: `client/src/components/windows/AttributeWindow.tsx`
- State: `client/src/stores/treeStore.ts` (`updateGoal`)

### UI Components
- All components: `client/src/components/ui/`
- Usage examples: Search across `client/src/components/`

## Code Organization Principles

1. **Separation of Concerns**: UI components separate from business logic
2. **Single Responsibility**: Each file has one clear purpose
3. **Colocation**: Related files grouped in directories
4. **Shared Code**: Common code in `shared/` directory
5. **Configuration Centralization**: All config files at root level

## Navigation Tips

### Finding a Component
1. Check `client/src/components/` subdirectories
2. Use file name search (Cmd+P in VS Code)
3. Search for component usage in other files

### Finding a Feature
1. Start from `client/src/pages/Home.tsx` (main page)
2. Trace imports to related components
3. Check stores for state management
4. Check utils for algorithms

### Finding Types/Interfaces
1. Check component files (usually at top)
2. Check stores for state types
3. Check `shared/schema.ts` for database types
4. Use TypeScript "Go to Definition" (F12)

## Related Documentation

- [Getting Started](./01-getting-started.md) - How to run the project
- [Architecture Overview](./02-architecture-overview.md) - System design
- [Development Guide](./11-development-guide.md) - Coding conventions

---

**Next**: Learn about the features in [Core Features](./05-core-features.md).
