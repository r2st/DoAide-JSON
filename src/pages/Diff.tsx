import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { diffJson } from 'diff';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

export default function Diff() {
  const [searchParams] = useSearchParams();
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const [result, setResult] = useState<ReturnType<typeof diffJson> | null>(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ added: 0, removed: 0, unchanged: 0 });

  useEffect(() => {
    const l = searchParams.get('l');
    const r = searchParams.get('r');
    if (l) setLeft(decodeShareParam(l));
    if (r) setRight(decodeShareParam(r));
  }, [searchParams]);

  const compare = () => {
    try {
      const objL = JSON.parse(left);
      const objR = JSON.parse(right);
      const changes = diffJson(objL, objR);
      setResult(changes);
      setError('');

      let added = 0, removed = 0, unchanged = 0;
      for (const part of changes) {
        const lines = part.value.split('\n').filter((l) => l.trim()).length;
        if (part.added) added += lines;
        else if (part.removed) removed += lines;
        else unchanged += lines;
      }
      setStats({ added, removed, unchanged });
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  };

  const diffText = result
    ? result.map((p) => {
        const prefix = p.added ? '+' : p.removed ? '-' : ' ';
        return p.value.split('\n').filter((l) => l.trim()).map((l) => `${prefix} ${l}`).join('\n');
      }).join('\n')
    : '';

  return (
    <ToolPage title="JSON Diff" description="Compare two JSON objects and highlight differences">
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <button onClick={compare} className="px-4 py-1.5 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">
          Compare
        </button>
        {diffText && <CopyButton text={diffText} label="Copy Diff" />}
        <ShareButton getUrl={() => encodeShareUrl('/diff', { l: left, r: right })} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-text-secondary text-sm mb-2">Original</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <Editor
              height="350px"
              defaultLanguage="json"
              theme="vs-dark"
              value={left}
              onChange={(v) => setLeft(v || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-2">Modified</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <Editor
              height="350px"
              defaultLanguage="json"
              theme="vs-dark"
              value={right}
              onChange={(v) => setRight(v || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-bg-secondary border border-border rounded-lg overflow-hidden">
          <div className="p-3 border-b border-border flex gap-4 text-sm">
            <span className="text-success">+{stats.added} added</span>
            <span className="text-error">-{stats.removed} removed</span>
            <span className="text-text-muted">{stats.unchanged} unchanged</span>
          </div>
          <div className="p-4 overflow-auto max-h-[500px] font-mono text-sm">
            {result.map((part, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap ${
                  part.added ? 'bg-success/15 text-success' : part.removed ? 'bg-error/15 text-error' : 'text-text-secondary'
                }`}
              >
                {part.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolPage>
  );
}
