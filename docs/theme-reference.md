# AR Labs Neo-Brutalist Theme Reference

Extracted from VOX session tree conventions and HTML implementations. This is the visual target for VoxPlanWeb.

## Brand Identity

Retro-futurist, readable, playful but serious, vintage-computing-inspired tools for deep human-AI collaboration. Not slick-corporate. Blade Runner, BBC Micro, ZX Spectrum aesthetic. "Intelligent system" vibes — tool for thought, not consumer app.

## Fonts

Load via Google Fonts CDN:

```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Body text | Outfit | 400 | Descriptions, metadata |
| Labels | Outfit | 500 | Node titles, status text |
| Headings | Outfit | 600-700 | Section headers, bold titles |
| Mono/badges | JetBrains Mono | 400-500 | Dept badges, dates, IDs, code |

## Node States & Colors

| State | Fill | Border | Text | Meaning |
|-------|------|--------|------|---------|
| Root | `#ffdd03` yellow | 3px solid `#000` | `#000` | Ultimate goal — everything feeds into this |
| Blocked | `#ffffff` white | 2px solid `#000` | `#000` | Waiting on children to resolve |
| Active leaf | `#62f6b5` mint | 3px solid `#000` | `#000` | Where attention should go now |
| Ongoing | `#62f6b5` mint | 3px solid `#000` | `#000` | Continuous work, not discrete completion |
| Delegated | `#9977ff` purple | 3px solid `#000` | `#fff` | Handed off to another agent/process |
| Done | `#d4edda` light green | 2px solid `#000` | `#000` | Completed |

## Department Badge Colors

Inline colored spans within node body:

| Department | Abbreviation | Background | Text |
|-----------|-------------|-----------|------|
| Engineering | ENG | `#62f6b5` mint | `#000` |
| R&D | RD | `#ffdd03` yellow | `#000` |
| Business Dev | BD | `#ff9933` orange | `#000` |
| Content | CONTENT | `#9977ff` purple | `#fff` |
| Product | PRODUCT | `#ffffff` white | `#000` |

Badge CSS:
```css
.dept-badge {
  display: inline-block;
  padding: 1px 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid #000;
}
```

## Node Anatomy

Each node is a rectangular card, NOT an SVG shape:

```
┌─────────────────────────────────┐
│ Node Title (bold, Outfit 600)   │
│ ─────────────────────────────── │
│ [DEPT] activity-stream · %      │  ← dept badge (colored) + allocation
│ ─────────────────────────────── │
│ Status · Due: YYYY-MM-DD        │  ← deadline only if different from parent
│ Additional context              │
│ Depends: what it needs          │  ← grey text (#888)
│ Releases: what parent gets      │  ← grey text (#888)
└─────────────────────────────────┘
```

## Neo-Brutalist Card Style

```css
.node-card {
  background: var(--node-fill);
  border: var(--node-border-width) solid #000;
  box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);
  padding: 12px 16px;
  font-family: 'Outfit', sans-serif;
  min-width: 200px;
  max-width: 320px;
}

.node-card .title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.node-card .separator {
  border-top: 1px solid #000;
  margin: 6px 0;
}

.node-card .metadata {
  font-size: 12px;
  color: #888;
}

.node-card .status {
  font-size: 13px;
}
```

## Edge Styles

```css
/* Solid edge = hard dependency */
.react-flow__edge-path {
  stroke: #000;
  stroke-width: 2px;
}

/* Edge type: smoothstep (not straight, not bezier) */
```

## Canvas Background

```css
.react-flow {
  background: #ffffff;  /* Light mode */
  /* OR */
  background: #0a0a0a;  /* Dark mode — match vision doc */
}
```

## Toolbar / Header

```css
.toolbar {
  background: #fff;
  border-bottom: 3px solid #000;
  font-family: 'Outfit', sans-serif;
}

.toolbar h1 {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.02em;
}

.badge {
  background: #fff;
  border: 2px solid #000;
  padding: 3px 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);
}
```

## Legend

Include a legend row below toolbar showing node state colors:

```
□ Root (yellow)  □ Blocked (white)  ■ Active (mint)  ■ Delegated (purple)  ── dependency
```
