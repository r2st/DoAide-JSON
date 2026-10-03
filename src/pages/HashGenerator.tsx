import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

function md5(input: string): string {
  function rotateLeft(val: number, shift: number) { return (val << shift) | (val >>> (32 - shift)); }
  function addUnsigned(a: number, b: number) {
    const r = (a & 0x7FFFFFFF) + (b & 0x7FFFFFFF);
    return (a & 0x80000000) ^ (b & 0x80000000) ? r ^ 0x80000000 : r;
  }

  const s = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
             5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
             4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
             6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const K = Array.from({length: 64}, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000));

  const bytes = new TextEncoder().encode(input);
  const bitLen = bytes.length * 8;
  const padded = new Uint8Array(((bytes.length + 8) >> 6 << 6) + 64);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  new DataView(padded.buffer).setUint32(padded.length - 8, bitLen & 0xFFFFFFFF, true);
  new DataView(padded.buffer).setUint32(padded.length - 4, Math.floor(bitLen / 0x100000000), true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = Array.from({length: 16}, (_, i) => new DataView(padded.buffer).getUint32(offset + i * 4, true));
    let A = a0, B = b0, C = c0, D = d0;

    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) { F = (B & C) | (~B & D); g = i; }
      else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
      else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
      else { F = C ^ (B | ~D); g = (7 * i) % 16; }

      F = addUnsigned(addUnsigned(F, A), addUnsigned(K[i], M[g]));
      A = D; D = C; C = B; B = addUnsigned(B, rotateLeft(F, s[i]));
    }

    a0 = addUnsigned(a0, A); b0 = addUnsigned(b0, B); c0 = addUnsigned(c0, C); d0 = addUnsigned(d0, D);
  }

  const toHex = (n: number) => {
    const bytes = [(n & 0xFF), ((n >> 8) & 0xFF), ((n >> 16) & 0xFF), ((n >> 24) & 0xFF)];
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  };
  return toHex(a0) + toHex(b0) + toHex(c0) + toHex(d0);
}

async function cryptoHash(algo: string, input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

export default function HashGenerator() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<HashResult | null>(null);

  useEffect(() => {
    const shared = searchParams.get('d');
    if (shared) setInput(decodeShareParam(shared));
  }, [searchParams]);

  useEffect(() => {
    if (!input) { setHashes(null); return; }
    (async () => {
      const [sha1, sha256, sha512] = await Promise.all([
        cryptoHash('SHA-1', input),
        cryptoHash('SHA-256', input),
        cryptoHash('SHA-512', input),
      ]);
      setHashes({ md5: md5(input), sha1, sha256, sha512 });
    })();
  }, [input]);

  const hashEntries: { label: string; key: keyof HashResult }[] = [
    { label: 'MD5', key: 'md5' },
    { label: 'SHA-1', key: 'sha1' },
    { label: 'SHA-256', key: 'sha256' },
    { label: 'SHA-512', key: 'sha512' },
  ];

  return (
    <ToolPage title="Hash Generator" description="Generate MD5, SHA-1, SHA-256, SHA-512 hashes">
      <div className="flex flex-wrap gap-2 mb-4">
        <ShareButton getUrl={() => encodeShareUrl('/hash', { d: input })} />
      </div>

      <div className="mb-6">
        <label className="block text-text-secondary text-sm mb-2">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash..."
          className="w-full h-32 p-4 bg-bg-secondary border border-border rounded-lg text-text-primary font-mono text-sm resize-none focus:outline-none focus:border-accent"
        />
      </div>

      {hashes && (
        <div className="space-y-3">
          {hashEntries.map(({ label, key }) => (
            <div key={key} className="p-4 bg-bg-secondary border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-text-secondary text-sm font-medium">{label}</label>
                <CopyButton text={hashes[key]} />
              </div>
              <code className="text-text-primary text-sm font-mono break-all">{hashes[key]}</code>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
