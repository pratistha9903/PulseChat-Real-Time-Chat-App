export function ConversationSkeleton() {
  return (
    <div className="skeleton-conversation">
      <div className="skeleton skeleton-circle" />
      <div className="skeleton-conversation-text">
        <div className="skeleton skeleton-line w-60" />
        <div className="skeleton skeleton-line w-80" />
      </div>
    </div>
  );
}

export function MessageSkeleton({ isOwn }) {
  return (
    <div className={`skeleton-message ${isOwn ? 'skeleton-own' : ''}`}>
      {!isOwn && <div className="skeleton skeleton-circle sm" />}
      <div className="skeleton-message-body">
        <div className={`skeleton skeleton-bubble ${isOwn ? 'own' : ''}`} />
      </div>
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="skeleton-message-list">
      <MessageSkeleton />
      <MessageSkeleton isOwn />
      <MessageSkeleton />
      <MessageSkeleton isOwn />
      <MessageSkeleton />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="skeleton-sidebar">
      {Array.from({ length: 6 }).map((_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  );
}
