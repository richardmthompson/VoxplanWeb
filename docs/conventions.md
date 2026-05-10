# Tree Visualization Conventions

Extracted from VOX session tree CONVENTIONS.md. These semantics govern how VoxPlanWeb renders dependency trees.

## Core Semantics

### Hierarchy = Dependency Resolution Order

The tree is NOT a topic outline or category grouping. Every parent-child relationship encodes a dependency: the parent cannot progress until the child has resolved and released its outcome upward.

### Resolution Direction

Leaves are the active front — the concrete work being done right now. Resolution flows from leaves toward root. When a leaf completes, its outcome propagates upward into its parent.

### Parent Closure Rule

A parent node cannot close until ALL children have resolved. Strict — two of three complete means parent remains open.

### Parallel Branches

Siblings at the same level can be worked concurrently. Higher-priority siblings appear first (top position in LR layout).

## Layout Direction

**Left-to-Right (LR).** Root on left, leaves on right. This matches Mermaid `flowchart LR` convention used in session tree HTML files.

## Edge Direction

**Arrow FROM dependent TO dependency.** Parent depends on children, so edge goes `PARENT → CHILD`.

Reading: `A → B` = "A depends on B" = "must do B before A can progress."

**Sequential children:** Chain them: `CHILD1 → CHILD2` = "do CHILD2 first."

**Edge economy:** Use minimal edges. Sequential chain = single path. Don't draw redundant transitive edges.

## Edge Types

| Type | Visual | Meaning |
|------|--------|---------|
| Hard dependency | Solid line | Cannot progress until resolved |
| Non-blocking | Dashed line | Spawned from context but doesn't block |

## Node States

| State | Fill | Border | Meaning |
|-------|------|--------|---------|
| Root | `#ffdd03` | 3px black | Ultimate goal |
| Blocked | `#ffffff` | 2px black | Waiting on children |
| Active leaf | `#62f6b5` | 3px black | Where attention goes |
| Ongoing | `#62f6b5` | 3px black | Continuous work |
| Delegated | `#9977ff` | 3px black, white text | Handed off |
| Done | `#d4edda` | 2px black | Completed |

## Deadline Inheritance

Only show deadline on a node when it differs from parent. If all children inherit the same deadline as root, only root shows it.

## Department Badges

| Department | Color | Badge Text |
|-----------|-------|-----------|
| Engineering | `#62f6b5` mint | ENG |
| R&D | `#ffdd03` yellow | RD |
| Business Dev | `#ff9933` orange | BD |
| Content | `#9977ff` purple | CONTENT |

## Priority Ordering

When siblings compete for attention:
1. Blocking depth — deeper chains resolve first
2. Strategic priority — revenue-driving work first
3. Effort — quick wins that unblock parents
