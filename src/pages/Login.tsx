import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  DollarSign, 
  Video, 
  Users, 
  TrendingUp, 
  Trophy,
  Scissors,
  Camera,
  Globe,
  CheckCircle,
  ArrowRight,
  BarChart,
  Clock,
  Zap,
  Star,
  Target,
  Wallet
} from 'lucide-react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'creator' | 'admin'>('creator');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, user } = useAuth();
  
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/creator');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        setIsRegistering(false);
        setError('Registration successful! Please log in.');
        setEmail('');
        setPassword('');
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">
                <span className="text-[#ff9800]">Ad</span>
                <span className="text-[#2b7de9]">Campaign</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {!showLoginForm && (
                <>
                  <button
                    onClick={() => {
                      setShowLoginForm(true);
                      setIsRegistering(false);
                    }}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginForm(true);
                      setIsRegistering(true);
                    }}
                    className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16">
        {showLoginForm ? (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8 m-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold">
                <span className="text-[#ff9800]">Ad</span>
                <span className="text-[#2b7de9]">Campaign</span>
              </h2>
              <p className="text-gray-600 mt-2">
                {isRegistering ? 'Create your account' : 'Sign in to access your dashboard'}
              </p>
            </div>
            
            {error && (
              <div className={`border px-4 py-3 rounded mb-4 ${
                error.includes('successful') 
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'bg-red-100 border-red-400 text-red-700'
              }`}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {isRegistering && (
                <div className="mb-4">
                  <label htmlFor="name\" className="block text-gray-700 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                  placeholder="••••••••"
                />
              </div>
              
              {isRegistering && (
                <div className="mb-6">
                  <label htmlFor="role" className="block text-gray-700 text-sm font-medium mb-2">
                    Account Type
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'creator' | 'admin')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                  >
                    <option value="creator">Creator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-[#2b7de9] hover:bg-[#2b7de9]/90 text-white font-medium py-2 px-4 rounded-md transition-colors ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading 
                    ? (isRegistering ? 'Creating Account...' : 'Signing in...') 
                    : (isRegistering ? 'Create Account' : 'Sign In')}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
                className="text-[#2b7de9] hover:underline text-sm"
              >
                {isRegistering 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Create one"}
              </button>
            </div>
            
            {!isRegistering && (
              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Demo credentials:</p>
                <p className="mt-1">Admin: admin@example.com / password</p>
                <p>Creator: creator@example.com / password</p>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowLoginForm(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 mb-8">
                <Star size={16} className="mr-2" />
                <span>Trusted by 1000+ Balkan Creators</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Turn Your Content Into Income<br />in the Balkan Region
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Join our platform and monetize your creativity. Create authentic content for brands, 
                reach millions, and earn competitive rewards in Serbia, Croatia, and beyond.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setShowLoginForm(true);
                    setIsRegistering(true);
                  }}
                  className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors flex items-center"
                >
                  Start Earning Today
                  <ArrowRight size={20} className="ml-2" />
                </button>
                <a
                  href="#how-it-works"
                  className="text-white hover:text-gray-200 transition-colors flex items-center"
                >
                  Learn More
                  <ArrowRight size={20} className="ml-2" />
                </a>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-[#ff9800] mb-2">€500+</div>
                <p className="text-gray-300">Average Monthly Earnings</p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-[#2b7de9] mb-2">1M+</div>
                <p className="text-gray-300">Monthly Views</p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">100+</div>
                <p className="text-gray-300">Active Campaigns</p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-[#ff9800]/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="text-[#ff9800]" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">UGC Content Creation</h3>
                <p className="text-gray-300">
                  Create authentic user-generated content for leading Balkan brands. Share your genuine 
                  experiences and build a professional portfolio while earning.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-[#2b7de9]/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Scissors className="text-[#2b7de9]" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Video Clipping</h3>
                <p className="text-gray-300">
                  Transform long-form content into engaging short clips. Perfect for creators who excel 
                  at video editing and storytelling in local languages.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Wallet className="text-green-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Competitive Earnings</h3>
                <p className="text-gray-300">
                  Earn based on views and engagement. Top creators can earn significant income through 
                  our transparent, performance-based system.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="text-purple-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Monthly Competitions</h3>
                <p className="text-gray-300">
                  Participate in special campaigns with prize pools up to €5000. Compete with other creators 
                  and win additional rewards.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-pink-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="text-pink-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Local Market Focus</h3>
                <p className="text-gray-300">
                  Create content in Serbian, Croatian, or your local language. Connect with brands looking 
                  specifically to reach Balkan audiences.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-yellow-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Target className="text-yellow-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Growth Opportunities</h3>
                <p className="text-gray-300">
                  Build your portfolio, gain experience with major brands, and grow your personal brand 
                  while earning money.
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div id="how-it-works" className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 text-green-400 mb-8">
                <Zap size={16} className="mr-2" />
                <span>Simple 4-Step Process</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-12">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="relative">
                  <div className="bg-[#2b7de9]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-[#2b7de9]" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">1. Sign Up</h3>
                  <p className="text-gray-300">Create your free account and complete your creator profile</p>
                </div>

                <div className="relative">
                  <div className="bg-[#ff9800]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="text-[#ff9800]" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">2. Choose Campaigns</h3>
                  <p className="text-gray-300">Browse and select campaigns that match your style and audience</p>
                </div>

                <div className="relative">
                  <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="text-green-500" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">3. Create Content</h3>
                  <p className="text-gray-300">Produce and submit your UGC videos or clips</p>
                </div>

                <div className="relative">
                  <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="text-purple-500" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">4. Get Paid</h3>
                  <p className="text-gray-300">Earn money based on views and engagement</p>
                </div>
              </div>
            </div>

            {/* Success Stories */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 mb-8">
                  <Star size={16} className="mr-2" />
                  <span>Success Stories</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Creator Success Stories</h2>
                <p className="text-xl text-gray-300">See how creators are earning on our platform</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                  <div className="flex items-center mb-4">
                    <img
                      src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Creator"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h4 className="text-white font-semibold">Marija S.</h4>
                      <p className="text-gray-400">Beauty Creator</p>
                    </div>
                  </div>
                  <p className="text-gray-300">
                    "I earned over €2000 in my first month creating UGC content for beauty brands. 
                    The platform made it easy to connect with brands and get paid for my work."
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                  <div className="flex items-center mb-4">
                    <img
                      src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Creator"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h4 className="text-white font-semibold">Stefan M.</h4>
                      <p className="text-gray-400">Tech Reviewer</p>
                    </div>
                  </div>
                  <p className="text-gray-300">
                    "The competition feature is amazing! I won first place in a tech review campaign 
                    and earned a €1000 bonus on top of my regular earnings."
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                  <div className="flex items-center mb-4">
                    <img
                      src="https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Creator"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h4 className="text-white font-semibold">Ana K.</h4>
                      <p className="text-gray-400">Lifestyle Creator</p>
                    </div>
                  </div>
                  <p className="text-gray-300">
                    "Creating content in Croatian helped me stand out. Brands love working with local 
                    creators, and I've built a steady income stream."
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mb-16">
              <div className="bg-gradient-to-r from-[#2b7de9]/20 to-[#ff9800]/20 rounded-lg p-12 backdrop-blur-lg border border-white/10">
                <h2 className="text-3xl font-bold text-white mb-6">Ready to Start Earning?</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join hundreds of creators already making money on our platform. Start your journey today 
                  and turn your content into income!
                </p>
                <button
                  onClick={() => {
                    setShowLoginForm(true);
                    setIsRegistering(true);
                  }}
                  className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors flex items-center mx-auto"
                >
                  Create Your Account
                  <ArrowRight size={20} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;