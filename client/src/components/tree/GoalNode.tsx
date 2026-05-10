import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useTreeStore, Goal } from '@/stores/treeStore';

export interface GoalNodeData {
  id: number;
  name: string;
  details: string;
  isActive: boolean;
  dept?: string;
  status: 'open' | 'in_progress' | 'blocked' | 'closed';
  deadline?: string;
  nodeState: 'root' | 'blocked' | 'active' | 'done' | 'delegated';
}

const STATE_COLORS: Record<string, { fill: string; border: string; text: string }> = {
  root:      { fill: '#ffdd03', border: '3px solid #000', text: '#000' },
  blocked:   { fill: '#ffffff', border: '2px solid #000', text: '#000' },
  active:    { fill: '#62f6b5', border: '3px solid #000', text: '#000' },
  done:      { fill: '#d4edda', border: '2px solid #000', text: '#000' },
  delegated: { fill: '#9977ff', border: '3px solid #000', text: '#fff' },
};

const DEPT_COLORS: Record<string, { bg: string; text: string }> = {
  eng:     { bg: '#62f6b5', text: '#000' },
  rd:      { bg: '#ffdd03', text: '#000' },
  bd:      { bg: '#ff9933', text: '#000' },
  content: { bg: '#9977ff', text: '#fff' },
  product: { bg: '#ffffff', text: '#000' },
};

const DEPT_LABELS: Record<string, string> = {
  eng: 'ENG',
  rd: 'RD',
  bd: 'BD',
  content: 'CONTENT',
  product: 'PRODUCT',
};

function GoalNode({ data }: NodeProps<GoalNodeData>) {
  const setActiveGoal = useTreeStore((state) => state.setActiveGoal);
  const colors = STATE_COLORS[data.nodeState] ?? STATE_COLORS.blocked;
  const deptColor = data.dept ? DEPT_COLORS[data.dept] : null;

  return (
    <div
      className="cursor-pointer transition-shadow duration-200"
      onClick={() => setActiveGoal(data.id)}
      style={{
        background: colors.fill,
        border: colors.border,
        boxShadow: data.isActive
          ? '0 0 0 4px #fff, 0 0 0 7px #ff9933, 0 0 16px 6px rgba(255, 153, 51, 0.4)'
          : '2px 2px 0px 0px rgba(0,0,0,1)',
        color: colors.text,
        fontFamily: "'Outfit', sans-serif",
        minWidth: 200,
        maxWidth: 320,
        padding: '12px 16px',
      }}
      data-testid={`goal-node-${data.id}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-black !w-2 !h-2 !border-0" />

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
        {data.name}
      </div>

      <div style={{ borderTop: '1px solid #000', margin: '6px 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        {deptColor && (
          <span
            style={{
              display: 'inline-block',
              padding: '1px 6px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              border: '1px solid #000',
              background: deptColor.bg,
              color: deptColor.text,
            }}
          >
            {DEPT_LABELS[data.dept!]}
          </span>
        )}
        <span style={{ fontSize: 13 }}>{data.status}</span>
      </div>

      {data.deadline && (
        <>
          <div style={{ borderTop: '1px solid #000', margin: '6px 0' }} />
          <div style={{ fontSize: 12, color: '#888', fontFamily: "'JetBrains Mono', monospace" }}>
            Due: {data.deadline}
          </div>
        </>
      )}

      <Handle type="source" position={Position.Right} className="!bg-black !w-2 !h-2 !border-0" />
    </div>
  );
}

export default memo(GoalNode);
