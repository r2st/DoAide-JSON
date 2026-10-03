import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

function PathTree({
  data,
  path,
  depth,
  selectedPath,
  onSelect,
}: {
  data: unknown;
  path: string;
  depth: number;
  selectedPath: string;
  onSelect: (path: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 3);
  const isSelected = selectedPath === path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(path, JSON.stringify(data, null, 2));
  };

  if (data === null || typeof data !== 'object') {
    return (
      <span
        onClick={handleClick}
        className={`cursor-pointer px-1 rounded hover:bg-accent/20 ${isSelected ? 'bg-accent/30 ring-1 ring-accent' : ''}`}
      >
        {data === null ? (
          <span className="text-text-muted">null</span>
        ) : typeof data === 'string' ? (
          <span className="text-gold">"{data}"</span>
        ) : typeof data === 'boolean' ? (
          <span className="text-warning">{String(data)}</span>
        ) : (
          <span className="text-success">{String(data)}</span>
        )}
      </span>
    );
  }

  const isArray = Array.isArray(data);
  const entries = isArray
    ? data.map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(data as Record<string, unknown>);

  return (
    <div style={{ marginLeft: depth > 0 ? 16 : 0 }}>
      <span className="inline-flex items-center gap-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-text-muted hover:text-text-primary text-sm w-4"
        >
          {expanded ? '▼' : '▶'}
        </button>
        <span
          onClick={handleClick}
          className={`cursor-pointer px-1 rounded hover:bg-accent/20 text-text-muted text-sm ${isSelected ? 'bg-accent/30 ring-1 ring-accent' : ''}`}
        >
          {isArray ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </span>
      {expanded && (
        <div className="border-l border-border pl-3 ml-1.5">
          {entries.map(([key, val]) => {
            const childPath = isArray ? `${path}[${key}]` : `${path}.${key}`;
            return (
              <div key={key} className="py-0.5 flex items-start gap-1">
                <span className="text-accent text-sm shrink-0">
                  {isArray ? `${key}:` : `"${key}":`}
                </span>
                <PathTree
                  data={val}
                  path={childPath}
                  depth={depth + 1}
                  selectedPath={selectedPath}
                  onSelect={onSelect}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PathFinder() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    const shared = searchParams.get('d');
    if (shared) setInput(decodeShareParam(shared));
  }, [searchParams]);

  useEffect(() => {
    if (!input.trim()) { setParsed(null); setError(''); return; }
    try {
      setParsed(JSON.parse(input));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setParsed(null);
    }
  }, [input]);

  const handleSelect = (path: string, value: string) => {
    setSelectedPath(path);
    setSelectedValue(value);
  };

  return (
    <ToolPage title="JSON Path Finder" description="Click any value to get its JSONPath expression">
      <div className="flex flex-wrap gap-2 mb-4">
        <ShareButton getUrl={() => encodeShareUrl('/path-finder', { d: input })} />
      </div>

      {selectedPath && (
        <div className="mb-4 p-3 bg-bg-secondary border border-accent/30 rounded-lg flex items-center gap-3">
          <span className="text-text-secondary text-sm shrink-0">Path:</span>
          <code className="flex-1 text-accent font-mono text-sm bg-bg-tertiary px-3 py-1 rounded">
            {selectedPath}
          </code>
          <CopyButton text={selectedPath} label="Copy Path" />
          {selectedValue && <CopyButton text={selectedValue} label="Copy Value" />}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">JSON Input</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <Editor
              height="450px"
              defaultLanguage="json"
              theme="vs-dark"
              value={input}
              onChange={(v) => setInput(v || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-2">Click to get path</label>
          <div className="h-[450px] p-4 bg-bg-secondary border border-border rounded-lg overflow-auto font-mono text-sm">
            {parsed !== null ? (
              <PathTree
                data={parsed}
                path="$"
                depth={0}
                selectedPath={selectedPath}
                onSelect={handleSelect}
              />
            ) : (
              <span className="text-text-muted">Paste valid JSON to see the tree...</span>
            )}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
