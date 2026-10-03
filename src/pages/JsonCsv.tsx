import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

function flatten(obj: unknown, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  if (obj === null || obj === undefined) {
    result[prefix] = '';
    return result;
  }
  if (typeof obj !== 'object' || obj instanceof Date) {
    result[prefix] = String(obj);
    return result;
  }
  if (Array.isArray(obj)) {
    result[prefix] = JSON.stringify(obj);
    return result;
  }
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flatten(val, newKey));
    } else {
      result[newKey] = val === null || val === undefined ? '' : String(val);
    }
  }
  return result;
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function jsonToCsv(input: string): string {
  const data = JSON.parse(input);
  if (!Array.isArray(data)) throw new Error('Input must be a JSON array of objects');
  if (data.length === 0) return '';

  const flattened = data.map((item) => flatten(item));
  const headers = [...new Set(flattened.flatMap((row) => Object.keys(row)))];
  const lines = [
    headers.map(escapeCsvField).join(','),
    ...flattened.map((row) =>
      headers.map((h) => escapeCsvField(row[h] ?? '')).join(',')
    ),
  ];
  return lines.join('\n');
}

export default function JsonCsv() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const shared = searchParams.get('d');
    if (shared) setInput(decodeShareParam(shared));
  }, [searchParams]);

  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      setOutput(jsonToCsv(input));
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input]);

  const downloadCsv = () => {
    const blob = new Blob([output], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPage title="JSON → CSV Converter" description="Convert JSON arrays to CSV for spreadsheets">
      <div className="flex flex-wrap gap-2 mb-4">
        {output && <CopyButton text={output} label="Copy CSV" />}
        {output && (
          <button onClick={downloadCsv} className="px-3 py-1.5 rounded-md text-sm font-medium bg-success/20 text-success hover:bg-success/30">
            Download CSV
          </button>
        )}
        <ShareButton getUrl={() => encodeShareUrl('/json-csv', { d: input })} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">JSON (array of objects)</label>
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
          <label className="block text-text-secondary text-sm mb-2">CSV Output</label>
          <pre className="h-[400px] p-4 bg-bg-secondary border border-border rounded-lg overflow-auto text-sm text-text-primary font-mono whitespace-pre">
            {output || 'CSV output will appear here...'}
          </pre>
        </div>
      </div>
    </ToolPage>
  );
}
