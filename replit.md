# VoxPlan - Hierarchical Goal Planning Application

## Overview

VoxPlan is a web-based hierarchical goal planning application that enables users to create, organize, and navigate complex goal structures using an interactive tree-based visualization. The application provides a clean, productivity-focused interface for managing goals with parent-child relationships, featuring real-time visual updates and multimodal interaction patterns.

The system is built as a full-stack web application with a React TypeScript frontend and Express backend, designed to modernize the original desktop Kivy application for cross-device accessibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 29, 2025
- **Major layout system overhaul**: Implemented hierarchical shapes (root=square, level1=circle, level2=diamond, level3=triangle, level4+=hexagon) using custom SVG rendering, dramatic size reduction by depth (75%, 60%, 48%, 40%), tighter clustering in both tree (120px spacing) and spider (120px radius) layouts, and improved sibling grouping via adaptive separation.
- **Parent-drag-children feature**: Added dragLocked toggle (Link/Unlink icon) on nodes with children. When locked (default), dragging a parent moves entire subtree together. Manual positions persist per layout mode. Uses onNodeDrag to calculate delta and recursively update descendant positions.
- **Improved attribute window sync**: Fixed race condition where attributes would show stale data by using ref flag + useEffect pattern instead of setTimeout, ensuring attributes always display newly created goal data.
- **Auto-open attributes on goal creation**: Attributes window now automatically opens whenever a new goal is created (via keyboard shortcuts 'n'/'s' or command terminal 'root'/'child'/'sibling'), with the Name field focused and selected for immediate editing.
- **Keyboard zoom controls**: Added '+' and '-' keyboard shortcuts to zoom in and out of the canvas using React Flow's zoom API.
- **UI positioning fixes**: Moved layout toggle buttons to bottom-center, command window shifted right to clear zoom controls, ensuring no UI element overlaps.

### October 28, 2025
- **Enhanced attribute window UX**: Name field auto-focuses and selects text when opening attributes. ESC closes without saving, ENTER saves and closes. Keyboard shortcuts properly disabled while typing in attribute fields.
- **Fixed keyboard shortcuts always working**: Keyboard shortcuts now work reliably even after clicking buttons in the header. Main container is auto-focused on mount and refocused on clicks to ensure shortcuts are always active.
- **Fixed keyboard shortcut conflict with command terminal**: Navigation shortcuts (h, j, k, l) are now properly disabled when typing in the command input. Added focus detection to prevent shortcuts from firing when any input element is active.
- **Fixed command parsing bug**: Commands like "root My Goal" and "child Test Node" now correctly include the first word of the goal name.
- **Dual-layout system completed**: Implemented tree and spider layout modes with layout-specific manual position persistence. Each mode maintains separate drag positions, allowing users to switch between layouts without losing custom arrangements.
- **Terminal UI improvements**: ESC minimizes terminal, command mode properly manages application mode state, updated title to "voxplan command mode".

## System Architecture

### Frontend Architecture

**Core Framework**: React 19 with TypeScript, built using Vite as the build tool and development server.

**Rationale**: React 19 provides the latest performance optimizations and developer experience improvements. TypeScript ensures type safety across the codebase, reducing runtime errors. Vite offers fast hot module replacement during development and optimized production builds.

**State Management**: Zustand for global application state with two primary stores:
- `treeStore`: Manages the goal tree data structure, CRUD operations, and tree navigation logic
- `uiStore`: Handles UI state including current mode (command/navigate/voice) and panel visibility

**Rationale**: Zustand chosen over Redux or Context API for its lightweight footprint, minimal boilerplate, and built-in support for immutable updates through Immer. The separation into domain-specific stores (tree data vs. UI state) maintains clear boundaries and prevents unnecessary re-renders.

**Tree Visualization**: React Flow library for rendering the interactive goal tree with custom node components.

**Rationale**: React Flow provides a battle-tested foundation for node-based visualizations with built-in pan/zoom, connection handling, and performance optimizations for large graphs. Custom `GoalNode` components integrate seamlessly while leveraging the library's layout and interaction capabilities.

**Layout Algorithm**: D3-hierarchy for tree layout calculations with support for both traditional hierarchical and radial (spider) layouts.

**Rationale**: D3's hierarchy module is the industry standard for tree layout algorithms, providing flexible, mathematically sound positioning that handles variable node sizes and maintains visual clarity at different scales.

**Routing**: Wouter for lightweight client-side routing.

**Rationale**: Wouter provides React Router-like functionality with a significantly smaller bundle size (~1.2KB), appropriate for this single-page application with minimal routing needs.

**UI Components**: shadcn/ui component library based on Radix UI primitives with Tailwind CSS styling.

**Rationale**: shadcn/ui provides accessible, customizable components that can be copied directly into the codebase rather than installed as dependencies. This approach offers full control over component styling and behavior while maintaining accessibility standards through Radix UI primitives. Tailwind CSS enables rapid UI development with consistent spacing, colors, and responsive design.

**Design System**: Material Design 3 principles with visual inspiration from Linear (typography), Figma (canvas tools), and Notion (flexible panels).

**Rationale**: The professional aesthetics and clear information hierarchy required for a productivity tool align well with Material Design 3's emphasis on clarity and usability. The hybrid approach borrows interaction patterns from successful productivity applications users already know.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript.

**Rationale**: Express provides a minimal, unopinionated framework suitable for RESTful APIs. TypeScript extends to the backend for end-to-end type safety. The simplicity of Express reduces cognitive overhead while remaining extensible for future features.

**Data Layer**: Drizzle ORM configured for PostgreSQL (via Neon serverless) with schema definitions in shared TypeScript files.

**Rationale**: Drizzle provides type-safe database queries with minimal overhead and excellent TypeScript integration. The serverless PostgreSQL connection through Neon reduces operational complexity while supporting connection pooling. Sharing schema definitions between frontend and backend ensures data contract consistency.

**Session Management**: In-memory storage initially with structure supporting migration to connect-pg-simple for PostgreSQL-backed sessions.

**Rationale**: Starting with in-memory storage simplifies initial development. The interface-based storage abstraction (`IStorage`) allows swapping implementations without changing business logic, supporting future migration to persistent session storage.

**API Structure**: RESTful endpoints under `/api` prefix with JSON request/response format.

**Rationale**: REST provides a well-understood, cacheable API design. The `/api` prefix clearly separates API routes from static asset serving, simplifying reverse proxy configuration in production deployments.

### Data Model

**Goal Structure**: Tree-based data model with single root node and parent-child relationships. Each goal contains:
- `id`: Unique numeric identifier (auto-incrementing)
- `name`: Goal title/label
- `details`: Extended description
- `parentId`: Reference to parent goal (null for root)
- `totalheight`: Size metric for visual representation
- `position`: Canvas coordinates for layout

**Active Goal Pattern**: Exactly one goal is designated as "active" at any time, representing the current focus of user attention. Navigation operations (up/down/left/right) move the active state between related goals.

**Rationale**: The single-root tree structure provides a clear entry point and prevents disconnected goal fragments. The active goal pattern simplifies keyboard navigation and provides an unambiguous context for CRUD operations. Storing position data directly on goals enables stable layouts across sessions.

### Development and Build Configuration

**Module System**: ES Modules (ESM) throughout the stack with TypeScript compilation to preserve module semantics.

**Bundling**: Vite for frontend bundling with code splitting; esbuild for backend bundling in production.

**Rationale**: ESM is the modern standard with better tree-shaking and static analysis. Vite's use of native ESM during development provides instant server start and fast HMR. esbuild's extreme speed makes backend bundling nearly instantaneous.

**Path Aliases**: Centralized path mapping configured in both TypeScript and Vite:
- `@/*`: Client source files
- `@shared/*`: Shared schema and types
- `@assets/*`: Static assets

**Rationale**: Path aliases prevent fragile relative imports (`../../..`) and make refactoring easier. Consistent configuration across build tools ensures aliases work in both development and production.

## External Dependencies

### UI and Component Libraries
- **Radix UI**: Unstyled, accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **shadcn/ui**: Pre-styled component library built on Radix UI primitives
- **Lucide React**: Icon library providing consistent iconography
- **React Flow**: Interactive node-based graph visualization library
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing

### State and Data Management
- **Zustand**: Lightweight state management with Immer middleware for immutable updates
- **TanStack Query (React Query)**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition
- **Drizzle ORM**: Type-safe database ORM with schema-first design
- **Drizzle Zod**: Integration between Drizzle schemas and Zod validators

### Database
- **Neon Serverless PostgreSQL**: Serverless PostgreSQL database with WebSocket connections
- **pg**: PostgreSQL client library
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Routing and Navigation
- **Wouter**: Lightweight React router (1.2KB)

### Backend Framework
- **Express**: Minimal web application framework
- **tsx**: TypeScript execution environment for Node.js development

### Build and Development Tools
- **Vite**: Frontend build tool and development server
- **esbuild**: Fast JavaScript/TypeScript bundler for backend
- **TypeScript**: Static type checking across the stack
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit integration for code navigation
- **@replit/vite-plugin-dev-banner**: Development environment indicator

### Utility Libraries
- **class-variance-authority (cva)**: Type-safe variant management for component styling
- **clsx**: Utility for constructing className strings
- **tailwind-merge**: Intelligent merging of Tailwind CSS classes
- **cmdk**: Command palette component (for future command interface enhancements)
- **d3-hierarchy**: Tree layout algorithms and hierarchical data processing
- **date-fns**: Date manipulation and formatting

### Font Delivery
- **Google Fonts CDN**: Serves Inter (primary UI font), IBM Plex Sans (alternative), and JetBrains Mono (monospace for command input)