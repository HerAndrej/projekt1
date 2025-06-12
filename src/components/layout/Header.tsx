import { LogOut, Menu, X, Sun, Moon, Settings } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isDashboardLink = user.role === 'admin' ? '/admin' : '/creator';
  
  return (
    <header className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white shadow-md dark:shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to={isDashboardLink} className="flex items-center space-x-3">
            <img 
              src="/erasebg-transformed.png" 
              alt="promReel Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              promReel
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user.name}</span>
              <span className="bg-[#2b7de9] text-white text-xs px-2 py-1 rounded-full uppercase">
                {user.role === 'admin' ? 'Admin' : 'Kreator'}
              </span>
              <Link
                to={`${isDashboardLink}/profile`}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings size={20} />
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-300 dark:border-gray-600">
            <div className="flex flex-col space-y-4">
              <button
                onClick={toggleTheme}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                {theme === 'light' ? (
                  <>
                    <Moon size={18} className="mr-2" />
                    Tamni Režim
                  </>
                ) : (
                  <>
                    <Sun size={18} className="mr-2" />
                    Svetli Režim
                  </>
                )}
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="mr-2">{user.name}</span>
                  <span className="bg-[#2b7de9] text-white text-xs px-2 py-1 rounded-full uppercase">
                    {user.role === 'admin' ? 'Admin' : 'Kreator'}
                  </span>
                </div>
              </div>
              <Link
                to={`${isDashboardLink}/profile`}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings size={18} className="mr-2" />
                Podešavanja Profila
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut size={18} className="mr-2" />
                Odjavi se
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;