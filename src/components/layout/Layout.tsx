import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useTheme } from '../../contexts/ThemeContext';

const Layout = () => {
  const { theme } = useTheme();

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="flex">
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;