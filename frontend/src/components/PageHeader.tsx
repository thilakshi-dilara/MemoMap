import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageHeader({ title, subtitle, action = true }: { title: string; subtitle?: React.ReactNode; action?: boolean }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <Link className="btn btn--primary btn--lg page-head__action" to="/memories/new"><Plus size={18} />Add Memory</Link>}
    </header>
  );
}
