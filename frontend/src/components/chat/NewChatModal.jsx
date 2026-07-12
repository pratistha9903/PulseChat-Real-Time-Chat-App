import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { api } from '../../services/api';

export default function NewChatModal({ onClose, onChatCreated }) {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async (q = '') => {
    setLoading(true);
    try {
      const data = q.length >= 2
        ? await api.searchUsers(q)
        : await api.getUsers();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q) => {
    setQuery(q);
    loadUsers(q);
  };

  const startChat = async (userId) => {
    const room = await api.createDm(userId);
    onChatCreated(room);
    onClose();
  };

  return (
    <Modal title="New Chat" onClose={onClose}>
      <div className="search-input-wrap">
        <Search size={18} />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search people..."
          autoFocus
        />
      </div>

      <div className="user-picker-list">
        {loading && <p className="search-hint">Loading...</p>}
        {!loading && users.length === 0 && (
          <p className="search-hint">No users found</p>
        )}
        {users.map((u) => (
          <button key={u.id} className="user-picker-item" onClick={() => startChat(u.id)}>
            <Avatar name={u.displayName} color={u.avatarColor} size={36} />
            <div>
              <span className="user-picker-name">{u.displayName}</span>
              <span className="user-picker-handle">@{u.username}</span>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
