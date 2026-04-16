export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_at: Date | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Recipient {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
}

export interface CampaignRecipient {
  campaign_id: string;
  recipient_id: string;
  status: 'pending' | 'sent' | 'failed';
  sent_at: Date | null;
  opened_at: Date | null;
}

export interface CampaignStats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
