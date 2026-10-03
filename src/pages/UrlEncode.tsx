import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

export default function UrlEncode() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodeType, setEncodeType] = useState<'component' | 'full'>('component');
  const [error, setError] = useState('');

  useEffect(() => {
    const shared = searchParams.get('d');
    if (shared) setInput(decodeShareParam(shared));
  }, [searchParams]);

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      if (mode === 'encode') {
        setOutput(encodeType === 'component' ? encodeURIComponent(input) : encodeURI(input));
      } else {
        try {
          setOutput(decodeURIComponent(input.trim()));
        } catch {
          setOutput(decodeURI(input.trim()));
        }
      }
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input, mode, encodeType]);

  return (
    <ToolPage title="URL Encode/Decode" description="Encode and decode URL components">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setMode('encode')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium ${mode === 'encode' ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}`}
        >
          Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium ${mode === 'decode' ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}`}
        >
          Decode
        </button>
        {mode === 'encode' && (
          <>
            <span className="text-text-muted text-sm self-center mx-1">|</span>
            <button
              onClick={() => setEncodeType('component')}
              className={`px-3 py-1.5 rounded-md text-sm ${encodeType === 'component' ? 'bg-gold/20 text-gold' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}`}
            >
              Component
            </button>
            <button
              onClick={() => setEncodeType('full')}
              className={`px-3 py-1.5 rounded-md text-sm ${encodeType === 'full' ? 'bg-gold/20 text-gold' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}`}
            >
              Full URI
            </button>
          </>
        )}
        <button
          onClick={() => { setInput(output); setOutput(''); setMode(mode === 'encode' ? 'decode' : 'encode'); }}
          className="px-4 py-1.5 bg-bg-tertiary text-text-secondary rounded-md text-sm font-medium hover:bg-border"
        >
          Swap ⇄
        </button>
        {output && <CopyButton text={output} />}
        <ShareButton getUrl={() => encodeShareUrl('/url-encode', { d: input })} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter URL or text to encode...' : 'Enter encoded URL to decode...'}
            className="w-full h-80 p-4 bg-bg-secondary border border-border rounded-lg text-text-primary font-mono text-sm resize-none focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-2">Output</label>
          <textarea
            value={output}
            readOnly
            placeholder="Output will appear here..."
            className="w-full h-80 p-4 bg-bg-secondary border border-border rounded-lg text-text-primary font-mono text-sm resize-none"
          />
        </div>
      </div>
    </ToolPage>
  );
}
