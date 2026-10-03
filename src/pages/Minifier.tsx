import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

export default function Minifier() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ original: 0, minified: 0, saved: 0 });

  useEffect(() => {
    const shared = searchParams.get('d');
    if (shared) setInput(decodeShareParam(shared));
  }, [searchParams]);

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); setStats({ original: 0, minified: 0, saved: 0 }); return; }
    try {
      const minified = JSON.stringify(JSON.parse(input));
      setOutput(minified);
      setError('');
      const origSize = new Blob([input]).size;
      const minSize = new Blob([minified]).size;
      setStats({
        original: origSize,
        minified: minSize,
        saved: origSize > 0 ? Math.round((1 - minSize / origSize) * 100) : 0,
      });
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input]);

  return (
    <ToolPage title="JSON Minifier" description="Minify JSON by removing all whitespace">
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {output && <CopyButton text={output} />}
        <ShareButton getUrl={() => encodeShareUrl('/minifier', { d: input })} />
        {stats.original > 0 && (
          <div className="ml-auto flex gap-4 text-sm">
            <span className="text-text-muted">Original: <span className="text-text-primary">{stats.original.toLocaleString()} B</span></span>
            <span className="text-text-muted">Minified: <span className="text-success">{stats.minified.toLocaleString()} B</span></span>
            <span className="text-text-muted">Saved: <span className="text-gold">{stats.saved}%</span></span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">Input (formatted)</label>
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
          <label className="block text-text-secondary text-sm mb-2">Minified Output</label>
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
    </ToolPage>
  );
}
