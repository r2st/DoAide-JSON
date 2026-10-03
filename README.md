# DoAide JSON

Free online developer tools at **json.doaide.com**. All processing happens client-side — nothing is sent to any server.

## Tools

| Tool | Path | Description |
|------|------|-------------|
| JSON Formatter | `/formatter` | Beautify JSON with syntax highlighting & tree view |
| JSON Validator | `/validator` | Validate JSON with error messages & line numbers |
| JSON ↔ YAML | `/json-yaml` | Bidirectional JSON/YAML conversion |
| JSON ↔ XML | `/json-xml` | Bidirectional JSON/XML conversion |
| JSON → CSV | `/json-csv` | Convert JSON arrays to CSV |
| JSON Diff | `/diff` | Compare two JSON objects |
| JSON Path Finder | `/path-finder` | Click values to get JSONPath |
| JSON Minifier | `/minifier` | Minify JSON with size stats |
| Schema Validator | `/schema-validator` | Validate JSON against JSON Schema |
| Base64 | `/base64` | Encode/decode Base64 with Unicode |
| URL Encode | `/url-encode` | Encode/decode URLs |
| JWT Decoder | `/jwt` | Decode JWT tokens (header, payload, expiry) |
| Hash Generator | `/hash` | MD5, SHA-1, SHA-256, SHA-512 |
| Regex Tester | `/regex` | Test regex with highlighting & common patterns |
| Cron Parser | `/cron` | Parse cron expressions with next run times |

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Monaco Editor

## Development

```bash
npm install
npm run dev
```

Dev server runs on `172.18.0.1:3059`.

## Build & Deploy

```bash
npm run build
```

### Deployment (systemd)

```bash
# Copy build to server
rsync -avz . root@89.167.8.178:/opt/doaide-json/

# On server
cp doaide-json.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable doaide-json
systemctl start doaide-json
```

## Architecture

Frontend-only — no backend. All processing (formatting, validation, hashing, etc.) runs in the browser using:
- Native `JSON.parse`/`JSON.stringify` for JSON operations
- `js-yaml` for YAML conversion
- `ajv` for JSON Schema validation
- Web Crypto API for SHA hashes
- Pure JS MD5 implementation
- `cronstrue` for cron descriptions
- `diff` library for JSON comparison
