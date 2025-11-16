# API Reference

This document describes the backend API endpoints for VoxplanWeb.

## Current Status

**Backend Implementation**: Minimal

The backend server is running with basic Express setup, but API routes are not yet implemented.

**Files**:
- `server/index.ts` - Express server setup
- `server/routes.ts` - Route registration (currently empty)
- `server/storage.ts` - Storage interface (in-memory implementation)

## Planned API Endpoints

When the backend is fully implemented, the following REST API will be available:

### Base URL

```
Development: http://localhost:5000/api
Production: https://yourdomain.com/api
```

### Authentication

**Planned**: JWT-based authentication

Headers:
```
Authorization: Bearer <jwt-token>
```

## Goal Endpoints (Planned)

### GET /api/goals

Get all goals for the authenticated user.

**Response**:
```json
{
  "goals": [
    {
      "id": 1,
      "name": "Root Goal",
      "details": "Description here",
      "parentId": null,
      "position": { "x": 600, "y": 50 },
      "totalheight": 110,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### GET /api/goals/:id

Get a specific goal by ID.

**Response**:
```json
{
  "id": 1,
  "name": "Root Goal",
  "details": "Description",
  "parentId": null,
  "position": { "x": 600, "y": 50 },
  "totalheight": 110
}
```

### POST /api/goals

Create a new goal.

**Request Body**:
```json
{
  "name": "New Goal",
  "details": "Optional description",
  "parentId": 1
}
```

**Response**: Created goal object (201 Created)

### PUT /api/goals/:id

Update an existing goal.

**Request Body**:
```json
{
  "name": "Updated Name",
  "details": "Updated description",
  "position": { "x": 100, "y": 200 }
}
```

**Response**: Updated goal object

### DELETE /api/goals/:id

Delete a goal and all its descendants.

**Response**: 204 No Content

## Tree Operations (Planned)

### GET /api/tree

Get the entire goal tree structure.

**Response**:
```json
{
  "rootId": 1,
  "goals": { /* id -> goal mapping */ },
  "layoutMode": "tree"
}
```

### POST /api/tree/import

Import a tree from JSON file.

**Request Body**: JSON tree structure

**Response**: Imported tree

### GET /api/tree/export

Export tree as JSON file.

**Response**: JSON download

## User Endpoints (Planned)

### POST /api/auth/register

Register a new user.

### POST /api/auth/login

Login and receive JWT token.

### GET /api/auth/me

Get current user profile.

## WebSocket Events (Planned)

For real-time collaboration:

**Connect**:
```javascript
const ws = new WebSocket('ws://localhost:5000');
```

**Events**:
- `goal.created` - New goal created
- `goal.updated` - Goal modified
- `goal.deleted` - Goal removed
- `tree.sync` - Full tree synchronization

## Current Implementation

### Storage Interface

**Location**: `server/storage.ts`

```typescript
interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}
```

Currently implemented with `MemStorage` (in-memory Map).

### Future: Database Implementation

Using Drizzle ORM with PostgreSQL:

```typescript
class DatabaseStorage implements IStorage {
  // Connect to PostgreSQL
  // Implement IStorage methods using Drizzle queries
}
```

## Error Responses

Standard error format:

```json
{
  "error": {
    "code": "GOAL_NOT_FOUND",
    "message": "Goal with ID 123 not found",
    "status": 404
  }
}
```

**Status Codes**:
- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Development Notes

### To Implement Backend API:

1. **Define Routes** in `server/routes.ts`:
```typescript
export async function registerRoutes(app: Express) {
  app.get('/api/goals', getGoals);
  app.post('/api/goals', createGoal);
  // ... more routes
}
```

2. **Implement Handlers**:
```typescript
async function getGoals(req, res) {
  const goals = await storage.getAllGoals();
  res.json({ goals });
}
```

3. **Connect Database**:
- Configure Drizzle connection in `server/db.ts`
- Run migrations: `npm run db:push`
- Replace MemStorage with DatabaseStorage

4. **Add Validation**:
- Use Zod schemas from `shared/schema.ts`
- Validate request bodies
- Return validation errors

## Testing API (Future)

### Using curl:

```bash
# Get all goals
curl http://localhost:5000/api/goals

# Create goal
curl -X POST http://localhost:5000/api/goals \
  -H "Content-Type: application/json" \
  -d '{"name":"New Goal","parentId":null}'

# Update goal
curl -X PUT http://localhost:5000/api/goals/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Delete goal
curl -X DELETE http://localhost:5000/api/goals/1
```

### Using Client:

```typescript
// Using TanStack React Query
const { data } = useQuery({
  queryKey: ['goals'],
  queryFn: async () => {
    const res = await fetch('/api/goals');
    return res.json();
  }
});

const mutation = useMutation({
  mutationFn: async (goal) => {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal)
    });
    return res.json();
  }
});
```

## Related Documentation

- [Architecture Overview](./02-architecture-overview.md)
- [Data Flow](./07-data-flow.md)
- [Development Guide](./11-development-guide.md)
