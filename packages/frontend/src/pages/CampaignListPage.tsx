import { Link } from 'react-router-dom';
import { useListCampaigns } from '../hooks/useCampaigns';
import { StatusBadge } from '../components/campaigns/StatusBadge';
import { Plus, Loader2 } from 'lucide-react';

export function CampaignListPage() {
  const { data: campaigns, isLoading, error } = useListCampaigns();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Failed to load campaigns. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Link
          to="/campaigns/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Link>
      </div>

      {!campaigns?.length ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No campaigns yet</p>
          <Link
            to="/campaigns/new"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Create your first campaign
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign: any) => (
                <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {campaign.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{campaign.subject}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
