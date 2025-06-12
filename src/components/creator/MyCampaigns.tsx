import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../../contexts/CampaignContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, CheckCircle, XCircle, Clock, ExternalLink, AlertCircle, DollarSign, Eye, TrendingUp, BarChart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const MyCampaigns = () => {
  const { user } = useAuth();
  const { getCampaigns, getSubmissionsByCreator, getTotalEarningsByCreator } = useCampaigns();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
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

    loadData();
  }, [getCampaigns]);
  
  if (!user) return null;
  
  const userSubmissions = getSubmissionsByCreator(user.id);
  const totalEarnings = getTotalEarningsByCreator(user.id);
  
  // Filter submissions by status
  const approvedSubmissions = userSubmissions.filter(sub => sub.status === 'approved');
  const pendingSubmissions = userSubmissions.filter(sub => sub.status === 'pending');
  const rejectedSubmissions = userSubmissions.filter(sub => sub.status === 'rejected');
  
  // Calculate total views
  const totalViews = approvedSubmissions.reduce((total, sub) => total + (sub.views || 0), 0);
  
  // Calculate pending earnings
  const totalPendingEarnings = pendingSubmissions.reduce((total, sub) => total + (sub.earnings || 0), 0);
  
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
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Ukupna Zarada
            </h3>
            <DollarSign className="text-green-500 dark:text-green-400" size={24} />
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalEarnings}</p>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Od odobrenih prijava
          </p>
          <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Na čekanju: ${totalPendingEarnings}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Ukupni Pregledi
            </h3>
            <Eye className="text-blue-500 dark:text-blue-400" size={24} />
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalViews.toLocaleString()}</p>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Kroz odobrene prijave
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Status Prijava
            </h3>
            <BarChart className="text-indigo-500 dark:text-indigo-400" size={24} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Odobreno:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{approvedSubmissions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Na čekanju:</span>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">{pendingSubmissions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Odbijeno:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{rejectedSubmissions.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              Rang u Takmičenju
            </h3>
            <TrendingUp className="text-purple-500 dark:text-purple-400" size={24} />
          </div>
          {approvedSubmissions.some(sub => sub.competition_rank) ? (
            <div className="space-y-2">
              {approvedSubmissions
                .filter(sub => sub.competition_rank && sub.competition_prize)
                .map(sub => (
                  <div key={sub.id} className="flex justify-between items-center">
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Rang #{sub.competition_rank}:
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${sub.competition_prize}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Još nema rangiranja u takmičenju
            </p>
          )}
        </div>
      </div>

      {userSubmissions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-8 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
            Još nema prijava
          </h3>
          <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Počnite da zarađujete slanjem sadržaja za dostupne kampanje.
          </p>
          <Link
            to="/creator/available"
            className="bg-[#2b7de9] hover:bg-[#2b7de9]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Pregledaj Kampanje
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Approved Submissions */}
          {approvedSubmissions.length > 0 && (
            <div>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                Odobrene Prijave
              </h2>
              <div className="space-y-4">
                {approvedSubmissions.map(submission => (
                  <div key={submission.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                          Prijava #{submission.id.slice(0, 8)}
                        </h3>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Poslato {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                        Odobreno
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Pregledi
                        </p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {submission.views.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Zarada
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${submission.earnings}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <a
                        href={submission.social_media_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-[#2b7de9] hover:underline"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Pogledaj na Društvenoj Mreži
                      </a>
                      {submission.video_links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-[#2b7de9] hover:underline"
                        >
                          <ExternalLink size={16} className="mr-2" />
                          Pogledaj Video {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Submissions */}
          {pendingSubmissions.length > 0 && (
            <div>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                Na Čekanju Pregleda
              </h2>
              <div className="space-y-4">
                {pendingSubmissions.map(submission => (
                  <div key={submission.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                          Prijava #{submission.id.slice(0, 8)}
                        </h3>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Poslato {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
                        Na Čekanju Pregleda
                      </span>
                    </div>

                    <div className="space-y-2">
                      <a
                        href={submission.social_media_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-[#2b7de9] hover:underline"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Pogledaj na Društvenoj Mreži
                      </a>
                      {submission.video_links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-[#2b7de9] hover:underline"
                        >
                          <ExternalLink size={16} className="mr-2" />
                          Pogledaj Video {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Submissions */}
          {rejectedSubmissions.length > 0 && (
            <div>
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                Odbijene Prijave
              </h2>
              <div className="space-y-4">
                {rejectedSubmissions.map(submission => (
                  <div key={submission.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                          Prijava #{submission.id.slice(0, 8)}
                        </h3>
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Poslato {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
                        Odbijeno
                      </span>
                    </div>

                    <div className="space-y-2">
                      <a
                        href={submission.social_media_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-[#2b7de9] hover:underline"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Pogledaj na Društvenoj Mreži
                      </a>
                      {submission.video_links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-[#2b7de9] hover:underline"
                        >
                          <ExternalLink size={16} className="mr-2" />
                          Pogledaj Video {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCampaigns;