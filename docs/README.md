# VoxplanWeb Documentation

## What is VoxplanWeb?

VoxplanWeb is an interactive web-based goal and task visualization application that allows users to create, manage, and navigate hierarchical goal trees using intuitive visual representations. The application supports multiple interaction modes including keyboard navigation, text commands, and visual tree manipulation.

The project emphasizes clarity, professional design, and powerful tree-based organization inspired by productivity tools like Linear, Figma, and Notion.

## Key Features

- **Interactive Tree Visualization**: Visual goal hierarchy with multiple layout modes (tree, radial/spider, vertical)
- **Keyboard-Driven Navigation**: Vim-like navigation (hjkl) for efficient goal traversal
- **Multiple Interaction Modes**: Navigate mode for keyboard shortcuts, Command mode for text input
- **Real-time Visual Feedback**: Active goals highlighted with visual indicators
- **Drag and Lock**: Move goals with children following (drag-locked by default)
- **Responsive Layout Algorithms**: Powered by D3.js hierarchy layouts with custom enhancements
- **Clean Material Design**: Following Material Design 3 principles with shadcn/ui components

## Documentation Index

### Getting Started
- [**01. Getting Started**](./01-getting-started.md) - Installation, setup, and running the application
- [**11. Development Guide**](./11-development-guide.md) - How to add features and contribute

### Understanding the System
- [**02. Architecture Overview**](./02-architecture-overview.md) - High-level system design
- [**03. Tech Stack**](./03-tech-stack.md) - Frameworks, libraries, and tools explained
- [**04. Project Structure**](./04-project-structure.md) - Directory organization and file purposes

### Features and Implementation
- [**05. Core Features**](./05-core-features.md) - Main capabilities and how they work
- [**06. Design Patterns**](./06-design-patterns.md) - Architectural decisions and patterns
- [**07. Data Flow**](./07-data-flow.md) - State management and data synchronization
- [**08. UI Components**](./08-ui-components.md) - Component library and usage

### Reference
- [**09. API Reference**](./09-api-reference.md) - Backend API endpoints (currently minimal)
- [**10. Known Issues**](./10-known-issues.md) - Current limitations and future improvements

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run check
```

Navigate to `http://localhost:5000` (or the port shown in console).

## Technology Overview

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- ReactFlow (tree visualization)
- Zustand (state management)
- TailwindCSS + shadcn/ui (styling)
- D3.js hierarchy (layout algorithms)

**Backend:**
- Express.js
- TypeScript
- In-memory storage (currently)
- Drizzle ORM (configured for future database)

## Project Status

### What's Working Well ✅
- Interactive tree visualization with three layout modes
- Keyboard navigation with vim-like controls
- Goal creation, editing, and deletion
- Multiple layout algorithms (tree, spider, vertical)
- Drag-and-drop with children following
- Responsive visual design
- Modal windows for command input and attribute editing

### In Progress / Future Enhancements 🚧
- Backend API integration (routes currently minimal)
- Database persistence (Drizzle ORM configured but not connected)
- Voice interaction mode
- Multi-user support
- File import/export
- Advanced search and filtering

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                   │
│  ┌───────────────────────────────────────────────┐  │
│  │  React Components                              │  │
│  │  - TreeCanvas (ReactFlow)                      │  │
│  │  - GoalNode (Custom Nodes)                     │  │
│  │  - CommandWindow, AttributeWindow              │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  State Management (Zustand)                    │  │
│  │  - treeStore: Goals, hierarchy, active node    │  │
│  │  - uiStore: UI mode, panel visibility          │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Layout Algorithms (D3 + Custom)               │  │
│  │  - Tree: Reingold-Tilford algorithm            │  │
│  │  - Spider: Radial with angular sectoring       │  │
│  │  - Vertical: Alternating left/right stacks     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
                         │ HTTP (Future)
                         ▼
┌─────────────────────────────────────────────────────┐
│                 Server (Express)                     │
│  - Routes (minimal, ready for expansion)             │
│  - Storage interface (in-memory)                     │
│  - Vite dev server integration                       │
└─────────────────────────────────────────────────────┘
```

## Design Philosophy

VoxplanWeb follows these core principles:

1. **Clarity Over Decoration**: Every visual element serves the tree visualization
2. **Responsive Canvas**: Tree adapts fluidly while maintaining spatial relationships
3. **Immediate Feedback**: Visual states clearly communicate active node and interactions
4. **Professional Minimalism**: Clean, distraction-free interface focusing on goal structure
5. **Keyboard-First**: Powerful keyboard navigation inspired by vim

## Contributing

See [Development Guide](./11-development-guide.md) for:
- Setting up your development environment
- Code style and conventions
- Adding new features
- Testing guidelines

## Related Documents

- `design_guidelines.md` - Detailed UI/UX design specifications
- `attached_assets/voxplan-web-architecture-proposal_*.md` - Original architecture planning
- `meta/tree-layout-research.md` - Research on tree layout algorithms
- `meta/radial-layout-research.md` - Research on radial layout approaches

## Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

---

**Last Updated**: 2025-11-15
**Version**: 1.0 (Initial Documentation)
