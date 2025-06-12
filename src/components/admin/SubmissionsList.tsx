import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../../contexts/CampaignContext';
import { ExternalLink, Search, Filter } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

const SubmissionsList = () => {
  const { submissions, campaigns, updateSubmission, getCampaigns } = useCampaigns();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [creators, setCreators] = useState<Record<string, { name: string; email: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load campaigns and creators
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load campaigns
        await getCampaigns();

        // Load creators
        const { data, error: creatorsError } = await supabase
          .from('users')
          .select('id, email, raw_user_meta_data');

        if (creatorsError) throw creatorsError;

        if (data) {
          const creatorMap: Record<string, { name: string; email: string }> = {};
          data.forEach(user => {
            creatorMap[user.id] = {
              name: user.raw_user_meta_data?.name || 'Nepoznat Korisnik',
              email: user.email
            };
          });
          setCreators(creatorMap);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Neuspešno učitavanje podataka');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getCampaigns]);
  
  // Get campaign details for display
  const getCampaignDetails = (campaignId: string) => {
    return campaigns.find(c => c.id === campaignId);
  };

  // Get creator name for display
  const getCreatorName = (creatorId: string) => {
    return creators[creatorId]?.name || creators[creatorId]?.email || 'Nepoznat Kreator';
  };
  
  // Filter submissions based on search term and status
  const filteredSubmissions = submissions.filter(submission => {
    const campaign = getCampaignDetails(submission.campaign_id);
    const creatorName = getCreatorName(submission.creator_id);
    
    const matchesSearch = 
      (campaign?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.social_media_link.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.video_links.some(link => link.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (submissionId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      setError(null);
      await updateSubmission(submissionId, { status: newStatus });
    } catch (err) {
      console.error('Error updating submission status:', err);
      setError('Neuspešno ažuriranje statusa prijave');
    }
  };

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
      <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-6`}>
        Prijave Kreatora
      </h1>
      
      <div className="mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Pretraži prijave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border border-gray-300'
            }`}
          />
        </div>
        
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`pl-10 w-full px-4 py-2 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'border border-gray-300'
            }`}
          >
            <option value="all">Svi Statusi</option>
            <option value="pending">Na Čekanju</option>
            <option value="approved">Odobreno</option>
            <option value="rejected">Odbijeno</option>
          </select>
        </div>
      </div>
      
      {filteredSubmissions.length === 0 ? (
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center`}>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Nema pronađenih prijava 
            {searchTerm && ' koje odgovaraju vašoj pretrazi'}
            {statusFilter !== 'all' && ` sa statusom "${statusFilter}"`}.
          </p>
        </div>
      ) : (
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Kampanja
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Kreator
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Datum Prijave
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Linkovi
                  </th>
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th scope="col" className={`px-6 py-3 text-right text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                {filteredSubmissions.map((submission) => {
                  const campaign = getCampaignDetails(submission.campaign_id);
                  return (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/admin/campaigns/${submission.campaign_id}`}
                          className="text-[#2b7de9] hover:underline"
                        >
                          {campaign?.title || 'Nepoznata Kampanja'}
                        </Link>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {getCreatorName(submission.creator_id)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(submission.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <a 
                            href={submission.social_media_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#2b7de9] hover:underline text-sm flex items-center"
                          >
                            Društveni Profil
                            <ExternalLink size={14} className="ml-1" />
                          </a>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                            {submission.video_links.length} video link{submission.video_links.length !== 1 ? 'ova' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          submission.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : submission.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {submission.status === 'pending' ? 'Na Čekanju' :
                           submission.status === 'approved' ? 'Odobreno' : 'Odbijeno'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {submission.status === 'pending' && (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleStatusChange(submission.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Odobri
                            </button>
                            <button
                              onClick={() => handleStatusChange(submission.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Odbij
                            </button>
                          </div>
                        )}
                        {submission.status !== 'pending' && (
                          <button
                            onClick={() => handleStatusChange(submission.id, 'pending')}
                            className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
                          >
                            Resetuj
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;