import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { api } from '../../services/api';

export default function CreateGroupModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getUsers().then(setUsers).catch(() => {});
  }, []);

  const toggleUser = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || selected.length === 0) return;
    setLoading(true);
    try {
      await onCreate({ name: name.trim(), description: description.trim(), memberIds: selected });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create Group" onClose={onClose} width={480}>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label>Group Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Project Team" autoFocus maxLength={50} />
        </div>
        <div className="form-group">
          <label>Description (optional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this group about?" maxLength={200} />
        </div>

        <label className="form-group-label">Add Members ({selected.length} selected)</label>
        <div className="user-picker-list compact">
          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              className={`user-picker-item ${selected.includes(u.id) ? 'selected' : ''}`}
              onClick={() => toggleUser(u.id)}
            >
              <Avatar name={u.displayName} color={u.avatarColor} size={32} />
              <span>{u.displayName}</span>
              {selected.includes(u.id) && <span className="check-mark">✓</span>}
            </button>
          ))}
        </div>

        <button type="submit" className="btn-primary" disabled={!name.trim() || selected.length === 0 || loading}>
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </Modal>
  );
}
