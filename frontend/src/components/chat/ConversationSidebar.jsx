import { MessageCircle, Plus, Search, Bell, Users, UserPlus } from 'lucide-react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import Avatar from '../ui/Avatar';
import { SidebarSkeleton } from '../ui/Skeleton';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export default function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onNewGroup,
  onSearch,
  onNotifications,
  notificationCount,
  user,
  loading,
  onlineUsers,
}) {
  const onlineIds = new Set(onlineUsers.map((u) => u.id));

  return (
    <aside className="conv-sidebar">
      <div className="conv-sidebar-header">
        <div className="sidebar-brand">
          <MessageCircle size={22} />
          <span>Chats</span>
        </div>
        <div className="sidebar-actions">
          <button className="icon-btn" onClick={onNotifications} title="Notifications">
            <Bell size={18} />
            {notificationCount > 0 && <span className="notif-dot">{notificationCount}</span>}
          </button>
          <button className="icon-btn" onClick={onSearch} title="Search"><Search size={18} /></button>
          <button className="icon-btn" onClick={onNewGroup} title="New group"><Users size={18} /></button>
          <button className="icon-btn" onClick={onNewChat} title="New chat"><UserPlus size={18} /></button>
        </div>
      </div>

      <div className="conv-list">
        {loading ? (
          <SidebarSkeleton />
        ) : conversations.length === 0 ? (
          <div className="conv-empty">
            <MessageCircle size={40} strokeWidth={1.5} />
            <h3>No conversations yet</h3>
            <p>Start a private chat or create a group</p>
            <button className="btn-primary sm" onClick={onNewChat}>Start Chatting</button>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              active={conv.id === activeId}
              onClick={() => onSelect(conv)}
              userId={user.id}
              isOnline={conv.type === 'dm' && conv.members?.some(
                (m) => m.id !== user.id && onlineIds.has(m.id)
              )}
            />
          ))
        )}
      </div>

      <div className="sidebar-user">
        <Avatar name={user.displayName} color={user.avatarColor} size={32} online />
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{user.displayName}</span>
          <span className="sidebar-user-handle">@{user.username}</span>
        </div>
      </div>
    </aside>
  );
}

function ConversationItem({ conv, active, onClick, userId, isOnline }) {
  const isPrivate = conv.type === 'dm';
  const other = isPrivate ? conv.members?.find((m) => m.id !== userId) : null;
  const isGroup = conv.type === 'group';

  return (
    <button className={`conv-item ${active ? 'active' : ''}`} onClick={onClick}>
      {isPrivate && other ? (
        <Avatar name={other.displayName} color={other.avatarColor} size={44} online={isOnline} />
      ) : (
        <Avatar
          name={conv.displayName || conv.name}
          color={conv.avatarColor || '#6366f1'}
          size={44}
        />
      )}

      <div className="conv-item-body">
        <div className="conv-item-top">
          <span className="conv-item-name">
            {conv.displayName || conv.name}
            {isGroup && <span className="group-tag">Group</span>}
          </span>
          {conv.lastMessageAt && (
            <span className="conv-item-time">{formatTime(conv.lastMessageAt)}</span>
          )}
        </div>
        <div className="conv-item-bottom">
          <span className="conv-item-preview">
            {conv.lastMessage || 'No messages yet'}
          </span>
          {conv.unreadCount > 0 && (
            <span className="unread-badge">{conv.unreadCount}</span>
          )}
        </div>
      </div>
    </button>
  );
}
