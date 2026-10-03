import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

function TreeNode({ data, path, depth }: { data: unknown; path: string; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (data === null) return <span className="text-text-muted">null</span>;
  if (typeof data === 'boolean') return <span className="text-warning">{String(data)}</span>;
  if (typeof data === 'number') return <span className="text-success">{data}</span>;
  if (typeof data === 'string') return <span className="text-gold">"{data}"</span>;

  if (Array.isArray(data)) {
    return (
      <div style={{ marginLeft: depth > 0 ? 16 : 0 }}>
        <button onClick={() => setExpanded(!expanded)} className="text-text-muted hover:text-text-primary text-sm mr-1">
          {expanded ? '▼' : '▶'}
        </button>
        <span className="text-text-muted text-sm">{path} [{data.length}]</span>
        {expanded && (
          <div className="ml-4 border-l border-border pl-3">
            {data.map((item, i) => (
              <div key={i} className="py-0.5">
                <span className="text-text-muted text-sm mr-2">{i}:</span>
                <TreeNode data={item} path={`${path}[${i}]`} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    return (
      <div style={{ marginLeft: depth > 0 ? 16 : 0 }}>
        <button onClick={() => setExpanded(!expanded)} className="text-text-muted hover:text-text-primary text-sm mr-1">
          {expanded ? '▼' : '▶'}
        </button>
        <span className="text-text-muted text-sm">{path} {`{${entries.length}}`}</span>
        {expanded && (
          <div className="ml-4 border-l border-border pl-3">
            {entries.map(([key, val]) => (
              <div key={key} className="py-0.5">
                <span className="text-accent text-sm mr-1">"{key}":</span>
                <TreeNode data={val} path={`${path}.${key}`} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span>{String(data)}</span>;
}

export default function Formatter() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<unknown>(null);
  const [showTree, setShowTree] = useState(false);

  useEffect(() => {
    const shared = searchParams.get('d');
    if (shared) setInput(decodeShareParam(shared));
  }, [searchParams]);

  const format = useCallback((text: string, spaces: number) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      setParsed(null);
      return;
    }
    try {
      const obj = JSON.parse(text);
      setOutput(JSON.stringify(obj, null, spaces));
      setParsed(obj);
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
      setParsed(null);
    }
  }, []);

  useEffect(() => {
    format(input, indent);
  }, [input, indent, format]);

  return (
    <ToolPage title="JSON Formatter" description="Beautify and format JSON with syntax highlighting and collapsible tree view">
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-text-secondary text-sm">Indent:</label>
          {[2, 4].map((n) => (
            <button
              key={n}
              onClick={() => setIndent(n)}
              className={`px-3 py-1 rounded text-sm ${indent === n ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}`}
            >
              {n} spaces
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowTree(!showTree)}
          className={`px-3 py-1 rounded text-sm ${showTree ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}`}
        >
          Tree View
        </button>
        <div className="ml-auto flex gap-2">
          {output && <CopyButton text={output} />}
          <ShareButton getUrl={() => encodeShareUrl('/formatter', { d: input })} />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">Input</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <Editor
              height="400px"
              defaultLanguage="json"
              theme="vs-dark"
              value={input}
              onChange={(v) => setInput(v || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-2">Formatted Output</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <Editor
              height="400px"
              defaultLanguage="json"
              theme="vs-dark"
              value={output}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false, readOnly: true }}
            />
          </div>
        </div>
      </div>

      {showTree && parsed !== null && (
        <div className="mt-6 p-4 bg-bg-secondary border border-border rounded-lg overflow-auto max-h-[500px]">
          <h3 className="text-text-primary font-semibold mb-3">Tree View</h3>
          <div className="font-mono text-sm">
            <TreeNode data={parsed} path="$" depth={0} />
          </div>
        </div>
      )}
    </ToolPage>
  );
}
