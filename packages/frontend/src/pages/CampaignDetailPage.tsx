import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useCampaign,
  useCampaignStats,
  useScheduleCampaign,
  useSendCampaign,
  useDeleteCampaign,
} from '../hooks/useCampaigns';
import { StatusBadge } from '../components/campaigns/StatusBadge';
import { CampaignStats } from '../components/campaigns/CampaignStats';
import { RecipientTable } from '../components/campaigns/RecipientTable';
import { ArrowLeft, Calendar, Send, Trash2, Loader2 } from 'lucide-react';

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign, isLoading, error } = useCampaign(id!);
  const { data: stats } = useCampaignStats(id!);
  const scheduleCampaign = useScheduleCampaign();
  const sendCampaign = useSendCampaign();
  const deleteCampaign = useDeleteCampaign();
  const [scheduleDate, setScheduleDate] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [actionError, setActionError] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Campaign not found.
      </div>
    );
  }

  const handleSchedule = async () => {
    setActionError('');
    try {
      await scheduleCampaign.mutateAsync({
        id: id!,
        scheduledAt: new Date(scheduleDate).toISOString(),
      });
      setShowSchedule(false);
      setScheduleDate('');
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to schedule');
    }
  };

  const handleSend = async () => {
    setActionError('');
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) return;
    try {
      await sendCampaign.mutateAsync(id!);
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to send');
    }
  };

  const handleDelete = async () => {
    setActionError('');
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await deleteCampaign.mutateAsync(id!);
      navigate('/campaigns');
    } catch (err: any) {
      setActionError(err.response?.data?.error?.message || 'Failed to delete');
    }
  };

  const isDraft = campaign.status === 'draft';
  const isSent = campaign.status === 'sent';

  return (
    <div>
      <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-gray-500 text-sm">Subject: {campaign.subject}</p>
          {campaign.scheduled_at && (
            <p className="text-gray-500 text-sm mt-1">
              Scheduled for: {new Date(campaign.scheduled_at).toLocaleString()}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isDraft && (
            <>
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
                Schedule
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteCampaign.isPending}
                className="inline-flex items-center gap-1 px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
          {!isSent && (
            <button
              onClick={handleSend}
              disabled={sendCampaign.isPending}
              className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 cursor-pointer"
            >
              {sendCampaign.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Now
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Schedule picker */}
      {showSchedule && (
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <button
            onClick={handleSchedule}
            disabled={!scheduleDate || scheduleCampaign.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {scheduleCampaign.isPending ? 'Scheduling...' : 'Confirm Schedule'}
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Campaign Stats</h2>
          <CampaignStats stats={stats} />
        </div>
      )}

      {/* Email Body */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Email Body</h2>
        <div className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.body}</div>
      </div>

      {/* Recipients */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Recipients ({campaign.recipients?.length || 0})
        </h2>
        <RecipientTable recipients={campaign.recipients || []} />
      </div>
    </div>
  );
}
