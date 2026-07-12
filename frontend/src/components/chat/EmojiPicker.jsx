const EMOJIS = [
  '😀', '😂', '🥰', '😎', '🤔', '👍', '👋', '🎉', '❤️', '🔥',
  '✨', '💯', '👏', '🙌', '💪', '🤝', '✅', '⭐', '💡', '🚀',
  '😊', '😍', '🤣', '😭', '🥺', '😤', '🤗', '🫡', '💀', '🙏',
  '☕', '🍕', '🎮', '📱', '💻', '📝', '📎', '🔗', '⏰', '🌍',
];

export default function EmojiPicker({ onSelect, onClose }) {
  return (
    <div className="emoji-picker">
      <div className="emoji-grid">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="emoji-btn"
            onClick={() => { onSelect(emoji); onClose?.(); }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
