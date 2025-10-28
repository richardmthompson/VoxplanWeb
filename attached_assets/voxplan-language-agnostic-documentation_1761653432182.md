# Voxplan System Documentation (Language-Agnostic)

**Document Purpose**: Complete language-agnostic documentation of the voxplan goal planning application to enable reconstruction in any programming language or framework.

**Version**: 1.0
**Date**: 2025
**Status**: Complete Analysis

---

## Executive Summary

Voxplan is a **hierarchical goal planning application** that enables users to create, organize, and navigate complex goal structures using a tree-based data model with multimodal interaction (text commands, keyboard navigation, voice control, and direct manipulation).

### Core Value Proposition
- **Visual Hierarchy**: Goals organized in a single-rooted tree with parent-child relationships
- **Active Focus Pattern**: One goal is always "active," representing current user attention
- **Multimodal Interaction**: Same operations accessible via text, keyboard, voice, or touch
- **Persistent Storage**: Goal trees saved to and loaded from JSON files
- **Spatial Navigation**: Intuitive tree traversal using directional controls

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ CommandWindow│  │InterfaceWindow│  │AttributeWindow│      │
│  │ (Text Input) │  │ (Tree Visual) │  │ (Edit Form)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                  ↓                  ↓              │
├─────────────────────────────────────────────────────────────┤
│                      CONTROLLER LAYER                        │
│               VoxplanGUIApp (MVC Controller)                 │
│   • process_command() - central dispatcher                   │
│   • node_index{} - visual node lookup                        │
│   • mode management (cmd/nav/vox)                           │
│   • active node tracking                                     │
│         ↓                                    ↑                │
├─────────────────────────────────────────────────────────────┤
│                         MODEL LAYER                          │
│                    VoxPlan (Data Manager)                    │
│   • goal_list{} - tree data structure                        │
│   • parse() - command router                                 │
│   • CRUD operations on goal tree                             │
│   • JSON persistence                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 1: Conceptual Model

### 1.1 Data Entities

#### Goal Node
The atomic unit of the system. Each goal node represents a single goal, task, or objective.

**Properties**:
- **ID** (integer): Unique sequential identifier (0 = root, then 1, 2, 3...)
- **Name** (string): Short summary/title of the goal
- **Details** (string): Extended description or notes
- **Parent Reference**: Link to parent node (null for root only)
- **Children Collection**: Ordered list of child nodes

**Invariants**:
- Every node except root has exactly one parent
- Root node always has ID = 0
- IDs are never reused (monotonically increasing counter)
- Tree structure prevents cycles

#### Goal Tree
The complete hierarchical structure of all goals.

**Properties**:
- **Single Root**: Exactly one node with no parent (ID = 0)
- **Active Node**: One node marked as current focus
- **Node Index**: Fast lookup mapping ID → Node object
- **Next ID Counter**: Auto-incrementing ID for new nodes

**Constraints**:
- Must have at least one node (the root)
- Exactly one node is active at any time
- All nodes accessible via parent-child traversal from root

#### System State
Global application state.

**Properties**:
- **goal_id** (integer): Next available ID for new goal creation
- **active_goal** (integer): ID of currently focused goal
- **file_name** (string): Target filename for save/load operations
- **mode** (enum): Interaction mode (command / navigation / voice)

---

### 1.2 Core Operations

All operations follow consistent patterns regardless of implementation language.

#### CREATE Operations

**Add Root Goal** (first node creation):
```
Precondition: goal_id == 0 (no goals exist)
Input: name (string), details (string)
Process:
  1. Create node with ID=0, no parent
  2. Set as root of tree
  3. Set as active node
  4. Increment goal_id to 1
Output: root node, active_goal=0
```

**Add Sibling Goal** (same level as active):
```
Precondition: active_goal is not root
Input: name, details
Process:
  1. Get active node's parent
  2. Create new node with next goal_id
  3. Set parent to active node's parent
  4. Automatically added to parent's children
  5. Reposition all siblings evenly
  6. Set new node as active
  7. Increment goal_id counter
Output: new sibling node
```

**Add Child Goal** (under active):
```
Precondition: goal_id > 0
Input: name, details
Process:
  1. Create new node with next goal_id
  2. Set parent to currently active node
  3. If first child:
     - Position directly below parent
     - Recalculate vertical spacing for entire tree
  4. If additional child:
     - Add to parent's children collection
     - Redistribute all children horizontally
  5. Set new node as active
  6. Increment goal_id counter
Output: new child node
```

#### READ Operations

**Get Children**:
```
Input: goal_id
Process:
  1. Lookup node by goal_id
  2. Access node's children collection
  3. Extract ID from each child
Output: list of child IDs, or empty list
```

**Get Parent**:
```
Input: goal_id
Process:
  1. If goal_id == 0: return null
  2. Lookup node by goal_id
  3. Return node's parent reference
Output: parent node or null
```

**Get Tree Depth**:
```
Input: none
Process:
  1. Traverse entire tree
  2. Track maximum distance from root
Output: integer depth (0 = root only, 1 = root + children, etc.)
```

**Get Node Depth**:
```
Input: goal_id
Process:
  1. Start at target node
  2. Count steps to root via parent links
Output: integer depth (0 = root, 1 = root's child, etc.)
```

#### UPDATE Operations

**Edit Goal Attributes**:
```
Input: goal_id, name (optional), details (optional)
Process:
  1. Lookup node by goal_id
  2. If name provided: update node.name
  3. If details provided: update node.details
Output: updated node
```

**Reparent Goal** (change parent):
```
Input: goal_id, new_parent_id
Process:
  1. Lookup target node
  2. Lookup new parent node
  3. Remove from old parent's children
  4. Set node.parent = new_parent
  5. Automatically adds to new parent's children
  6. Recalculate node size (may grow/shrink based on new depth)
  7. Rebuild affected subtrees
Output: reparented node
```

**Reorder Sibling** (move left/right):
```
Input: goal_id, direction (left or right)
Process:
  1. Get parent's children list
  2. Find current index of target node
  3. If direction == left:
     - Swap with sibling at (index - 1)
     - Fail if already leftmost
  4. If direction == right:
     - Swap with sibling at (index + 1)
     - Fail if already rightmost
  5. Rebuild parent's subtree to update positions
Output: new children order
```

#### DELETE Operations

**Delete Node (Preserve Children)**:
```
Input: goal_id
Precondition: goal_id != 0 (cannot delete root)
Process:
  1. Get target node's children
  2. Get target node's parent (grandparent to children)
  3. For each child:
     - Reassign child.parent = grandparent
     - Recalculate child size (now one level higher)
  4. Determine new active goal:
     - If target has siblings: select previous sibling, or parent if leftmost
     - Else: select parent
  5. Remove target from parent's children
  6. Delete target from node index
  7. Reposition remaining tree
Output: new active goal ID
```

**Delete Node + All Descendants**:
```
Input: goal_id
Precondition: goal_id != 0
Process:
  1. Recursively delete all descendants depth-first
  2. For each descendant:
     - Delete from visual display
     - Delete from node index
  3. Delete target node last
  4. Determine new active goal (sibling or parent)
  5. Reposition remaining tree
Output: new active goal ID
```

#### NAVIGATE Operations

**Navigate Up (to parent)**:
```
Input: current goal_id
Process:
  1. If goal_id == 0: fail (already at root)
  2. Get parent of current node
  3. Set active_goal = parent.id
Output: parent goal_id
```

**Navigate Down (to first child)**:
```
Input: current goal_id
Process:
  1. Get children of current node
  2. If no children: fail
  3. Set active_goal = first child's ID
Output: first child goal_id
```

**Navigate Left/Right (between siblings)**:
```
Input: current goal_id, direction
Process:
  1. Get parent of current node
  2. If no parent (root): fail
  3. Get all siblings from parent.children
  4. Find current node's index
  5. If direction == left:
     - Calculate prev_index = current_index - 1
     - If prev_index < 0: fail
     - Set active_goal = siblings[prev_index].id
  6. If direction == right:
     - Calculate next_index = current_index + 1
     - If next_index >= siblings.length: fail
     - Set active_goal = siblings[next_index].id
Output: sibling goal_id
```

---

### 1.3 Persistence Model

#### JSON Data Format
```json
{
  "description": "Goal Name",
  "details": "Goal Details",
  "name": 0,
  "children": [
    {
      "description": "Child Goal",
      "details": "Child Details",
      "name": 1,
      "children": []
    }
  ]
}
```

**Field Mapping** (historical naming):
- `name` stores the numeric ID (confusing legacy field name)
- `description` stores the goal title/summary
- `details` stores extended description
- `children` array contains nested child objects

#### Save Operation
```
Input: complete goal tree
Process:
  1. Serialize root node recursively
  2. Convert all nodes to JSON-serializable format
  3. Write to file: trees/{filename}.json
Output: confirmation message
```

#### Load Operation
```
Input: filename
Process:
  1. Read JSON from trees/{filename}.json
  2. Parse into tree data structure
  3. Scan all nodes to find highest ID
  4. Set goal_id counter = max_id + 1
  5. Rebuild node index:
     - For each node (pre-order traversal):
       * Add to node_index[node.id] = node
  6. Set root as active goal
  7. Yield each node (id, description, details, parent_name)
Output: generator of node tuples for reconstruction
```

---

## Part 2: Visual Representation

### 2.1 Visual Component Structure

Each goal node is rendered with four visual layers:

#### Layer 1: Connection Line (if not root)
- **Primitive**: Line segment
- **Color**: Black
- **Width**: 2 pixels
- **Start Point**: Parent node's bottom-center, offset by 3× parent label font size
- **End Point**: Current node's top-center (y-position + totalheight)
- **Visibility**: Only drawn if node has parent

#### Layer 2: Border (inactive nodes only)
- **Primitive**: Filled circle
- **Color**: Dark blue (RGB: 0.3, 0.4, 0.6)
- **Size**: Node diameter + 4 pixels (2px border on all sides)
- **Position**: Node center, offset by border width
- **Visibility**: Opacity = 1 when inactive, 0 when active

#### Layer 3: Node Circle
- **Primitive**: Filled circle
- **Size**: Determined by hierarchy depth (see size calculation)
- **Colors**:
  - Active: Red (RGB: 0.75, 0.13, 0.13)
  - Inactive: Light blue (RGB: 0.5, 0.7, 1)
- **Animation**: Active nodes pulsate (120% expansion, 2-second cycle)

#### Layer 4: Label Text
- **Primitive**: Text
- **Content**: Goal name/summary
- **Font Size**: 20% of totalheight
- **Color**: Black
- **Position**: Horizontally centered below node circle
- **Vertical Offset**: labelspacing = circle diameter

### 2.2 Hierarchical Size Scaling

Nodes decrease in size with depth to create visual hierarchy:

```
totalheight_child = totalheight_parent × 0.9
node_diameter = totalheight × 0.73
label_font_size = round(totalheight × 0.2)
```

**Example cascade** (root totalheight = 109.6):
- **Depth 0 (root)**: totalheight=109.6, diameter=80, font=22
- **Depth 1**: totalheight=98.6, diameter=72, font=20
- **Depth 2**: totalheight=88.7, diameter=65, font=18
- **Depth 3**: totalheight=79.8, diameter=58, font=16

### 2.3 Layout Algorithms

#### Vertical Stratification Algorithm
```
Purpose: Assign Y-coordinates to all nodes based on depth
Input: tree_depth, screen_height, window_center
Process:
  1. Calculate vertical spacing:
     dy = screen_height / (tree_depth + 1)

  2. Calculate starting Y position:
     start_y = window_center + (screen_height / 2) + (dy / 2)

  3. Create Y-position array:
     FOR depth FROM 0 TO tree_depth:
       y_positions[depth] = start_y - (depth × dy)

  4. Organize nodes by depth:
     layer_matrix = [empty_list for each depth level]
     FOR each node in tree:
       depth = get_node_depth(node)
       layer_matrix[depth].append(node)

  5. Assign Y-coordinates:
     FOR each depth level:
       FOR each node at that depth:
         node.y = y_positions[depth]
         redraw node at new position

Output: All nodes positioned vertically by depth level
```

#### Horizontal Distribution Algorithm
```
Purpose: Evenly space sibling nodes within parent's horizontal allocation
Input: parent_node, available_width
Process:
  1. Get all children of parent
     IF no children: RETURN

  2. Initialize width allocation:
     IF parent has stored width (parent.dx):
       width = parent.dx
     ELSE:
       width = screen_width

  3. Calculate per-child allocation:
     num_children = children.length
     dx = width / num_children

  4. Calculate starting X position:
     parent_center_x = parent.x
     start_x = parent_center_x - (width / 2)

  5. Position children:
     FOR i FROM 0 TO num_children - 1:
       child_center_x = start_x + (i × dx) + (dx / 2)
       child = children[i]
       child.x = child_center_x
       child.dx = dx  // Store for recursive positioning
       redraw child

  6. Recursively position grandchildren:
     FOR each child:
       horizontal_distribution(child, child.dx)

Output: All descendants positioned horizontally
```

**Visualization**:
```
Parent (x=600, width=1200)
  │
  ├─ Child 1: x = 600 - 600 + 200 = 200  (dx=400)
  ├─ Child 2: x = 200 + 400 = 600         (dx=400)
  └─ Child 3: x = 600 + 400 = 1000        (dx=400)
```

#### Initial Root Positioning
```
Purpose: Place first node at screen center
Process:
  1. center_x = screen_width / 2
  2. center_y = screen_height / 2
  3. Adjust for bottom-left origin:
     x = center_x - (node_diameter / 2)
     y = center_y
  4. Set root position = (x, y)
```

### 2.4 Animation Specifications

#### Pulsating Animation (Active Node)
```
Type: Size and position oscillation
Loop: Infinite repeat
Duration: 2 seconds per cycle

Phase 1 - Expansion:
  1. Calculate node center (pivot point)
  2. Target size: 120% of original (multiply by 1.2)
  3. Recalculate position to keep center fixed:
     new_x = center_x - (new_width / 2)
     new_y = center_y - (new_height / 2)
  4. Animate to expanded state (default duration)

Phase 2 - Contraction:
  1. Target size: 100% (original dimensions)
  2. Recalculate position:
     new_x = center_x - (original_width / 2)
     new_y = center_y - (original_height / 2)
  3. Animate to contracted state (2 second duration)

Repeat infinitely until deactivated
```

#### State Transition Animations
```
Activation (inactive → active):
  1. Border opacity: 1 → 0 (instant)
  2. Node color: blue → red (instant)
  3. Start pulsating animation

Deactivation (active → inactive):
  1. Stop pulsating animation
  2. Node color: red → blue (instant)
  3. Border opacity: 0 → 1 (instant)
  4. Render border at offset position
```

---

## Part 3: Interaction Model

### 3.1 Mode System

The application operates in three distinct interaction modes:

| Mode | Input Method | Focus | Visual Indicator |
|------|-------------|-------|------------------|
| **Command Mode** | Text commands | Command input field | Cursor in text box, prompt visible |
| **Navigation Mode** | Keyboard shortcuts | Global keyboard capture | Active node pulsating, no text cursor |
| **Voice Mode** | Speech recognition | Audio stream | Status message displayed |

**Mode Transition Rules**:
```
Command Mode ←→ Navigation Mode
     ↓              ↓
     └→ Voice Mode ←┘

- cmdMode → navMode: Empty Enter press
- navMode → cmdMode: 'w' key or command input receives focus
- Any mode → voxMode: 'v' key or "voice_mode" command
```

**Mode Exclusivity**: Exactly one mode active at any time. Keyboard event handling changes based on mode.

### 3.2 Command Vocabulary

All operations accessible via multiple modalities:

| Operation | Text Command | Keyboard (nav) | Voice (planned) | Touch |
|-----------|-------------|----------------|----------------|-------|
| Create sibling | `new` | `n` | "new goal" | - |
| Create child | `new_sub` | `s` | "new sub" | - |
| Delete (preserve children) | `del` | `d` | "delete" | - |
| Delete with descendants | `del_all` | `Backspace` | "delete all" | - |
| Edit goal | `edit` | `Enter` | "edit" | - |
| Navigate up | `nav_up` | `↑` | "up" | - |
| Navigate down | `nav_down` | `↓` | "down" | - |
| Navigate left | `nav_left` | `←` | "left" | - |
| Navigate right | `nav_right` | `→` | "right" | - |
| Move left in order | `move_left` | `b` | "move left" | - |
| Move right in order | `move_right` | `f` | "move right" | - |
| Activate goal | - | - | "select [name]" | Click node |
| Enter navigation mode | [empty line] | `Esc` | - | Click any node |
| Exit navigation mode | - | `w` | - | - |
| Activate voice | `voice_mode` | `v` | "voice mode" | - |
| Save tree | `save` | - | "save" | - |
| Load tree | `load` | - | "load" | - |
| Quit application | `bye` | `q` | "quit" | - |

### 3.3 User Workflows

#### Workflow: Create Root Goal (First Use)
```
State: Empty application, goal_id = 0
User Action: Type "new" + Enter
System Response:
  1. Check: goal_id == 0? → Yes, create root
  2. Create GoalNode at screen center
  3. Open AttributeWindow (edit form)
  4. Auto-focus on Name field
  5. User enters "Launch Product", press Enter
  6. Focus moves to Details field
  7. User enters details, press Enter
  8. Commit changes:
     - Update visual node with entered text
     - Create Model node (goal_id=0)
     - Mark as active (start pulsating)
     - Increment goal_id to 1
  9. Close AttributeWindow
 10. Return to Command Mode
Result: Root goal created and active
```

#### Workflow: Create First Child Goal
```
State: Root goal active (goal_id=0)
User Action: Press 's' in Navigation Mode
System Response:
  1. Validate: active node = root, goal_id = 1
  2. Calculate child position:
     - Get tree depth (will increase by 1)
     - Recalculate Y-stratification for all nodes
     - Position child directly below root (X-aligned)
  3. Create child node:
     - goal_id = 1
     - parent = root (goal_id=0)
     - Draw connection line from root to child
  4. Open AttributeWindow for data entry
  5. User enters goal name and details
  6. Commit:
     - Update child node visuals
     - Create Model node with parent_id=0
     - Mark as active
     - Increment goal_id to 2
  7. Reposition tree vertically (new depth level)
  8. Return to Navigation Mode
Result: First child created under root
```

#### Workflow: Create Sibling Goal
```
State: Child goal active (e.g., goal_id=2)
User Action: Press 'n' in Navigation Mode
System Response:
  1. Validate: active node != root (has parent)
  2. Get parent reference
  3. Create new sibling node:
     - goal_id = next_id (e.g., 3)
     - parent = active_node.parent
     - Initial position (temporary, will be recalculated)
  4. Redistribute ALL siblings:
     - Get parent's children (now includes new node)
     - Calculate horizontal space division
     - Position all siblings evenly
     - Recursively reposition their subtrees
  5. Open AttributeWindow
  6. User enters data
  7. Commit and return to Navigation Mode
Result: New sibling added and all siblings rebalanced
```

#### Workflow: Navigate Tree
```
State: Any goal active, Navigation Mode
User Actions: Arrow keys
System Response:

  Up Arrow:
    1. Send 'nav_up' to Model
    2. Model returns parent_id
    3. If parent exists:
       - Deactivate current node (stop pulse, blue)
       - Activate parent node (start pulse, red)
       - Update Model active_goal

  Down Arrow:
    1. Send 'nav_down' to Model
    2. Model returns first_child_id
    3. If child exists:
       - Switch active nodes (as above)

  Left/Right Arrow:
    1. Send 'nav_left' or 'nav_right' to Model
    2. Model returns sibling_id
    3. If sibling exists:
       - Switch active nodes
    4. If no sibling: no change

Result: Active node changes, visual feedback updates
```

#### Workflow: Edit Existing Goal
```
State: Any goal active
User Action: Press Enter in Navigation Mode
System Response:
  1. Open AttributeWindow
  2. Pre-populate fields with current name/details
  3. Auto-focus on Name field
  4. User modifies Name: "Updated Goal Name"
  5. Press Enter → focus moves to Details
  6. User modifies Details
  7. Press Enter or click Commit
  8. Update:
     - Visual node label updates immediately
     - Send edit_item() to Model with new data
     - No repositioning needed (structure unchanged)
  9. Close AttributeWindow
 10. Return to previous mode
Result: Goal attributes updated
```

#### Workflow: Delete Goal (Preserve Children)
```
State: Non-root goal with children active
User Action: Press 'd' in Navigation Mode
System Response:
  1. Validate: goal_id != 0 (not root)
  2. Get children: [child_id_1, child_id_2]
  3. Get parent (grandparent to children)
  4. For each child:
     - Reassign child.parent = grandparent
     - Recalculate child size (now 10% larger, moved up one level)
     - Update Model: edit_item(child_id, parent_id=grandparent_id)
  5. Remove active node from display
  6. Remove from node index
  7. Send delete to Model
  8. Model determines new active goal:
     - Previous sibling if exists, else parent
  9. Activate new goal
 10. Reposition tree:
     - Check if depth decreased
     - Recalculate Y-stratification if needed
     - Rebuild grandparent's subtree (redistribute promoted children)
Result: Node deleted, children promoted, tree rebalanced
```

#### Workflow: Save Tree
```
State: Any state with goals created
User Action: Type "save" + Enter in Command Mode
System Response:
  1. Serialize root node recursively
  2. Convert tree to JSON format
  3. Write to trees/voxplan-default.json
  4. Display confirmation: "Tree saved to voxplan-default.json"
Result: Tree persisted to disk
```

#### Workflow: Load Tree
```
State: Any state
User Action: Type "load" + Enter in Command Mode
System Response:
  1. Read JSON from trees/voxplan-default.json
  2. Parse data structure
  3. Clear existing tree (if any)
  4. Rebuild tree node-by-node:
     - For each node in generator:
       * If parent_id == None: build root
       * Else: get parent from node_index, create child
       * Skip AttributeWindow (non-interactive creation)
  5. Scan loaded nodes to find max ID
  6. Set goal_id counter = max_id + 1
  7. Set root as active goal
  8. Display: "Tree loaded from voxplan-default.json"
Result: Saved tree restored
```

---

## Part 4: Component Architecture

### 4.1 Controller Component (Application Coordinator)

**Responsibility**: Mediate between Model and View, coordinate all interactions

**Core State**:
```
{
  model_instance: VoxPlan object,
  rootnode: currently active visual node,
  node_index: { goal_id → visual node object },
  mode: "cmdMode" | "navMode" | "voxMode",
  speakMode: boolean (TTS enabled/disabled)
}
```

**Key Methods**:

`process_command(command, *args, **kwargs) → string`
- Central dispatcher for all operations
- Routes to GUI handlers or Model based on command type
- Returns result for display/feedback

`set_active_node(node) → void`
- Updates both GUI state and Model state
- Ensures single active node invariant

`get_active_node() → node`
- Returns currently active visual node

`add_node_index(goal_id, node) → void`
- Registers visual node for O(1) lookup

`get_node_object(goal_id) → node`
- Retrieves visual node by ID

`set_mode(mode) → void`
- Changes interaction mode
- Manages keyboard binding/unbinding

`reset_window_focus() → void`
- Restores focus to appropriate component based on mode

### 4.2 View Components

#### CommandWindow (Text Interface)
**Layout**:
- **Output Area** (90% height): Scrolling text display (read-only)
- **Input Field** (10% height): Single-line text input with prompt

**Behavior**:
- Displays command prompt: "voxplan :> "
- Echoes user commands with ">" prefix
- Shows command results and system messages
- Empty Enter → switch to Navigation Mode

**Event Handling**:
- on_enter(): Parse command, call process_command(), display result
- on_focus(): Exit Navigation Mode if active

#### InterfaceWindow (Visual Tree Display)
**Responsibilities**:
- Render all visual nodes and connection lines
- Handle Navigation Mode keyboard events
- Manage tree layout algorithms
- Respond to node click events

**Spatial Organization**:
- Y-axis: Stratified by depth (root at top)
- X-axis: Siblings evenly distributed within parent's allocation
- Connections: Lines from parent bottom to child top

**Navigation Mode Keyboard Bindings**:
```
w → Exit to Command Mode
v → Activate Voice Mode
n → Create sibling goal
s → Create sub-goal
d → Delete goal (preserve children)
Backspace → Delete goal + descendants
Enter → Edit goal attributes
↑/↓/←/→ → Navigate tree
b/f → Move goal in sibling order
x → Show text tree view
q → Quit application
```

**Layout Methods**:
- `build_root_node()`: Create first node at center
- `add_first_child(parent)`: Position first child, recalculate Y-axis
- `add_sibling_node(parent)`: Add child, rebuild entire subtree
- `reset_tree_y_axis()`: Recalculate vertical positions for all nodes
- `rebuild_subtree(parent)`: Recursively reposition all descendants
- `reposition_y_after_deletion()`: Adjust tree after node removal

#### AttributeWindow (Edit Form)
**Layout**: 2-column grid
```
[ Label: "Goal ID"    ] [ TextInput: (read-only) ]
[ Label: "Summary"    ] [ TextInput: (editable)  ]
[ Label: "Details"    ] [ TextInput: (editable)  ]
[ Button: "Cancel"    ] [ Button: "Create"       ]
```

**Lifecycle**:
1. **Creation Mode** (new goal):
   - Mark current_node.is_new = True
   - Show blank text fields
   - Cancel → delete node, return focus
   - Create → commit data, mark is_new = False

2. **Edit Mode** (existing goal):
   - Mark current_node.is_new = False
   - Pre-populate with existing values
   - Cancel → discard changes, return focus
   - Commit → update node and Model

**Event Handling**:
- Enter in Summary → focus Details
- Enter in Details → commit changes
- Auto-focus on Summary when opened

#### GoalNode (Individual Visual Node)
**Visual Elements**:
- Connection line to parent (if not root)
- Border circle (inactive only)
- Main node circle (active/inactive colored)
- Label text below node

**State Properties**:
```
{
  goal_id: unique identifier,
  name: display text,
  details: extended description,
  is_active: boolean,
  is_new: boolean (first edit vs subsequent),
  drawn: boolean (visual initialized),
  parent_node: reference to parent visual node,

  // Visual properties
  position: (x, y),
  size: (width, height),
  totalheight: node + label height,
  dx: horizontal allocation for subtree,

  // Graphics objects
  node_ellipse: circle primitive,
  border: border circle primitive,
  edge: connection line,
  node_label: text primitive,
  anim: pulsating animation
}
```

**Methods**:
- `set_active(active)`: Change active state, start/stop animation
- `draw_node()`: Render all visual elements
- `draw_connection()`: Render line to parent
- `change_name(new_name)`: Update label text
- `change_pos(position)`: Move node to new position
- `recalculate_size()`: Update size based on new depth
- `switch_active(off_node, on_node)`: Deactivate old, activate new

**Click Handling**:
```
on_click(position):
  1. Check if click within node bounds
  2. If hit:
     - Get currently active node from Controller
     - Call switch_active(current, self)
     - Enter Navigation Mode
     - Consume event (return true)
  3. If miss: propagate event
```

### 4.3 Model Component (VoxPlan)

**Responsibility**: Manage goal tree data, persist to storage, validate operations

**Core State**:
```
{
  goal_id: next available ID (auto-increment),
  goal_list: { goal_id → tree node object },
  active_goal: ID of focused goal,
  file_name: target for save/load
}
```

**Key Methods**:

`parse(command, *args, **kwargs) → result`
- Command router with dictionary lookup
- Dispatches to appropriate handler function
- Updates internal state as needed
- Returns operation result

Command Implementations:
- `create(goal_id, goal_list, active_goal, name, details, parent_id) → new_goal_id`
- `edit_item(goal_id, description, details, parent_id) → description`
- `delete(goal_id) → new_active_goal_id`
- `get_children(goal_id) → [child_ids]`
- `nav_up/down/left/right(active_goal) → new_active_goal_id`
- `move_left/right(active_goal) → parent_id`
- `save() → confirmation`
- `load() → generator<(id, name, details, parent_name)>`
- `get_tree_depth() → integer`
- `get_node_depth(goal_id) → integer`

**Validation Rules**:
- Cannot delete root (goal_id == 0)
- Cannot create sibling of root
- Navigation fails silently if target doesn't exist
- Parent must exist for reparent operations

### 4.4 Voice/Speech Components

#### Speech Recognition (Listener)
**Technology**: Offline speech-to-text engine (e.g., Vosk)

**Configuration**:
- Sample rate: 16,000 Hz
- Format: 16-bit PCM mono
- Buffer: 4,096 frames per read
- Language model: US English

**Processing Loop**:
```
WHILE listening:
  1. Read audio buffer from microphone
  2. Feed to recognizer.AcceptWaveform()
  3. If complete utterance detected:
     - Extract text from JSON result
     - [Future] Map to command vocabulary
     - [Future] Execute via process_command()
```

**Current Status**: Infrastructure exists, command mapping not implemented

#### Text-to-Speech (TTS)
**Technology**: Speech synthesis engine (e.g., eSpeakNG)

**Configuration**:
```
pitch: 66 (mid-range)
speed: 133 words per minute
language: [system default]
```

**Invocation Pattern**:
```
component.say(message)
  ↓
app.say(message)
  ↓
IF speakMode == true:
  voice_engine.say(message)
ELSE:
  (silent, ignore)
```

**Usage Events**:
- Welcome message on startup
- Mode transitions ("Entering nav mode")
- Action confirmations ("Deleting", "New sub goal")
- Goal creation prompts ("Enter goal summary")
- Error/status messages
- Exit confirmation ("Good bye")

**Design Pattern**: Global TTS toggle allows enabling/disabling voice feedback without code changes

---

## Part 5: Key Algorithms

### 5.1 Tree Depth Calculation
```
FUNCTION get_tree_depth(root_node):
  max_depth = 0

  FUNCTION traverse(node, current_depth):
    IF current_depth > max_depth:
      max_depth = current_depth

    FOR each child IN node.children:
      traverse(child, current_depth + 1)

  traverse(root_node, 0)
  RETURN max_depth
```

### 5.2 Node Depth Calculation
```
FUNCTION get_node_depth(node):
  depth = 0
  current = node

  WHILE current.parent != NULL:
    depth = depth + 1
    current = current.parent

  RETURN depth
```

### 5.3 Sibling Reordering
```
FUNCTION move_left(node):
  parent = node.parent
  IF parent == NULL:
    RETURN FAIL  // Root has no siblings

  children = parent.children
  current_index = children.indexOf(node)

  IF current_index == 0:
    RETURN FAIL  // Already leftmost

  // Swap with previous sibling
  temp = children[current_index - 1]
  children[current_index - 1] = node
  children[current_index] = temp

  RETURN parent.id  // Trigger subtree rebuild

FUNCTION move_right(node):
  // Mirror logic of move_left
```

### 5.4 Subtree Rebuild (Recursive Repositioning)
```
FUNCTION rebuild_subtree(parent, x_position, available_width):
  children = get_children(parent)

  IF children.length == 0:
    RETURN

  // Initialize width if first call
  IF available_width == NULL:
    IF parent.dx EXISTS:
      available_width = parent.dx
    ELSE:
      available_width = screen_width

  IF x_position == NULL:
    x_position = parent.x

  // Calculate child spacing
  num_children = children.length
  child_width = available_width / num_children

  // Starting X position (left edge of parent's allocation)
  start_x = x_position - (available_width / 2)

  // Get Y position from first child (already set by vertical algorithm)
  y_position = children[0].y

  // Position each child
  FOR i FROM 0 TO num_children - 1:
    child = children[i]

    // Center child within its allocated space
    child_x = start_x + (i * child_width) + (child_width / 2)

    // Update child position
    child.x = child_x
    child.y = y_position
    child.dx = child_width  // Store for recursive calls

    // Redraw child visuals
    redraw(child)
    redraw_connection(child)

    // Recursively position child's subtree
    rebuild_subtree(child, child_x, child_width)
```

### 5.5 Active Node Selection After Deletion
```
FUNCTION select_new_active_after_delete(deleted_node):
  parent = deleted_node.parent
  siblings = parent.children

  IF siblings.length > 1:
    // Has siblings, select adjacent one
    current_index = siblings.indexOf(deleted_node)

    IF current_index > 0:
      // Select previous sibling (to the left)
      RETURN siblings[current_index - 1].id
    ELSE:
      // Was leftmost, select next sibling
      RETURN siblings[current_index + 1].id

  ELSE:
    // No siblings, select parent
    RETURN parent.id
```

---

## Part 6: Critical Design Patterns

### 6.1 Active Node Pattern
**Constraint**: Exactly one goal is active at all times

**Enforcement**:
```
FUNCTION switch_active(off_node, on_node):
  // Deactivate old
  off_node.set_active(false)
    → Stop pulsating animation
    → Change color to blue
    → Show border

  // Activate new
  on_node.set_active(true)
    → Start pulsating animation
    → Change color to red
    → Hide border

  // Synchronize with Model
  model.set_active(on_node.id)
```

**Implications**:
- All operations target active node by default
- Visual feedback always clear (one pulsating node)
- Navigation simply changes which node is active

### 6.2 Dual Representation Pattern
**Concept**: Each goal exists in parallel structures

1. **Model Representation** (VoxPlan):
   - Tree data structure (anytree-style)
   - goal_id, description, details, parent reference
   - Persisted to JSON files

2. **View Representation** (GoalNode):
   - Visual widget/component
   - Position, size, color, animation state
   - Graphics primitives (circles, lines, text)

**Synchronization**:
- Creation: Visual node → triggers Model node creation
- Update: Both structures updated in same operation
- Deletion: Both structures removed together

**Index Mapping**:
```
node_index = {
  goal_id → visual_node_object
}
```

Enables O(1) lookup of visual node by Model ID

### 6.3 Mode-Based Interaction Pattern
**States**:
- **cmdMode**: Text command entry, focus on input field
- **navMode**: Keyboard shortcuts, global capture
- **voxMode**: Voice recognition active

**Behavior Matrix**:
| Input | cmdMode | navMode | voxMode |
|-------|---------|---------|---------|
| 'n' key | Types 'n' in field | Creates new goal | (no effect) |
| Arrow keys | Moves text cursor | Navigates tree | (no effect) |
| Enter | Submits command | Edits active goal | (no effect) |
| Speech | (no effect) | (no effect) | Executes command |

**Mode Transitions**:
- cmdMode ←→ navMode: Explicit (Enter/Esc/click)
- Any → voxMode: Explicit ('v' key or "voice_mode")

### 6.4 Position Recovery Pattern
**Problem**: UI framework may auto-reposition widgets

**Solution**: Backup and restore mechanism
```
FUNCTION change_pos(new_position):
  disable_recovery()  // Prevent restoration during manual change
  widget.position = new_position
  backup_position = new_position  // Store intended position
  enable_recovery()

FUNCTION on_position_changed():
  IF recovery_enabled:
    // Unauthorized change detected
    widget.position = backup_position  // Revert
```

Prevents layout corruption from framework behavior

### 6.5 Scheduled Focus Pattern
**Problem**: Focus changes fail if widget not fully initialized

**Solution**: Delayed focus assignment
```
// Wrong
input_field.focus = true  // May fail if widget not ready

// Right
schedule_after_delay(100ms, function():
  input_field.focus = true
)
```

Ensures widget is fully constructed before focus

### 6.6 Recursive Tree Operations Pattern
**Structure**: Many operations naturally recursive

**Examples**:

**Delete with descendants**:
```
FUNCTION delete_recursive(node, is_nested_call):
  FOR each child IN node.children:
    delete_recursive(child, true)

  remove_visual(node)
  remove_from_index(node)
  remove_from_model(node)

  IF NOT is_nested_call:
    // Only rebuild once, at the end
    rebuild_tree()
```

**Subtree positioning**:
```
FUNCTION position_subtree(parent):
  FOR each child IN parent.children:
    calculate_child_position(child)
    position_subtree(child)  // Recurse
```

**Benefit**: Tree structure naturally maps to recursive algorithms

---

## Part 7: Data Flow Patterns

### 7.1 Command Processing Flow
```
┌─────────────────┐
│  User Input     │
│ (Text/Key/Voice)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Window Component│
│ (Capture Event) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │
│process_command()│
└────────┬────────┘
         │
         ├────────────────┐
         ▼                ▼
┌─────────────┐   ┌─────────────┐
│   Model     │   │    View     │
│VoxPlan.parse│   │ GUI Update  │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │ Return result   │
       └────────┬────────┘
                ▼
         ┌─────────────┐
         │   Feedback  │
         │ (Text/Voice)│
         └─────────────┘
```

### 7.2 Visual Update Flow
```
Model State Change → Controller → View Components

Example: Create new goal
  1. User enters "new" command
  2. Controller checks preconditions
  3. Controller creates GoalNode (visual)
  4. GoalNode initializes with generic position
  5. GoalNode calls Model.create() (data)
  6. Model adds to goal_list, returns new ID
  7. Controller adds to node_index
  8. InterfaceWindow positions node correctly
  9. InterfaceWindow triggers tree layout
 10. All nodes redrawn in new positions
 11. New node set as active (animation starts)
```

### 7.3 Navigation Flow
```
Keyboard Event → Controller → Model Query → Visual Switch

Example: Navigate down
  1. User presses ↓ arrow in navMode
  2. InterfaceWindow.on_keyboard_down() captures
  3. Calls Controller.process_command('nav_down')
  4. Controller calls Model.nav_down(active_goal)
  5. Model finds first child, returns child_id
  6. Controller gets visual node: get_node_object(child_id)
  7. Controller calls switch_active(current, child)
  8. Visual active state changes
  9. Model active_goal updated
```

### 7.4 Save/Load Flow
```
Save:
  User Command → Model Serialization → File Write
  1. "save" command
  2. Model.save() serializes root recursively
  3. Write JSON to trees/{filename}.json
  4. Confirmation message

Load:
  User Command → File Read → Model Parse → View Rebuild
  1. "load" command
  2. Read JSON from trees/{filename}.json
  3. Model.load() yields node tuples
  4. For each tuple:
     a. Controller creates visual node (non-interactive)
     b. Model creates data node
     c. Add to node_index
  5. Reposition entire tree
  6. Set root as active
```

---

## Part 8: Constraints & Edge Cases

### 8.1 Structural Constraints
- **Single Root**: Exactly one node with ID=0, no parent
- **No Orphans**: All nodes except root have parent
- **No Cycles**: Tree structure enforced (cannot be own ancestor)
- **Ordered Children**: Sibling order is significant, maintained in list

### 8.2 Operational Constraints
- **Root is Eternal**: Cannot delete goal_id=0
- **No Root Siblings**: Cannot create peer of root
- **ID Monotonicity**: IDs never decrease, never reused
- **Single Active**: Exactly one goal active at all times

### 8.3 Visual Constraints
- **Minimum Size**: Nodes become illegible beyond depth 6-7
- **No Clipping**: Nodes can position off-screen if tree too wide
- **Fixed Vertical Spacing**: All depth levels evenly spaced
- **Sequential Rendering**: Connections before nodes, or lines appear on top

### 8.4 Edge Cases

**Empty Tree**:
- Not possible after first goal created
- Application requires root goal to function

**Single Node Tree**:
- Root only, no children
- Cannot navigate (all nav commands fail)
- Cannot create sibling (only sub-goal allowed)

**Wide Tree** (many siblings):
- Horizontal space divided equally
- May create very narrow allocations
- Text labels may overlap
- No scrolling or zoom implemented

**Deep Tree** (many levels):
- Nodes become progressively smaller
- Font size becomes illegible (16px → 14px → ...)
- Vertical spacing becomes tight
- Practical limit ~6-7 levels

**Deletion of Node with Many Children**:
- If preserving children: all promoted to grandparent
- If deleting with children: recursive deletion depth-first
- Tree repositioning can be expensive (O(n) subtree)

**Load Operation**:
- Destructive: replaces entire existing tree
- No merge capability
- Must rebuild node_index from scratch
- ID counter set to max_loaded_id + 1

### 8.5 Performance Considerations

**Tree Traversal**:
- get_tree_depth: O(n) - must visit all nodes
- get_node_depth: O(log n) - walk up to root
- Display operations: O(n) where n = subtree size

**Dictionary Operations**:
- Node lookup by ID: O(1)
- Add/remove from index: O(1)

**Layout Algorithms**:
- reset_tree_y_axis: O(n) - visit all nodes once
- rebuild_subtree: O(m) - visit all descendants (m = subtree size)

**Worst Case**:
- Deep, unbalanced tree (linked list)
- Every operation triggers full tree repositioning
- Vertical spacing recalculation expensive

**Optimization Strategies**:
- Normalize state (flat index + tree structure)
- Memoize depth calculations
- Lazy layout updates (batch multiple operations)
- Virtualize rendering for large trees

---

## Part 9: Implementation Notes

### 9.1 Technology-Agnostic Decisions

**Data Structure Choice**:
- Tree with bidirectional parent-child references
- Flat dictionary index for fast lookup
- Trade-off: Extra memory for O(1) access

**ID Strategy**:
- Sequential integers starting from 0
- Simple but wastes ID space after deletions
- Alternative: UUID for distributed systems

**Active Node Management**:
- Exactly one active node maintained by system
- Alternatives: zero (selection optional) or multiple (multi-select)
- Current choice supports focused workflow

**Mode System**:
- Explicit modes with distinct behavior
- Alternatives: modeless (all inputs always active)
- Current choice prevents accidental operations

### 9.2 Extensibility Points

**Additional Node Properties**:
- Current: ID, name, details only
- Easy to add: status, priority, due date, tags, etc.
- Would require: Model schema update, AttributeWindow fields

**Multiple Trees**:
- Current: Single tree per application session
- Could add: Tabs, tree selector, tree merging
- Would require: State management for multiple trees

**Collaboration**:
- Current: Single user, local files
- Could add: Real-time sync, conflict resolution
- Would require: Backend server, OT/CRDT algorithms

**Visualization Modes**:
- Current: Top-down tree layout
- Could add: Radial, horizontal, mind map, outline view
- Would require: Alternative layout algorithms

### 9.3 Known Limitations

**No Undo/Redo**:
- All operations immediate and permanent
- Workaround: Save before destructive operations
- To add: Command pattern with history stack

**No Search**:
- Must navigate manually to find goals
- Workaround: Text tree view (vox_view command)
- To add: Full-text search, filter by properties

**No Bulk Operations**:
- Edit/delete one goal at a time
- Workaround: Multiple individual operations
- To add: Multi-select, bulk actions

**No Export/Import**:
- JSON format only, application-specific
- Workaround: Manual JSON manipulation
- To add: Markdown, CSV, other formats

**Voice Control Incomplete**:
- Infrastructure exists, command mapping missing
- Workaround: Use text or keyboard
- To complete: Vocabulary mapping, NLP parsing

---

## Part 10: Recommended Implementation Approaches

### 10.1 Web Technologies
**Framework**: React, Vue, or Svelte
**State Management**: Zustand, Redux, or Pinia
**Tree Visualization**: D3.js, react-flow, or custom Canvas
**Storage**: IndexedDB for local persistence
**Voice**: Web Speech API for recognition and synthesis

**Key Considerations**:
- Normalized state structure (flat + tree)
- Immutable updates (Immer.js)
- Memoization to prevent unnecessary re-renders
- Virtual scrolling for large trees
- Service workers for offline support

### 10.2 Mobile Native
**iOS**: SwiftUI with Core Data
**Android**: Jetpack Compose with Room
**Cross-Platform**: React Native or Flutter

**Key Considerations**:
- Touch gestures (tap, long-press, swipe)
- Responsive layout for small screens
- Local database for persistence
- Background sync when online
- Voice recognition APIs (platform-specific)

### 10.3 Desktop Native
**Electron**: Web technologies wrapped
**Tauri**: Rust + Web (smaller bundles)
**Native**: Qt, GTK, or platform-specific

**Key Considerations**:
- Window management
- File system access for save/load
- Keyboard shortcuts (system-wide or app-level)
- Native look and feel

### 10.4 Backend (Optional)
**Not Required**: Application fully functional with local storage only

**If Adding Sync**:
- **Database**: PostgreSQL with ltree for tree queries
- **API**: REST or GraphQL
- **Real-time**: WebSockets or Server-Sent Events
- **Conflict Resolution**: Operational Transform or CRDTs

---

## Part 11: Testing Strategies

### 11.1 Unit Tests

**Model Layer**:
- Test each operation in isolation
- Verify state transitions (goal_id, active_goal)
- Test edge cases (delete root, nav at boundaries)
- Test JSON serialization/deserialization

**Layout Algorithms**:
- Test vertical stratification with various tree depths
- Test horizontal distribution with varying child counts
- Test recursive positioning
- Verify coordinates within expected ranges

**Command Routing**:
- Test command dictionary lookup
- Test argument/kwargs handling
- Test return value propagation

### 11.2 Integration Tests

**Complete Workflows**:
- Create root → add children → save → load → verify
- Navigate tree → edit goal → verify Model updated
- Delete node → verify children promoted
- Reorder siblings → verify visual positions

**Mode Transitions**:
- Test cmdMode ←→ navMode transitions
- Test focus management
- Test keyboard event routing by mode

### 11.3 Visual Regression Tests

**Layout Verification**:
- Snapshot test: known tree structure renders consistently
- Verify node positions relative to each other
- Verify connection line endpoints

**Animation**:
- Test active node pulsates
- Test inactive nodes static
- Test state transitions

### 11.4 Performance Tests

**Tree Size Limits**:
- Test with 100, 1000, 10000 nodes
- Measure layout algorithm performance
- Measure re-render times
- Identify maximum practical size

**Operation Latency**:
- Measure time for create/delete/navigate operations
- Identify bottlenecks
- Optimize critical paths

---

## Part 12: Glossary

**Terms and Definitions**:

- **Active Goal**: The currently focused goal in the tree, indicated visually
- **Goal Node**: Individual unit representing a single goal/task/objective
- **Tree Structure**: Hierarchical organization of goals with parent-child relationships
- **Root Node**: Top-level goal (ID=0) with no parent
- **Sibling**: Goals sharing the same parent
- **Depth**: Distance from root (root=0, children=1, grandchildren=2, etc.)
- **Model**: Data layer managing goal tree structure and persistence
- **View**: Visual layer rendering goal tree on screen
- **Controller**: Coordination layer mediating Model and View
- **Mode**: Interaction context (command / navigation / voice)
- **Navigation Mode**: Keyboard-driven tree traversal mode
- **Command Mode**: Text-based command entry mode
- **Voice Mode**: Speech recognition input mode
- **Node Index**: Dictionary mapping goal ID to visual node object
- **Stratification**: Vertical positioning by depth level
- **Horizontal Allocation**: Width of screen space assigned to node's subtree
- **Pulsating Animation**: Size oscillation indicating active node
- **TTS**: Text-to-Speech synthesis for voice feedback
- **STT**: Speech-to-Text recognition for voice input

---

## Conclusion

This document provides a complete, language-agnostic specification of the voxplan goal planning application. All core concepts, data structures, algorithms, and interaction patterns have been described in terms independent of implementation technology.

Key architectural decisions:
- **Tree-based hierarchy** for goal organization
- **Single active node** for focused interaction
- **Multimodal input** (text, keyboard, voice, touch) converging on unified command system
- **MVC pattern** separating data, visual, and coordination concerns
- **Algorithmic layout** for automatic tree positioning
- **JSON persistence** for simple, human-readable storage

This specification enables reconstruction of voxplan's functionality in any programming language or framework while preserving the original design intent and user experience.

---

**Document Status**: Complete
**Next Steps**: Use as reference for implementing voxplan in target technology stack

