import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CampaignProvider } from '../../contexts/CampaignContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import CampaignList from '../../components/admin/CampaignList';
import CampaignForm from '../../components/admin/CampaignForm';
import SubmissionsList from '../../components/admin/SubmissionsList';
import CampaignDetails from '../../components/admin/CampaignDetails';
import ProfileSettings from '../../components/shared/ProfileSettings';

const AdminDashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <CampaignProvider>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
        <AdminSidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        
        <div className="flex-1 md:ml-64">
          <div className="p-4 md:p-6">
            <Routes>
              <Route path="/" element={<CampaignList />} />
              <Route path="/campaigns" element={<CampaignList />} />
              <Route path="/campaigns/new" element={<CampaignForm />} />
              <Route path="/campaigns/:id" element={<CampaignDetails />} />
              <Route path="/submissions" element={<SubmissionsList />} />
              <Route path="/profile" element={<ProfileSettings />} />
            </Routes>
          </div>
        </div>
      </div>
    </CampaignProvider>
  );
};

export default AdminDashboard;