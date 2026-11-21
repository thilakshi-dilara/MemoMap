import { AlertCircle, MapPinPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LogoMark } from './Logo';

export function PageLoader({ label = 'Loading your memories…' }: { label?: string }) {
  return (
    <div className="state state--loading" role="status">
      <LogoMark size={44} className="state__pin" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state state--error" role="alert">
      <AlertCircle />
      <b>Something went wrong</b>
      <span>{message}</span>
      {onRetry && <button className="btn btn--ghost" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ title, text, action = true }: { title: string; text: string; action?: boolean }) {
  return (
    <div className="state state--empty">
      <MapPinPlus />
      <b>{title}</b>
      <span>{text}</span>
      {action && <Link className="btn btn--primary" to="/memories/new">Add your first memory</Link>}
    </div>
  );
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => <span key={index} />)}
    </div>
  );
}
