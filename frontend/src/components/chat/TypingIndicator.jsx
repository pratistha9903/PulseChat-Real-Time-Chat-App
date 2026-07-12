export default function TypingIndicator({ users }) {
  if (!users?.length) return null;

  let text;
  if (users.length === 1) text = `${users[0].displayName} is typing`;
  else if (users.length === 2) text = `${users[0].displayName} and ${users[1].displayName} are typing`;
  else text = `${users.length} people are typing`;

  return (
    <div className="typing-bar">
      <div className="typing-dots"><span /><span /><span /></div>
      <span>{text}</span>
    </div>
  );
}
