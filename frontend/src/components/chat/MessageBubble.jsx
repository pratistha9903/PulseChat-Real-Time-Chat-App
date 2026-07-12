import { useState } from 'react';
import { Check, CheckCheck, MoreHorizontal, Pencil, Trash2, Reply } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { formatMessageTime } from './DateSeparator';

function MessageStatus({ status }) {
  if (status === 'read') return <CheckCheck size={14} className="status-read" />;
  if (status === 'delivered') return <CheckCheck size={14} className="status-delivered" />;
  return <Check size={14} className="status-sent" />;
}

export default function MessageBubble({ message, isOwn, showAvatar, onReply, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content || '');

  if (message.deletedAt) {
    return (
      <div className={`msg-row ${isOwn ? 'msg-own' : 'msg-other'}`}>
        <div className="msg-deleted">
          <span>This message was deleted</span>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    if (editText.trim() && editText !== message.content) {
      onEdit(message.id, editText.trim());
    }
    setEditing(false);
    setMenuOpen(false);
  };

  return (
    <div
      className={`msg-row ${isOwn ? 'msg-own' : 'msg-other'}`}
      onMouseLeave={() => setMenuOpen(false)}
    >
      {!isOwn && showAvatar && (
        <Avatar
          name={message.displayName}
          color={message.avatarColor}
          size={32}
        />
      )}
      {!isOwn && !showAvatar && <div className="msg-avatar-spacer" />}

      <div className="msg-body">
        {!isOwn && showAvatar && (
          <span className="msg-sender">{message.displayName}</span>
        )}

        {message.replyContent && (
          <div className="msg-reply-preview">
            <span className="msg-reply-user">{message.replyUsername}</span>
            <span>{message.replyContent}</span>
          </div>
        )}

        {editing ? (
          <div className="msg-edit-form">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') setEditing(false);
              }}
              autoFocus
            />
            <div className="msg-edit-actions">
              <button onClick={() => setEditing(false)}>Cancel</button>
              <button className="primary" onClick={handleEdit}>Save</button>
            </div>
          </div>
        ) : (
          <div className={`msg-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
            {message.type === 'image' && message.imageUrl && (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${message.imageUrl}`}
                alt="Shared"
                className="msg-image"
                loading="lazy"
              />
            )}
            {message.content && <p>{message.content}</p>}
          </div>
        )}

        <div className="msg-meta">
          <span className="msg-time">{formatMessageTime(message.createdAt)}</span>
          {message.editedAt && <span className="msg-edited">edited</span>}
          {isOwn && <MessageStatus status={message.status} />}
        </div>
      </div>

      {!editing && (
        <div className="msg-actions">
          <button className="icon-btn sm" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="msg-menu">
              <button onClick={() => { onReply(message); setMenuOpen(false); }}>
                <Reply size={14} /> Reply
              </button>
              {isOwn && (
                <>
                  <button onClick={() => { setEditing(true); setMenuOpen(false); }}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button className="danger" onClick={() => { onDelete(message.id); setMenuOpen(false); }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
