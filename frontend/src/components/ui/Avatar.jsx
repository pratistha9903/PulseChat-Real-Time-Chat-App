import { getInitials } from '../../utils/avatar';

export default function Avatar({ name, color, size = 36, online, className = '' }) {
  return (
    <div className={`avatar-wrap ${className}`} style={{ width: size, height: size }}>
      <div
        className="avatar"
        style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.35 }}
        title={name}
      >
        {getInitials(name)}
      </div>
      {online !== undefined && (
        <span className={`avatar-status ${online ? 'online' : 'offline'}`} />
      )}
    </div>
  );
}
