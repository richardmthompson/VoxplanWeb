# Tech Stack

This document provides a comprehensive overview of all technologies, frameworks, and libraries used in VoxplanWeb, explaining why each was chosen and how it's used.

## Frontend Stack

### Core Framework

#### React 18.3.1
**Purpose**: UI component library and reactivity system

**Why chosen**:
- Industry-standard component model
- Excellent TypeScript support
- Large ecosystem of compatible libraries
- Efficient re-rendering with virtual DOM
- Hooks API for state and side effects

**How used**:
- All UI components built as React function components
- Hooks: `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`
- Context providers for global state (QueryClient, Tooltip)

**Key files**:
- `client/src/main.tsx` - App entry point
- `client/src/App.tsx` - Root component
- `client/src/pages/Home.tsx` - Main page component

#### TypeScript 5.6.3
**Purpose**: Type-safe JavaScript with compile-time checking

**Why chosen**:
- Catch errors before runtime
- Better IDE autocomplete and refactoring
- Self-documenting code through types
- Required for many modern libraries

**How used**:
- All `.tsx` and `.ts` files
- Strict type checking enabled
- Interface definitions for data models
- Type inference for reduced boilerplate

**Configuration**:
- `tsconfig.json` - TypeScript compiler options
- Strict mode enabled
- Path aliases: `@/` maps to `client/src/`

### Build Tool

#### Vite 5.4.20
**Purpose**: Fast development server and build tool

**Why chosen**:
- Lightning-fast HMR (Hot Module Replacement)
- Native ESM support
- Optimized production builds
- Better developer experience than Webpack
- Built-in TypeScript support

**How used**:
- Development server: `npm run dev`
- Production build: `npm run build`
- Plugin system for customization

**Configuration**:
- `vite.config.ts` - Vite configuration
- React plugin for JSX transformation
- TailwindCSS integration
- Path resolution for imports

**Plugins used**:
- `@vitejs/plugin-react` - React fast refresh
- `@replit/vite-plugin-dev-banner` - Dev banner
- `@replit/vite-plugin-runtime-error-modal` - Error overlay
- `@replit/vite-plugin-cartographer` - Code mapping

### Routing

#### Wouter 3.3.5
**Purpose**: Lightweight client-side routing

**Why chosen**:
- Minimalist (1.5KB gzipped)
- React-hooks based API
- No need for heavy React Router
- Simple enough for this project

**How used**:
```tsx
<Switch>
  <Route path="/" component={Home} />
  <Route component={NotFound} />
</Switch>
```

**Key files**:
- `client/src/App.tsx` - Route definitions

### State Management

#### Zustand 5.0.8
**Purpose**: Lightweight state management library

**Why chosen**:
- Much simpler than Redux
- No boilerplate (actions, reducers, etc.)
- Built-in TypeScript support
- Hook-based API
- Small bundle size (1KB)
- Direct state mutation (with immer)

**How used**:
```typescript
const useTreeStore = create<TreeState>((set, get) => ({
  goals: new Map(),
  addGoal: (name, details, parentId) => { /* ... */ }
}))
```

**Stores**:
- `treeStore` (client/src/stores/treeStore.ts:1) - Goal tree data
- `uiStore` (client/src/stores/uiStore.ts:1) - UI state

#### Immer 10.2.0
**Purpose**: Immutable state updates with mutable syntax

**Why chosen**:
- Write simple mutation code
- Produces immutable updates under the hood
- Integrates with Zustand
- Prevents state mutation bugs

**How used**:
- Used implicitly through Zustand
- Enables `set(state => { state.x = y })` syntax

### Visualization

#### ReactFlow 11.11.4
**Purpose**: Node-based graph visualization library

**Why chosen**:
- Built for React
- Handles zoom, pan, drag automatically
- Custom node components
- Edge routing and styling
- Performance optimized for large graphs
- Mini-map and controls included

**How used**:
```tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  nodeTypes={{ goalNode: GoalNode }}
  onNodeDrag={handleDrag}
/>
```

**Features used**:
- Custom node rendering (GoalNode component)
- Smooth-step edges
- Background with dots variant
- Built-in controls (zoom, fit view)
- Node positioning and dragging

**Key files**:
- `client/src/components/tree/TreeCanvas.tsx` - ReactFlow container
- `client/src/components/tree/GoalNode.tsx` - Custom node component

#### D3.js Hierarchy 3.1.2
**Purpose**: Hierarchical layout algorithms

**Why chosen**:
- Industry-standard tree layouts
- Reingold-Tilford algorithm (optimal space)
- Well-tested and performant
- Flexible configuration

**How used**:
```typescript
import { hierarchy, tree } from 'd3-hierarchy';

const root = hierarchy(data);
const treeLayout = tree().nodeSize([width, height]);
treeLayout(root);
```

**Layouts implemented**:
- Tree layout: D3's `tree()` with custom separation
- Spider layout: Custom radial algorithm
- Vertical layout: Custom stacking algorithm

**Key files**:
- `client/src/utils/layouts.ts` - Layout algorithms

### Server State

#### TanStack React Query 5.60.5
**Purpose**: Server state synchronization and caching

**Why chosen**:
- Automatic caching and invalidation
- Loading and error states
- Optimistic updates
- Background refetching
- Devtools for debugging

**How used**:
- Currently minimal (no server calls yet)
- Configured and ready for future API integration
- QueryClient provider wraps app

**Configuration**:
- `client/src/lib/queryClient.ts` - Query client setup

### UI Components

#### shadcn/ui
**Purpose**: High-quality, customizable component library

**Why chosen**:
- Built on Radix UI primitives (accessibility)
- Fully customizable (copy into codebase)
- TailwindCSS styling
- TypeScript support
- No runtime dependency (code is copied)

**Components used**:
- Button, Input, Textarea, Label
- Dialog, Alert Dialog
- Tooltip, Toast, Toaster
- Card, Separator
- Accordion, Tabs
- Form components
- Many more in `client/src/components/ui/`

**How it works**:
- Components copied into `client/src/components/ui/`
- Modified as needed for this project
- Styled with TailwindCSS classes

#### Radix UI Primitives
**Purpose**: Unstyled, accessible component primitives

**Packages used**:
- `@radix-ui/react-dialog` - Modal dialogs
- `@radix-ui/react-alert-dialog` - Confirmation dialogs
- `@radix-ui/react-tooltip` - Tooltips
- `@radix-ui/react-toast` - Notifications
- And many more (see package.json)

**Why chosen**:
- Best-in-class accessibility
- Unstyled (bring your own styles)
- Composable API
- Keyboard navigation built-in
- ARIA attributes handled automatically

#### Lucide React 0.453.0
**Purpose**: Icon library

**Why chosen**:
- Modern, consistent design
- Tree-shakeable (only import used icons)
- Good variety of icons
- TypeScript support

**How used**:
```tsx
import { Crosshair, Network, Radar } from 'lucide-react';
<Crosshair className="w-4 h-4" />
```

**Icons used**:
- Crosshair - Center active goal
- Network, Radar, List - Layout mode indicators
- Many more in various components

### Styling

#### TailwindCSS 3.4.17
**Purpose**: Utility-first CSS framework

**Why chosen**:
- Rapid development
- Consistent design system
- No CSS file management
- Purges unused styles
- Responsive utilities
- Dark mode support

**How used**:
```tsx
<div className="flex items-center gap-4 p-6 bg-card rounded-lg">
```

**Configuration**:
- `tailwind.config.ts` - Theme customization
- `postcss.config.js` - PostCSS setup
- `client/src/index.css` - Base styles and Tailwind directives

**Customizations**:
- Extended color palette
- Custom spacing scale
- Animation utilities
- Component-specific styles

#### Framer Motion 11.13.1
**Purpose**: Animation library

**Why chosen**:
- Declarative animations
- Spring physics
- Gesture support
- Great TypeScript support

**How used**:
- Currently minimal usage
- Ready for future animations
- Potential use: goal transitions, panel animations

### Forms and Validation

#### React Hook Form 7.55.0
**Purpose**: Form state management

**Why chosen**:
- Minimal re-renders
- Built-in validation
- TypeScript support
- Easy integration with UI libraries

**How used**:
- Attribute window form
- Command input (future)

#### Zod 3.24.2
**Purpose**: TypeScript-first schema validation

**Why chosen**:
- Type inference (TypeScript types from schemas)
- Runtime validation
- Composable schemas
- Great error messages

**How used**:
```typescript
const goalSchema = z.object({
  name: z.string().min(1),
  details: z.string().optional(),
});
```

**Integration**:
- `@hookform/resolvers` - Connect Zod to React Hook Form
- `drizzle-zod` - Generate Zod schemas from Drizzle schemas

### Utilities

#### class-variance-authority (cva) 0.7.1
**Purpose**: Variant-based component styling

**How used**:
- Button variants (primary, secondary, outline, ghost)
- Size variants (sm, md, lg)
- Combined with TailwindCSS

#### clsx 2.1.1 & tailwind-merge 2.6.0
**Purpose**: Conditional class name generation

**How used**:
```typescript
import { cn } from '@/lib/utils';
<div className={cn("base-class", condition && "conditional-class")} />
```

## Backend Stack

### Server Framework

#### Express 4.21.2
**Purpose**: Minimalist web framework for Node.js

**Why chosen**:
- Industry standard
- Middleware ecosystem
- Simple and unopinionated
- Easy to add features incrementally

**How used**:
```typescript
const app = express();
app.use(express.json());
app.use(registerRoutes);
```

**Middleware**:
- JSON body parser
- URL-encoded parser
- Request logging
- Error handling

**Key files**:
- `server/index.ts` - Server setup and configuration

#### tsx 4.20.5
**Purpose**: TypeScript execution for Node.js

**Why chosen**:
- Run TypeScript directly without compilation
- Fast development iteration
- Used for dev server

**How used**:
```bash
tsx server/index.ts  # Development mode
```

### Database (Configured, Not Yet Connected)

#### Drizzle ORM 0.39.1
**Purpose**: TypeScript ORM for SQL databases

**Why chosen**:
- Type-safe queries
- Schema as code
- Lightweight (no runtime overhead)
- SQL-like syntax
- Great migrations

**How configured**:
```typescript
// shared/schema.ts
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull(),
});
```

**Configuration**:
- `drizzle.config.ts` - ORM configuration
- `shared/schema.ts` - Database schema definitions

#### PostgreSQL (via @neondatabase/serverless)
**Purpose**: Production database

**Why chosen**:
- Robust, mature database
- Strong typing
- JSON support
- Serverless option available

**Current status**: Configured but not connected (using in-memory storage)

### Development Tools

#### Vite Integration (server/vite.ts)
**Purpose**: Serve Vite dev server in development

**How used**:
- Development: Vite middleware in Express
- Production: Serve static files from `dist/`

#### esbuild 0.25.0
**Purpose**: Fast JavaScript bundler

**How used**:
- Backend bundling for production
- Lightning-fast compilation

## Development Dependencies

### Type Definitions

All `@types/*` packages provide TypeScript definitions:
- `@types/node` - Node.js APIs
- `@types/react` - React APIs
- `@types/express` - Express APIs
- And more...

### Linting and Formatting (Future)

Configured but not fully set up:
- ESLint - Code linting
- Prettier - Code formatting

## Dependency Management

### Package Manager: npm
- Lock file: `package-lock.json`
- Total dependencies: ~100+ (including transitive)
- Bundle size: ~500KB (production, minified + gzipped)

### Dependency Security
- Regular updates via `npm update`
- Audit: `npm audit`
- No known critical vulnerabilities (as of docs creation)

## Build Output

### Development Build
- No bundling (ESM modules served directly)
- Source maps enabled
- Fast HMR

### Production Build
- Minified bundles
- Tree-shaking (removes unused code)
- Code splitting (separate vendor chunks)
- Optimized assets
- Gzip compression

**Output structure**:
```
dist/
├── assets/
│   ├── index-[hash].js      # Main bundle
│   ├── vendor-[hash].js     # Third-party libraries
│   └── index-[hash].css     # Styles
├── index.html               # Entry HTML
└── index.js                 # Server bundle
```

## Browser Compatibility

**Target browsers** (from Vite config):
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions

**Polyfills**: None needed (modern browsers only)

## Performance Characteristics

### Bundle Sizes (approximate, minified + gzipped)
- React + ReactDOM: ~45 KB
- ReactFlow: ~80 KB
- D3 hierarchy: ~10 KB
- Zustand: ~1 KB
- Radix UI components: ~50 KB (total)
- Application code: ~30 KB
- **Total**: ~220 KB (first load)

### Load Performance
- First Contentful Paint (FCP): < 1s
- Time to Interactive (TTI): < 2s
- Lighthouse score: 90+ (estimated)

## Version Management

### Dependency Version Strategy
- **Caret ranges** (`^`): Allow patch and minor updates
- **Major versions**: Locked to avoid breaking changes
- **React ecosystem**: Kept in sync (18.x)
- **TypeScript**: Locked to 5.6.x for stability

### Update Strategy
```bash
# Check for updates
npm outdated

# Update within semver ranges
npm update

# Major version upgrades (manual)
npm install package@latest
```

## Technology Alternatives Considered

### What We Didn't Choose (and why)

**Vue/Svelte instead of React**:
- React has larger ecosystem
- More job-relevant
- Better TypeScript support

**Redux instead of Zustand**:
- Redux is overkill for this project size
- Too much boilerplate
- Zustand is simpler and sufficient

**Next.js instead of Vite**:
- Don't need SSR (single-page app)
- Vite is faster for development
- Simpler configuration

**GraphQL instead of REST**:
- REST is simpler for small API
- No need for complex querying yet
- Can migrate later if needed

**Styled Components instead of Tailwind**:
- Tailwind is faster to write
- Better for rapid prototyping
- Consistent design system

## Future Technology Additions

### Planned
- WebSocket library for real-time sync
- Dexie.js for IndexedDB caching
- Sentry for error monitoring
- Playwright for E2E testing

### Under Consideration
- Jotai or Recoil (if state gets more complex)
- tRPC (type-safe API layer)
- Turbo/monorepo tools (if project grows)

## Related Documentation

- [Architecture Overview](./02-architecture-overview.md) - How these technologies fit together
- [Development Guide](./11-development-guide.md) - Using these technologies in practice
- [Project Structure](./04-project-structure.md) - Where technology code lives

---

**Next**: Understand how the codebase is organized in [Project Structure](./04-project-structure.md).
