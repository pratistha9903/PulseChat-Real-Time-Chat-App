import { Users, Circle } from 'lucide-react';
import Avatar from '../ui/Avatar';

export default function MembersPanel({ members, onlineUsers, currentUser, onStartDm }) {
  const onlineIds = new Set(onlineUsers.map((u) => u.id));

  return (
    <aside className="members-panel">
      <div className="panel-header">
        <Users size={16} />
        <h3>Members</h3>
        <span className="panel-count">{members.length}</span>
      </div>

      <div className="panel-section">
        <h4>Online — {onlineUsers.length}</h4>
        <ul className="member-list">
          {onlineUsers.map((u) => (
            <li key={u.id} className="member-item">
              <Avatar name={u.displayName} color={u.avatarColor} size={30} online />
              <span className="member-name">
                {u.displayName}
                {u.id === currentUser.id && <span className="you-tag">you</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-section">
        <h4>All Members</h4>
        <ul className="member-list">
          {members.map((m) => (
            <li key={m.id} className="member-item clickable" onClick={() => m.id !== currentUser.id && onStartDm(m.id)}>
              <Avatar
                name={m.displayName}
                color={m.avatarColor}
                size={30}
                online={onlineIds.has(m.id)}
              />
              <span className="member-name">{m.displayName}</span>
              {!onlineIds.has(m.id) && m.lastSeen && (
                <span className="member-offline">offline</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
