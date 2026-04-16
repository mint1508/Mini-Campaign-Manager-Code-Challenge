import { Users, Send, AlertTriangle, Eye } from 'lucide-react';

interface Stats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
}

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function CampaignStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard label="Total" value={stats.total} icon={Users} color="bg-gray-100 text-gray-600" />
      <StatCard label="Sent" value={stats.sent} icon={Send} color="bg-blue-100 text-blue-600" />
      <StatCard label="Failed" value={stats.failed} icon={AlertTriangle} color="bg-red-100 text-red-600" />
      <StatCard label="Opened" value={stats.opened} icon={Eye} color="bg-green-100 text-green-600" />
      <StatCard
        label="Send Rate"
        value={`${(stats.send_rate * 100).toFixed(1)}%`}
        icon={Send}
        color="bg-indigo-100 text-indigo-600"
      />
      <StatCard
        label="Open Rate"
        value={`${(stats.open_rate * 100).toFixed(1)}%`}
        icon={Eye}
        color="bg-emerald-100 text-emerald-600"
      />
    </div>
  );
}
