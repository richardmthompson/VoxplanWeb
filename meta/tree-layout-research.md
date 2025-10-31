# Tree Layout Algorithm Research

## Overview

This document summarizes research on hierarchical tree layout algorithms, focusing on the industry-standard Reingold-Tilford algorithm and its implementations.

---

## The Problem with Naive Tree Layouts

Simple recursive algorithms that position children evenly under parents suffer from **subtree collision problems**:

```
      Root
     /    \
   A        B
  /|\      /|\
 1 2 3    4 5 6
```

A naive algorithm positions A's children (1,2,3) and B's children (4,5,6) independently. When subtrees are wide, they can overlap because the algorithm doesn't check if A's rightmost descendant collides with B's leftmost descendant.

---

## Reingold-Tilford Algorithm (1981)

The **Reingold-Tilford algorithm** is the industry standard for drawing aesthetically pleasing hierarchical tree diagrams. It produces compact, balanced layouts while preventing collisions.

### Core Aesthetic Rules

1. **Depth alignment** – Nodes at the same depth lie on parallel horizontal lines
2. **Hierarchical ordering** – Left children go left of parent, right children go right
3. **Parent centering** – Parents are centered above their children
4. **Symmetry** – Mirror-image trees produce mirror-image drawings
5. **Compact layout** – Minimizes horizontal space without node overlap
6. **No subtree collisions** – Subtrees never intermingle

### How It Works: Two-Pass Approach

**Pass 1: Bottom-Up (Post-order traversal)**
- Starts at leaves, works up to root
- Calculates preliminary X-coordinates
- Merges subtrees by scanning their **contours** (outer edges)
- Shifts right subtree as close as possible to left subtree without overlap
- Stores "modifier" values for subtree shifts

**Pass 2: Top-Down (Pre-order traversal)**
- Applies accumulated modifiers from ancestors
- Computes final X-coordinates
- Y-coordinates are simply the depth level

### Key Concepts

**Contour Scanning:**
The algorithm maintains left and right **contours** (outer edges) of subtrees to detect potential overlaps and calculate minimum separation distances.

**Three Critical Values Per Node:**
```javascript
x     // Preliminary X position (before modifiers applied)
mod   // Accumulated shift for this subtree
shift // Additional shift from sibling spacing
```

### Performance

- **Original (1981)**: O(n) time for binary trees
- **Walker's Extension (1990)**: Generalized to n-ary trees
- **Buchheim Improvement (2002)**: True linear-time O(n) for n-ary trees

---

## Walker's Algorithm (1989-1990)

**John Q. Walker II** enhanced Reingold-Tilford for general (m-ary) trees with variable node sizes.

### Key Improvements

- Handles trees of any degree (not just binary)
- Supports variable node sizes
- Linear time complexity O(N)
- Uses only two tree traversals

### Paper Reference

📄 [A Node-Positioning Algorithm for General Trees (1990)](https://onlinelibrary.wiley.com/doi/10.1002/spe.4380200705)

---

## Buchheim et al. Improvement (2002)

Optimized Walker's algorithm to achieve truly linear time by fixing performance bottlenecks in the original implementation.

📄 [Improving Walker's Algorithm to Run in Linear Time (2002)](https://link.springer.com/content/pdf/10.1007/3-540-36151-0_32.pdf)

**This is what modern implementations use**, including D3.js.

---

## D3.js Implementation

D3's `d3-hierarchy` module provides a production-ready implementation of the Reingold-Tilford algorithm (with Buchheim improvements).

### Basic Usage

```javascript
import { tree, hierarchy } from 'd3-hierarchy';

// Create tree layout
const treeLayout = tree()
  .size([width, height])              // Total layout size
  .separation((a, b) => {             // Separation between nodes
    return a.parent === b.parent ? 1 : 2;  // Siblings closer than cousins
  });

// Create hierarchy from data
const root = hierarchy(data);

// Compute positions
treeLayout(root);

// Access node positions
root.descendants().forEach(node => {
  console.log(node.x, node.y);  // Final coordinates
});
```

### Key Methods

**tree.size([width, height])**
Sets the total layout dimensions. Nodes will be positioned within this bounding box.

**tree.nodeSize([width, height])**
Alternative to `.size()` - sets a fixed size for each node's space allocation instead of the overall layout size.

**tree.separation(fn)**
Controls spacing between nodes:
```javascript
tree().separation((a, b) => {
  return a.parent === b.parent ? 1 : 2;  // Siblings: 1x, Cousins: 2x
});
```

For radial layouts:
```javascript
tree().separation((a, b) => {
  return (a.parent === b.parent ? 1 : 2) / a.depth;
});
```

### Coordinate System

D3's tree layout outputs:
- **node.x**: Horizontal position (breadth)
- **node.y**: Vertical position (depth)

For top-down trees, you typically swap these:
```javascript
// D3 coordinates → Visual coordinates
visualX = node.y  // Depth becomes horizontal
visualY = node.x  // Breadth becomes vertical
```

---

## Alternative Libraries

### @antv/hierarchy (AntV)

Advanced compact layouts that are tighter than D3's default tree algorithm.

**Key feature:** `compactBox` layout – tidy in BOTH horizontal and vertical directions

```javascript
const Hierarchy = require('@antv/hierarchy');

const rootNode = Hierarchy.compactBox(root, {
  direction: 'H', // H/V/LR/RL/TB/BT
  getHeight(d) { return NODE_SIZE; },
  getWidth(d) { return ctx.measureText(d.id).width + PADDING; },
  getHGap(d) { return HORIZONTAL_GAP; },
  getVGap(d) { return VERTICAL_GAP; }
});
```

**Advantage:** More compact than d3-hierarchy for complex trees

### d3-flextree

Flexible tree layout that allows for variable node sizes.

📦 [d3-flextree on npm](https://www.npmjs.com/package/d3-flextree)

Implements **van der Ploeg's 2013 algorithm** for handling nodes of different dimensions.

```javascript
import { flextree } from 'd3-flextree';

const layout = flextree({
  nodeSize: node => [node.data.width, node.data.height],
  spacing: (a, b) => a.path(b).length
});

const tree = layout.hierarchy(data);
layout(tree);
```

---

## Spacing & Positioning Control

### Horizontal Spacing

- **Minimum sibling separation**: Usually 1-2 units
- **Subtree separation**: Can be larger between subtrees
- Controlled by `separation` function in D3

### Vertical Spacing

- **Uniform**: All nodes at same depth get same Y
- Calculated as: `depth × verticalSpacing`

### Node Size Adjustments

For variable-width nodes:
- Track actual node widths during contour scan
- Use half-widths when calculating overlaps
- Most implementations assume uniform node size by default

---

## Implementation Resources

### Tutorial Articles

- **Easiest explanation** (with C# code): [Rachel Lim's Blog - Reingold-Tilford](https://rachel53461.wordpress.com/2014/04/20/algorithm-for-drawing-trees/)
- **Best walkthrough** (with Python): [Reingold Tilford Algorithm Explained With Walkthrough](https://towardsdatascience.com/reingold-tilford-algorithm-explained-with-walkthrough-be5810e8ed93/)
- **Functional approach** (Haskell with animations): [William Yao - Drawing Trees Functionally](https://williamyaoh.com/posts/2023-04-22-drawing-trees-functionally.html)
- **Classic article**: [Dr. Dobbs 1991 - Positioning Nodes for General Trees](https://www.drdobbs.com/positioning-nodes-for-general-trees/184402320)

### Official Documentation

- **D3 Tree Layout**: https://d3js.org/d3-hierarchy/tree
- **D3 Hierarchy Module**: https://github.com/d3/d3-hierarchy
- **Observable Examples**: https://observablehq.com/@d3/tree

### Original Papers

📄 [Reingold & Tilford (1981) - Tidier Drawings of Trees](https://reingold.co/tidier-drawings.pdf) (6 pages, Pascal code)

📄 [Walker (1989) - A Node-Positioning Algorithm for General Trees](https://www.cs.unc.edu/techreports/89-034.pdf)

---

## Use Cases

**Perfect for:**
- Organization charts
- File system browsers
- AST/syntax tree viewers
- Decision tree visualization
- Any hierarchical data structure with clear parent-child relationships

**Not ideal for:**
- Very wide trees (exponential breadth) – Consider fisheye or hyperbolic layouts
- DAGs with cycles – Needs spanning tree first (loses some edges)
- Force-directed needs – Use spring algorithms instead

---

## Summary

The **Reingold-Tilford algorithm** (via D3's implementation) is the gold standard for hierarchical tree visualization:

✅ Industry-proven (40+ years of use)  
✅ Linear time complexity O(n)  
✅ Prevents subtree collisions automatically  
✅ Produces aesthetically pleasing, compact layouts  
✅ Highly customizable spacing and separation  
✅ Production-ready via d3-hierarchy  

For VoxPlan, we use D3's `tree()` layout for the hierarchical top-down view, ensuring professional-quality node positioning without manual collision detection.
