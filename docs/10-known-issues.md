# Known Issues and Future Improvements

This document tracks current limitations, bugs, and planned enhancements for VoxplanWeb.

## What's Working Well ✅

### Tree Visualization
- Three layout algorithms working smoothly (tree, spider, vertical)
- Manual position preservation per layout mode
- Drag-and-drop with children following parent (drag-lock)
- Smooth animations and transitions
- Responsive zoom and pan controls

### Keyboard Navigation
- Vim-style navigation (hjkl) working perfectly
- All keyboard shortcuts functional
- Smart focus management (ignores shortcuts when typing)
- Help dialog accessible via `?`

### Goal Management
- Create, edit, delete operations working
- Automatic ID generation
- Parent-child relationships maintained
- Visual hierarchy with size scaling by depth

### User Interface
- Clean, professional Material Design aesthetic
- Floating windows (command, attribute)
- Header with mode indicator and breadcrumb
- shadcn/ui components integrated

### Performance
- Fast rendering for trees up to 100+ goals
- Efficient layout calculations (< 15ms)
- React optimization with memo and proper hooks
- No noticeable lag for typical use cases

---

## Current Limitations ⚠️

### 1. No Data Persistence

**Issue**: All data lost on page refresh

**Impact**: Cannot save work between sessions

**Workaround**: Keep browser tab open, don't refresh

**Future Fix**:
- Implement backend API for goal storage
- Connect Drizzle ORM to PostgreSQL
- Add localStorage fallback for offline mode

**Priority**: High
**Estimated Effort**: 2-3 days

---

### 2. Command Mode Not Functional

**Issue**: Command window exists but doesn't process text commands

**Impact**: Users can only use keyboard shortcuts, not text commands

**Current State**:
- Window opens when pressing `c`
- Textarea accepts input
- No command parsing implemented

**Planned Commands**:
- `new: Goal Name` - Create child goal
- `rename: New Name` - Rename active goal
- `delete` - Delete active goal
- `move to: Parent Name` - Move goal to new parent
- `search: query` - Search goals

**Future Fix**:
- Implement command parser
- Add command history
- Add auto-suggestions
- Add command validation

**Priority**: Medium
**Estimated Effort**: 3-4 days

---

### 3. No Backend API Integration

**Issue**: Backend routes are minimal (server/routes.ts is nearly empty)

**Impact**:
- No server-side operations
- No multi-user support
- No authentication
- All logic client-side only

**Current State**:
- Express server running
- Routes file exists but empty
- Storage interface defined
- Database schema configured but not connected

**Future Fix**:
- Implement REST API endpoints
- Add WebSocket for real-time sync
- Connect to PostgreSQL via Drizzle
- Add authentication (JWT)

**Priority**: High
**Estimated Effort**: 1-2 weeks

---

### 4. No Undo/Redo

**Issue**: Deleted goals cannot be recovered

**Impact**: Accidental deletions are permanent

**Workaround**: Be careful when pressing `d`

**Future Fix**:
- Implement command history stack
- Add undo/redo actions to treeStore
- Keyboard shortcuts: Cmd+Z (undo), Cmd+Shift+Z (redo)
- Undo button in UI

**Priority**: Medium
**Estimated Effort**: 2-3 days

---

### 5. No File Import/Export

**Issue**: Cannot save/load goal trees as files

**Impact**:
- Cannot backup work
- Cannot share trees
- Cannot migrate from desktop app

**Future Fix**:
- JSON export/import
- Compatibility with desktop VoxPlan format
- Download/upload buttons
- Drag-and-drop file import

**Priority**: Medium
**Estimated Effort**: 2 days

---

### 6. No Search or Filter

**Issue**: Large trees difficult to navigate

**Impact**: Hard to find specific goals in big trees

**Future Fix**:
- Search by goal name or details
- Filter by depth, status, date created
- Highlight matching goals
- Jump to search results

**Priority**: Low
**Estimated Effort**: 2-3 days

---

### 7. Voice Mode Not Implemented

**Issue**: Voice interaction mode planned but not built

**Impact**: No hands-free operation

**Planned Features**:
- Web Speech API integration
- Voice commands ("create new goal called Meeting")
- Text-to-speech feedback
- Push-to-talk or continuous listening

**Priority**: Low
**Estimated Effort**: 1 week

---

### 8. No Multi-Select

**Issue**: Can only work with one goal at a time

**Impact**: Batch operations not possible

**Future Fix**:
- Shift+Click for multi-select
- Cmd+Click to add to selection
- Batch delete, move, edit
- Selection rectangle (drag to select area)

**Priority**: Low
**Estimated Effort**: 3-4 days

---

### 9. Limited Mobile Support

**Issue**: App designed for desktop, mobile is suboptimal

**Problems**:
- Keyboard shortcuts don't work on mobile
- Floating windows overlap on small screens
- Touch gestures limited
- No mobile-optimized layout

**Future Fix**:
- Responsive layout for mobile
- Touch gesture support
- Mobile-friendly navigation (buttons instead of keys)
- Progressive Web App (PWA) features

**Priority**: Medium
**Estimated Effort**: 1 week

---

### 10. No Copy/Paste

**Issue**: Cannot duplicate goals or subtrees

**Impact**: Repetitive work when creating similar goals

**Future Fix**:
- Copy goal: Cmd+C
- Paste as child: Cmd+V
- Paste as sibling: Cmd+Shift+V
- Copies entire subtree

**Priority**: Low
**Estimated Effort**: 2 days

---

## Minor Issues 🔧

### Visual/UX

**Node label truncation**:
- Long goal names get cut off
- No tooltip on hover (yet)
- **Fix**: Add tooltip showing full name

**No visual feedback on invalid actions**:
- Pressing `h` at first sibling: no feedback
- **Fix**: Add toast notifications for invalid actions

**Zoom limits**:
- Can zoom too far in/out
- **Fix**: Better min/max zoom constraints

**No loading states**:
- Future API calls need loading indicators
- **Fix**: Add skeleton loaders

### Technical Debt

**Example components directory**:
- Old implementations kept for reference
- Clutters component directory
- **Fix**: Move to `_archive/` or delete

**Inconsistent naming**:
- Some files use kebab-case, some PascalCase
- **Fix**: Standardize on conventions

**Missing tests**:
- No unit tests
- No E2E tests
- **Fix**: Add Vitest + Playwright tests

**No error boundaries**:
- React errors could crash entire app
- **Fix**: Add error boundaries to component tree

## Performance Limitations

### Large Trees (100+ goals)

**Symptoms**:
- Slight lag when dragging
- Layout recalculation takes 20-50ms
- Many nodes to render

**Mitigations**:
- ReactFlow handles virtualization
- Memoized components reduce re-renders
- Zustand selectors prevent unnecessary updates

**Future Optimizations**:
- Virtual scrolling for off-screen nodes
- Lazy loading of subtrees
- Web Workers for layout calculations
- Canvas rendering instead of DOM (extreme cases)

### Memory Usage

**Current**: Acceptable for typical usage

**Future Concerns**:
- Very large trees (1000+ goals) may use significant RAM
- Solution: Pagination or lazy loading

## Security Considerations

### Current Security Posture

**Good**:
- No exposed API endpoints (nothing to attack)
- React prevents XSS by default
- TypeScript reduces runtime errors

**Missing**:
- No authentication
- No authorization
- No input sanitization (future API)
- No rate limiting
- No CSRF protection

**Future Requirements**:
- JWT authentication
- Input validation with Zod
- SQL injection prevention (Drizzle handles this)
- CORS configuration
- HTTPS only in production

## Browser Compatibility

### Tested and Working
- Chrome 120+ ✅
- Firefox 120+ ✅
- Safari 17+ ✅
- Edge 120+ ✅

### Known Issues
- Safari < 16: Some CSS features may not work
- IE 11: Not supported (modern browsers only)

### Required Browser Features
- ES2020+ JavaScript
- CSS Grid
- Flexbox
- SVG support
- Web Audio API (future voice mode)

## Accessibility Issues

### Current State

**Working**:
- Keyboard navigation (primary interaction method)
- Semantic HTML from shadcn/ui components
- Focus indicators on buttons

**Missing**:
- Screen reader support (no ARIA labels on tree nodes)
- High contrast mode
- Reduced motion support (animations always on)
- Color blindness considerations (red/blue only)

**Future Improvements**:
- Add ARIA labels to all interactive elements
- Respect `prefers-reduced-motion`
- Alternative visual indicators besides color
- Screen reader announcements for state changes

## Deployment Issues

### Current Setup

**Development**: Works well with Vite dev server

**Production**: Basic setup, needs improvement

**Missing**:
- CI/CD pipeline
- Automated testing
- Production monitoring (Sentry, etc.)
- Analytics
- Error tracking
- Performance monitoring

## Roadmap Priority

### Phase 1: Foundation (Current)
- ✅ Tree visualization
- ✅ Keyboard navigation
- ✅ Basic goal management
- ✅ Multiple layouts

### Phase 2: Persistence (Next, High Priority)
- 🔲 Backend API implementation
- 🔲 Database integration
- 🔲 Data persistence
- 🔲 File import/export

### Phase 3: Enhanced Features (Medium Priority)
- 🔲 Command mode functionality
- 🔲 Undo/redo
- 🔲 Search and filter
- 🔲 Multi-select

### Phase 4: Polish (Lower Priority)
- 🔲 Mobile optimization
- 🔲 Voice mode
- 🔲 Advanced animations
- 🔲 Themes (dark mode)

### Phase 5: Scale (Future)
- 🔲 Multi-user collaboration
- 🔲 Real-time sync
- 🔲 Permission system
- 🔲 Team workspaces

## Workarounds for Current Limitations

### For No Persistence
- Keep browser tab open
- Take screenshots of important trees
- Manually note down structure

### For No Search
- Use browser Find (Cmd+F) on goal names (limited)
- Keep trees small and organized
- Use descriptive goal names

### For No Undo
- Double-check before deleting
- Create backups by opening multiple tabs
- Be cautious with `d` key

### For Large Trees
- Keep trees under 100 goals
- Use multiple smaller trees instead of one huge tree
- Archive completed subtrees

## Reporting Issues

### How to Report

When you find a bug:
1. Note the exact steps to reproduce
2. Include browser version
3. Include tree size (number of goals)
4. Screenshot if visual issue
5. Check if it's already listed here

### What Information to Include

- Browser: Chrome 120.0.6099.129
- OS: macOS 14.1.1
- Tree size: 45 goals, depth 4
- Steps to reproduce: ...
- Expected behavior: ...
- Actual behavior: ...

## Contributing Fixes

See [Development Guide](./11-development-guide.md) for:
- Setting up development environment
- Coding standards
- Testing requirements
- Pull request process

---

## Summary

VoxplanWeb currently excels at:
- Visual tree manipulation
- Keyboard-driven navigation
- Multiple layout algorithms
- Responsive, professional UI

Main gaps to address:
- Data persistence (highest priority)
- Backend API integration
- Command mode implementation
- Undo/redo system

The foundation is solid, and the architecture is ready for these enhancements.

---

**Related Documentation**:
- [Core Features](./05-core-features.md) - What works now
- [Architecture](./02-architecture-overview.md) - System design
- [Development Guide](./11-development-guide.md) - Contributing fixes
