import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Instagram, Youtube, BookText as TikTok, Lock, Globe } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

type SocialLinks = {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
};

const ProfileSettings = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState(user?.user_metadata?.language || i18n.language || 'en');

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (currentUser?.user_metadata) {
        setName(currentUser.user_metadata.name || '');
        setSocialLinks({
          instagram: currentUser.user_metadata.instagram || '',
          youtube: currentUser.user_metadata.youtube || '',
          tiktok: currentUser.user_metadata.tiktok || ''
        });
        setLanguage(currentUser.user_metadata.language || i18n.language || 'en');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    await i18n.changeLanguage(newLanguage);
  };

  const updateProfile = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name,
          ...socialLinks,
          language
        }
      });

      if (error) throw error;

      setSuccess(t('profile.updateSuccess'));
    } catch (err) {
      setError(t('profile.updateError'));
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError(t('profile.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess(t('profile.updateSuccess'));
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(t('profile.updateError'));
      console.error('Error updating password:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword) {
      await updatePassword();
    } else {
      await updateProfile();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          {t('profile.settings')}
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('profile.description')}
        </p>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-lg mb-6 ${
          error 
            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' 
            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
        }`}>
          {error || success}
        </div>
      )}

      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {t('profile.settings')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('profile.displayName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border border-gray-300'
                  }`}
                  placeholder={t('profile.displayName')}
                />
              </div>

              <div>
                <label className={`flex items-center text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Globe size={16} className="mr-2" />
                  {t('profile.language')}
                </label>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border border-gray-300'
                  }`}
                >
                  <option value="en">{t('profile.languages.en')}</option>
                  <option value="sr">{t('profile.languages.sr')}</option>
                  <option value="hr">{t('profile.languages.hr')}</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {t('profile.socialLinks')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`flex items-center text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Instagram size={16} className="mr-2" />
                  Instagram Profile
                </label>
                <input
                  type="text"
                  value={socialLinks.instagram || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border border-gray-300'
                  }`}
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div>
                <label className={`flex items-center text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  <Youtube size={16} className="mr-2" />
                  YouTube Channel
                </label>
                <input
                  type="text"
                  value={socialLinks.youtube || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border border-gray-300'
                  }`}
                  placeholder="https://youtube.com/@channel"
                />
              </div>

              <div>
                <label className={`flex items-center text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  <TikTok size={16} className="mr-2" />
                  TikTok Profile
                </label>
                <input
                  type="text"
                  value={socialLinks.tiktok || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border border-gray-300'
                  }`}
                  placeholder="https://tiktok.com/@username"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className={`text-lg font-semibold flex items-center mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              <Lock size={18} className="mr-2" />
              {t('profile.changePassword')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('profile.newPassword')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border border-gray-300'
                  }`}
                  placeholder={t('profile.newPassword')}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  {t('profile.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9] ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'border border-gray-300'
                  }`}
                  placeholder={t('profile.confirmPassword')}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`px-4 py-2 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-[#2b7de9] hover:bg-[#2b7de9]/90 text-white px-6 py-2 rounded-md font-medium transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;