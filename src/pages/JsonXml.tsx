import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

function jsonToXml(obj: unknown, rootName = 'root', indent = 0): string {
  const pad = '  '.repeat(indent);

  if (obj === null || obj === undefined) return `${pad}<${rootName}/>\n`;
  if (typeof obj !== 'object') return `${pad}<${rootName}>${escapeXml(String(obj))}</${rootName}>\n`;

  if (Array.isArray(obj)) {
    return obj.map((item) => jsonToXml(item, 'item', indent)).join('');
  }

  const entries = Object.entries(obj as Record<string, unknown>);
  let xml = `${pad}<${rootName}>\n`;
  for (const [key, val] of entries) {
    const safeName = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (Array.isArray(val)) {
      xml += val.map((item) => jsonToXml(item, safeName, indent + 1)).join('');
    } else {
      xml += jsonToXml(val, safeName, indent + 1);
    }
  }
  xml += `${pad}</${rootName}>\n`;
  return xml;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function xmlToJson(xml: string): unknown {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) throw new Error('Invalid XML: ' + errorNode.textContent);
  return elementToJson(doc.documentElement);
}

function elementToJson(el: Element): unknown {
  if (el.children.length === 0) {
    const text = el.textContent || '';
    if (!text) return null;
    const num = Number(text);
    if (!isNaN(num) && text.trim() !== '') return num;
    if (text === 'true') return true;
    if (text === 'false') return false;
    return text;
  }

  const result: Record<string, unknown> = {};
  for (const child of Array.from(el.children)) {
    const key = child.tagName;
    const val = elementToJson(child);
    if (key in result) {
      const existing = result[key];
      result[key] = Array.isArray(existing) ? [...existing, val] : [existing, val];
    } else {
      result[key] = val;
    }
  }
  return result;
}

export default function JsonXml() {
  const [searchParams] = useSearchParams();
  const [jsonVal, setJsonVal] = useState('');
  const [xmlVal, setXmlVal] = useState('');
  const [error, setError] = useState('');
  const editingRef = useRef<'json' | 'xml' | null>(null);

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
    if (!jsonVal.trim()) { setXmlVal(''); setError(''); return; }
    try {
      const obj = JSON.parse(jsonVal);
      setXmlVal('<?xml version="1.0" encoding="UTF-8"?>\n' + jsonToXml(obj));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [jsonVal]);

  useEffect(() => {
    if (editingRef.current !== 'xml') return;
    if (!xmlVal.trim()) { setJsonVal(''); setError(''); return; }
    try {
      const obj = xmlToJson(xmlVal);
      setJsonVal(JSON.stringify(obj, null, 2));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [xmlVal]);

  return (
    <ToolPage title="JSON ↔ XML Converter" description="Convert between JSON and XML formats">
      <div className="flex flex-wrap gap-2 mb-4">
        {jsonVal && <CopyButton text={jsonVal} label="Copy JSON" />}
        {xmlVal && <CopyButton text={xmlVal} label="Copy XML" />}
        <ShareButton getUrl={() => encodeShareUrl('/json-xml', { d: jsonVal })} />
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
          <label className="block text-text-secondary text-sm mb-2">XML</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <Editor
              height="450px"
              defaultLanguage="xml"
              theme="vs-dark"
              value={xmlVal}
              onChange={(v) => { editingRef.current = 'xml'; setXmlVal(v || ''); }}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
