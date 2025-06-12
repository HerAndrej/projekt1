import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CampaignProvider } from '../../contexts/CampaignContext';
import CreatorSidebar from '../../components/creator/CreatorSidebar';
import AvailableCampaigns from '../../components/creator/AvailableCampaigns';
import MyCampaigns from '../../components/creator/MyCampaigns';
import CampaignSubmission from '../../components/creator/CampaignSubmission';
import EarningsStatistics from '../../components/creator/EarningsStatistics';
import ProfileSettings from '../../components/shared/ProfileSettings';

const CreatorDashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <CampaignProvider>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
        <CreatorSidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        
        <div className="flex-1 md:ml-64">
          <div className="p-4 md:p-6">
            <Routes>
              <Route path="/" element={<AvailableCampaigns />} />
              <Route path="/available" element={<AvailableCampaigns />} />
              <Route path="/my-campaigns" element={<MyCampaigns />} />
              <Route path="/earnings" element={<EarningsStatistics />} />
              <Route path="/submit/:id" element={<CampaignSubmission />} />
              <Route path="/profile" element={<ProfileSettings />} />
            </Routes>
          </div>
        </div>
      </div>
    </CampaignProvider>
  );
};

export default CreatorDashboard;