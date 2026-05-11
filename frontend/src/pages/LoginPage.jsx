import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Target, BarChart3, Users, Zap, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import tenderhubLogo from '../assets/TenderHub_Logo.png';

const FEATURES = [
  { icon: Target, label: 'Tender Intelligence', desc: 'Monitor ribuan tender secara real-time dengan scoring relevansi otomatis.' },
  { icon: BarChart3, label: 'Dashboard Analytics', desc: 'KPI winrate, pipeline nilai kontrak, dan tren historis dalam satu tampilan.' },
  { icon: Users, label: 'Manajemen Tenaga Ahli', desc: 'Database ahli terpusat dengan riwayat proyek dan rating performa.' },
  { icon: Zap, label: 'RUP Pipeline', desc: 'Radar awal paket RUP sebelum naik menjadi tender resmi.' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInAsGuest, user, loading } = useAuth();

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

  const handleGuestLogin = () => {
    signInAsGuest();
    navigate('/', { replace: true });
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
    <div className="h-screen overflow-hidden flex">
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
          {/* Hero text — logo dihapus dari kiri (cukup di kanan card). */}
          <div className="mb-10">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              PT Sucofindo — SBU LSI
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Sistem Cerdas<br />
              <span style={{ color: '#13B2AA' }}>Monitoring Tender</span><br />
              SBU LSI PT. SUCOFINDO (PERSERO)
            </h1>
            <p className="text-slate-300 text-base leading-relaxed max-w-sm">
              Platform terpadu untuk memantau, menganalisis, dan mengelola peluang pengadaan barang & jasa pemerintah.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-3 flex-1">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
                  style={{ background: 'rgba(19, 178, 170, 0.15)', border: '1px solid rgba(19, 178, 170, 0.3)' }}>
                  <Icon size={16} style={{ color: '#13B2AA' }} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{label}</div>
                  <div className="text-xs text-slate-400 leading-relaxed mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-[11px] text-slate-500">
              © 2026 PT Sucofindo (Persero) · SBU Layanan Publik, Sumber Daya Alam, dan Investasi
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6 flex flex-col items-center text-center">
              <img src={tenderhubLogo} alt="TenderHub" className="h-40 w-auto mb-4 object-contain" />
              <h2 className="text-xl font-black text-slate-900 mb-0.5">Selamat Datang</h2>
              <p className="text-xs text-slate-500">Masuk dengan akun Anda untuk melanjutkan.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
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
                    className="w-full pl-10 pr-12 py-2.5 text-sm border border-slate-300 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
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
                className="w-full py-2.5 px-6 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {/* Divider */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">atau</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Guest Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="mt-3 w-full py-2.5 px-6 rounded-xl text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <UserCheck size={16} className="text-slate-400" />
            Masuk sebagai Guest
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2 leading-relaxed">
            Mode Guest: akses terbatas. Akun dikelola Admin SBU LSI.
          </p>
        </div>
      </div>
    </div>
  );
}
