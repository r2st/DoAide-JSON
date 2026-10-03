import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { dump as yamlDump, load as yamlLoad } from 'js-yaml';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

export default function JsonYaml() {
  const [searchParams] = useSearchParams();
  const [jsonVal, setJsonVal] = useState('');
  const [yamlVal, setYamlVal] = useState('');
  const [error, setError] = useState('');
  const editingRef = useRef<'json' | 'yaml' | null>(null);

  useEffect(() => {
    const shared = searchParams.get('d');
    if (shared) {
      const decoded = decodeShareParam(shared);
      setJsonVal(decoded);
      editingRef.current = 'json';
    }
  }, [searchParams]);

  useEffect(() => {
    if (editingRef.current !== 'json') return;
    if (!jsonVal.trim()) { setYamlVal(''); setError(''); return; }
    try {
      const obj = JSON.parse(jsonVal);
      setYamlVal(yamlDump(obj, { indent: 2, lineWidth: -1 }));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [jsonVal]);

  useEffect(() => {
    if (editingRef.current !== 'yaml') return;
    if (!yamlVal.trim()) { setJsonVal(''); setError(''); return; }
    try {
      const obj = yamlLoad(yamlVal);
      setJsonVal(JSON.stringify(obj, null, 2));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [yamlVal]);

  return (
    <ToolPage title="JSON ↔ YAML Converter" description="Convert between JSON and YAML formats instantly">
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonVal && <CopyButton text={jsonVal} label="Copy JSON" />}
        {yamlVal && <CopyButton text={yamlVal} label="Copy YAML" />}
        <ShareButton getUrl={() => encodeShareUrl('/json-yaml', { d: jsonVal })} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">JSON</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <Editor
              height="450px"
              defaultLanguage="json"
              theme="vs-dark"
              value={jsonVal}
              onChange={(v) => { editingRef.current = 'json'; setJsonVal(v || ''); }}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-2">YAML</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <Editor
              height="450px"
              defaultLanguage="yaml"
              theme="vs-dark"
              value={yamlVal}
              onChange={(v) => { editingRef.current = 'yaml'; setYamlVal(v || ''); }}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
