import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase, testConnection } from '../lib/supabase';

// Types based on the database schema
export type Campaign = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed' | 'cancelled';
  content_type: 'ugc' | 'clipping';
  earnings_per_3k_views: number;
  total_budget: number;
  spent_budget: number;
  user_id: string;
  file_links: string[];
  logo_url?: string;
  thumbnail_url?: string;
  has_competition: boolean;
  prizes?: any;
};

export type Submission = {
  id: string;
  campaign_id: string;
  creator_id: string;
  social_media_link: string;
  video_links: string[];
  submitted_at: string;
  updated_at: string;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  earnings: number;
  competition_rank?: number | null;
  competition_prize?: number | null;
};

type CampaignStatistics = {
  totalSpent: number;
  totalViews: number;
  totalCreators: number;
};

type CampaignContextType = {
  campaigns: Campaign[];
  submissions: Submission[];
  getCampaign: (id: string) => Campaign | null;
  getCampaigns: () => Promise<void>;
  getSubmissionsByCampaign: (campaignId: string) => Submission[];
  getSubmissionsByCreator: (creatorId: string) => Submission[];
  getCampaignsForCreator: (creatorId: string) => Campaign[];
  getTotalEarningsByCreator: (creatorId: string) => number;
  getCampaignStatistics: (campaignId: string) => CampaignStatistics;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => Promise<Campaign>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<Campaign | null>;
  deleteCampaign: (id: string) => Promise<void>;
  createSubmission: (submission: Omit<Submission, 'id' | 'submitted_at' | 'updated_at'>) => Promise<Submission>;
  updateSubmission: (id: string, updates: Partial<Submission>) => Promise<Submission | null>;
  deleteSubmission: (id: string) => Promise<void>;
};

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial data fetch with connection retry
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Test connection first
        const isConnected = await testConnection();
        if (!isConnected) {
          throw new Error('Failed to establish connection to Supabase');
        }

        // Fetch campaigns
        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });

        if (campaignsError) throw campaignsError;
        setCampaigns(campaignsData || []);

        // Fetch submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (submissionsError) throw submissionsError;
        setSubmissions(submissionsData || []);
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        // Retry connection after 2 seconds
        setTimeout(() => {
          if (!isInitialized) {
            fetchData();
          }
        }, 2000);
      }
    };

    fetchData();
  }, [isInitialized]);

  const getCampaigns = useCallback(async () => {
    try {
      console.log('Fetching campaigns...');
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Campaigns fetched successfully:', data?.length || 0, 'campaigns');
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }, []);

  const getCampaign = useCallback((id: string) => {
    return campaigns.find(campaign => campaign.id === id) || null;
  }, [campaigns]);

  const getSubmissionsByCampaign = useCallback((campaignId: string) => {
    return submissions.filter(submission => submission.campaign_id === campaignId);
  }, [submissions]);

  const getSubmissionsByCreator = useCallback((creatorId: string) => {
    return submissions.filter(submission => submission.creator_id === creatorId);
  }, [submissions]);

  const getCampaignsForCreator = useCallback((creatorId: string) => {
    const creatorSubmissions = getSubmissionsByCreator(creatorId);
    const campaignIds = [...new Set(creatorSubmissions.map(s => s.campaign_id))];
    return campaigns.filter(campaign => campaignIds.includes(campaign.id));
  }, [campaigns, getSubmissionsByCreator]);

  const getTotalEarningsByCreator = useCallback((creatorId: string) => {
    return getSubmissionsByCreator(creatorId)
      .reduce((sum, submission) => sum + (submission.earnings || 0), 0);
  }, [getSubmissionsByCreator]);

  const getCampaignStatistics = useCallback((campaignId: string): CampaignStatistics => {
    const campaignSubmissions = getSubmissionsByCampaign(campaignId);
    const totalSpent = campaignSubmissions.reduce((sum, submission) => sum + (submission.earnings || 0), 0);
    const totalViews = campaignSubmissions.reduce((sum, submission) => sum + (submission.views || 0), 0);
    const uniqueCreators = new Set(campaignSubmissions.map(submission => submission.creator_id));
    
    return {
      totalSpent,
      totalViews,
      totalCreators: uniqueCreators.size
    };
  }, [getSubmissionsByCampaign]);

  const createCampaign = useCallback(async (campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Creating new campaign:', campaign);
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaign])
        .select()
        .single();

      if (error) throw error;
      console.log('Campaign created successfully:', data);
      setCampaigns(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }, []);

  const updateCampaign = useCallback(async (id: string, updates: Partial<Campaign>) => {
    try {
      console.log('Updating campaign:', id, updates);
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log('No campaign found with ID:', id);
        return null;
      }

      const updatedCampaign = data[0];
      console.log('Campaign updated successfully:', updatedCampaign);
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updatedCampaign } : c));
      return updatedCampaign;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }, []);

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      console.log('Deleting campaign:', id);
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('Campaign deleted successfully');
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }, []);

  const createSubmission = useCallback(async (submission: Omit<Submission, 'id' | 'submitted_at' | 'updated_at'>) => {
    try {
      console.log('Creating new submission:', submission);
      const { data, error } = await supabase
        .from('submissions')
        .insert([submission])
        .select()
        .single();

      if (error) throw error;
      console.log('Submission created successfully:', data);
      setSubmissions(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }, []);

  const updateSubmission = useCallback(async (id: string, updates: Partial<Submission>) => {
    try {
      console.log('Updating submission:', {
        id,
        updates,
        currentSubmission: submissions.find(s => s.id === id)
      });

      const { data, error } = await supabase
        .from('submissions')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Database error updating submission:', error);
        throw error;
      }
      
      console.log('Database response:', data);

      if (!data || data.length === 0) {
        console.warn('No submission found with ID:', id);
        return null;
      }

      const updatedSubmission = data[0];
      console.log('Submission updated successfully:', updatedSubmission);

      setSubmissions(prev => {
        const newSubmissions = prev.map(s => s.id === id ? { ...s, ...updatedSubmission } : s);
        console.log('Updated submissions state:', newSubmissions);
        return newSubmissions;
      });

      return updatedSubmission;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }, [submissions]);

  const deleteSubmission = useCallback(async (id: string) => {
    try {
      console.log('Deleting submission:', id);
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('Submission deleted successfully');
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }, []);

  return (
    <CampaignContext.Provider value={{
      campaigns,
      submissions,
      getCampaign,
      getCampaigns,
      getSubmissionsByCampaign,
      getSubmissionsByCreator,
      getCampaignsForCreator,
      getTotalEarningsByCreator,
      getCampaignStatistics,
      createCampaign,
      updateCampaign,
      deleteCampaign,
      createSubmission,
      updateSubmission,
      deleteSubmission,
    }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};