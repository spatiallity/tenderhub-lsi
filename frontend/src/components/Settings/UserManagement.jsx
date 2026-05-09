import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Pencil, Trash2, Save, X, Mail, User, Shield, Eye, EyeOff, Building2, Database } from 'lucide-react';
import { Card, Btn, Badge } from '../UI/index';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import supabase from '../../services/supabase';
import { UNIT_KERJA_BY_REGION, REGIONS, unitKerjaLabel, getRegion } from '../../utils/unitKerja';
import { seedAllClaims } from '../../utils/seedClaims';

export default function UserManagement({ showToast }) {
  const { isAdmin, isGuest } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [newUserDraft, setNewUserDraft] = useState({
    email: '',
    password: '',
    name: '',
    title: '',
    role: 'cabang',
    unit_kerja: '',
  });

  const [editDraft, setEditDraft] = useState({
    name: '',
    title: '',
    role: '',
    is_active: true,
    unit_kerja: '',
  });

  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(null);

  const newNeedsUnit = newUserDraft.role === 'cabang' || newUserDraft.role === 'pusat';
  const editNeedsUnit = editDraft.role === 'cabang' || editDraft.role === 'pusat';

  // Fetch users — try backend first, fallback to direct Supabase profiles read.
  const fetchUsers = async () => {
    try {
      setLoading(true);
      try {
        const response = await api.get('/users');
        setUsers(response.data || []);
        return;
      } catch (backendErr) {
        // Backend offline — fallback to Supabase.
        console.warn('[UserManagement] backend /users failed, falling back to Supabase:', backendErr.message);
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Gagal memuat daftar user', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Add new user
  const handleAddUser = async () => {
    console.log('🔵 handleAddUser called');
    
    if (!newUserDraft.email || !newUserDraft.password || !newUserDraft.name) {
      showToast('Email, password, dan nama wajib diisi', 'error');
      return;
    }
    if (newNeedsUnit && !newUserDraft.unit_kerja) {
      showToast('Pilih unit kerja untuk role Cabang atau Pusat', 'error');
      return;
    }

    try {
      // Try backend first (uses Supabase service key, auto-confirms email).
      let createdViaBackend = false;
      try {
        await api.post('/users', newUserDraft);
        createdViaBackend = true;
      } catch (backendErr) {
        console.warn('[UserManagement] backend create failed, falling back to direct Supabase signUp:', backendErr.message);
      }

      // Fallback: Supabase signUp from browser. Email confirmation may be required.
      if (!createdViaBackend) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newUserDraft.email.trim(),
          password: newUserDraft.password,
          options: {
            data: {
              name: newUserDraft.name,
              title: newUserDraft.title,
              role: newUserDraft.role,
              unit_kerja: newUserDraft.unit_kerja || null,
            },
            emailRedirectTo: window.location.origin + '/login',
          },
        });
        if (authError) throw authError;

        if (authData?.user?.id) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: authData.user.id,
            email: newUserDraft.email.trim(),
            name: newUserDraft.name.trim(),
            title: newUserDraft.title?.trim() || null,
            role: newUserDraft.role,
            unit_kerja: newNeedsUnit ? newUserDraft.unit_kerja : null,
            unit_kerja_region: newNeedsUnit ? getRegion(newUserDraft.unit_kerja) : null,
            is_active: true,
          });
          if (profileError) throw profileError;
        }
      }

      setNewUserDraft({ email: '', password: '', name: '', title: '', role: 'cabang', unit_kerja: '' });
      setShowAddForm(false);
      setShowPassword(false);
      await fetchUsers();
      showToast('User berhasil ditambahkan!', 'success');
    } catch (error) {
      console.error('Error adding user:', error);
      const msg = error?.response?.data?.detail
        || error?.message
        || 'Gagal menambahkan user';
      showToast(msg, 'error');
    }
  };

  // Update user — backend first, fallback to Supabase profiles update.
  const handleUpdateUser = async (userId) => {
    try {
      try {
        await api.patch(`/users/${userId}`, editDraft);
      } catch (backendErr) {
        console.warn('[UserManagement] backend patch failed, falling back to Supabase:', backendErr.message);
        const updates = {
          name: editDraft.name,
          title: editDraft.title,
          role: editDraft.role,
          is_active: editDraft.is_active,
          unit_kerja: editNeedsUnit ? editDraft.unit_kerja : null,
          unit_kerja_region: editNeedsUnit ? getRegion(editDraft.unit_kerja) : null,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
        if (error) throw error;
      }
      setEditingUserId(null);
      await fetchUsers();
      showToast('User berhasil diupdate!', 'success');
    } catch (error) {
      showToast(error?.response?.data?.detail || error?.message || 'Gagal mengupdate user', 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Hapus user "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      try {
        await api.delete(`/users/${userId}`);
      } catch (backendErr) {
        console.warn('[UserManagement] backend delete failed, falling back to Supabase profile delete only:', backendErr.message);
        // NOTE: Supabase JS can't delete auth.users from browser without admin key.
        // Fallback only soft-disables the profile.
        const { error } = await supabase.from('profiles').update({ is_active: false }).eq('id', userId);
        if (error) throw error;
      }
      await fetchUsers();
      showToast('User berhasil dihapus/dinonaktifkan!', 'success');
    } catch (error) {
      showToast(error?.response?.data?.detail || error?.message || 'Gagal menghapus user', 'error');
    }
  };

  // Start editing
  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditDraft({
      name: user.name || '',
      title: user.title || '',
      role: user.role,
      is_active: user.is_active,
      unit_kerja: user.unit_kerja || '',
    });
  };

  const handleSeedClaims = async () => {
    if (!confirm('Seed dummy claims ke Supabase?\nIni akan men-claim semua tender dengan status aktif (Akan/Sudah Diikuti, Menang, Kalah) ke unit kerja terdekat.')) return;
    setSeeding(true);
    setSeedProgress(null);
    try {
      const result = await seedAllClaims((p) => setSeedProgress(p));
      showToast(`Seed selesai: ${result.tender.claimed} tender + ${result.rup.claimed} RUP claimed.`, 'success');
    } catch (e) {
      showToast(`Gagal seed: ${e.message}`, 'error');
    } finally {
      setSeeding(false);
      setSeedProgress(null);
    }
  };

  if (isGuest) {
    return (
      <Card>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-900">Mode Guest</span>
          </div>
          <p className="text-xs text-amber-700">
            Anda tidak memiliki akses untuk mengelola user.
          </p>
        </div>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-slate-600" />
            <span className="text-sm font-bold text-slate-900">Akses Terbatas</span>
          </div>
          <p className="text-xs text-slate-600">
            Hanya Administrator yang dapat mengelola user.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
            <UsersIcon size={18} className="text-slate-500" />
            Manajemen Pengguna
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Kelola akun user yang dapat mengakses sistem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn className="ghost small" onClick={handleSeedClaims} disabled={seeding} title="Generate dummy claim assignments — admin only, idempotent">
            <Database size={14} />
            {seeding ? (seedProgress ? `Seeding ${seedProgress.phase} ${seedProgress.done}/${seedProgress.total}...` : 'Seeding...') : 'Seed Dummy Claims'}
          </Btn>
          {!showAddForm && (
            <Btn className="primary small" onClick={() => setShowAddForm(true)}>
              <Plus size={14} />
              Tambah User
            </Btn>
          )}
        </div>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Tambah User Baru</h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewUserDraft({ email: '', password: '', name: '', title: '', role: 'cabang', unit_kerja: '' });
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail size={12} className="text-slate-400" />
                Email *
              </label>
              <input
                type="email"
                value={newUserDraft.email}
                onChange={e => setNewUserDraft(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@sucofindo.co.id"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Shield size={12} className="text-slate-400" />
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newUserDraft.password}
                  onChange={e => setNewUserDraft(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimal 6 karakter"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User size={12} className="text-slate-400" />
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={newUserDraft.name}
                onChange={e => setNewUserDraft(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama lengkap"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jabatan
              </label>
              <input
                type="text"
                value={newUserDraft.title}
                onChange={e => setNewUserDraft(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Sales & Marketing"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Role
              </label>
              <select
                value={newUserDraft.role}
                onChange={e => setNewUserDraft(prev => ({ ...prev, role: e.target.value, unit_kerja: '' }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="cabang">Cabang (kantor cabang)</option>
                <option value="pusat">Pusat (SBU LSI)</option>
                <option value="admin">Administrator</option>
                <option value="manager">Manager (legacy)</option>
                <option value="user">User (legacy)</option>
              </select>
            </div>

            {newNeedsUnit && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Building2 size={12} className="text-slate-400" />
                  Unit Kerja *
                </label>
                <select
                  value={newUserDraft.unit_kerja}
                  onChange={e => setNewUserDraft(prev => ({ ...prev, unit_kerja: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                >
                  <option value="">— Pilih unit kerja —</option>
                  {REGIONS.map(region => (
                    <optgroup key={region} label={`Wilayah ${region}`}>
                      {UNIT_KERJA_BY_REGION[region].map(u => (
                        <option key={u} value={u}>{unitKerjaLabel(u)}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-3">
            <Btn
              className="ghost small"
              onClick={() => {
                setShowAddForm(false);
                setNewUserDraft({ email: '', password: '', name: '', title: '', role: 'cabang', unit_kerja: '' });
              }}
            >
              Batal
            </Btn>
            <Btn className="primary small" onClick={handleAddUser}>
              <Save size={14} />
              Simpan User
            </Btn>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Memuat data user...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Belum ada user. Tambahkan user pertama Anda.
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                  <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jabatan</th>
                  <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Role</th>
                  <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unit Kerja</th>
                  <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <span className="text-sm text-slate-600">{user.email}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          value={editDraft.name}
                          onChange={e => setEditDraft(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-slate-900">{user.name || '-'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          value={editDraft.title}
                          onChange={e => setEditDraft(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-slate-600">{user.title || '-'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {editingUserId === user.id ? (
                        <select
                          value={editDraft.role}
                          onChange={e => setEditDraft(prev => ({ ...prev, role: e.target.value, unit_kerja: (e.target.value === 'cabang' || e.target.value === 'pusat') ? prev.unit_kerja : '' }))}
                          className="border border-slate-300 rounded px-2 py-1 text-xs"
                        >
                          <option value="cabang">Cabang</option>
                          <option value="pusat">Pusat</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="user">User</option>
                        </select>
                      ) : (
                        <Badge
                          color={
                            user.role === 'admin' ? 'red'
                            : user.role === 'pusat' ? 'purple'
                            : user.role === 'cabang' ? 'teal'
                            : user.role === 'manager' ? 'blue'
                            : 'gray'
                          }
                          className="text-xs"
                        >
                          {user.role === 'admin' ? 'Admin'
                            : user.role === 'pusat' ? 'Pusat'
                            : user.role === 'cabang' ? 'Cabang'
                            : user.role === 'manager' ? 'Manager'
                            : 'User'}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {editingUserId === user.id && editNeedsUnit ? (
                        <select
                          value={editDraft.unit_kerja}
                          onChange={e => setEditDraft(prev => ({ ...prev, unit_kerja: e.target.value }))}
                          className="border border-slate-300 rounded px-2 py-1 text-xs w-full"
                        >
                          <option value="">— pilih —</option>
                          {REGIONS.map(region => (
                            <optgroup key={region} label={`Wilayah ${region}`}>
                              {UNIT_KERJA_BY_REGION[region].map(u => (
                                <option key={u} value={u}>{unitKerjaLabel(u)}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      ) : user.unit_kerja ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{unitKerjaLabel(user.unit_kerja)}</span>
                          {user.unit_kerja_region && <span className="text-[10px] text-slate-400">Wilayah {user.unit_kerja_region}</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {editingUserId === user.id ? (
                        <select
                          value={editDraft.is_active ? 'active' : 'inactive'}
                          onChange={e => setEditDraft(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                          className="border border-slate-300 rounded px-2 py-1 text-xs"
                        >
                          <option value="active">Aktif</option>
                          <option value="inactive">Nonaktif</option>
                        </select>
                      ) : (
                        <Badge color={user.is_active ? 'green' : 'gray'} className="text-xs">
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        {editingUserId === user.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateUser(user.id)}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-green-600 hover:bg-green-50"
                              title="Simpan"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100"
                              title="Batal"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(user)}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-blue-600 hover:bg-blue-50"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-red-600 hover:bg-red-50"
                              title="Hapus"
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
        )}
      </div>
      
      {/* Summary */}
      {users.length > 0 && (
        <div className="mt-3 text-xs text-slate-500 text-center">
          Total: {users.length} user • {users.filter(u => u.is_active).length} aktif • {users.filter(u => !u.is_active).length} nonaktif
        </div>
      )}
    </Card>
  );
}
