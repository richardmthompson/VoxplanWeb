# VoxPlan Design Guidelines

## Design Approach

**Selected Approach**: Design System + Canvas Tool Hybrid
- **Primary System**: Material Design 3 principles for foundational components
- **Visual Inspiration**: Linear (typography clarity), Figma (canvas tools), Notion (flexible panels)
- **Rationale**: Productivity tool requiring professional aesthetics, clear information hierarchy, and canvas-based interaction patterns

## Core Design Principles

1. **Clarity Over Decoration**: Every visual element serves the tree visualization and navigation
2. **Responsive Canvas**: Main tree view adapts fluidly while maintaining spatial relationships
3. **Immediate Feedback**: Visual states clearly communicate active node, hierarchy depth, and interaction modes
4. **Professional Minimalism**: Clean, distraction-free interface focusing user attention on goal structure

---

## Typography System

### Font Family
- **Primary**: Inter or IBM Plex Sans via Google Fonts CDN
- **Monospace**: JetBrains Mono for command input and IDs

### Type Scale
- **H1 (Page Title)**: 2xl font-bold (tree name, if displayed)
- **H2 (Panel Headers)**: lg font-semibold
- **Body (Default)**: base font-normal
- **Small (Metadata)**: sm font-normal
- **Tree Node Labels**: Dynamic sizing based on node depth (starts at text-base for root, scales down 10% per level)
- **Command Input**: text-sm font-mono

### Hierarchy Rules
- Panel titles use semibold weight
- Active elements use medium weight
- Metadata and secondary info use normal weight
- Tree node names use medium weight, details use normal weight

---

## Layout System

### Spacing Primitives
**Standard Units**: 2, 4, 8, 12, 16, 24 (tailwind scale)
- **Micro spacing** (2): Icon gaps, tight inline elements
- **Component spacing** (4): Between related elements within components
- **Section spacing** (8): Between major UI sections/panels
- **Panel padding** (12-16): Internal panel padding
- **Large gaps** (24): Between distinct functional areas

### Application Layout Structure

**Three-Panel Layout** (desktop):
```
┌─────────────────────────────────────────────────────────┐
│ Header (h-16, px-8, py-4)                               │
├──────────────┬──────────────────────────┬───────────────┤
│ Command      │ Tree Canvas              │ Attribute     │
│ Panel        │ (Main visualization)     │ Panel         │
│ (w-80)       │ (flex-1)                 │ (w-96)        │
│              │                          │               │
│ p-4          │ Infinite canvas          │ p-6           │
│              │ with zoom/pan            │               │
└──────────────┴──────────────────────────┴───────────────┘
```

**Responsive Behavior** (mobile/tablet):
- Stack panels vertically: Command → Tree → Attributes
- Tree canvas gets min-h-96 on mobile
- Panels become full-width collapsible sections

### Canvas Controls
- **Position**: Fixed bottom-right of tree canvas
- **Spacing**: mb-4 mr-4
- **Layout**: Horizontal button group with gap-2
- **Controls**: Zoom in, zoom out, fit view, center active node

---

## Component Library

### Panel Components

**Base Panel**:
- Border radius: rounded-lg
- Border: 1px solid (subtle)
- Padding: p-6
- Shadow: shadow-sm

**Panel Header**:
- Typography: text-lg font-semibold
- Bottom border: 1px solid
- Padding: pb-4 mb-6
- Optional action button: text-sm font-medium

**Command Window Panel**:
- Fixed width: w-80 (desktop)
- Textarea input: font-mono text-sm, p-3, rounded-md, min-h-32
- Submit button: w-full mt-2
- Command history: max-h-64 overflow-y-auto, text-xs, mt-4, space-y-1
- Mode indicator: Badge showing "CMD" / "NAV" / "VOX"

**Attribute Editor Panel**:
- Fixed width: w-96 (desktop)
- Input fields: Full width, p-3, rounded-md, mb-4
- Label typography: text-sm font-medium mb-2
- Textarea for details: min-h-40
- Action buttons: flex gap-2 justify-end mt-6

### Tree Visualization Components

**Goal Node** (React Flow custom node):
- **Circle Element**: SVG circle, diameter based on depth (start 109.6px, multiply by 0.9 per level)
- **Border Ring**: 2px ring for inactive nodes
- **Label**: Positioned below circle, text-center, max-w-40, truncate with ellipsis
- **Depth Visual**: Gradually smaller size creates hierarchy
- **Active State**: No border ring, distinct appearance
- **Inactive State**: Has border ring

**Connection Lines**:
- Stroke width: 2px
- Smooth bezier curves (React Flow default)
- Start from bottom-center of parent
- End at top-center of child

**Tree Canvas Container**:
- Background: Dot pattern (subtle)
- Minimap: Fixed bottom-left corner, w-48 h-32, rounded-lg, border

### Form Elements

**Text Input**:
- Height: h-10
- Padding: px-3
- Border radius: rounded-md
- Border: 1px solid
- Focus ring: 2px offset ring

**Textarea**:
- Padding: p-3
- Border radius: rounded-md
- Border: 1px solid
- Resize: vertical only

**Button (Primary)**:
- Height: h-10
- Padding: px-6
- Border radius: rounded-md
- Typography: text-sm font-medium
- Min-width: min-w-20

**Button (Secondary)**:
- Same dimensions as primary
- Different visual treatment

**Button (Icon)**:
- Size: w-10 h-10
- Padding: p-2
- Border radius: rounded-md

### Navigation & Controls

**Keyboard Shortcuts Panel** (help overlay):
- Modal dialog, max-w-2xl
- Grid layout: grid-cols-2 gap-4
- Shortcut display: kbd element, text-xs font-mono, px-2 py-1, rounded

**Mode Switcher** (header):
- Segmented control group
- Three options: Command / Navigate / Voice
- Active state clearly indicated
- Width: each segment min-w-24

**Zoom Controls** (canvas overlay):
- Vertical button stack
- Buttons: w-10 h-10
- Icons: Heroicons (plus, minus, arrows-pointing-out, crosshair)
- Semi-transparent background with blur

### Status & Feedback

**Active Node Indicator** (header):
- Breadcrumb trail: "Root > Goal > Subgoal"
- Typography: text-sm, truncate
- Separators: text-gray-400 px-2

**Tree Statistics** (header right):
- Total nodes count
- Tree depth
- Typography: text-sm tabular-nums

**Toast Notifications**:
- Position: Fixed top-right
- Width: w-80
- Padding: p-4
- Shadow: shadow-lg
- Auto-dismiss: 3 seconds
- Types: Success, Error, Info

---

## Interaction Patterns

### Tree Navigation
- **Click node**: Activate and center
- **Double-click node**: Open attribute editor focused
- **Arrow keys**: Navigate up/down/left/right between siblings
- **Escape**: Deselect / return to command mode
- **Enter**: Create child from active node

### Command Input
- **Auto-focus**: Command textarea when entering command mode
- **Enter**: Submit command
- **Ctrl+Enter**: Submit and create new line
- **Up/Down arrows**: Navigate command history
- **Slash commands**: Parse and execute (e.g., "/create", "/delete")

### Panel Interactions
- **Resizable dividers**: Drag to resize command and attribute panels
- **Collapsible panels**: Mobile view - tap header to expand/collapse
- **Sticky headers**: Panel titles remain visible during scroll

---

## Responsive Breakpoints

- **Mobile**: < 768px (single column, stacked panels)
- **Tablet**: 768px - 1024px (two-column, tree + one panel)
- **Desktop**: > 1024px (three-panel layout)
- **Large Desktop**: > 1440px (wider attribute panel: w-[28rem])

---

## Accessibility

- All interactive elements have min 44×44px touch targets
- Focus indicators: 2px offset ring on all focusable elements
- Keyboard navigation: Full tree traversal without mouse
- Screen reader: ARIA labels on all icon buttons
- Reduced motion: Respect `prefers-reduced-motion` for node animations
- Color independence: Active state uses shape/size differences, not just hue

---

## Asset Guidelines

**Icons**: Heroicons via CDN (outline style for inactive, solid for active states)

**No custom images needed** - This is a data visualization tool focused on the tree structure itself