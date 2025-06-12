import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

try {
  new URL(supabaseUrl);
} catch (e) {
  throw new Error('Invalid Supabase URL format');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
  db: {
    schema: 'public',
  },
});

// Test the connection and retry if needed
export const testConnection = async (retries = 3, delay = 1000): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.from('campaigns').select('count');
      if (error) {
        console.warn(`Supabase connection attempt ${i + 1} failed:`, error.message);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
      console.log('Supabase connection test successful');
      return true;
    } catch (err) {
      if (i === retries - 1) {
        console.error('Failed to initialize Supabase client:', err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    }
  }
  return false;
};

// Initialize connection test
testConnection();

export type DbCampaign = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  created_at: string;
  status: 'active' | 'completed' | 'cancelled';
  content_type: 'ugc' | 'clipping';
  earnings_per_3k_views: number;
  total_budget: number;
  spent_budget: number;
  user_id: string;
  file_links: string[];
  logo_url: string | null;
  thumbnail_url: string | null;
  has_competition: boolean;
  prizes: {
    first: string;
    second: string;
    third: string;
    fourth: string;
    fifth: string;
  } | null;
};

export type DbSubmission = {
  id: string;
  campaign_id: string;
  creator_id: string;
  social_media_link: string;
  video_links: string[];
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  earnings: number;
  competition_rank: number | null;
  competition_prize: number | null;
};