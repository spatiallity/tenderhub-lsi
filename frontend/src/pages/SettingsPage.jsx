import React, { useState } from 'react';
import { Settings, Save, Pencil, Trash2 } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { PageTitle, Card, Btn, Badge } from '../components/UI/index';
import { portfolioColor, PROVINCES } from '../utils/constants';

export default function SettingsPage() {
  const {
    keywords, addKeyword, removeKeyword,
    users, addUser, updateUser, deleteUser,
    coverage, setCoverage,
    hpsThreshold, setHpsThreshold,
    showToast
  } = useAppContext();

  const [kwDraft, setKwDraft] = useState({ text: '', portfolio: 'SDA' });
  const [userDraft, setUserDraft] = useState({ nama: '', role: 'PIC', aktif: true });
  const [editingUserId, setEditingUserId] = useState(null);

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
                addKeyword(kwDraft.portfolio, kwDraft.text);
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
                      <button onClick={() => removeKeyword(port, k.id)} className="ml-1 cursor-pointer text-slate-500 hover:text-red-500 transition-colors">×</button>
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

          {/* Manajemen User (Mock) */}
          <Card>
            <h2 className="text-base font-extrabold tracking-tight mb-1">Manajemen Pengguna (PIC)</h2>
            <p className="text-slate-500 text-xs mb-3">Daftar akun SBU LSI yang dapat di-assign sebagai PIC tender.</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
              <input
                placeholder="Nama pengguna"
                value={userDraft.nama}
                onChange={e => setUserDraft(prev => ({ ...prev, nama: e.target.value }))}
                className="md:col-span-2 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <select
                value={userDraft.role}
                onChange={e => setUserDraft(prev => ({ ...prev, role: e.target.value }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="PIC">PIC</option>
                <option value="Admin">Admin</option>
                <option value="Reviewer">Reviewer</option>
              </select>
              <Btn className="primary" onClick={() => {
                addUser(userDraft);
                setUserDraft({ nama: '', role: 'PIC', aktif: true });
              }}>
                Tambah Pengguna
              </Btn>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">Nama</th>
                    <th className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">Role</th>
                    <th className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="bg-white">
                      <td className="px-3 py-2 font-bold">
                        {editingUserId === u.id ? (
                          <input
                            value={userDraft.nama}
                            onChange={e => setUserDraft(prev => ({ ...prev, nama: e.target.value }))}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        ) : u.nama}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {editingUserId === u.id ? (
                          <select
                            value={userDraft.role}
                            onChange={e => setUserDraft(prev => ({ ...prev, role: e.target.value }))}
                            className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                          >
                            <option value="PIC">PIC</option>
                            <option value="Admin">Admin</option>
                            <option value="Reviewer">Reviewer</option>
                          </select>
                        ) : u.role}
                      </td>
                      <td className="px-3 py-2">
                        {editingUserId === u.id ? (
                          <select
                            value={userDraft.aktif ? 'aktif' : 'nonaktif'}
                            onChange={e => setUserDraft(prev => ({ ...prev, aktif: e.target.value === 'aktif' }))}
                            className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-100 outline-none"
                          >
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Non-aktif</option>
                          </select>
                        ) : (
                          <Badge color={u.aktif ? 'green' : 'gray'}>{u.aktif ? 'Aktif' : 'Non-aktif'}</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-1.5">
                          {editingUserId === u.id ? (
                            <>
                              <Btn className="primary small" onClick={() => {
                                updateUser(u.id, userDraft);
                                setEditingUserId(null);
                                setUserDraft({ nama: '', role: 'PIC', aktif: true });
                              }}>Simpan</Btn>
                              <Btn className="ghost small" onClick={() => {
                                setEditingUserId(null);
                                setUserDraft({ nama: '', role: 'PIC', aktif: true });
                              }}>Batal</Btn>
                            </>
                          ) : (
                            <>
                              <button
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100"
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setUserDraft({ nama: u.nama, role: u.role, aktif: u.aktif });
                                }}
                                title="Edit pengguna"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50"
                                onClick={() => deleteUser(u.id)}
                                title="Hapus pengguna"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
