import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import cronstrue from 'cronstrue';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

const PRESETS = [
  { name: 'Every minute', expr: '* * * * *' },
  { name: 'Every 5 minutes', expr: '*/5 * * * *' },
  { name: 'Every hour', expr: '0 * * * *' },
  { name: 'Daily at midnight', expr: '0 0 * * *' },
  { name: 'Daily at 9 AM', expr: '0 9 * * *' },
  { name: 'Weekly (Mon 9 AM)', expr: '0 9 * * 1' },
  { name: 'Monthly (1st, midnight)', expr: '0 0 1 * *' },
  { name: 'Weekdays at 8 AM', expr: '0 8 * * 1-5' },
];

function getNextRuns(expr: string, count: number): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 5) return [];

  const parseField = (field: string, min: number, max: number): number[] => {
    const values = new Set<number>();
    for (const part of field.split(',')) {
      if (part === '*') {
        for (let i = min; i <= max; i++) values.add(i);
      } else if (part.includes('/')) {
        const [range, stepStr] = part.split('/');
        const step = parseInt(stepStr);
        let start = min;
        let end = max;
        if (range !== '*') {
          if (range.includes('-')) {
            const [a, b] = range.split('-').map(Number);
            start = a;
            end = b;
          } else {
            start = parseInt(range);
          }
        }
        for (let i = start; i <= end; i += step) values.add(i);
      } else if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number);
        for (let i = a; i <= b; i++) values.add(i);
      } else {
        values.add(parseInt(part));
      }
    }
    return [...values].filter((v) => v >= min && v <= max).sort((a, b) => a - b);
  };

  const minutes = parseField(parts[0], 0, 59);
  const hours = parseField(parts[1], 0, 23);
  const daysOfMonth = parseField(parts[2], 1, 31);
  const months = parseField(parts[3], 1, 12);
  const daysOfWeek = parseField(parts[4], 0, 6);

  const results: Date[] = [];
  const now = new Date();
  const check = new Date(now);
  check.setSeconds(0, 0);
  check.setMinutes(check.getMinutes() + 1);

  const limit = 365 * 24 * 60;
  for (let i = 0; i < limit && results.length < count; i++) {
    const month = check.getMonth() + 1;
    const day = check.getDate();
    const dow = check.getDay();
    const hour = check.getHours();
    const minute = check.getMinutes();

    if (
      months.includes(month) &&
      (parts[2] === '*' || parts[4] !== '*'
        ? daysOfMonth.includes(day) || daysOfWeek.includes(dow)
        : daysOfMonth.includes(day)) &&
      (parts[4] === '*' || daysOfWeek.includes(dow)) &&
      hours.includes(hour) &&
      minutes.includes(minute)
    ) {
      results.push(new Date(check));
    }
    check.setMinutes(check.getMinutes() + 1);
  }

  return results;
}

export default function CronParser() {
  const [searchParams] = useSearchParams();
  const [expr, setExpr] = useState('*/5 * * * *');
  const [description, setDescription] = useState('');
  const [nextRuns, setNextRuns] = useState<Date[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const shared = searchParams.get('d');
    if (shared) setExpr(decodeShareParam(shared));
  }, [searchParams]);

  useEffect(() => {
    if (!expr.trim()) { setDescription(''); setNextRuns([]); setError(''); return; }
    try {
      setDescription(cronstrue.toString(expr));
      setNextRuns(getNextRuns(expr, 5));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setDescription('');
      setNextRuns([]);
    }
  }, [expr]);

  const fields = expr.trim().split(/\s+/);
  const fieldLabels = ['Minute', 'Hour', 'Day (month)', 'Month', 'Day (week)'];

  return (
    <ToolPage title="Cron Parser" description="Parse and explain cron expressions with next run times">
      <div className="flex flex-wrap gap-2 mb-4">
        <CopyButton text={expr} label="Copy Expression" />
        <ShareButton getUrl={() => encodeShareUrl('/cron', { d: expr })} />
      </div>

      <div className="mb-6">
        <label className="block text-text-secondary text-sm mb-2">Cron Expression</label>
        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder="* * * * *"
          className="w-full px-4 py-3 bg-bg-secondary border border-border rounded-lg text-text-primary font-mono text-lg focus:outline-none focus:border-accent text-center tracking-widest"
        />
        <div className="flex justify-center gap-6 mt-2 text-xs text-text-muted">
          {fieldLabels.map((label, i) => (
            <span key={label} className="text-center">
              <span className="block font-mono text-text-secondary">{fields[i] || '*'}</span>
              {label}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>
      )}

      {description && (
        <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-lg text-center">
          <span className="text-accent-hover text-lg font-medium">{description}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-text-primary font-semibold text-sm mb-3">Next 5 Runs</h3>
          {nextRuns.length > 0 ? (
            <div className="space-y-2">
              {nextRuns.map((date, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-bg-secondary border border-border rounded-lg">
                  <span className="text-gold font-mono text-sm w-6">#{i + 1}</span>
                  <span className="text-text-primary text-sm">{date.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm">Enter a valid cron expression to see next runs.</p>
          )}
        </div>

        <div>
          <h3 className="text-text-primary font-semibold text-sm mb-3">Quick Presets</h3>
          <div className="grid grid-cols-1 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.expr}
                onClick={() => setExpr(p.expr)}
                className={`flex items-center justify-between p-3 rounded-lg text-sm text-left ${
                  expr === p.expr
                    ? 'bg-accent/20 border border-accent/30 text-accent-hover'
                    : 'bg-bg-secondary border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                <span>{p.name}</span>
                <code className="font-mono text-text-muted">{p.expr}</code>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
