// Search view for semantic queries across activity and decision history.
import React, { useEffect, useState } from 'react';
import { SearchResult } from '../components/SearchResult';

type Props = {
  lastMessage: { command: string; data?: any } | null;
  vscode: { postMessage: (message: unknown) => void };
};

export function SearchView({ lastMessage, vscode }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setLoading(true);
        vscode.postMessage({ command: 'startSearch', data: { query, limit: 10 } });
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (lastMessage?.command === 'searchResult') {
      setLoading(false);
      setResults(lastMessage.data?.results || []);
    }
  }, [lastMessage]);

  return (
    <div className="shell">
      <input
        className="input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search your code history..."
      />
      {!query && <p className="muted">Start typing to search your activity.</p>}
      {loading && <p className="muted">Searching your local history...</p>}
      {!loading && query && !results.length && <p className="muted">No matching activity found.</p>}
      {results.map((result, index) => (
        <SearchResult key={`${result.type}-${index}`} title={result.type || 'result'} subtitle={result.content || result.filePath || ''} score={Number(result.score || 0)} />
      ))}
    </div>
  );
}
