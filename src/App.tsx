import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Formatter from './pages/Formatter';
import Validator from './pages/Validator';
import JsonYaml from './pages/JsonYaml';
import JsonXml from './pages/JsonXml';
import JsonCsv from './pages/JsonCsv';
import Diff from './pages/Diff';
import PathFinder from './pages/PathFinder';
import Minifier from './pages/Minifier';
import SchemaValidator from './pages/SchemaValidator';
import Base64 from './pages/Base64';
import UrlEncode from './pages/UrlEncode';
import JwtDecoder from './pages/JwtDecoder';
import HashGenerator from './pages/HashGenerator';
import RegexTester from './pages/RegexTester';
import CronParser from './pages/CronParser';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="formatter" element={<Formatter />} />
        <Route path="validator" element={<Validator />} />
        <Route path="json-yaml" element={<JsonYaml />} />
        <Route path="json-xml" element={<JsonXml />} />
        <Route path="json-csv" element={<JsonCsv />} />
        <Route path="diff" element={<Diff />} />
        <Route path="path-finder" element={<PathFinder />} />
        <Route path="minifier" element={<Minifier />} />
        <Route path="schema-validator" element={<SchemaValidator />} />
        <Route path="base64" element={<Base64 />} />
        <Route path="url-encode" element={<UrlEncode />} />
        <Route path="jwt" element={<JwtDecoder />} />
        <Route path="hash" element={<HashGenerator />} />
        <Route path="regex" element={<RegexTester />} />
        <Route path="cron" element={<CronParser />} />
      </Route>
    </Routes>
  );
}
