import { useId } from 'react';
import { Link } from 'react-router-dom';

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg className={className} width={size} height={size * 1.12} viewBox="0 0 64 72" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#8467f5" />
          <stop offset="1" stopColor="#4f30cc" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="66.5" rx="15" ry="3.6" fill="#b9a9f5" opacity="0.55" />
      <path d="M32 2C17.6 2 6 13.3 6 27.4c0 17.2 20.2 33.5 24.3 36.6a2.8 2.8 0 0 0 3.4 0C37.8 60.9 58 44.6 58 27.4 58 13.3 46.4 2 32 2z" fill={`url(#${id}g)`} />
      <path d="M14.5 37.5 27 20.5l6 7.6 4.6-5.6 11.9 15z" fill="#fff" />
      <path d="M27 20.5l-4.3 5.9 2.9-1.1 1.6 1.8 1.9-1.6 3 .9z" fill="#cfc4fb" />
    </svg>
  );
}

export function Logo({ to = '/', stacked = false, className = '' }: { to?: string; stacked?: boolean; className?: string }) {
  return (
    <Link to={to} className={`logo ${stacked ? 'logo--stacked' : ''} ${className}`} aria-label="MemoMap home">
      <LogoMark size={stacked ? 64 : 36} />
      <span className="logo__word">
        Memo<span>Map</span>
      </span>
      {stacked && <small className="logo__tag">Your Memories<br />on a Map</small>}
    </Link>
  );
}
