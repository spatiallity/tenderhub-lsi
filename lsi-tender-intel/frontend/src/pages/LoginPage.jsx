import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Target, BarChart3, Users, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FEATURES = [
  { icon: Target, label: 'Tender Intelligence', desc: 'Monitor ribuan tender secara real-time dengan scoring relevansi otomatis.' },
  { icon: BarChart3, label: 'Dashboard Analytics', desc: 'KPI winrate, pipeline nilai kontrak, dan tren historis dalam satu tampilan.' },
  { icon: Users, label: 'Manajemen Tenaga Ahli', desc: 'Database ahli terpusat dengan riwayat proyek dan rating performa.' },
  { icon: Zap, label: 'RUP Pipeline', desc: 'Radar awal paket RUP sebelum naik menjadi tender resmi.' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setError('');
    setSubmitting(true);
    try {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        if (signInError.message.includes('Invalid login')) {
          setError('Email atau password salah. Silakan coba lagi.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Email belum dikonfirmasi. Cek kotak masuk email Anda.');
        } else {
          setError(signInError.message);
        }
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Memuat...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 40%, #0c3a4a 70%, #0d4a42 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #13B2AA, transparent)' }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #13B2AA, #0891b2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8M16 17H8M10 9H8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-xl font-black tracking-tight leading-none">
                <span className="text-blue-300">Tender</span>
                <span style={{ color: '#13B2AA' }}>Hub</span>
              </div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                PT Sucofindo — SBU LSI
              </div>
            </div>
          </div>

          {/* Hero text */}
          <div className="mb-12">
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Sistem Cerdas<br />
              <span style={{ color: '#13B2AA' }}>Monitoring Tender</span><br />
              SBU Layanan Publik
            </h1>
            <p className="text-slate-300 text-base leading-relaxed max-w-sm">
              Platform terpadu untuk memantau, menganalisis, dan mengelola peluang pengadaan barang & jasa pemerintah.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-4 flex-1">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{ background: 'rgba(19, 178, 170, 0.15)', border: '1px solid rgba(19, 178, 170, 0.3)' }}>
                  <Icon size={18} style={{ color: '#13B2AA' }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{label}</div>
                  <div className="text-xs text-slate-400 leading-relaxed mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-500">
              © 2025 PT Sucofindo (Persero) · SBU Layanan Publik, Sumber Daya Alam, dan Investasi
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #13B2AA, #0891b2)' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2"/>
                <path d="M14 2V8H20M16 13H8M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-lg font-black tracking-tight">
              <span className="text-blue-600">Tender</span>
              <span style={{ color: '#13B2AA' }}>Hub</span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-1">Selamat Datang</h2>
              <p className="text-sm text-slate-500">Masuk dengan akun SBU LSI Anda untuk melanjutkan.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Kerja
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="nama@sucofindo.co.id"
                    autoComplete="email"
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-12 py-3 text-sm border border-slate-300 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 font-medium leading-relaxed">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !email || !password}
                className="w-full py-3 px-6 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: submitting
                    ? '#64748b'
                    : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  boxShadow: submitting ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.35)',
                }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Masuk...</span>
                  </>
                ) : (
                  'Masuk ke TenderHub'
                )}
              </button>
            </form>
          </div>

          {/* Bottom note */}
          <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
            Akun dikelola oleh Admin SBU LSI.<br />
            Hubungi admin jika belum memiliki akses.
          </p>
        </div>
      </div>
    </div>
  );
}
