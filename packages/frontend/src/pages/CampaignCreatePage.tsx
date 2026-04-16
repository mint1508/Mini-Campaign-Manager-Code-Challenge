import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCampaign } from '../hooks/useCampaigns';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CampaignCreatePage() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const createCampaign = useCreateCampaign();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emails = recipientEmails
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (!emails.length) {
      setError('At least one recipient email is required');
      return;
    }

    try {
      const campaign = await createCampaign.mutateAsync({
        name,
        subject,
        body,
        recipientEmails: emails,
      });
      navigate(`/campaigns/${campaign.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create campaign');
    }
  };

  return (
    <div className="max-w-2xl">
      <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Campaign</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Spring Sale Newsletter"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Don't miss our Spring Sale!"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your campaign email content here..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Emails
          </label>
          <textarea
            value={recipientEmails}
            onChange={(e) => setRecipientEmails(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter emails separated by commas or newlines&#10;e.g., alice@example.com, bob@example.com"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate emails with commas or newlines
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={createCampaign.isPending}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {createCampaign.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Campaign
          </button>
          <Link
            to="/campaigns"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
