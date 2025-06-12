import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, ListChecks, PlusCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

type AdminSidebarProps = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
};

const AdminSidebar = ({ mobileMenuOpen, setMobileMenuOpen }: AdminSidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();

  const navItems = [
    {
      name: 'Campaigns',
      path: '/admin/campaigns',
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: 'New Campaign',
      path: '/admin/campaigns/new',
      icon: <PlusCircle size={20} />,
    },
    {
      name: 'Submissions',
      path: '/admin/submissions',
      icon: <ListChecks size={20} />,
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden fixed top-20 right-4 z-20 p-2 rounded-md bg-gray-800 dark:bg-gray-700 text-white"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-10 transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden bg-gray-800 dark:bg-gray-900 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full pt-24 px-6 pb-8 overflow-y-auto">
          <div className="mb-8">
            <p className="text-white text-sm uppercase tracking-wider">
              Admin Dashboard
            </p>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-lg ${
                  isActive(item.path)
                    ? 'bg-[#2b7de9] text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:fixed md:w-64 md:inset-y-0 md:pt-20 bg-gray-800 dark:bg-gray-900">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="px-4 mb-6">
            <p className="text-white text-sm font-medium uppercase tracking-wider">
              Admin Dashboard
            </p>
          </div>
          <nav className="mt-5 flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-lg ${
                  isActive(item.path)
                    ? 'bg-[#2b7de9] text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                } transition-colors`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;