import React, { useState, useEffect } from 'react';
import { Settings, Save, Pencil, Trash2, User, Mail, Shield } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { PageTitle, Card, Btn, Badge } from '../components/UI/index';
import { portfolioColor, PROVINCES } from '../utils/constants';
import UserManagement from '../components/Settings/UserManagement';

export default function SettingsPage() {
  const {
    keywords, addKeyword, removeKeyword,
    users, addUser, updateUser, deleteUser,
    coverage, setCoverage,
    hpsThreshold, setHpsThreshold,
    showToast
  } = useAppContext();
  
  const { user, profile, isGuest, isAdmin, updateProfile } = useAuth();

  const [kwDraft, setKwDraft] = useState({ text: '', portfolio: 'SDA' });
  const [userDraft, setUserDraft] = useState({ nama: '', role: 'PIC', aktif: true });
  const [editingUserId, setEditingUserId] = useState(null);
  
  // Profile Draft State - use Supabase profile
  const [profileDraft, setProfileDraft] = useState({
    name: profile?.name || user?.email?.split('@')[0] || 'User',
    title: profile?.title || '',
    email: user?.email || ''
  });
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Update draft when profile changes
  useEffect(() => {
    if (profile) {
      setProfileDraft({
        name: profile.name || user?.email?.split('@')[0] || 'User',
        title: profile.title || '',
        email: user?.email || ''
      });
    }
  }, [profile, user]);
  
  const handleSaveProfile = async () => {
    if (isGuest) {
      showToast('Mode Guest tidak dapat mengubah profil', 'error');
      return;
    }
    
    setIsSavingProfile(true);
    try {
      const { error } = await updateProfile({
        name: profileDraft.name,
        title: profileDraft.title
      });
      
      if (error) {
        showToast('Gagal menyimpan profil: ' + error.message, 'error');
      } else {
        showToast('Profil berhasil diperbarui');
      }
    } catch (err) {
      showToast('Terjadi kesalahan saat menyimpan profil', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Pengaturan Aplikasi"
        subtitle="Kelola parameter filter otomatis, threshold HPS, keyword portofolio, dan manajemen pengguna."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Keyword Manager - Admin Only */}
        <Card className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
              <Settings size={18} className="text-slate-500" /> Manajemen Keyword LSI
            </h2>
            <p className="text-slate-500 text-xs mt-1">Keyword digunakan untuk menghitung skor relevansi dan memfilter tender/RUP secara otomatis. Berlaku untuk semua user.</p>
          </div>

          {!isAdmin ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-amber-600" />
                <span className="text-sm font-bold text-amber-900">Akses Terbatas</span>
              </div>
              <p className="text-xs text-amber-700">
                Hanya Administrator yang dapat mengelola keyword global.
              </p>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input 
                  placeholder="Tambah keyword baru..." 
                  value={kwDraft.text}
                  onChange={e => setKwDraft({ ...kwDraft, text: e.target.value })}
                  onKeyPress={e => {
                    if (e.key === 'Enter' && kwDraft.text.trim()) {
                      addKeyword(kwDraft.portfolio, kwDraft.text);
                      setKwDraft({ ...kwDraft, text: '' });
                    }
                  }}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <select 
              value={kwDraft.portfolio}
              onChange={e => setKwDraft({ ...kwDraft, portfolio: e.target.value })}
              className="w-[100px] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option>SDA</option><option>FLP</option><option>FITI</option>
            </select>
            <Btn className="primary" onClick={() => {
              if (kwDraft.text.trim()) {
                addKeyword(kwDraft.portfolio, kwDraft.text);
                setKwDraft({ ...kwDraft, text: '' });
              }
            }}>Tambah</Btn>
          </div>

          {/* Keyword Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                  <tr>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Portfolio</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Keyword</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center w-20">Status</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {Object.entries(keywords).flatMap(([port, items]) =>
                    items.map((k, idx) => (
                      <tr key={`${port}-${k.id}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5">
                          <Badge color={portfolioColor[port]} className="text-xs">
                            {port}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-sm font-semibold text-slate-900">{k.text}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <Badge color={k.active ? 'green' : 'gray'} className="text-xs">
                            {k.active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => removeKeyword(port, k.id)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Hapus keyword"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  {Object.values(keywords).every(items => items.length === 0) && (
                    <tr>
                      <td colSpan="4" className="px-3 py-8 text-center text-sm text-slate-400">
                        Belum ada keyword. Tambahkan keyword pertama Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(keywords).map(([port, items]) => (
              <div key={port} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                <div className="text-xs font-bold text-slate-500 mb-1">{port}</div>
                <div className="text-lg font-black text-slate-900">{items.length}</div>
                <div className="text-[10px] text-slate-400">keywords</div>
              </div>
            ))}
          </div>
          </>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          {/* Threshold */}
          <Card>
            <h2 className="text-base font-extrabold tracking-tight mb-1">Ambang Batas (Threshold) HPS</h2>
            <p className="text-slate-500 text-xs mb-3">Sembunyikan tender/RUP dengan nilai di bawah batas ini.</p>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold">Rp</span>
                <input 
                  type="number" 
                  value={hpsThreshold} 
                  onChange={e => setHpsThreshold(e.target.value)}
                  className="w-full pl-9 pr-12 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <span className="absolute right-3 top-2.5 text-slate-500 text-sm">Juta</span>
              </div>
              <Btn className="primary" onClick={() => showToast('Threshold HPS tersimpan')}><Save size={16} />Simpan</Btn>
            </div>
          </Card>

          {/* Area Coverage */}
          <Card>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h2 className="text-base font-extrabold tracking-tight">Coverage Wilayah</h2>
                <p className="text-slate-500 text-xs">Tender dari provinsi ini akan diberi skor relevansi lebih tinggi. Default: seluruh provinsi aktif.</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Btn
                  className="ghost small"
                  onClick={() => setCoverage(prev => prev.map(c => ({ ...c, active: true })))}
                >
                  Aktifkan Semua
                </Btn>
                <Btn
                  className="ghost small"
                  onClick={() => setCoverage(prev => prev.map(c => ({ ...c, active: false })))}
                >
                  Kosongkan
                </Btn>
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl h-[220px] overflow-y-auto p-3 bg-slate-50 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROVINCES.map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-200/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={coverage.some(c => c.name === p && c.active)}
                      onChange={e => {
                        setCoverage(prev => {
                          const found = prev.some(c => c.name === p);
                          return found
                            ? prev.map(c => c.name === p ? { ...c, active: e.target.checked } : c)
                            : [...prev, { name: p, active: e.target.checked }];
                        });
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-700">{p}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-[11px] text-slate-500">
                {coverage.filter(c => c.active).length} dari {PROVINCES.length} provinsi aktif.
              </div>
              <Btn
                className="primary"
                onClick={() => {
                  try {
                    localStorage.setItem('lsi-coverage', JSON.stringify(coverage));
                    showToast('Coverage wilayah tersimpan');
                  } catch {
                    showToast('Gagal menyimpan coverage', 'error');
                  }
                }}
              >
                <Save size={16} /> Simpan Coverage
              </Btn>
            </div>
          </Card>

          {/* Profil Saya */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <User size={18} className="text-slate-500" />
              <div>
                <h2 className="text-base font-extrabold tracking-tight">Profil Saya</h2>
                <p className="text-slate-500 text-xs">Informasi profil Anda yang ditampilkan di aplikasi.</p>
              </div>
            </div>
            
            {isGuest ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-amber-600" />
                  <span className="text-sm font-bold text-amber-900">Mode Guest</span>
                </div>
                <p className="text-xs text-amber-700">
                  Anda login sebagai guest. Tidak dapat mengubah profil.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-400" />
                    Email
                  </label>
                  <input 
                    type="email" 
                    value={profileDraft.email} 
                    disabled
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Email tidak dapat diubah</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User size={12} className="text-slate-400" />
                    Nama Lengkap
                  </label>
                  <input 
                    type="text" 
                    value={profileDraft.name} 
                    onChange={e => setProfileDraft(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama lengkap"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Shield size={12} className="text-slate-400" />
                    Jabatan / Peran
                  </label>
                  <input 
                    type="text" 
                    value={profileDraft.title} 
                    onChange={e => setProfileDraft(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Contoh: Sales & Marketing"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
                
                {profile?.role && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role Akun</div>
                    <Badge color={profile.role === 'admin' ? 'blue' : profile.role === 'manager' ? 'purple' : 'gray'}>
                      {profile.role === 'admin' ? 'Administrator' : profile.role === 'manager' ? 'Manager' : 'User'}
                    </Badge>
                  </div>
                )}
                
                <div className="flex justify-end mt-1">
                  <Btn 
                    className="primary" 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                  >
                    <Save size={16} />
                    {isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                  </Btn>
                </div>
              </div>
            )}
          </Card>

          {/* User Management - New Component */}
          <UserManagement showToast={showToast} />
        </div>
      </div>
    </div>
  );
}
