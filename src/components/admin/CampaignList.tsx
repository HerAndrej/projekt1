import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../../contexts/CampaignContext';
import { Calendar, Users, AlertCircle, Search, Image } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const CampaignList = () => {
  const { campaigns, getSubmissionsByCampaign, getCampaigns } = useCampaigns();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoading(true);
        await getCampaigns();
      } catch (err) {
        setError('Neuspešno učitavanje kampanja');
        console.error('Error loading campaigns:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaigns();
  }, [getCampaigns]);
  
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b7de9]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 sm:mb-0`}>
          Kampanje
        </h1>
        <Link
          to="/admin/campaigns/new"
          className="bg-[#2b7de9] hover:bg-[#2b7de9]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Kreiraj Novu Kampanju
        </Link>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pretraži kampanje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border-gray-300'
            }`}
          />
        </div>
      </div>
      
      {filteredCampaigns.length === 0 ? (
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center`}>
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Nema pronađenih kampanja
          </h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
            {searchTerm ? 'Pokušajte da prilagodite pretragu' : 'Kreirajte svoju prvu kampanju da biste počeli'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const submissions = getSubmissionsByCampaign(campaign.id);
            const submissionsCount = submissions.length;
            
            return (
              <Link 
                to={`/admin/campaigns/${campaign.id}`}
                key={campaign.id}
                className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow`}
              >
                {campaign.thumbnail_url ? (
                  <div className="w-full h-40 bg-gray-100">
                    <img
                      src={campaign.thumbnail_url}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                    <Image size={48} className="text-gray-300" />
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      {campaign.logo_url ? (
                        <img
                          src={campaign.logo_url}
                          alt="Logo"
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Image size={20} className="text-gray-300" />
                        </div>
                      )}
                      <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} line-clamp-1`}>
                        {campaign.title}
                      </h2>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : campaign.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {campaign.status === 'active' ? 'Aktivna' : 
                       campaign.status === 'completed' ? 'Završena' : 'Otkazana'}
                    </span>
                  </div>
                  
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 line-clamp-2`}>
                    {campaign.description}
                  </p>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <Calendar size={16} className="mr-1" />
                    <span>Kreirana {new Date(campaign.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm">
                    <Users size={16} className="mr-1" />
                    <span>{submissionsCount} {submissionsCount === 1 ? 'prijava' : 'prijava'}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignList;