import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '../../contexts/CampaignContext';
import { Link, Plus, X, Upload, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext'; // Add this import

const CampaignForm = () => {
  const navigate = useNavigate();
  const { createCampaign } = useCampaigns();
  const { user } = useAuth(); // Add this line to get the current user
  const logoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [contentType, setContentType] = useState<'ugc' | 'clipping'>('ugc');
  const [earningsPer3kViews, setEarningsPer3kViews] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [fileLinks, setFileLinks] = useState(['']);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasCompetition, setHasCompetition] = useState(false);
  const [prizes, setPrizes] = useState({
    first: '',
    second: '',
    third: '',
    fourth: '',
    fifth: ''
  });
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      if (!file) return null;

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
      }

      const fileExt = file.name.split('.').pop();
      const uniqueId = Math.random().toString(36).substring(2);
      const fileName = `${uniqueId}-${Date.now()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const blob = file.slice(0, file.size, file.type);
      const newFile = new File([blob], fileName, { type: file.type });

      const { data, error: uploadError } = await supabase.storage
        .from('campaign-images')
        .upload(filePath, newFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: publicData } = supabase
        .storage
        .from('campaign-images')
        .getPublicUrl(filePath);

      return publicData.publicUrl;
    } catch (err) {
      console.error('Image upload error:', err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('You must be logged in to create a campaign');
      return;
    }
    
    if (!title.trim() || !description.trim() || !requirements.trim() || 
        !earningsPer3kViews || !totalBudget) {
      setError('All required fields must be filled');
      return;
    }

    if (hasCompetition && (!prizes.first || !prizes.second || !prizes.third || !prizes.fourth || !prizes.fifth)) {
      setError('All prize amounts must be filled for competition');
      return;
    }
    
    const validFileLinks = fileLinks.filter(link => link.trim() !== '');
    const isValidGoogleDriveLink = (link: string) => {
      return link.includes('drive.google.com') || link.includes('docs.google.com');
    };
    
    if (validFileLinks.length > 0 && !validFileLinks.every(isValidGoogleDriveLink)) {
      setError('Please provide valid Google Drive links only');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let logoUrl = null;
      let thumbnailUrl = null;

      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'logos');
      }

      if (thumbnailFile) {
        thumbnailUrl = await uploadImage(thumbnailFile, 'thumbnails');
      }

      await createCampaign({
        title,
        description,
        requirements,
        content_type: contentType,
        earnings_per_3k_views: Number(earningsPer3kViews),
        total_budget: Number(totalBudget),
        file_links: validFileLinks,
        logo_url: logoUrl,
        thumbnail_url: thumbnailUrl,
        has_competition: hasCompetition,
        prizes: hasCompetition ? prizes : null,
        user_id: user.id // Add the user_id here
      });
      
      navigate('/admin/campaigns');
    } catch (err) {
      console.error('Campaign creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
      setIsSubmitting(false);
    }
  };
  
  const addFileLinkInput = () => {
    setFileLinks([...fileLinks, '']);
  };
  
  const removeFileLinkInput = (index: number) => {
    const newFileLinks = [...fileLinks];
    newFileLinks.splice(index, 1);
    setFileLinks(newFileLinks);
  };
  
  const handleFileLinkChange = (index: number, value: string) => {
    const newFileLinks = [...fileLinks];
    newFileLinks[index] = value;
    setFileLinks(newFileLinks);
  };

  const handlePrizeChange = (place: keyof typeof prizes, value: string) => {
    setPrizes(prev => ({
      ...prev,
      [place]: value
    }));
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Campaign</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* Campaign Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Campaign Logo
              </label>
              <div className="space-y-2">
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#2b7de9] transition-colors"
                >
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-32 w-32 object-contain mx-auto"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogoFile(null);
                          setLogoPreview('');
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Click to upload logo</p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Campaign Thumbnail
              </label>
              <div className="space-y-2">
                <div 
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-[#2b7de9] transition-colors"
                >
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="h-32 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnailFile(null);
                          setThumbnailPreview('');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Click to upload thumbnail</p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-medium mb-2">
              Campaign Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
              placeholder="e.g., Summer Product Launch"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-medium mb-2">
              Campaign Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
              placeholder="Describe the campaign goals and what content creators need to know"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="requirements" className="block text-gray-700 text-sm font-medium mb-2">
              Requirements
            </label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
              placeholder="List specific requirements for creators (e.g., follower count, content type, deadlines)"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="contentType" className="block text-gray-700 text-sm font-medium mb-2">
                Content Type
              </label>
              <select
                id="contentType"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as 'ugc' | 'clipping')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
              >
                <option value="ugc">UGC (User Generated Content)</option>
                <option value="clipping">Clipping</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="earningsPer3kViews" className="block text-gray-700 text-sm font-medium mb-2">
                Earnings per 3k Views ($)
              </label>
              <input
                id="earningsPer3kViews"
                type="number"
                min="0"
                step="0.01"
                value={earningsPer3kViews}
                onChange={(e) => setEarningsPer3kViews(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                placeholder="e.g., 50"
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="totalBudget" className="block text-gray-700 text-sm font-medium mb-2">
              Total Campaign Budget ($)
            </label>
            <input
              id="totalBudget"
              type="number"
              min="0"
              step="0.01"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
              placeholder="e.g., 10000"
            />
          </div>

          {/* Competition Section */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="hasCompetition"
                checked={hasCompetition}
                onChange={(e) => setHasCompetition(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="hasCompetition" className="flex items-center text-gray-700 font-medium">
                <Trophy size={20} className="mr-2 text-yellow-500" />
                Enable Competition with Prizes
              </label>
            </div>

            {hasCompetition && (
              <div className="bg-yellow-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Competition Prizes</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🥇 1st Place Prize ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prizes.first}
                      onChange={(e) => handlePrizeChange('first', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                      placeholder="e.g., 1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🥈 2nd Place Prize ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prizes.second}
                      onChange={(e) => handlePrizeChange('second', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                      placeholder="e.g., 500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🥉 3rd Place Prize ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prizes.third}
                      onChange={(e) => handlePrizeChange('third', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                      placeholder="e.g., 250"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      4th Place Prize ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prizes.fourth}
                      onChange={(e) => handlePrizeChange('fourth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                      placeholder="e.g., 100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      5th Place Prize ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={prizes.fifth}
                      onChange={(e) => handlePrizeChange('fifth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                      placeholder="e.g., 50"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* File links section */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Google Drive File Links
            </label>
            <div className="space-y-2">
              {fileLinks.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={link}
                      onChange={(e) => handleFileLinkChange(index, e.target.value)}
                      placeholder="Paste Google Drive link here"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                    />
                  </div>
                  {fileLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFileLinkInput(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFileLinkInput}
                className="flex items-center text-[#2b7de9] hover:text-[#2b7de9]/80 mt-2"
              >
                <Plus size={16} className="mr-1" />
                Add another file link
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Add Google Drive links to campaign assets and materials
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/campaigns')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-[#2b7de9] hover:bg-[#2b7de9]/90 text-white px-4 py-2 rounded-md font-medium transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignForm;