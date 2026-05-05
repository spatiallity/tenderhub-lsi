import { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Mail, Shield, ShieldCheck, ShieldAlert, Search, MoreVertical, Check, X, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../services/supabase';
import { PageTitle, Card, Btn, Badge } from '../components/UI/index';

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'red', icon: ShieldAlert, desc: 'Akses penuh + kelola pengguna' },
  manager: { label: 'Manager', color: 'blue', icon: ShieldCheck, desc: 'Bisa edit status internal' },
  user: { label: 'User', color: 'gray', icon: Shield, desc: 'Hanya bisa lihat & monitor' },
};

const ROLE_ORDER = ['admin', 'manager', 'user'];

function RoleBadge({ role }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.user;
  const colorMap = {
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${colorMap[cfg.color]}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

function InviteModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Invite user via Supabase Admin (requires service role in real setup)
      // For now: create profile entry, admin sets password separately
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: Math.random().toString(36).slice(-12) + 'A1!', // temp password
        options: {
          data: { name, title, role },
          emailRedirectTo: window.location.origin + '/login',
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Upsert profile
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: email.trim(),
          name: name.trim(),
          title: title.trim(),
          role,
          is_active: true,
        });
        if (profileError) throw profileError;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Gagal mengundang pengguna.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Undang Pengguna Baru</h3>
            <p className="text-xs text-slate-500 mt-0.5">Pengguna akan menerima email konfirmasi.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Kerja <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@sucofindo.co.id"
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Jabatan / Posisi</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Contoh: Account Executive"
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Role / Akses</label>
            <div className="flex flex-col gap-2">
              {ROLE_ORDER.map(r => {
                const cfg = ROLE_CONFIG[r];
                const Icon = cfg.icon;
                return (
                  <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    role === r ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                    <Icon size={16} className={role === r ? 'text-blue-600' : 'text-slate-400'} />
                    <div className="flex-1">
                      <div className={`text-xs font-bold ${role === r ? 'text-blue-700' : 'text-slate-700'}`}>{cfg.label}</div>
                      <div className="text-[11px] text-slate-500">{cfg.desc}</div>
                    </div>
                    {role === r && <Check size={14} className="text-blue-600" />}
                  </label>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-bold border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors">
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mengundang...</>
              ) : (
                <><UserPlus size={16} /> Kirim Undangan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const { profile: currentProfile, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (!fetchError) setProfiles(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const handleSaveRole = async (id) => {
    setSavingId(id);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: editRole, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!updateError) {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: editRole } : p));
    } else {
      setError('Gagal memperbarui role.');
    }
    setSavingId(null);
    setEditingId(null);
  };

  const handleToggleActive = async (id, current) => {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_active: !current, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!updateError) {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    }
  };

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.role || '').toLowerCase().includes(q)
    );
  });

  const userInitials = (name) =>
    (name || '??').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const avatarColors = [
    'from-blue-500 to-blue-700',
    'from-teal-500 to-teal-700',
    'from-violet-500 to-violet-700',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-700',
    'from-emerald-500 to-green-700',
  ];

  const getAvatarColor = (id) => {
    const idx = id ? id.charCodeAt(0) % avatarColors.length : 0;
    return avatarColors[idx];
  };

  const stats = {
    total: profiles.length,
    active: profiles.filter(p => p.is_active !== false).length,
    admins: profiles.filter(p => p.role === 'admin').length,
    managers: profiles.filter(p => p.role === 'manager').length,
  };

  return (
    <div className="flex flex-col gap-5">
      <PageTitle
        title="Manajemen Pengguna"
        subtitle="Kelola akun, role akses, dan status pengguna TenderHub SBU LSI."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Pengguna', value: stats.total, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Pengguna Aktif', value: stats.active, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Admin', value: stats.admins, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
          { label: 'Manager', value: stats.managers, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.bg} flex flex-col gap-1`}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs font-semibold text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <Card className="flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau role..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button
            onClick={fetchProfiles}
            className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">Undang Pengguna</span>
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={15} className="text-red-500" />
            <p className="text-xs text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-700"><X size={14} /></button>
          </div>
        )}

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">Pengguna</th>
                <th className="px-4 py-3 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                {isAdmin && (
                  <th className="px-4 py-3 text-right text-[11px] font-extrabold text-slate-500 uppercase tracking-wide">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-500">Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <Users size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">
                      {search ? 'Tidak ada pengguna yang cocok.' : 'Belum ada pengguna terdaftar.'}
                    </p>
                  </td>
                </tr>
              ) : filtered.map(p => {
                const isCurrentUser = p.id === currentProfile?.id;
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} className={`bg-white hover:bg-slate-50 transition-colors ${!p.is_active ? 'opacity-60' : ''}`}>
                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(p.id)} text-white font-extrabold flex items-center justify-center text-xs shadow-sm shrink-0`}>
                          {userInitials(p.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                            {p.name || '—'}
                            {isCurrentUser && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-md">Anda</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{p.title || '—'}</div>
                          <div className="text-xs text-slate-400 truncate md:hidden">{p.email || '—'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{p.email || '—'}</span>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      {isEditing && isAdmin ? (
                        <select
                          value={editRole}
                          onChange={e => setEditRole(e.target.value)}
                          className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 outline-none focus:border-blue-500"
                        >
                          {ROLE_ORDER.map(r => (
                            <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                          ))}
                        </select>
                      ) : (
                        <RoleBadge role={p.role} />
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge color={p.is_active !== false ? 'green' : 'gray'}>
                        {p.is_active !== false ? 'Aktif' : 'Non-aktif'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveRole(p.id)}
                                disabled={savingId === p.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
                              >
                                {savingId === p.id ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Check size={12} />
                                )}
                                Simpan
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <X size={12} /> Batal
                              </button>
                            </>
                          ) : (
                            <>
                              {!isCurrentUser && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingId(p.id);
                                      setEditRole(p.role || 'user');
                                    }}
                                    className="px-2.5 py-1.5 text-xs font-bold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                    title="Ubah role"
                                  >
                                    Edit Role
                                  </button>
                                  <button
                                    onClick={() => handleToggleActive(p.id, p.is_active !== false)}
                                    className={`px-2.5 py-1.5 text-xs font-bold border rounded-lg transition-colors ${
                                      p.is_active !== false
                                        ? 'text-red-600 border-red-200 hover:bg-red-50'
                                        : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                                    }`}
                                    title={p.is_active !== false ? 'Non-aktifkan' : 'Aktifkan'}
                                  >
                                    {p.is_active !== false ? 'Non-aktifkan' : 'Aktifkan'}
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 text-center">
          {filtered.length} dari {profiles.length} pengguna ditampilkan
        </p>
      </Card>

      {/* Role legend */}
      <Card className="flex flex-col gap-3">
        <h3 className="text-sm font-extrabold text-slate-900">Keterangan Role</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ROLE_ORDER.map(r => {
            const cfg = ROLE_CONFIG[r];
            const Icon = cfg.icon;
            const colorMap = { red: 'border-red-200 bg-red-50', blue: 'border-blue-200 bg-blue-50', gray: 'border-slate-200 bg-slate-50' };
            const iconColor = { red: 'text-red-600', blue: 'text-blue-600', gray: 'text-slate-500' };
            return (
              <div key={r} className={`flex items-start gap-3 p-3 rounded-xl border ${colorMap[cfg.color]}`}>
                <Icon size={18} className={`shrink-0 mt-0.5 ${iconColor[cfg.color]}`} />
                <div>
                  <div className="text-xs font-extrabold text-slate-800">{cfg.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{cfg.desc}</div>
                  {r === 'manager' && (
                    <div className="text-[11px] text-slate-500">• Edit status internal tender</div>
                  )}
                  {r === 'admin' && (
                    <>
                      <div className="text-[11px] text-slate-500">• Edit status internal tender</div>
                      <div className="text-[11px] text-slate-500">• Kelola pengguna & role</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {showInvite && (
        <InviteModal onClose={() => setShowInvite(false)} onSuccess={fetchProfiles} />
      )}
    </div>
  );
}
