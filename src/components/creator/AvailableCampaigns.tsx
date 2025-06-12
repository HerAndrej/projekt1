import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '../../contexts/CampaignContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  AlertCircle, 
  Search, 
  Info, 
  DollarSign, 
  Link as LinkIcon, 
  Image, 
  Trophy, 
  CheckCircle, 
  Filter,
  TrendingUp,
  Users,
  Tag,
  Clock,
  Instagram,
  Youtube
} from 'lucide-react';

const AvailableCampaigns = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { campaigns, submissions, getCampaigns } = useCampaigns();
  const [searchTerm, setSearchTerm] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'ugc' | 'clipping'>('all');
  const [hasCompetitionFilter, setHasCompetitionFilter] = useState<'all' | 'yes' | 'no'>('all');
  
  useEffect(() => {
    getCampaigns();
  }, [getCampaigns]);
  
  if (!user) return null;
  
  // Get user's submissions
  const userSubmissions = submissions.filter(sub => sub.creator_id === user.id);
  const submittedCampaignIds = new Set(userSubmissions.map(sub => sub.campaign_id));
  
  // Filter active campaigns
  const availableCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesContentType = contentTypeFilter === 'all' || campaign.content_type === contentTypeFilter;
      const matchesCompetition = hasCompetitionFilter === 'all' || 
                                (hasCompetitionFilter === 'yes' ? campaign.has_competition : !campaign.has_competition);
      
      return campaign.status === 'active' && matchesSearch && matchesContentType && matchesCompetition;
    });

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
  
  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Dostupne Kampanje</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Pregledajte i prihvatite kampanje koje odgovaraju vašem stilu sadržaja i publici.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Pretraži kampanje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
            </div>

            <div className="relative flex-1 lg:flex-none">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value as 'all' | 'ugc' | 'clipping')}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] appearance-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option value="all">Svi Tipovi Sadržaja</option>
                <option value="ugc">Samo UGC</option>
                <option value="clipping">Samo Klipovanje</option>
              </select>
            </div>

            <div className="relative flex-1 lg:flex-none">
              <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <select
                value={hasCompetitionFilter}
                onChange={(e) => setHasCompetitionFilter(e.target.value as 'all' | 'yes' | 'no')}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] appearance-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                <option value="all">Sve Kampanje</option>
                <option value="yes">Samo Takmičenja</option>
                <option value="no">Bez Takmičenja</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableCampaigns.length === 0 ? (
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-8 text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Nema dostupnih kampanja</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || contentTypeFilter !== 'all' || hasCompetitionFilter !== 'all'
                ? 'Pokušajte da prilagodite filtere ili se vratite kasnije za nove prilike.'
                : 'Vratite se kasnije za nove prilike za kampanje.'}
            </p>
          </div>
        ) : (
          availableCampaigns.map((campaign) => {
            const hasSubmitted = submittedCampaignIds.has(campaign.id);
            const submission = userSubmissions.find(sub => sub.campaign_id === campaign.id);
            
            return (
              <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg overflow-hidden">
                {campaign.thumbnail_url ? (
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
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
                            alt="Logo Kampanje"
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-white shadow-lg">
                            <Image size={24} className="text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-bold">{campaign.title}</h2>
                          <div className="flex items-center text-gray-200 text-sm">
                            <Calendar size={14} className="mr-1" />
                            <span>Objavljena {new Date(campaign.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="bg-purple-500/80 text-white px-3 py-1 rounded-full text-sm">
                          {campaign.content_type === 'ugc' ? 'UGC' : 'Klipovanje'}
                        </span>
                        <span className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm">
                          Budžet: ${campaign.total_budget}
                        </span>
                        {campaign.has_competition && (
                          <span className="bg-yellow-500/80 text-white px-3 py-1 rounded-full text-sm flex items-center">
                            <Trophy size={14} className="mr-1" />
                            Takmičenje
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center">
                    <Image size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Nema dostupne slike</p>
                  </div>
                )}

                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <DollarSign className="text-green-600 dark:text-green-400 mr-2" size={20} />
                        <h3 className="font-semibold text-green-800 dark:text-green-200">Zarada</h3>
                      </div>
                      <p className="text-green-600 dark:text-green-400 font-bold">${campaign.earnings_per_1k_views}/1k pregleda</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Users className="text-blue-600 dark:text-blue-400 mr-2" size={20} />
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200">Kreatori</h3>
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 font-bold">{submissions.filter(s => s.campaign_id === campaign.id).length} prijava</p>
                    </div>
                  </div>

                  {/* Allowed Networks */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Dozvoljene Mreže:</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.allowed_networks?.map((network) => (
                        <div
                          key={network}
                          className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
                        >
                          {getNetworkIcon(network)}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getNetworkName(network)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">{campaign.description}</p>

                  {campaign.has_competition && (
                    <div className="mb-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-center mb-3">
                        <Trophy size={20} className="text-yellow-600 dark:text-yellow-400 mr-2" />
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Nagrade za Takmičenje</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <span className="text-xl">🥇</span>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">${campaign.prizes?.first}</p>
                        </div>
                        <div className="text-center">
                          <span className="text-xl">🥈</span>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">${campaign.prizes?.second}</p>
                        </div>
                        <div className="text-center">
                          <span className="text-xl">🥉</span>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">${campaign.prizes?.third}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasSubmitted ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <CheckCircle size={20} className="text-green-500 dark:text-green-400 mr-2" />
                        <div>
                          <p className="font-medium">Već Prijavljeno</p>
                          <p className="text-sm">Status: {submission?.status === 'pending' ? 'Na čekanju' : 
                                                         submission?.status === 'approved' ? 'Odobreno' : 'Odbijeno'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/creator/submit/${campaign.id}`)}
                        className="text-[#2b7de9] hover:underline text-sm"
                      >
                        Dodaj Više Videa
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/creator/submit/${campaign.id}`)}
                      className="w-full bg-[#ff9800] hover:bg-[#ff9800]/90 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                      Prihvati Kampanju
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AvailableCampaigns;