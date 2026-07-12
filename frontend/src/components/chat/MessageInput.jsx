import { useState, useRef, useEffect } from 'react';
import { Send, Smile, ImagePlus, X } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function MessageInput({
  onSend,
  onTypingStart,
  onTypingStop,
  disabled,
  replyTo,
  onCancelReply,
}) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const typingRef = useRef(null);
  const isTyping = useRef(false);
  const fileRef = useRef(null);
  const { addToast } = useToast();

  const handleTyping = () => {
    if (!isTyping.current) {
      isTyping.current = true;
      onTypingStart?.();
    }
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      isTyping.current = false;
      onTypingStop?.();
    }, 1500);
  };

  const submit = (payload) => {
    onSend(payload);
    setText('');
    isTyping.current = false;
    clearTimeout(typingRef.current);
    onTypingStop?.();
    onCancelReply?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    submit({ content: trimmed, replyTo: replyTo?.id });
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image must be under 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const { imageUrl } = await api.uploadImage(file);
      submit({ content: text.trim(), type: 'image', imageUrl, replyTo: replyTo?.id });
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  useEffect(() => () => clearTimeout(typingRef.current), []);

  return (
    <div className="msg-input-area">
      {replyTo && (
        <div className="reply-bar">
          <div>
            <span>Replying to {replyTo.displayName || replyTo.username}</span>
            <p>{replyTo.content}</p>
          </div>
          <button className="icon-btn" onClick={onCancelReply}>
            <X size={16} />
          </button>
        </div>
      )}

      <form className="msg-input-form" onSubmit={handleSubmit}>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImage} />

        <button
          type="button"
          className="icon-btn"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading}
          title="Upload image"
        >
          <ImagePlus size={20} />
        </button>

        <div className="msg-input-wrap">
          <input
            type="text"
            placeholder={uploading ? 'Uploading...' : 'Type a message...'}
            value={text}
            onChange={(e) => { setText(e.target.value); handleTyping(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
            }}
            disabled={disabled || uploading}
            maxLength={2000}
          />

          <div className="emoji-wrap">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowEmoji(!showEmoji)}
            >
              <Smile size={20} />
            </button>
            {showEmoji && (
              <EmojiPicker
                onSelect={(emoji) => setText((t) => t + emoji)}
                onClose={() => setShowEmoji(false)}
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          className="send-btn"
          disabled={!text.trim() || disabled || uploading}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
