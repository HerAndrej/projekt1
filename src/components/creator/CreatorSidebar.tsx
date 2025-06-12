import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ListChecks, Bookmark, BarChart2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

type CreatorSidebarProps = {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
};

const CreatorSidebar = ({ mobileMenuOpen, setMobileMenuOpen }: CreatorSidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();

  const navItems = [
    {
      name: 'Available Campaigns',
      path: '/creator/available',
      icon: <ListChecks size={20} />,
    },
    {
      name: 'My Campaigns',
      path: '/creator/my-campaigns',
      icon: <Bookmark size={20} />,
    },
    {
      name: 'Earnings & Statistics',
      path: '/creator/earnings',
      icon: <BarChart2 size={20} />,
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
        } md:hidden bg-gray-200 dark:bg-gray-900 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full pt-24 px-6 pb-8 overflow-y-auto">
          {/* Logo */}
          <div className="mb-8">
            <Link to="/creator" className="flex justify-center mb-6">
              <img 
                src="/erasebg-transformed.png" 
                alt="promReel Logo" 
                className="h-16 w-16"
              />
            </Link>
            <p className="text-gray-800 dark:text-white text-sm uppercase tracking-wider text-center">
              Creator Dashboard
            </p>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-lg ${
                  isActive(item.path)
                    ? 'bg-[#ff9800] text-white'
                    : 'text-gray-700 hover:bg-gray-300 dark:hover:bg-gray-800 dark:text-gray-300'
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
      <div className="hidden md:flex md:flex-col md:fixed md:w-64 md:inset-y-0 md:pt-20 bg-gray-200 dark:bg-gray-900">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="px-4 mb-6">
            <Link to="/creator" className="flex justify-center mb-6">
              <img 
                src="/erasebg-transformed.png" 
                alt="promReel Logo" 
                className="h-16 w-16"
              />
            </Link>
            <p className="text-gray-800 dark:text-white text-sm font-medium uppercase tracking-wider text-center">
              Creator Dashboard
            </p>
          </div>
          <nav className="mt-5 flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-3 rounded-lg ${
                  isActive(item.path)
                    ? 'bg-[#ff9800] text-white'
                    : 'text-gray-700 hover:bg-gray-300 dark:hover:bg-gray-800 dark:text-gray-300'
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

export default CreatorSidebar;