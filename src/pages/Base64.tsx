import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

export default function Base64() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');

  useEffect(() => {
    const shared = searchParams.get('d');
    if (shared) setInput(decodeShareParam(shared));
  }, [searchParams]);

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      if (mode === 'encode') {
        const bytes = new TextEncoder().encode(input);
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        setOutput(btoa(binary));
      } else {
        const binary = atob(input.trim());
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        setOutput(new TextDecoder().decode(bytes));
      }
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input, mode]);

  return (
    <ToolPage title="Base64 Encode/Decode" description="Encode and decode Base64 strings with Unicode support">
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
        <button
          onClick={() => { setInput(output); setOutput(''); setMode(mode === 'encode' ? 'decode' : 'encode'); }}
          className="px-4 py-1.5 bg-bg-tertiary text-text-secondary rounded-md text-sm font-medium hover:bg-border"
        >
          Swap ⇄
        </button>
        {output && <CopyButton text={output} />}
        <ShareButton getUrl={() => encodeShareUrl('/base64', { d: input })} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">
            {mode === 'encode' ? 'Plain Text' : 'Base64 Input'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
            className="w-full h-80 p-4 bg-bg-secondary border border-border rounded-lg text-text-primary font-mono text-sm resize-none focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-2">
            {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
          </label>
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
