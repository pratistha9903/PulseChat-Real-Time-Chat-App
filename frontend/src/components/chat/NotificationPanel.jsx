import { Bell, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { format, parseISO, isToday } from 'date-fns';

export default function NotificationPanel({ onSelectConversation, onClose }) {
  const { notifications, markAllRead, clearNotifications } = useNotifications();

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3><Bell size={16} /> Notifications</h3>
        <div>
          {notifications.length > 0 && (
            <button className="text-btn" onClick={markAllRead}>Mark all read</button>
          )}
          <button className="icon-btn sm" onClick={onClose}><X size={16} /></button>
        </div>
      </div>

      <div className="notification-list">
        {notifications.length === 0 && (
          <p className="notification-empty">No notifications yet</p>
        )}
        {notifications.map((n) => (
          <button
            key={n.id}
            className={`notification-item ${n.read ? '' : 'unread'}`}
            onClick={() => {
              onSelectConversation?.(n.conversationId);
              onClose();
            }}
          >
            <div className="notification-dot" />
            <div>
              <strong>{n.title}</strong>
              <p>{n.body}</p>
              <span>{formatTime(n.timestamp)}</span>
            </div>
          </button>
        ))}
      </div>

      {notifications.length > 0 && (
        <button className="text-btn clear-btn" onClick={clearNotifications}>
          Clear all
        </button>
      )}
    </div>
  );
}

function formatTime(ts) {
  const date = typeof ts === 'string' ? parseISO(ts) : new Date(ts);
  return isToday(date) ? format(date, 'h:mm a') : format(date, 'MMM d, h:mm a');
}
