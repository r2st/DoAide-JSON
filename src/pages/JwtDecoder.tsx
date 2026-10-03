import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeJwtPart(part: string): Record<string, unknown> {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(padded);
  return JSON.parse(decoded);
}

function formatExpiry(exp: number): { text: string; expired: boolean } {
  const now = Date.now() / 1000;
  const date = new Date(exp * 1000);
  const expired = now > exp;
  const diff = Math.abs(exp - now);
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  let relative = '';
  if (days > 0) relative = `${days}d ${hours}h`;
  else if (hours > 0) relative = `${hours}h ${minutes}m`;
  else relative = `${minutes}m`;

  return {
    text: `${date.toISOString()} (${expired ? 'expired' : 'expires in'} ${relative})`,
    expired,
  };
}

export default function JwtDecoder() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState('');
  const [expiry, setExpiry] = useState<{ text: string; expired: boolean } | null>(null);

  useEffect(() => {
    const shared = searchParams.get('d');
    if (shared) setInput(decodeShareParam(shared));
  }, [searchParams]);

  useEffect(() => {
    if (!input.trim()) { setDecoded(null); setError(''); setExpiry(null); return; }
    try {
      const parts = input.trim().split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT: must have 3 parts separated by dots');

      const header = decodeJwtPart(parts[0]);
      const payload = decodeJwtPart(parts[1]);
      const signature = parts[2];

      setDecoded({ header, payload, signature });
      setError('');

      if (typeof payload.exp === 'number') {
        setExpiry(formatExpiry(payload.exp));
      } else {
        setExpiry(null);
      }
    } catch (e) {
      setError((e as Error).message);
      setDecoded(null);
      setExpiry(null);
    }
  }, [input]);

  const parts = input.trim().split('.');

  return (
    <ToolPage title="JWT Decoder" description="Decode JWT tokens — header, payload, and expiry">
      <div className="flex flex-wrap gap-2 mb-4">
        {decoded && <CopyButton text={JSON.stringify(decoded.payload, null, 2)} label="Copy Payload" />}
        <ShareButton getUrl={() => encodeShareUrl('/jwt', { d: input })} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>
      )}

      <div className="mb-6">
        <label className="block text-text-secondary text-sm mb-2">Paste JWT Token</label>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            className="w-full h-28 p-4 bg-bg-secondary border border-border rounded-lg text-text-primary font-mono text-sm resize-none focus:outline-none focus:border-accent"
          />
        </div>
        {parts.length === 3 && input.trim() && (
          <div className="mt-2 font-mono text-sm break-all">
            <span className="text-accent">{parts[0]}</span>
            <span className="text-text-muted">.</span>
            <span className="text-[#c084fc]">{parts[1]}</span>
            <span className="text-text-muted">.</span>
            <span className="text-success">{parts[2]}</span>
          </div>
        )}
      </div>

      {expiry && (
        <div className={`mb-4 p-3 rounded-lg border text-sm ${
          expiry.expired
            ? 'bg-error/10 border-error/30 text-error'
            : 'bg-success/10 border-success/30 text-success'
        }`}>
          {expiry.expired ? '⚠ Token Expired' : '✓ Token Valid'}: {expiry.text}
        </div>
      )}

      {decoded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-accent" />
              <label className="text-text-secondary text-sm font-medium">Header</label>
              <CopyButton text={JSON.stringify(decoded.header, null, 2)} label="Copy" className="ml-auto" />
            </div>
            <pre className="p-4 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary font-mono overflow-auto max-h-60">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-[#c084fc]" />
              <label className="text-text-secondary text-sm font-medium">Payload</label>
              <CopyButton text={JSON.stringify(decoded.payload, null, 2)} label="Copy" className="ml-auto" />
            </div>
            <pre className="p-4 bg-bg-secondary border border-border rounded-lg text-sm text-text-primary font-mono overflow-auto max-h-60">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-success" />
              <label className="text-text-secondary text-sm font-medium">Signature</label>
              <CopyButton text={decoded.signature} label="Copy" className="ml-auto" />
            </div>
            <pre className="p-4 bg-bg-secondary border border-border rounded-lg text-sm text-text-muted font-mono overflow-auto break-all">
              {decoded.signature}
            </pre>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
