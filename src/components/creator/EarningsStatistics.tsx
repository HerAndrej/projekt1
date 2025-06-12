import { useState, useEffect } from 'react';
import { useCampaigns } from '../../contexts/CampaignContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  BarChart2, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Filter,
  Search
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

type TimePeriod = 'all' | 'year' | 'month' | 'week';
type CampaignFilter = string;
type VideoFilter = 'all' | 'approved' | 'pending' | 'rejected';

type DailyMetrics = {
  date: string;
  views: number;
  earnings: number;
};

const EarningsStatistics = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { getCampaignsForCreator, getSubmissionsByCreator } = useCampaigns();
  
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [campaignFilter, setCampaignFilter] = useState<CampaignFilter>('all');
  const [videoFilter, setVideoFilter] = useState<VideoFilter>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [approvedVideos, setApprovedVideos] = useState(0);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Calculate date range based on selected period
        const endDate = new Date();
        const startDate = new Date();
        
        switch (selectedPeriod) {
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          default:
            startDate.setFullYear(2020); // Get all data
        }

        // Get user's campaigns and submissions
        const userCampaigns = getCampaignsForCreator(user.id);
        setCampaigns(userCampaigns);
        
        // Filter campaigns based on selection
        let filteredCampaigns = userCampaigns;
        if (campaignFilter !== 'all') {
          filteredCampaigns = userCampaigns.filter(c => c.id === campaignFilter);
        }

        // Get submissions for filtered campaigns
        let userSubmissions = getSubmissionsByCreator(user.id)
          .filter(sub => filteredCampaigns.some(c => c.id === sub.campaign_id));

        // Apply video status filter
        if (videoFilter !== 'all') {
          userSubmissions = userSubmissions.filter(sub => sub.status === videoFilter);
        }
        
        // Calculate totals
        const totalEarnings = userSubmissions.reduce((sum, sub) => sum + (sub.earnings || 0), 0);
        const totalViews = userSubmissions.reduce((sum, sub) => sum + (sub.views || 0), 0);
        const activeCount = filteredCampaigns.filter(c => c.status === 'active').length;
        const approvedCount = userSubmissions.filter(s => s.status === 'approved').length;

        setTotalEarnings(totalEarnings);
        setTotalViews(totalViews);
        setActiveCampaigns(activeCount);
        setApprovedVideos(approvedCount);

        // Generate daily metrics
        const metrics: DailyMetrics[] = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const daySubmissions = userSubmissions.filter(sub => {
            const submissionDate = new Date(sub.submitted_at).toISOString().split('T')[0];
            return submissionDate === dateStr;
          });
          
          metrics.push({
            date: currentDate.toLocaleDateString(),
            views: daySubmissions.reduce((sum, sub) => sum + (sub.views || 0), 0),
            earnings: daySubmissions.reduce((sum, sub) => sum + (sub.earnings || 0), 0)
          });
          
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setDailyMetrics(metrics);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [user, selectedPeriod, campaignFilter, videoFilter, getCampaignsForCreator, getSubmissionsByCreator]);

  if (!user) return null;

  // Calculate period averages
  const periodDays = dailyMetrics.length || 1;
  const averageViews = Math.round(totalViews / periodDays);
  const averageEarnings = totalEarnings / periodDays;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Earnings & Statistics
        </h1>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
              className={`pl-10 pr-4 py-2 rounded-md appearance-none ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border border-gray-300'
              }`}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-md appearance-none ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border border-gray-300'
              }`}
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={videoFilter}
              onChange={(e) => setVideoFilter(e.target.value as VideoFilter)}
              className={`pl-10 pr-4 py-2 rounded-md appearance-none ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'border border-gray-300'
              }`}
            >
              <option value="all">All Videos</option>
              <option value="approved">Approved Videos</option>
              <option value="pending">Pending Videos</option>
              <option value="rejected">Rejected Videos</option>
            </select>
          </div>

          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
          >
            <DollarSign size={18} className="mr-2" />
            Schedule Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Period Earnings
            </h3>
            <DollarSign className="text-green-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
            Average: ${averageEarnings.toFixed(2)}/day
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Period Views
            </h3>
            <Eye className="text-blue-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-blue-600">{totalViews.toLocaleString()}</p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
            Average: {averageViews.toLocaleString()}/day
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Active Campaigns
            </h3>
            <BarChart2 className="text-purple-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-purple-600">{activeCampaigns}</p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
            Total campaigns
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Approved Videos
            </h3>
            <CheckCircle className="text-green-500" size={24} />
          </div>
          <p className="text-2xl font-bold text-green-600">{approvedVideos}</p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
            Success rate: {((approvedVideos / (approvedVideos || 1)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Views & Earnings Over Time
        </h2>
        
        <div className="space-y-8">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyMetrics}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#4B5563' }}
                />
                <YAxis 
                  tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#4B5563' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyMetrics}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#4B5563' }}
                />
                <YAxis 
                  tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#4B5563' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                    color: theme === 'dark' ? '#FFFFFF' : '#000000'
                  }}
                />
                <Bar
                  dataKey="earnings"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-md`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Schedule Payment
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Available Balance
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ${totalEarnings.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Minimum withdrawal amount: $50
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Payment Method
                  </label>
                  <select 
                    className={`w-full px-3 py-2 rounded-md ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border border-gray-300'
                    }`}
                  >
                    <option value="paypal">PayPal</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="wise">Wise</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      min="50"
                      max={totalEarnings}
                      className={`w-full pl-8 pr-3 py-2 rounded-md ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'border border-gray-300'
                      }`}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={`px-4 py-2 rounded-md ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                >
                  Request Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsStatistics;