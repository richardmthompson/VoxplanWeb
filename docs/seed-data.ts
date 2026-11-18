/**
 * Seed data for VoxPlanWeb — maps current VOX beads database to Goal format.
 * Generated 2026-05-10 from `bd list --status=all --long` in VOX repo.
 *
 * This file serves as test fixture and reference for the data model.
 * In production, this would be replaced by Supabase Postgres reads.
 */

export interface Goal {
  id: number;
  name: string;
  details: string;
  parentId: number | null;
  dept?: string;        // department: eng, bd, content, rd, product
  status: 'open' | 'in_progress' | 'blocked' | 'closed';
  deadline?: string;    // YYYY-MM-DD — only if different from parent
  beadsId?: string;     // original beads ID for future sync
}

export const SEED_GOALS: Goal[] = [
  // ═══════════════════════════════════════
  // EPIC 1: Salesbot V2 (ENG)
  // ═══════════════════════════════════════
  {
    id: 1,
    name: 'Salesbot V2: Complete the Loop',
    details: 'Agent SDK extraction + 3 tools (collect_contact_info, send_summary_email, end_conversation) + 7 completion gates',
    parentId: null,
    dept: 'eng',
    status: 'open',
    deadline: '2026-05-11',
    beadsId: 'PAI-9ji',
  },
  {
    id: 2,
    name: 'Design V2',
    details: 'Agent SDK extraction architecture. 3 tools + 7 completion gates. Produce V2 architecture in DESIGN.md, milestones in BUILD.md',
    parentId: 1,
    dept: 'eng',
    status: 'open',
    beadsId: 'PAI-9ji.1',
  },
  {
    id: 3,
    name: 'Build V2',
    details: 'Implement against V2 design. Work through milestones sequentially. Comprehension gate maintained.',
    parentId: 1,
    dept: 'eng',
    status: 'blocked',  // blocked by Design V2
    beadsId: 'PAI-9ji.2',
  },

  // ═══════════════════════════════════════
  // EPIC 2: BD Pipeline Activation (BD)
  // ═══════════════════════════════════════
  {
    id: 10,
    name: 'BD Pipeline Activation',
    details: 'CPN learning path + first Upwork proposals',
    parentId: null,
    dept: 'bd',
    status: 'open',
    deadline: '2026-05-11',
    beadsId: 'PAI-qx5',
  },
  {
    id: 11,
    name: 'CPN Learning Path',
    details: '4 Anthropic Academy courses. Releases: Anthropic certification eligibility.',
    parentId: 10,
    dept: 'bd',
    status: 'open',
    deadline: '2026-05-16',  // different from parent — shown
    beadsId: 'PAI-qx5.1',
  },
  {
    id: 12,
    name: 'Intro to Agent Skills',
    details: 'Anthropic Academy course 1',
    parentId: 11,
    dept: 'bd',
    status: 'closed',
    beadsId: 'PAI-qx5.1.1',
  },
  {
    id: 13,
    name: 'Building with Claude API',
    details: 'Anthropic Academy course 2',
    parentId: 11,
    dept: 'bd',
    status: 'in_progress',
    beadsId: 'PAI-qx5.1.2',
  },
  {
    id: 14,
    name: 'Intro to MCP',
    details: 'Anthropic Academy course 3',
    parentId: 11,
    dept: 'bd',
    status: 'open',
    beadsId: 'PAI-qx5.1.3',
  },
  {
    id: 15,
    name: 'Claude Code in Action',
    details: 'Anthropic Academy course 4',
    parentId: 11,
    dept: 'bd',
    status: 'open',
    beadsId: 'PAI-qx5.1.4',
  },
  {
    id: 16,
    name: 'Upwork Proposals',
    details: '2-3 submitted by Friday. $500-2K range, broadened criteria. Live demo link + market intelligence.',
    parentId: 10,
    dept: 'bd',
    status: 'open',
    beadsId: 'PAI-qx5.2',
  },

  // ═══════════════════════════════════════
  // EPIC 3: Content & Visibility (CONTENT)
  // ═══════════════════════════════════════
  {
    id: 20,
    name: 'Content & Visibility',
    details: 'LinkedIn cadence + salesbot showcase page',
    parentId: null,
    dept: 'content',
    status: 'open',
    deadline: '2026-05-11',
    beadsId: 'PAI-09o',
  },
  {
    id: 21,
    name: '3 LinkedIn Posts',
    details: 'Mon/Wed/Fri rhythm. Visibility + audience growth.',
    parentId: 20,
    dept: 'content',
    status: 'open',
    beadsId: 'PAI-09o.1',
  },
  {
    id: 22,
    name: 'Salesbot Showcase Page',
    details: 'Draft minimum on arlabs.tech. Asset visible for proposals.',
    parentId: 20,
    dept: 'content',
    status: 'open',
    beadsId: 'PAI-09o.2',
  },

  // ═══════════════════════════════════════
  // EPIC 4: VoxPlanWeb Rewrite (RD)
  // ═══════════════════════════════════════
  {
    id: 30,
    name: 'VoxPlanWeb: Layout + Theme Rewrite',
    details: 'Dagre LR layout, AR Labs theme, seed data, keyboard nav',
    parentId: null,
    dept: 'rd',
    status: 'open',
    beadsId: 'PAI-lmc',
  },
  {
    id: 31,
    name: 'Replace D3 with Dagre LR',
    details: 'Dagre horizontal layout matching session tree Mermaid',
    parentId: 30,
    dept: 'rd',
    status: 'open',
    beadsId: 'PAI-lmc.1',
  },
  {
    id: 32,
    name: 'AR Labs Theme',
    details: 'Neo-brutalist: mint/yellow/orange/purple, black borders, Outfit + JetBrains Mono',
    parentId: 30,
    dept: 'rd',
    status: 'blocked',
    beadsId: 'PAI-lmc.2',
  },
  {
    id: 33,
    name: 'Seed with Beads Data',
    details: 'Load current beads into treeStore on init',
    parentId: 30,
    dept: 'rd',
    status: 'blocked',
    beadsId: 'PAI-lmc.3',
  },
  {
    id: 34,
    name: 'Keyboard Navigation',
    details: 'Verify hjkl, add selection highlight + follow mode',
    parentId: 30,
    dept: 'rd',
    status: 'blocked',
    beadsId: 'PAI-lmc.4',
  },

  // ═══════════════════════════════════════
  // STANDALONE ITEMS
  // ═══════════════════════════════════════
  {
    id: 40,
    name: 'VOX OS: Goal Management Foundation',
    details: 'W19 infrastructure work: beads cleanup, label paradigm shift, session tree rules, VOX-OS index',
    parentId: null,
    dept: 'rd',
    status: 'open',
    beadsId: 'PAI-zfm',
  },
  {
    id: 50,
    name: 'Self-hosted Cloud LLM Demo',
    details: 'Qwen3.5-27B on L40S for privacy-focused research',
    parentId: null,
    dept: 'rd',
    status: 'open',
    beadsId: 'PAI-kzk',
  },
  {
    id: 60,
    name: 'R&D Tactical',
    details: 'W19 tactical only. Zero weekday research. 5% allocation.',
    parentId: null,
    dept: 'rd',
    status: 'open',
    beadsId: 'PAI-jxs',
  },
];

/**
 * Helper: determine node state for rendering
 */
export function getNodeState(goal: Goal, allGoals: Goal[]): 'root' | 'blocked' | 'active' | 'done' | 'delegated' {
  if (goal.status === 'closed') return 'done';
  if (goal.parentId === null) return 'root';

  const children = allGoals.filter(g => g.parentId === goal.id);
  if (children.length > 0) {
    // Has children — blocked unless all children done
    const allChildrenDone = children.every(c => c.status === 'closed');
    return allChildrenDone ? 'active' : 'blocked';
  }

  // Leaf node
  if (goal.status === 'blocked') return 'blocked';
  if (goal.status === 'in_progress') return 'active';
  return 'active'; // open leaf = active front
}

/**
 * Helper: get fill color for node state
 */
export function getNodeColor(state: string): string {
  switch (state) {
    case 'root': return '#ffdd03';
    case 'blocked': return '#ffffff';
    case 'active': return '#62f6b5';
    case 'done': return '#d4edda';
    case 'delegated': return '#9977ff';
    default: return '#ffffff';
  }
}

/**
 * Helper: get dept badge color
 */
export function getDeptColor(dept: string): string {
  switch (dept) {
    case 'eng': return '#62f6b5';
    case 'rd': return '#ffdd03';
    case 'bd': return '#ff9933';
    case 'content': return '#9977ff';
    case 'product': return '#ffffff';
    default: return '#ffffff';
  }
}
