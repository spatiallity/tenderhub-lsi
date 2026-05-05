import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Pencil, Trash2, Save, X, Mail, User, Shield, Eye, EyeOff } from 'lucide-react';
import { Card, Btn, Badge } from '../UI/index';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

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
    role: 'user'
  });
  
  const [editDraft, setEditDraft] = useState({
    name: '',
    title: '',
    role: '',
    is_active: true
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data || []);
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

    try {
      console.log('🔵 Posting user...', newUserDraft);
      const response = await api.post('/users', newUserDraft);
      console.log('✅ User created:', response.data);
      
      // Reset form dan tutup
      setNewUserDraft({ email: '', password: '', name: '', title: '', role: 'user' });
      setShowAddForm(false);
      setShowPassword(false);
      
      // Refresh list
      console.log('🔵 Fetching users...');
      await fetchUsers();
      console.log('✅ Users refreshed');
      
      // Show success notification
      console.log('🔵 Showing toast...');
      showToast('User berhasil ditambahkan!', 'success');
      console.log('✅ Toast shown');
    } catch (error) {
      console.error('❌ Error adding user:', error);
      showToast(error.response?.data?.detail || 'Gagal menambahkan user', 'error');
    }
  };

  // Update user
  const handleUpdateUser = async (userId) => {
    try {
      await api.patch(`/users/${userId}`, editDraft);
      
      // Reset editing state
      setEditingUserId(null);
      
      // Refresh list
      await fetchUsers();
      
      // Show success notification
      showToast('✅ User berhasil diupdate!', 'success');
    } catch (error) {
      showToast(error.response?.data?.detail || 'Gagal mengupdate user', 'error');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Hapus user "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      
      // Refresh list
      await fetchUsers();
      
      // Show success notification
      showToast('✅ User berhasil dihapus!', 'success');
    } catch (error) {
      showToast(error.response?.data?.detail || 'Gagal menghapus user', 'error');
    }
  };

  // Start editing
  const startEdit = (user) => {
    setEditingUserId(user.id);
    setEditDraft({
      name: user.name || '',
      title: user.title || '',
      role: user.role,
      is_active: user.is_active
    });
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
        {!showAddForm && (
          <Btn className="primary small" onClick={() => setShowAddForm(true)}>
            <Plus size={14} />
            Tambah User
          </Btn>
        )}
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Tambah User Baru</h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewUserDraft({ email: '', password: '', name: '', title: '', role: 'user' });
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
                onChange={e => setNewUserDraft(prev => ({ ...prev, role: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-3">
            <Btn
              className="ghost small"
              onClick={() => {
                setShowAddForm(false);
                setNewUserDraft({ email: '', password: '', name: '', title: '', role: 'user' });
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
                          onChange={e => setEditDraft(prev => ({ ...prev, role: e.target.value }))}
                          className="border border-slate-300 rounded px-2 py-1 text-xs"
                        >
                          <option value="user">User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <Badge color={user.role === 'admin' ? 'blue' : user.role === 'manager' ? 'purple' : 'gray'} className="text-xs">
                          {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : 'User'}
                        </Badge>
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
