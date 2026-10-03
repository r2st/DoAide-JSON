import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

export default function Validator() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null);

  useEffect(() => {
    const shared = searchParams.get('d');
    if (shared) setInput(decodeShareParam(shared));
  }, [searchParams]);

  useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      return;
    }
    try {
      JSON.parse(input);
      setResult({ valid: true, message: 'Valid JSON' });
    } catch (e) {
      const msg = (e as Error).message;
      setResult({ valid: false, message: msg });
    }
  }, [input]);

  return (
    <ToolPage title="JSON Validator" description="Validate JSON with clear error messages and line numbers">
      <div className="flex flex-wrap gap-2 mb-4">
        <CopyButton text={input} label="Copy Input" />
        <ShareButton getUrl={() => encodeShareUrl('/validator', { d: input })} />
      </div>

      {result && (
        <div className={`mb-4 p-3 rounded-lg text-sm border ${
          result.valid
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-error/10 border-error/30 text-error'
        }`}>
          <span className="font-semibold mr-2">{result.valid ? '✓' : '✗'}</span>
          {result.message}
        </div>
      )}

      <div className="border border-border rounded-lg overflow-hidden">
        <Editor
          height="500px"
          defaultLanguage="json"
          theme="vs-dark"
          value={input}
          onChange={(v) => setInput(v || '')}
          options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false }}
        />
      </div>
    </ToolPage>
  );
}
