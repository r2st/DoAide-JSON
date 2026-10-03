import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

const COMMON_PATTERNS = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
  { name: 'URL', pattern: 'https?://[^\\s/$.?#][^\\s]*', flags: 'gi' },
  { name: 'IPv4 Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
  { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags: 'g' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])', flags: 'g' },
  { name: 'Hex Color', pattern: '#[0-9a-fA-F]{3,8}\\b', flags: 'gi' },
  { name: 'UUID', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', flags: 'gi' },
  { name: 'HTML Tag', pattern: '<\\/?[a-zA-Z][^>]*>', flags: 'g' },
];

const FLAG_OPTIONS = [
  { flag: 'g', label: 'Global' },
  { flag: 'i', label: 'Case-insensitive' },
  { flag: 'm', label: 'Multiline' },
  { flag: 's', label: 'Dot-all' },
];

interface Match {
  text: string;
  index: number;
  groups: string[];
}

export default function RegexTester() {
  const [searchParams] = useSearchParams();
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [error, setError] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [showPatterns, setShowPatterns] = useState(false);

  useEffect(() => {
    const p = searchParams.get('p');
    const t = searchParams.get('t');
    const f = searchParams.get('f');
    if (p) setPattern(decodeShareParam(p));
    if (t) setTestString(decodeShareParam(t));
    if (f) setFlags(decodeShareParam(f));
  }, [searchParams]);

  useEffect(() => {
    if (!pattern || !testString) { setMatches([]); setError(''); return; }
    try {
      const re = new RegExp(pattern, flags);
      const found: Match[] = [];
      let match: RegExpExecArray | null;

      if (flags.includes('g')) {
        while ((match = re.exec(testString)) !== null) {
          found.push({ text: match[0], index: match.index, groups: match.slice(1) });
          if (match[0].length === 0) re.lastIndex++;
        }
      } else {
        match = re.exec(testString);
        if (match) found.push({ text: match[0], index: match.index, groups: match.slice(1) });
      }

      setMatches(found);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setMatches([]);
    }
  }, [pattern, flags, testString]);

  const highlighted = useMemo(() => {
    if (!pattern || !testString || error) return null;
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const parts: Array<{ text: string; match: boolean }> = [];
      let lastIndex = 0;
      let m: RegExpExecArray | null;

      while ((m = re.exec(testString)) !== null) {
        if (m.index > lastIndex) parts.push({ text: testString.slice(lastIndex, m.index), match: false });
        parts.push({ text: m[0], match: true });
        lastIndex = m.index + m[0].length;
        if (m[0].length === 0) re.lastIndex++;
      }
      if (lastIndex < testString.length) parts.push({ text: testString.slice(lastIndex), match: false });
      return parts;
    } catch {
      return null;
    }
  }, [pattern, flags, testString, error]);

  const toggleFlag = (f: string) => {
    setFlags((prev) => prev.includes(f) ? prev.replace(f, '') : prev + f);
  };

  return (
    <ToolPage title="Regex Tester" description="Test regex patterns with highlighting and common patterns library">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setShowPatterns(!showPatterns)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${showPatterns ? 'bg-gold/20 text-gold' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}`}
        >
          Common Patterns
        </button>
        <CopyButton text={pattern} label="Copy Pattern" />
        <ShareButton getUrl={() => encodeShareUrl('/regex', { p: pattern, t: testString, f: flags })} />
      </div>

      {showPatterns && (
        <div className="mb-4 p-4 bg-bg-secondary border border-border rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COMMON_PATTERNS.map((p) => (
            <button
              key={p.name}
              onClick={() => { setPattern(p.pattern); setFlags(p.flags); setShowPatterns(false); }}
              className="px-3 py-2 text-sm text-left bg-bg-tertiary rounded-md text-text-secondary hover:text-text-primary hover:bg-border"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-text-secondary text-sm mb-2">Pattern</label>
        <div className="flex gap-2 items-center">
          <span className="text-text-muted text-lg">/</span>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-md text-text-primary font-mono text-sm focus:outline-none focus:border-accent"
          />
          <span className="text-text-muted text-lg">/</span>
          <div className="flex gap-1">
            {FLAG_OPTIONS.map(({ flag, label }) => (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                title={label}
                className={`w-8 h-8 rounded text-sm font-mono ${
                  flags.includes(flag) ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">Test String</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter test string..."
            className="w-full h-60 p-4 bg-bg-secondary border border-border rounded-lg text-text-primary font-mono text-sm resize-none focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-2">
            Highlighted ({matches.length} match{matches.length !== 1 ? 'es' : ''})
          </label>
          <div className="h-60 p-4 bg-bg-secondary border border-border rounded-lg overflow-auto font-mono text-sm whitespace-pre-wrap">
            {highlighted ? (
              highlighted.map((part, i) =>
                part.match ? (
                  <mark key={i} className="bg-gold/30 text-gold rounded px-0.5">{part.text}</mark>
                ) : (
                  <span key={i} className="text-text-primary">{part.text}</span>
                )
              )
            ) : (
              <span className="text-text-muted">Matches will be highlighted here...</span>
            )}
          </div>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="bg-bg-secondary border border-border rounded-lg p-4">
          <h3 className="text-text-primary font-semibold text-sm mb-3">Match Details</h3>
          <div className="space-y-2 max-h-60 overflow-auto">
            {matches.map((m, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-text-muted w-8 shrink-0">#{i + 1}</span>
                <code className="text-gold bg-bg-tertiary px-2 py-0.5 rounded">{m.text}</code>
                <span className="text-text-muted">at index {m.index}</span>
                {m.groups.length > 0 && (
                  <span className="text-text-muted">
                    groups: {m.groups.map((g, j) => <code key={j} className="text-accent mx-1">{g}</code>)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolPage>
  );
}
