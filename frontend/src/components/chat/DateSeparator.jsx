import { format, isToday, isYesterday, parseISO, isSameDay } from 'date-fns';

export function formatMessageTime(dateString) {
  const date = parseISO(dateString);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
  return format(date, 'MMM d, h:mm a');
}

export function shouldShowDateSeparator(messages, index) {
  if (index === 0) return true;
  const current = parseISO(messages[index].createdAt);
  const previous = parseISO(messages[index - 1].createdAt);
  return !isSameDay(current, previous);
}

export function formatDateSeparator(dateString) {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

export default function DateSeparator({ date }) {
  return (
    <div className="date-separator">
      <span>{formatDateSeparator(date)}</span>
    </div>
  );
}
