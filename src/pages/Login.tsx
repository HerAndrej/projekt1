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
        setError('Registracija uspešna! Molimo prijavite se.');
        setEmail('');
        setPassword('');
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Došlo je do greške');
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
            <div className="flex items-center space-x-3">
              <img 
                src="/erasebg-transformed.png" 
                alt="promReel Logo" 
                className="h-8 w-8"
              />
              <h1 className="text-2xl font-bold text-white">
                promReel
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
                    Prijava
                  </button>
                  <button
                    onClick={() => {
                      setShowLoginForm(true);
                      setIsRegistering(true);
                    }}
                    className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Počni Sada
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
              <div className="flex items-center justify-center space-x-3 mb-4">
                <img 
                  src="/erasebg-transformed.png" 
                  alt="promReel Logo" 
                  className="h-10 w-10"
                />
                <h2 className="text-3xl font-bold text-gray-800">
                  promReel
                </h2>
              </div>
              <p className="text-gray-600 mt-2">
                {isRegistering ? 'Kreirajte svoj nalog' : 'Prijavite se da pristupite vašem panelu'}
              </p>
            </div>
            
            {error && (
              <div className={`border px-4 py-3 rounded mb-4 ${
                error.includes('uspešna') 
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'bg-red-100 border-red-400 text-red-700'
              }`}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {isRegistering && (
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">
                    Puno Ime
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                    placeholder="Marko Petrović"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                  Email Adresa
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                  placeholder="vas@email.com"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                  Lozinka
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
                    Tip Naloga
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'creator' | 'admin')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b7de9]"
                  >
                    <option value="creator">Kreator</option>
                    <option value="admin">Administrator</option>
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
                    ? (isRegistering ? 'Kreiranje Naloga...' : 'Prijavljivanje...') 
                    : (isRegistering ? 'Kreiraj Nalog' : 'Prijavi se')}
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
                  ? 'Već imate nalog? Prijavite se' 
                  : "Nemate nalog? Kreirajte ga"}
              </button>
            </div>
            
            {!isRegistering && (
              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Demo podaci:</p>
                <p className="mt-1">Admin: admin@example.com / password</p>
                <p>Kreator: creator@example.com / password</p>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowLoginForm(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Nazad na Početnu
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 mb-8">
                <Star size={16} className="mr-2" />
                <span>Povereno od strane 1000+ Balkanskih Kreatora</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Pretvorite Vaš Sadržaj u Prihod<br />u Balkanskom Regionu
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Pridružite se našoj platformi i monetizujte svoju kreativnost. Kreirajte autentičan sadržaj za brendove, 
                dosegnite milione i zarađujte konkurentne nagrade u Srbiji, Hrvatskoj i šire.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setShowLoginForm(true);
                    setIsRegistering(true);
                  }}
                  className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors flex items-center"
                >
                  Počnite da Zarađujete Danas
                  <ArrowRight size={20} className="ml-2" />
                </button>
                <a
                  href="#how-it-works"
                  className="text-white hover:text-gray-200 transition-colors flex items-center"
                >
                  Saznajte Više
                  <ArrowRight size={20} className="ml-2" />
                </a>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-[#ff9800] mb-2">€500+</div>
                <p className="text-gray-300">Prosečna Mesečna Zarada</p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-[#2b7de9] mb-2">1M+</div>
                <p className="text-gray-300">Mesečni Pregledi</p>
              </div>
              <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">100+</div>
                <p className="text-gray-300">Aktivne Kampanje</p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-[#ff9800]/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="text-[#ff9800]" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">UGC Kreiranje Sadržaja</h3>
                <p className="text-gray-300">
                  Kreirajte autentičan korisnički generisan sadržaj za vodeće balkanske brendove. Podelite svoja 
                  istinska iskustva i izgradite profesionalni portfolio dok zarađujete.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-[#2b7de9]/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Scissors className="text-[#2b7de9]" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Video Klipovanje</h3>
                <p className="text-gray-300">
                  Transformišite dugačak sadržaj u privlačne kratke klipove. Savršeno za kreatore koji se ističu 
                  u video editovanju i pripovedanju na lokalnim jezicima.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-green-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Wallet className="text-green-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Konkurentne Zarade</h3>
                <p className="text-gray-300">
                  Zarađujte na osnovu pregleda i angažovanja. Najbolji kreatori mogu zaraditi značajan prihod kroz 
                  naš transparentan sistem zasnovan na performansama.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-purple-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="text-purple-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Mesečna Takmičenja</h3>
                <p className="text-gray-300">
                  Učestvujte u specijalnim kampanjama sa nagradnim fondovima do €5000. Takmičite se sa drugim kreatorima 
                  i osvojite dodatne nagrade.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-pink-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="text-pink-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Fokus na Lokalno Tržište</h3>
                <p className="text-gray-300">
                  Kreirajte sadržaj na srpskom, hrvatskom ili vašem lokalnom jeziku. Povežite se sa brendovima koji 
                  specifično žele da dosegnu balkanske publike.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                <div className="bg-yellow-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Target className="text-yellow-500" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Prilike za Rast</h3>
                <p className="text-gray-300">
                  Izgradite svoj portfolio, steknite iskustvo sa velikim brendovima i razvijte svoj lični brend 
                  dok zarađujete novac.
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div id="how-it-works" className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 text-green-400 mb-8">
                <Zap size={16} className="mr-2" />
                <span>Jednostavan Proces u 4 Koraka</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-12">Kako Funkcioniše</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="relative">
                  <div className="bg-[#2b7de9]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-[#2b7de9]" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">1. Registrujte se</h3>
                  <p className="text-gray-300">Kreirajte svoj besplatan nalog i dopunite svoj kreatorski profil</p>
                </div>

                <div className="relative">
                  <div className="bg-[#ff9800]/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="text-[#ff9800]" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">2. Izaberite Kampanje</h3>
                  <p className="text-gray-300">Pregledajte i izaberite kampanje koje odgovaraju vašem stilu i publici</p>
                </div>

                <div className="relative">
                  <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="text-green-500" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">3. Kreirajte Sadržaj</h3>
                  <p className="text-gray-300">Proizvedite i pošaljite svoje UGC videe ili klipove</p>
                </div>

                <div className="relative">
                  <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="text-purple-500" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">4. Zarađujte</h3>
                  <p className="text-gray-300">Zarađujte novac na osnovu pregleda i angažovanja</p>
                </div>
              </div>
            </div>

            {/* Success Stories */}
            <div className="mb-16">
              <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 mb-8">
                  <Star size={16} className="mr-2" />
                  <span>Priče o Uspehu</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Priče Uspešnih Kreatora</h2>
                <p className="text-xl text-gray-300">Pogledajte kako kreatori zarađuju na našoj platformi</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                  <div className="flex items-center mb-4">
                    <img
                      src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Kreator"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h4 className="text-white font-semibold">Marija S.</h4>
                      <p className="text-gray-400">Beauty Kreator</p>
                    </div>
                  </div>
                  <p className="text-gray-300">
                    "Zaradila sam preko €2000 u prvom mesecu kreirajući UGC sadržaj za beauty brendove. 
                    Platforma je olakšala povezivanje sa brendovima i plaćanje za moj rad."
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                  <div className="flex items-center mb-4">
                    <img
                      src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Kreator"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h4 className="text-white font-semibold">Stefan M.</h4>
                      <p className="text-gray-400">Tech Recenzent</p>
                    </div>
                  </div>
                  <p className="text-gray-300">
                    "Funkcija takmičenja je neverovatna! Osvojio sam prvo mesto u tech review kampanji 
                    i zaradio €1000 bonus pored redovne zarade."
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/10">
                  <div className="flex items-center mb-4">
                    <img
                      src="https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Kreator"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h4 className="text-white font-semibold">Ana K.</h4>
                      <p className="text-gray-400">Lifestyle Kreator</p>
                    </div>
                  </div>
                  <p className="text-gray-300">
                    "Kreiranje sadržaja na hrvatskom mi je pomoglo da se istaknem. Brendovi vole da rade sa lokalnim 
                    kreatorima, i izgradila sam stabilan tok prihoda."
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mb-16">
              <div className="bg-gradient-to-r from-[#2b7de9]/20 to-[#ff9800]/20 rounded-lg p-12 backdrop-blur-lg border border-white/10">
                <h2 className="text-3xl font-bold text-white mb-6">Spremni da Počnete da Zarađujete?</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Pridružite se stotinama kreatora koji već zarađuju na našoj platformi. Počnite svoje putovanje danas 
                  i pretvorite svoj sadržaj u prihod!
                </p>
                <button
                  onClick={() => {
                    setShowLoginForm(true);
                    setIsRegistering(true);
                  }}
                  className="bg-[#ff9800] hover:bg-[#ff9800]/90 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors flex items-center mx-auto"
                >
                  Kreirajte Vaš Nalog
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