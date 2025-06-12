import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../../contexts/CampaignContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Calendar, 
  Users, 
  ExternalLink, 
  AlertCircle, 
  DollarSign, 
  Eye, 
  TrendingUp,
  Trash2, 
  Link as LinkIcon,
  Trophy,
  Clock,
  Tag,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Image,
  Download,
  Save,
  Instagram,
  Youtube
} from 'lucide-react';

type TabType = 'submissions' | 'competition' | 'requirements';

type ViewsUpdate = {
  submissionId: string;
  views: number;
};

const CampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCampaign, getSubmissionsByCampaign, updateCampaign, updateSubmission, getCampaignStatistics, deleteCampaign } = useCampaigns();
  
  const [activeTab, setActiveTab] = useState<TabType>('requirements');
  const campaign = getCampaign(id || '');
  const submissions = getSubmissionsByCampaign(id || '') || [];
  const statistics = campaign ? getCampaignStatistics(campaign.id) : null;
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingViewsUpdates, setPendingViewsUpdates] = useState<ViewsUpdate[]>([]);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editedBudget, setEditedBudget] = useState(campaign?.total_budget || 0);
  const [editedEarningsPerView, setEditedEarningsPerView] = useState(campaign?.earnings_per_1k_views || 0);

  const handleBudgetUpdate = async () => {
    if (!campaign) return;
    setError(null);
    setIsUpdating(true);
    
    try {
      await updateCampaign(campaign.id, {
        total_budget: editedBudget,
        earnings_per_1k_views: editedEarningsPerView
      });
      
      setIsEditingBudget(false);
    } catch (err) {
      setError('Failed to update campaign budget');
      console.error('Error updating campaign budget:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmissionStatusChange = async (submissionId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    setError(null);
    setIsUpdating(true);
    
    try {
      const result = await updateSubmission(submissionId, { 
        status: newStatus 
      });

      if (!result) {
        setError('Submission not found or could not be updated. Please refresh and try again.');
        return;
      }
    } catch (err) {
      setError('Failed to update submission status');
      console.error('Error updating submission status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewsChange = (submissionId: string, newViews: number) => {
    const updates = [...pendingViewsUpdates];
    const existingIndex = updates.findIndex(u => u.submissionId === submissionId);
    
    if (existingIndex >= 0) {
      updates[existingIndex].views = newViews;
    } else {
      updates.push({ submissionId, views: newViews });
    }
    
    setPendingViewsUpdates(updates);
  };

  const saveViewsUpdate = async (submissionId: string) => {
    setError(null);
    setIsUpdating(true);
    
    try {
      const update = pendingViewsUpdates.find(u => u.submissionId === submissionId);
      const submissionToUpdate = submissions.find(sub => sub.id === submissionId);
      
      if (!update || !campaign || !submissionToUpdate) return;

      const earnings = Math.floor(update.views / 1000) * campaign.earnings_per_1k_views;
      
      const result = await updateSubmission(submissionId, { 
        views: update.views,
        earnings
      });

      if (!result) {
        throw new Error('Failed to update submission');
      }
      
      setPendingViewsUpdates(prev => prev.filter(u => u.submissionId !== submissionId));
    } catch (err) {
      setError('Failed to update views');
      console.error('Error updating views:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const saveAllViewsUpdates = async () => {
    setError(null);
    setIsUpdating(true);
    
    try {
      for (const update of pendingViewsUpdates) {
        await saveViewsUpdate(update.submissionId);
      }
    } catch (err) {
      setError('Failed to update all views');
      console.error('Error updating all views:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const exportCampaignData = () => {
    if (!campaign || !submissions) return;

    const campaignData = {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      requirements: campaign.requirements,
      status: campaign.status,
      content_type: campaign.content_type,
      earnings_per_1k_views: campaign.earnings_per_1k_views,
      total_budget: campaign.total_budget,
      created_at: campaign.created_at,
      total_views: statistics?.totalViews || 0,
      total_spent: statistics?.totalSpent || 0,
      total_creators: statistics?.totalCreators || 0
    };

    const submissionsData = submissions.map(sub => ({
      id: sub.id,
      creator_id: sub.creator_id,
      status: sub.status,
      views: sub.views,
      earnings: sub.earnings,
      submitted_at: sub.submitted_at,
      social_media_link: sub.social_media_link,
      video_links: sub.video_links.join(', ')
    }));

    let csvContent = "Campaign Details\n";
    Object.entries(campaignData).forEach(([key, value]) => {
      csvContent += `${key},${value}\n`;
    });

    csvContent += "\nSubmissions\n";
    if (submissionsData.length > 0) {
      csvContent += Object.keys(submissionsData[0]).join(',') + '\n';
      submissionsData.forEach(sub => {
        csvContent += Object.values(sub).join(',') + '\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-${campaign.id}-export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getNetworkIcon = (network: string) => {
    switch (network) {
      case 'instagram':
        return <Instagram size={16} className="text-purple-500" />;
      case 'youtube':
        return <Youtube size={16} className="text-red-500" />;
      case 'tiktok':
        return <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center text-white text-xs font-bold">T</div>;
      default:
        return null;
    }
  };

  const getNetworkName = (network: string) => {
    switch (network) {
      case 'instagram':
        return 'Instagram';
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      default:
        return network;
    }
  };

  if (!campaign) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Campaign Not Found</h2>
        <p className="text-gray-600 mb-4">The campaign you are looking for does not exist.</p>
        <button
          onClick={() => navigate('/admin/campaigns')}
          className="bg-[#2b7de9] hover:bg-[#2b7de9]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: 'active' | 'completed' | 'cancelled') => {
    if (!campaign) return;
    setIsUpdating(true);
    setError(null);
    try {
      await updateCampaign(campaign.id, { status: newStatus });
    } catch (err) {
      setError('Failed to update campaign status');
      console.error('Error updating campaign:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    setError(null);
    try {
      await deleteCampaign(campaign.id);
      navigate('/admin/campaigns');
    } catch (err) {
      setError('Failed to delete campaign');
      console.error('Error deleting campaign:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const { theme } = useTheme();

  return (
    <div className={`max-w-6xl mx-auto ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/admin/campaigns')}
          className="text-[#2b7de9] hover:underline flex items-center"
        >
          ← Back to Campaigns
        </button>
        
        <div className="flex space-x-2">
          {pendingViewsUpdates.length > 0 && (
            <button
              onClick={saveAllViewsUpdates}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <Save size={16} className="mr-1" />
              Save Views
            </button>
          )}
          <button
            onClick={exportCampaignData}
            className="bg-[#2b7de9] hover:bg-[#2b7de9]/90 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center"
          >
            <Download size={16} className="mr-1" />
            Export Data
          </button>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            {campaign.thumbnail_url ? (
              <div className="relative h-64 bg-gray-100">
                <img
                  src={campaign.thumbnail_url}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center space-x-4 mb-3">
                    {campaign.logo_url ? (
                      <img
                        src={campaign.logo_url}
                        alt="Campaign Logo"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-lg">
                        <Image size={24} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold">{campaign.title}</h1>
                      <div className="flex items-center text-gray-200 text-sm">
                        <Calendar size={14} className="mr-1" />
                        <span>Created on {new Date(campaign.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-purple-500/80 text-white px-3 py-1 rounded-full text-sm">
                      {campaign.content_type === 'ugc' ? 'UGC' : 'Clipping'}
                    </span>
                    <span className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm">
                      Budget: ${campaign.total_budget}
                    </span>
                    {campaign.has_competition && (
                      <span className="bg-yellow-500/80 text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <Trophy size={14} className="mr-1" />
                        Competition
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`h-64 flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <Image size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500">No thumbnail available</p>
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <DollarSign className="text-green-500" size={24} />
                  <span className="text-xl font-semibold text-green-600">
                    ${campaign.earnings_per_1k_views}/1k views
                  </span>
                </div>
              </div>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{campaign.description}</p>
            </div>
          </div>

          <div className={`rounded-lg shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('requirements')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'requirements'
                      ? 'border-b-2 border-[#2b7de9] text-[#2b7de9]'
                      : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  <Info size={16} className="mr-2" />
                  Requirements
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'submissions'
                      ? 'border-b-2 border-[#2b7de9] text-[#2b7de9]'
                      : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                >
                  <CheckCircle2 size={16} className="mr-2" />
                  Submissions ({submissions.length})
                </button>
                {campaign.has_competition && (
                  <button
                    onClick={() => setActiveTab('competition')}
                    className={`px-6 py-4 text-sm font-medium flex items-center ${
                      activeTab === 'competition'
                        ? 'border-b-2 border-[#2b7de9] text-[#2b7de9]'
                        : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                    }`}
                  >
                    <Trophy size={16} className="mr-2" />
                    Competition
                  </button>
                )}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'requirements' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Requirements</h3>
                    <div className={`${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'} rounded-lg p-4`}>
                      <p className="whitespace-pre-wrap">{campaign.requirements}</p>
                    </div>
                  </div>

                  {/* Allowed Networks */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      Dozvoljene Mreže
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {campaign.allowed_networks?.map((network) => (
                        <div
                          key={network}
                          className={`flex items-center space-x-3 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                          {getNetworkIcon(network)}
                          <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                              {getNetworkName(network)}
                            </h4>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {network === 'instagram' && 'Stories, Reels, Posts'}
                              {network === 'tiktok' && 'Short Videos'}
                              {network === 'youtube' && 'Videos, Shorts'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {campaign.file_links && campaign.file_links.length > 0 && (
                    <div>
                      <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Campaign Files</h3>
                      <div className="space-y-2">
                        {campaign.file_links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                          >
                            <div className="flex items-center">
                              <LinkIcon size={16} className="text-[#2b7de9] mr-2" />
                              <span>{link.split('/').pop() || `File ${index + 1}`}</span>
                            </div>
                            <ExternalLink size={16} className="text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'submissions' && (
                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle size={48} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600">No submissions yet</p>
                    </div>
                  ) : (
                    submissions.map(submission => (
                      <div key={submission.id} className={`border rounded-lg p-4 ${theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Creator #{submission.creator_id.slice(0, 8)}</h4>
                            <p className="text-sm text-gray-500">
                              Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select
                              value={submission.status}
                              onChange={(e) => handleSubmissionStatusChange(submission.id, e.target.value as 'pending' | 'approved' | 'rejected')}
                              className={`px-2 py-1 text-sm rounded-md border ${
                                submission.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : submission.status === 'approved'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }`}
                              disabled={isUpdating}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">Views</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={pendingViewsUpdates.find(u => u.submissionId === submission.id)?.views ?? submission.views}
                                onChange={(e) => handleViewsChange(submission.id, Number(e.target.value))}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                                min="0"
                                disabled={isUpdating}
                              />
                              {pendingViewsUpdates.find(u => u.submissionId === submission.id) && (
                                <button
                                  onClick={() => saveViewsUpdate(submission.id)}
                                  disabled={isUpdating}
                                  className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md transition-colors"
                                >
                                  <Save size={16} />
                                </button>
                              )}
                              <Eye size={16} className="text-gray-500" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">Earnings</label>
                            <div className="flex items-center">
                              <span className="text-lg font-semibold text-green-600">
                                ${submission.earnings}
                              </span>
                              <TrendingUp size={16} className="ml-2 text-green-500" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {submission.video_links.map((link, index) => (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-between p-2 rounded transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-600 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                            >
                              <span className="text-gray-700">Video {index + 1}</span>
                              <ExternalLink size={14} className="text-gray-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'competition' && campaign.has_competition && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <Trophy size={24} className="text-yellow-600 mr-3" />
                      <h3 className="text-lg font-semibold text-yellow-800">Prize Pool</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <span className="text-2xl">🥇</span>
                        <p className="font-semibold text-green-600">${campaign.prizes?.first}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl">🥈</span>
                        <p className="font-semibold text-green-600">${campaign.prizes?.second}</p>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl">🥉</span>
                        <p className="font-semibold text-green-600">${campaign.prizes?.third}</p>
                      </div>
                    </div>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy size={48} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600">No submissions in the competition yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...submissions]
                        .sort((a, b) => b.views - a.views)
                        .map((submission, index) => (
                          <div
                            key={submission.id}
                            className={`border rounded-lg p-4 ${
                              index < 3 ? 'bg-yellow-50 border-yellow-200' : `${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500 text-white font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                    Creator #{submission.creator_id.slice(0, 8)}
                                  </p>
                                  <div className="flex items-center mt-1 text-sm text-gray-600">
                                    <Eye size={14} className="mr-1" />
                                    {submission.views.toLocaleString()} views
                                  </div>
                                </div>
                              </div>
                              {index < 3 && campaign.prizes && (
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">Prize</p>
                                  <p className="font-bold text-green-600">
                                    ${campaign.prizes[['first', 'second', 'third'][index]]}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Campaign Budget</h3>
              {!isEditingBudget ? (
                <button
                  onClick={() => {
                    setIsEditingBudget(true);
                    setEditedBudget(campaign.total_budget);
                    setEditedEarningsPerView(campaign.earnings_per_1k_views);
                  }}
                  className="text-[#2b7de9] hover:text-[#2b7de9]/80 text-sm"
                >
                  Edit Budget
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditingBudget(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBudgetUpdate}
                    disabled={isUpdating}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
            
            {isEditingBudget ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Total Budget ($)
                  </label>
                  <input
                    type="number"
                    value={editedBudget}
                    onChange={(e) => setEditedBudget(Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Earnings per 1k Views ($)
                  </label>
                  <input
                    type="number"
                    value={editedEarningsPerView}
                    onChange={(e) => setEditedEarningsPerView(Number(e.target.value))}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'border-gray-300'}`}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Budget</p>
                  <div className="flex items-center mt-1">
                    <DollarSign className="text-green-500 mr-2" size={20} />
                    <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      ${campaign.total_budget}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Spent Budget</p>
                  <div className="flex items-center mt-1">
                    <DollarSign className="text-red-500 mr-2" size={20} />
                    <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      ${statistics?.totalSpent || 0}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining Budget</p>
                  <div className="flex items-center mt-1">
                    <DollarSign className="text-purple-500 mr-2" size={20} />
                    <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      ${campaign.total_budget - (statistics?.totalSpent || 0)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Earnings per 1k Views</p>
                  <div className="flex items-center mt-1">
                    <Eye className="text-blue-500 mr-2" size={20} />
                    <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      ${campaign.earnings_per_1k_views}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Campaign Status</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleStatusChange('active')}
                disabled={campaign.status === 'active' || isUpdating}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  campaign.status === 'active'
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                disabled={campaign.status === 'completed' || isUpdating}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  campaign.status === 'completed'
                    ? 'bg-blue-100 text-blue-800 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={campaign.status === 'cancelled' || isUpdating}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  campaign.status === 'cancelled'
                    ? 'bg-red-100 text-red-800 cursor-default'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Campaign Statistics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <div className="flex items-center mt-1">
                  <Eye className="text-blue-500 mr-2" size={20} />
                  <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {statistics?.totalViews.toLocaleString() || 0}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <div className="flex items-center mt-1">
                  <DollarSign className="text-green-500 mr-2" size={20} />
                  <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    ${statistics?.totalSpent || 0}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Creators</p>
                <div className="flex items-center mt-1">
                  <Users className="text-indigo-500 mr-2" size={20} />
                  <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {statistics?.totalCreators || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 max-w-md w-full mx-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <h3 className="text-lg font-bold mb-4">Delete Campaign</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this campaign? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 border rounded-md ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                Delete Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetails;