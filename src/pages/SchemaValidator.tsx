import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import ToolPage from '../components/ToolPage';
import CopyButton from '../components/CopyButton';
import ShareButton from '../components/ShareButton';
import { encodeShareUrl, decodeShareParam } from '../utils/share';

const SAMPLE_DATA = JSON.stringify({
  name: "John Doe",
  age: 30,
  email: "john@example.com",
  address: { street: "123 Main St", city: "Springfield" }
}, null, 2);

const SAMPLE_SCHEMA = JSON.stringify({
  type: "object",
  required: ["name", "email"],
  properties: {
    name: { type: "string", minLength: 1 },
    age: { type: "integer", minimum: 0 },
    email: { type: "string", format: "email" },
    address: {
      type: "object",
      properties: {
        street: { type: "string" },
        city: { type: "string" }
      }
    }
  }
}, null, 2);

interface ValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
}

export default function SchemaValidator() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState('');
  const [schema, setSchema] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const d = searchParams.get('d');
    const s = searchParams.get('s');
    if (d) setData(decodeShareParam(d));
    if (s) setSchema(decodeShareParam(s));
  }, [searchParams]);

  const validate = () => {
    try {
      const dataObj = JSON.parse(data);
      const schemaObj = JSON.parse(schema);
      const ajv = new Ajv({ allErrors: true });
      addFormats(ajv);
      const valid = ajv.validate(schemaObj, dataObj);
      setResult({
        valid: !!valid,
        errors: ajv.errors?.map((e) => ({
          path: e.instancePath || '/',
          message: e.message || 'Unknown error',
        })) || [],
      });
      setError('');
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  };

  const loadSample = () => {
    setData(SAMPLE_DATA);
    setSchema(SAMPLE_SCHEMA);
  };

  return (
    <ToolPage title="JSON Schema Validator" description="Validate JSON data against a JSON Schema">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={validate} className="px-4 py-1.5 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">
          Validate
        </button>
        <button onClick={loadSample} className="px-4 py-1.5 bg-bg-tertiary text-text-secondary rounded-md text-sm font-medium hover:bg-border">
          Load Sample
        </button>
        {data && <CopyButton text={data} label="Copy Data" />}
        <ShareButton getUrl={() => encodeShareUrl('/schema-validator', { d: data, s: schema })} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">{error}</div>
      )}

      {result && (
        <div className={`mb-4 p-3 rounded-lg border text-sm ${
          result.valid
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-error/10 border-error/30 text-error'
        }`}>
          {result.valid ? (
            <span className="font-semibold">✓ Valid — JSON matches the schema</span>
          ) : (
            <div>
              <span className="font-semibold">✗ Invalid — {result.errors.length} error(s):</span>
              <ul className="mt-2 space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="ml-4">
                    <code className="text-text-primary">{err.path}</code>: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-text-secondary text-sm mb-2">JSON Data</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <Editor
              height="400px"
              defaultLanguage="json"
              theme="vs-dark"
              value={data}
              onChange={(v) => setData(v || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>
        <div>
          <label className="block text-text-secondary text-sm mb-2">JSON Schema</label>
          <div className="border border-border rounded-lg overflow-hidden">
            <Editor
              height="400px"
              defaultLanguage="json"
              theme="vs-dark"
              value={schema}
              onChange={(v) => setSchema(v || '')}
              options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on', scrollBeyondLastLine: false }}
            />
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
