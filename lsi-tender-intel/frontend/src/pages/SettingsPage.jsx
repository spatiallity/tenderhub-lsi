import React, { useState, useEffect } from 'react';
import { Settings, Save, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { PageTitle, Card, Btn, Badge } from '../components/UI/index';
import { portfolioColor, PROVINCES } from '../utils/constants';

export default function SettingsPage() {
  const navigate = useNavigate();
  const {
    keywords, addKeyword, removeKeyword, deleteGlobalKeyword,
    coverage, setCoverage,
    hpsThreshold, setHpsThreshold,
    showToast
  } = useAppContext();

  const { profile, updateProfile, isAdmin } = useAuth();

  const [kwDraft, setKwDraft] = useState({ text: '', portfolio: 'SDA' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile Draft State (synced from auth profile)
  const [profileDraft, setProfileDraft] = useState({
    name: profile?.name || '',
    title: profile?.title || ''
  });

  useEffect(() => {
    if (profile) {
      setProfileDraft({ name: profile.name || '', title: profile.title || '' });
    }
  }, [profile]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Pengaturan Aplikasi"
        subtitle="Kelola parameter filter otomatis, threshold HPS, keyword portofolio, dan manajemen pengguna."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Keyword Manager */}
        <Card className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
              <Settings size={18} className="text-slate-500" /> Manajemen Keyword LSI
            </h2>
            <p className="text-slate-500 text-xs mt-1">Keyword digunakan untuk menghitung skor relevansi dan memfilter tender/RUP secara otomatis.</p>
          </div>

          <div className="flex gap-2">
            <input 
              placeholder="Tambah keyword baru..." 
              value={kwDraft.text}
              onChange={e => setKwDraft({ ...kwDraft, text: e.target.value })}
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
                addKeyword(kwDraft.portfolio, kwDraft.text, true);
                setKwDraft({ ...kwDraft, text: '' });
              }
            }}>Tambah</Btn>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {Object.entries(keywords).map(([port, items]) => (
              <div key={port} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge color={portfolioColor[port]}>{port}</Badge>
                  <span className="text-[11px] font-bold text-slate-500">{items.length} keywords</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map(k => (
                    <Badge key={k.id} color={k.active ? 'green' : 'gray'} className={!k.active ? 'opacity-60' : ''}>
                      {k.text}
                      <button onClick={() => deleteGlobalKeyword(port, k.id)} className="ml-1 cursor-pointer text-slate-500 hover:text-red-500 transition-colors">×</button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
            <h2 className="text-base font-extrabold tracking-tight mb-1">Coverage Wilayah</h2>
            <p className="text-slate-500 text-xs mb-3">Tender dari provinsi ini akan diberi skor relevansi lebih tinggi.</p>
            <div className="border border-slate-200 rounded-xl h-[180px] overflow-y-auto p-3 bg-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROVINCES.map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-200/50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={coverage.some(c => c.name === p && c.active)}
                      onChange={e => {
                        setCoverage(prev => prev.map(c => c.name === p ? { ...c, active: e.target.checked } : c));
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-700">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          {/* Profil Saya */}
          <Card>
            <h2 className="text-base font-extrabold tracking-tight mb-1">Profil Saya</h2>
            <p className="text-slate-500 text-xs mb-3">Informasi profil Anda yang ditampilkan di dasbor dan aplikasi.</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={profileDraft.name} 
                  onChange={e => setProfileDraft(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Peran</label>
                <input 
                  type="text" 
                  value={profileDraft.title} 
                  onChange={e => setProfileDraft(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <div className="flex justify-end mt-1">
                <Btn className="primary" disabled={savingProfile} onClick={async () => {
                  setSavingProfile(true);
                  const { error } = await updateProfile(profileDraft);
                  setSavingProfile(false);
                  if (!error) showToast('Profil berhasil diperbarui');
                  else showToast('Gagal memperbarui profil', 'error');
                }}>
                  <Save size={16} />{savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </Btn>
              </div>
            </div>
          </Card>

          {/* Manajemen Pengguna — link to dedicated page (admin only) */}
          {isAdmin && (
            <Card>
              <h2 className="text-base font-extrabold tracking-tight mb-1">Manajemen Pengguna</h2>
              <p className="text-slate-500 text-xs mb-3">Kelola akun, role akses, dan status pengguna TenderHub.</p>
              <button
                onClick={() => navigate('/users')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
              >
                <ExternalLink size={15} />
                Buka Halaman Manajemen Pengguna
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
