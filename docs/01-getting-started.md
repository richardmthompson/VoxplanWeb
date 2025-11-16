# Getting Started

This guide will help you set up VoxplanWeb on your local machine and get started with development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher (check with `node --version`)
- **npm**: Version 8.x or higher (comes with Node.js)
- **Git**: For version control

### Recommended Tools

- **VS Code**: With TypeScript and ESLint extensions
- **Chrome/Firefox DevTools**: For debugging

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd VoxplanWeb
```

### 2. Install Dependencies

```bash
npm install
```

This will install all frontend and backend dependencies defined in `package.json`.

### 3. Verify Installation

Check that TypeScript compiles without errors:

```bash
npm run check
```

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

This command:
- Starts the Express backend server
- Launches Vite dev server for the React frontend
- Enables hot module replacement (HMR)
- Serves the app at `http://localhost:5000` (or another port if 5000 is busy)

The console will show:
```
serving on port 5000
```

Open your browser and navigate to the displayed URL.

### Production Build

To create an optimized production build:

```bash
npm run build
```

This will:
- Build the frontend (output to `dist/`)
- Bundle the backend server
- Type-check all TypeScript files

### Running Production Build

After building, start the production server:

```bash
npm start
```

## Project Scripts

Here's a complete list of available npm scripts:

```bash
# Development
npm run dev          # Start dev server with hot reload

# Building
npm run build        # Build both frontend and backend for production
npm run check        # Type-check TypeScript without emitting files

# Database (configured but not yet in use)
npm run db:push      # Push schema changes to database
```

## Environment Variables

Currently, the application uses default configuration. Future versions will support:

```bash
# Create a .env file (not yet implemented)
PORT=5000                    # Server port
NODE_ENV=development         # Environment mode
DATABASE_URL=<db-url>        # Database connection (future)
```

## First-Time Setup

### 1. Launch the Application

```bash
npm run dev
```

### 2. Explore the Interface

When the app loads, you'll see:
- An empty canvas (tree visualization area)
- Floating command window (bottom left)
- Floating attribute window (bottom right)

### 3. Create Your First Goal

**Using Navigate Mode (default):**
- Press `n` to create a new root goal
- The attribute window will open automatically
- Enter a name like "My First Goal"
- Press `Escape` or close the window

**Using Command Mode:**
- Click the command window or press `c`
- Type commands to create goals (feature in development)

### 4. Navigate the Tree

**Keyboard Navigation (Vim-style):**
- `h` - Navigate left (previous sibling)
- `j` - Navigate down (first child)
- `k` - Navigate up (parent)
- `l` - Navigate right (next sibling)

**Other Actions:**
- `n` - Create new sibling
- `s` - Create new child
- `d` - Delete active goal
- `a` - Toggle attribute window
- `?` - Show help

### 5. Change Layout Modes

Click the layout toggle button (bottom center):
- **Tree** (Network icon): Traditional hierarchical layout
- **Spider** (Radar icon): Radial mind-map layout
- **Vertical** (List icon): Stacked left/right layout

## Development Workflow

### Typical Development Session

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start development server
npm run dev

# 4. Make changes to code
# - Frontend: Files in client/src/
# - Backend: Files in server/
# - Shared: Files in shared/

# 5. Test changes in browser
# - Changes auto-reload via HMR

# 6. Type-check before committing
npm run check

# 7. Commit your changes
git add .
git commit -m "Description of changes"
```

### Hot Module Replacement (HMR)

Vite provides fast HMR for React components:
- Edit a `.tsx` file in `client/src/`
- Save the file
- Browser updates automatically without full reload
- State is preserved in most cases

### TypeScript Checking

The development server doesn't stop on type errors. Always run:

```bash
npm run check
```

Before committing to catch TypeScript issues.

## Troubleshooting

### Port Already in Use

If port 5000 is busy:

```bash
# Check what's using the port (Unix/Mac)
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or set a different port (future feature)
PORT=3000 npm run dev
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Check for type errors
npm run check

# Common issues:
# - Missing type definitions: npm install --save-dev @types/<package>
# - Outdated types: npm update
```

### Browser Not Updating

```bash
# Hard refresh in browser
# Chrome/Firefox: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Clear browser cache
# Chrome: DevTools > Network tab > Disable cache

# Restart dev server
# Ctrl+C, then npm run dev
```

### Build Fails

```bash
# Check TypeScript compilation
npm run check

# Clean build artifacts
rm -rf dist
npm run build
```

## IDE Setup

### VS Code Configuration

Recommended extensions (`.vscode/extensions.json`):

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag"
  ]
}
```

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## Next Steps

Now that you have the application running:

1. Read the [Architecture Overview](./02-architecture-overview.md) to understand the system design
2. Explore [Core Features](./05-core-features.md) to learn what the app can do
3. Check [Development Guide](./11-development-guide.md) for coding conventions
4. Review [Project Structure](./04-project-structure.md) to navigate the codebase

## Quick Reference

### Essential Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `h/j/k/l` | Navigate tree (vim-style) |
| `n` | New sibling goal |
| `s` | New child goal |
| `d` | Delete active goal |
| `a` | Toggle attribute window |
| `c` | Switch to command mode |
| `?` | Show help dialog |
| `+/-` | Zoom in/out |

### Essential File Locations

```
client/src/
  ├── pages/Home.tsx          # Main application page
  ├── components/tree/        # Tree visualization components
  ├── stores/                 # Zustand state stores
  └── utils/layouts.ts        # Layout algorithms

server/
  ├── index.ts               # Server entry point
  ├── routes.ts              # API routes (minimal)
  └── storage.ts             # Data storage (in-memory)
```

---

**Ready to dive deeper?** Continue to [Architecture Overview](./02-architecture-overview.md).
