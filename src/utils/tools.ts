export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  category: 'json' | 'encoding' | 'dev';
}

export const tools: Tool[] = [
  {
    id: 'formatter',
    name: 'JSON Formatter',
    description: 'Beautify & format JSON with syntax highlighting and collapsible tree view',
    icon: '{ }',
    path: '/formatter',
    category: 'json',
  },
  {
    id: 'validator',
    name: 'JSON Validator',
    description: 'Validate JSON with clear error messages and line numbers',
    icon: '✓',
    path: '/validator',
    category: 'json',
  },
  {
    id: 'json-yaml',
    name: 'JSON ↔ YAML',
    description: 'Convert between JSON and YAML formats instantly',
    icon: '⇄',
    path: '/json-yaml',
    category: 'json',
  },
  {
    id: 'json-xml',
    name: 'JSON ↔ XML',
    description: 'Convert between JSON and XML formats',
    icon: '◇',
    path: '/json-xml',
    category: 'json',
  },
  {
    id: 'json-csv',
    name: 'JSON → CSV',
    description: 'Convert JSON arrays to CSV for spreadsheets',
    icon: '▤',
    path: '/json-csv',
    category: 'json',
  },
  {
    id: 'diff',
    name: 'JSON Diff',
    description: 'Compare two JSON objects and highlight differences',
    icon: '≠',
    path: '/diff',
    category: 'json',
  },
  {
    id: 'path-finder',
    name: 'JSON Path Finder',
    description: 'Click any value to get its JSONPath expression',
    icon: '⊙',
    path: '/path-finder',
    category: 'json',
  },
  {
    id: 'minifier',
    name: 'JSON Minifier',
    description: 'Minify JSON by removing all whitespace',
    icon: '▸',
    path: '/minifier',
    category: 'json',
  },
  {
    id: 'schema-validator',
    name: 'Schema Validator',
    description: 'Validate JSON data against a JSON Schema',
    icon: '⧩',
    path: '/schema-validator',
    category: 'json',
  },
  {
    id: 'base64',
    name: 'Base64 Encode/Decode',
    description: 'Encode and decode Base64 strings',
    icon: '⌥',
    path: '/base64',
    category: 'encoding',
  },
  {
    id: 'url-encode',
    name: 'URL Encode/Decode',
    description: 'Encode and decode URL components',
    icon: '%',
    path: '/url-encode',
    category: 'encoding',
  },
  {
    id: 'jwt',
    name: 'JWT Decoder',
    description: 'Decode JWT tokens — header, payload, and expiry',
    icon: '🔑',
    path: '/jwt',
    category: 'encoding',
  },
  {
    id: 'hash',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256 hashes using Web Crypto API',
    icon: '#',
    path: '/hash',
    category: 'encoding',
  },
  {
    id: 'regex',
    name: 'Regex Tester',
    description: 'Test regex patterns with highlighting and common patterns library',
    icon: '.*',
    path: '/regex',
    category: 'dev',
  },
  {
    id: 'cron',
    name: 'Cron Parser',
    description: 'Parse and explain cron expressions with next run times',
    icon: '⏰',
    path: '/cron',
    category: 'dev',
  },
];
