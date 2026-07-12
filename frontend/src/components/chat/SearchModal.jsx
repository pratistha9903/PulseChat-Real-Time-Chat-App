import { useState } from 'react';
import { Search } from 'lucide-react';
import Modal from '../ui/Modal';
import { api } from '../../services/api';

export default function SearchModal({ onClose, onSelectResult }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await api.searchMessages(q);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Search Messages" onClose={onClose} width={520}>
      <div className="search-input-wrap">
        <Search size={18} />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search messages..."
          autoFocus
        />
      </div>

      <div className="search-results">
        {loading && <p className="search-hint">Searching...</p>}
        {!loading && query.length >= 2 && results.length === 0 && (
          <p className="search-hint">No messages found</p>
        )}
        {results.map((r) => (
          <button
            key={r.id}
            className="search-result"
            onClick={() => { onSelectResult(r); onClose(); }}
          >
            <span className="search-result-room">
              {r.roomType === 'dm' ? r.displayName : `# ${r.roomName}`}
            </span>
            <p>{r.content}</p>
            <span className="search-result-meta">{r.displayName} · {r.createdAt}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
