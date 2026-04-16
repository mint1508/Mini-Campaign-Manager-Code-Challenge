import { cn } from '../../lib/utils';

const variants: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  sent: 'bg-green-100 text-green-700 border-green-200',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variants[status] || variants.draft,
    )}>
      {status}
    </span>
  );
}
