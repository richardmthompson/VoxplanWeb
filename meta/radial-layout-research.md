# Radial/Spider Layout Algorithm Research

## Overview

This document summarizes research on radial tree layout algorithms used in mind-mapping software, focusing on angular sectoring, the PLANET algorithm, and industry best practices.

---

## What is a Radial Layout?

Radial layouts arrange nodes in **concentric circles** expanding outward from a central root node. Each circle represents a hierarchical level (depth), with nodes spreading radially like spokes from a wheel.

**Common names:**
- Radial tree
- Spider layout
- Balloon layout
- Circular tree layout

---

## Core Algorithm Principles

### Basic Structure

1. **Root node** at the center (coordinates: centerX, centerY)
2. **First level** nodes distributed around the root at a fixed radius
3. **Subsequent levels** positioned at increasing radii
4. **Angular space** allocated hierarchically to prevent overlap

---

## Node Positioning Rules

### Root Node (Level 0)

- Positioned at the center of the layout
- Coordinates: `(centerX, centerY)`
- All other nodes radiate outward from this point

### First Level Nodes

The first level is special because all nodes share the same parent (root).

**Angle Distribution:**

**Option A: Even distribution**
```javascript
angleSpace = 2 * Math.PI / numberOfChildren
angle_i = angleSpace * i  // for child i
```

**Option B: Weighted by subtree size**
Allocate angular space proportional to the number of descendants each child has.

**Radius:**
```javascript
x = rootX + initialRadius * cos(angle)
y = rootY + initialRadius * sin(angle)
```

### Second Level and Beyond

For subsequent levels, nodes are positioned within **angular sectors** (wedges) inherited from their parent.

**Sectoring Strategy:**

Each child subtree gets a wedge of the parent's angular space. This prevents overlap between sibling subtrees.

The wedge size can be:
- **Equal division**: parent's angular span ÷ number of children
- **Proportional to leaf count**: nodes with more descendants get wider wedges (Eades algorithm)

**Angle Calculation:**
```javascript
// For child i of a parent node
parentAngle = parent.angle
parentSpan = parent.angularSpan  // inherited from grandparent
childSpan = parentSpan / parent.children.length

// Place child at center of its wedge
childAngle = parentAngle - (parentSpan/2) + childSpan * (i + 0.5)
```

**Radius Progression:**

Each level increases radius from the center:
```javascript
radius = initialRadius + depth * radiusIncrement * radiusFactor
```

Distance between levels controlled by:
- **Radius Factor**: multiplicative constant (default = 1.0)
  - Factor > 1: levels spread out progressively
  - Factor < 1: levels compress as you move outward
  - Factor = 1: uniform spacing between levels

---

## Angular Sectoring (Industry Standard)

### The Key Principle

**Each subtree gets confined to its angular wedge, preventing overlap with sibling subtrees.**

### Level 1: Wedge Allocation

Example: 4 first-level nodes → each gets 90° sector (360° / 4)

```javascript
// Level 1: Even distribution
firstLevelAngleSpace = 2π / numFirstLevelChildren
child_i.angle = i * firstLevelAngleSpace
child_i.angularWedge = firstLevelAngleSpace
```

### Level 2+: Subdivide Parent's Wedge

Parent at angle 45° with 90° sector (0° to 90°)  
Its 3 children distributed within that 90° wedge:
- Child 0: 22.5°
- Child 1: 45°
- Child 2: 67.5°

```javascript
// Level 2+: Subdivide parent's wedge
parentWedge = parent.angularWedge
childWedge = parentWedge / numSiblings
child_i.angle = parentAngle - (parentWedge/2) + (i + 0.5) * childWedge
```

---

## Modern Approach: PLANET Algorithm (2020)

The PLANET algorithm represents the state-of-the-art in radial layout design.

📄 [PLANET: A radial layout algorithm for network visualization (2020)](https://www.sciencedirect.com/science/article/abs/pii/S037843711931670X)

### Key Innovation: Clustered Siblings

**Traditional approach:** Spread children across the full parent sector
**PLANET approach:** Keep siblings **clustered close** to parent's angle

```javascript
// Traditional: Use full parent wedge
childAngleSpace = parentAngleSpace / numChildren

// PLANET: Keep siblings clustered
childAngleSpace = min(parentAngleSpace, maxClusterAngle)  // e.g., 20-30°
// Position children centered on parent's angle
```

### Benefits

- Better visual grouping of sibling nodes
- Prevents unnecessary spreading when subtree is small
- More intuitive navigation
- Cleaner appearance for sparse trees

---

## Mind-Mapping Software Standards

Research into FreeMind, XMind, and MindManager reveals common patterns:

### FreeMind
- Uses standard radial layout for first 2 levels
- Manual node positioning available (up/down/away from root)
- Discussion of hyperbolic tree layout as alternative

### XMind
- Supports radial + horizontal/vertical/fishbone layouts
- "Smart algorithm" for auto color/spacing
- Emphasis on aesthetics over pure radial math

### MindManager
- "Radial-like" but **not truly radial beyond 2nd level**
- Switches to traditional tree after level 2
- Focus on business/SOP visualization

### Key Takeaway

Professional mind-mapping tools use **explicit angular sectoring** to ensure subtrees never overlap, rather than relying on generic tree algorithms wrapped in polar coordinates.

---

## Overlap Prevention Strategies

### Challenge

Nodes at outer levels can overlap since circumference grows linearly while nodes grow exponentially.

### Solutions

1. **Radius Adjustment**
   - Calculate minimum radius needed to fit all nodes at a level without overlap
   - Adjust based on node width and angular separation

2. **Span Adjustment**
   - For dense subtrees, expand the angular wedge allocated
   - May require adjusting sibling positions

3. **Radial Compaction**
   - Contract radii iteratively while checking for overlaps
   - Stop when nodes would touch

4. **Wedge Compaction**
   - Compact nodes within each angular sector independently

---

## Implementation Pseudocode

```javascript
function layoutRadialTree(root, initialRadius, radiusFactor) {
  // Place root at center
  root.x = centerX
  root.y = centerY
  root.angle = 0
  root.span = 2 * Math.PI  // full circle
  
  // Layout first level - special case
  const level1Nodes = root.children
  const angleSlice = (2 * Math.PI) / level1Nodes.length
  
  for (let i = 0; i < level1Nodes.length; i++) {
    const node = level1Nodes[i]
    node.angle = angleSlice * i
    node.span = angleSlice  // allocate wedge for children
    node.x = centerX + initialRadius * Math.cos(node.angle)
    node.y = centerY + initialRadius * Math.sin(node.angle)
    
    // Recursively layout subtree
    layoutSubtree(node, 2, initialRadius * radiusFactor)
  }
}

function layoutSubtree(parent, depth, currentRadius) {
  const children = parent.children
  if (!children || children.length === 0) return
  
  const childSpan = parent.span / children.length
  
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    
    // Position within parent's angular sector
    child.span = childSpan
    child.angle = parent.angle - (parent.span / 2) + childSpan * (i + 0.5)
    child.x = centerX + currentRadius * Math.cos(child.angle)
    child.y = centerY + currentRadius * Math.sin(child.angle)
    
    // Recurse to next level
    layoutSubtree(child, depth + 1, currentRadius + radiusIncrement * radiusFactor)
  }
}
```

---

## Key Parameters

| Parameter | Purpose | Typical Values |
|-----------|---------|----------------|
| **Initial Radius** | Distance from center to first level | 50-300px or 3-6 node widths |
| **Radius Factor** | Controls spacing between levels | 0.5-2.0 (default: 1.0) |
| **Radius Increment** | Base distance added per level | Node height + padding |
| **Angle Distribution** | How to allocate angular space | Even split or weighted by subtree size |
| **Max Cluster Angle** | PLANET algorithm clustering limit | 20-30° (π/10 to π/6) |

---

## Current Implementation Issues (VoxPlan)

### What We're Doing

Using D3's `tree()` layout with polar coordinate transformation:
```javascript
const treeLayout = tree()
  .size([2 * Math.PI, maxDepth * radiusPerLevel])
  .separation((a, b) => a.parent === b.parent ? 0.8 : 2.5);

// Convert to polar coordinates
x = centerX + radius * Math.cos(angle)
y = centerY + radius * Math.sin(angle)
```

### The Problems

1. **D3's tree layout is designed for 2D Cartesian trees**, not radial
   - The `separation` function helps, but it's not true angular sectoring
   - We're warping a rectangular tree into polar coordinates

2. **No explicit wedge allocation**
   - We don't track "this first-level node owns angles 0° to 90°"
   - Children might spill into neighboring subtrees' space

3. **Linear tree workaround is a hack**
   - Real solution: proper angular sectoring for all tree shapes

---

## Recommended Improvements

To match industry standards, we should:

### 1. Implement Explicit Angular Sectoring

```javascript
// Level 1: Even distribution
firstLevelAngleSpace = 2π / numFirstLevelChildren
child_i.angle = i * firstLevelAngleSpace
child_i.angularWedge = firstLevelAngleSpace

// Level 2+: Subdivide parent's wedge
parentWedge = parent.angularWedge
childWedge = parentWedge / numSiblings
child_i.angle = parentAngle - (parentWedge/2) + (i + 0.5) * childWedge
```

### 2. Modern Clustering (PLANET-style)

```javascript
// Keep siblings close to parent angle
maxClusterAngle = Math.PI / 6  // 30 degrees
effectiveWedge = Math.min(parentWedge, maxClusterAngle)
// Center children around parent's angle using effectiveWedge
```

### 3. Adaptive Radius

```javascript
// Calculate based on node count at each level
radiusAtLevel = calculateMinimumRadius(nodesAtLevel, anglePerNode)
```

---

## Libraries & Resources

### Open Source Implementations

- **mindmap-layouts** (npm): JavaScript library with standard and radial layouts
- **d3-flextree**: D3.js tree layout (primarily horizontal/vertical)
- **ELK Radial**: Eclipse Layout Kernel radial algorithm (based on Eades 1991)

### Academic Foundation

📄 **Eades (1991)**: "Drawing free trees" - foundational radial tree algorithm  
📄 **Walker (1990)**: "Tidier Drawings of Trees" - referenced for node positioning  
📄 **PLANET (2020)**: Modern approach with clustering and uniform distribution

### Commercial

- **yFiles**: Commercial library with advanced radial layouts
- Implements sophisticated overlap prevention and aesthetic optimizations

---

## Summary

For professional radial/spider layouts:

✅ Use **explicit angular sectoring** (not D3 tree in polar coordinates)  
✅ Implement **PLANET-style clustering** for better visual grouping  
✅ Allocate **wedges hierarchically** to prevent subtree overlap  
✅ Make **radius adaptive** based on node density  
✅ Follow **mind-mapping standards** (FreeMind, XMind patterns)  

Future VoxPlan improvement: Replace D3-based spider layout with proper angular sectoring algorithm for cleaner, more professional radial visualization.
