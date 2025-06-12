import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../../contexts/CampaignContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

import { 
  Calendar, 
  Users, 
  ExternalLink, 
  AlertCircle, 
  DollarSign, 
  Eye, 
  TrendingUp,
  Link as LinkIcon,
  Trophy,
  Image,
  Info,
  Plus,
  X
} from 'lucide-react';

type TabType = 'requirements' | 'submissions' | 'competition';

type VideoSubmission = {
  platform: string;
  url: string;
};

const CampaignSubmission = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCampaign, getSubmissionsByCreator, getCampaignStatistics, getSubmissionsByCampaign, createSubmission } = useCampaigns();
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<TabType>('requirements');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [videoSubmission, setVideoSubmission] = useState<VideoSubmission>({
    platform: '',
    url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const campaign = getCampaign(id || '');
  const userSubmissions = user ? getSubmissionsByCreator(user.id).filter(sub => sub.campaign_id === id) : [];
  const allSubmissions = getSubmissionsByCampaign(id || '');
  const statistics = campaign ? getCampaignStatistics(campaign.id) : null;

  const validateSubmission = () => {
    if (!videoSubmission.platform || !videoSubmission.url.trim()) {
      setError(t('errors.fillAllFields'));
      return false;
    }

    try {
      new URL(videoSubmission.url);
      return true;
    } catch {
      setError(t('errors.invalidUrl'));
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSubmission()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!campaign || !user) {
        setError(t('errors.invalidData'));
        return;
      }
      
      await createSubmission({
        campaign_id: campaign.id,
        creator_id: user.id,
        social_media_link: videoSubmission.url,
        video_links: [videoSubmission.url],
        status: 'pending',
        views: 0,
        earnings: 0
      });

      setShowSubmitModal(false);
      setVideoSubmission({ platform: '', url: '' });
    } catch (err) {
      setError(t('errors.submissionFailed'));
      console.error('Error submitting video:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;
  
  if (!campaign) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">{t('campaigns.details.title')}</h2>
        <p className="text-gray-600 mb-4">{t('campaigns.noCampaigns')}</p>
        <button
          onClick={() => navigate('/creator/available')}
          className="bg-[#2b7de9] hover:bg-[#2b7de9]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          {t('common.back')} {t('campaigns.title')}
        </button>
      </div>
    );
  }

  const sortedSubmissions = [...allSubmissions]
    .sort((a, b) => b.views - a.views)
    .map((submission, index) => ({
      ...submission,
      rank: index + 1,
      prize: campaign.prizes?.[
        ['first', 'second', 'third'][index] || ''
      ]
    }));
    console.log(theme)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/creator/available')}
          className="text-[#2b7de9] hover:underline flex items-center"
        >
          ← Back to Available Campaigns
        </button>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          {t('submissions.new')}
        </button>
      </div>

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
                        <span>{t('common.createdOn')} {new Date(campaign.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-purple-500/80 text-white px-3 py-1 rounded-full text-sm">
                      {campaign.content_type === 'ugc' ? 'UGC' : 'Clipping'}
                    </span>
                    <span className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm">
                      {t('campaigns.details.budget.label')}: ${campaign.total_budget}
                    </span>
                    {campaign.has_competition && (
                      <span className="bg-yellow-500/80 text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <Trophy size={14} className="mr-1" />
                        {t('campaigns.competition.title')}
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
                    ${campaign.earnings_per_3k_views}/3k views
                  </span>
                </div>
              </div>
              <p className={`${theme === 'dark' ? 'text-white-300' : 'text-gray-700'}`}>{campaign.description}</p>
            </div>
          </div>

          <div className={` shadow-md overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('requirements')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'requirements'
                      ? 'border-b-2 border-[#2b7de9] text-[#2b7de9]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Info size={16} className="mr-2" />
                  {t('campaigns.details.requirements')}
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`px-6 py-4 text-sm font-medium flex items-center ${
                    activeTab === 'submissions'
                      ? 'border-b-2 border-[#2b7de9] text-[#2b7de9]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Eye size={16} className="mr-2" />
                  {t('submissions.title')} ({userSubmissions.length})
                </button>
                {campaign.has_competition && (
                  <button
                    onClick={() => setActiveTab('competition')}
                    className={`px-6 py-4 text-sm font-medium flex items-center ${
                      activeTab === 'competition'
                        ? 'border-b-2 border-[#2b7de9] text-[#2b7de9]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Trophy size={16} className="mr-2" />
                    {t('campaigns.competition.title')}
                  </button>
                )}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'requirements' && (
                <div className="space-y-6">
                  <div>
                    <h3 className={`${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{t('campaigns.details.requirements')}</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{campaign.requirements}</p>
                    </div>
                  </div>

                  {campaign.file_links && campaign.file_links.length > 0 && (
                    <div>
                      <h3 className={`${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{t('campaigns.details.files.title')}</h3>
                      <div className="space-y-2">
                        {campaign.file_links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center">
                              <LinkIcon size={16} className="text-[#2b7de9] mr-2" />
                              <span className="text-gray-700">{link.split('/').pop() || `File ${index + 1}`}</span>
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
                  {userSubmissions.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle size={48} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600">{t('submissions.noSubmissions')}</p>
                    </div>
                  ) : (
                    userSubmissions.map(submission => (
                      <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            submission.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : submission.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('submissions.details.views')}</label>
                            <div className="flex items-center">
                              <span className="text-lg font-semibold text-blue-600">
                                {submission.views.toLocaleString()}
                              </span>
                              <Eye size={16} className="ml-2 text-blue-500" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">{t('submissions.details.earnings')}</label>
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
                              className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                            >
                              <span className="text-gray-700">{t('submissions.video')} {index + 1}</span>
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
                      <h3 className="text-lg font-semibold text-yellow-800">{t('campaigns.competition.prizePool')}</h3>
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

                  {sortedSubmissions.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy size={48} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600">{t('campaigns.competition.noSubmissions')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sortedSubmissions.map((submission, index) => (
                        <div
                          key={submission.id}
                          className={`border rounded-lg p-4 ${
                            index < 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500 text-white font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {submission.creator_id === user.id ? t('submissions.yours') : `${t('submissions.creator')} #${submission.creator_id.slice(0, 8)}`}
                                </p>
                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                  <Eye size={14} className="mr-1" />
                                  {submission.views.toLocaleString()} views
                                </div>
                              </div>
                            </div>
                            {index < 3 && campaign.prizes && (
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{t('campaigns.competition.prize')}</p>
                                <p className="font-bold text-green-600">
                                  ${campaign.prizes[['first', 'second', 'third'][index]]}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {submission.creator_id === user.id && (
                            <div className="mt-4 space-y-2">
                              {submission.video_links.map((link, videoIndex) => (
                                <a
                                  key={videoIndex}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                >
                                  <span className="text-gray-700">Video {videoIndex + 1}</span>
                                  <ExternalLink size={14} className="text-gray-400" />
                                </a>
                              ))}
                            </div>
                          )}
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
          <div className= {`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800 mb-4'}`}>{t('campaigns.details.budget.title')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">{t('campaigns.details.budget.total')}</p>
                <div className="flex items-center mt-1">
                  <DollarSign className="text-green-500 mr-2" size={20} />
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    ${campaign.total_budget}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('campaigns.details.budget.spent')}</p>
                <div className="flex items-center mt-1">
                  <DollarSign className="text-red-500 mr-2" size={20} />
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    ${statistics?.totalSpent || 0}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('campaigns.details.budget.remaining')}</p>
                <div className="flex items-center mt-1">
                  <DollarSign className="text-purple-500 mr-2" size={20} />
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    ${campaign.total_budget - (statistics?.totalSpent || 0)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('campaigns.details.budget.perView')}</p>
                <div className="flex items-center mt-1">
                  <Eye className="text-blue-500 mr-2" size={20} />
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    ${campaign.earnings_per_3k_views}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-md p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800 mb-4'}`}>{t('campaigns.details.stats.title')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">{t('campaigns.details.stats.views')}</p>
                <div className="flex items-center mt-1">
                  <Eye className="text-blue-500 mr-2" size={20} />
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {statistics?.totalViews.toLocaleString() || 0}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('campaigns.details.stats.spent')}</p>
                <div className="flex items-center mt-1">
                  <DollarSign className="text-green-500 mr-2" size={20} />
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    ${statistics?.totalSpent || 0}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('campaigns.details.stats.creators')}</p>
                <div className="flex items-center mt-1">
                  <Users className="text-indigo-500 mr-2" size={20} />
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {statistics?.totalCreators || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {t('submissions.new')}
              </h2>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {t('submissions.title')}
                </label>
                <div className="space-y-4">
                  <div>
                    <select
                      value={videoSubmission.platform}
                      onChange={(e) => setVideoSubmission({ ...videoSubmission, platform: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                    >
                      <option value="">{t('submissions.platform')}</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={videoSubmission.url}
                      onChange={(e) => setVideoSubmission({ ...videoSubmission, url: e.target.value })}
                      placeholder={t('submissions.videoUrl')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-[#ff9800] hover:bg-[#ff9800]/90 text-white px-6 py-2 rounded-md font-medium transition-colors ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? t('common.saving') : t('submissions.new')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignSubmission;
