import { StatusBadge } from './StatusBadge';

interface Recipient {
  email: string;
  name: string | null;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
}

export function RecipientTable({ recipients }: { recipients: Recipient[] }) {
  if (!recipients.length) {
    return <p className="text-sm text-gray-500">No recipients</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Sent At</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Opened At</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((r) => (
            <tr key={r.email} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-900">{r.email}</td>
              <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
              <td className="py-3 px-4 text-gray-500">
                {r.sent_at ? new Date(r.sent_at).toLocaleString() : '—'}
              </td>
              <td className="py-3 px-4 text-gray-500">
                {r.opened_at ? new Date(r.opened_at).toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
