import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, FileText } from 'lucide-react';
import api from '../../services/api';

const CVDataModal = ({ expert, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // CV Data State
  const [cvData, setCvData] = useState({
    tempat_lahir: '',
    tanggal_lahir: '',
    posisi_diusulkan: 'Team Leader',
    pendidikan_formal: [],
    pendidikan_non_formal: [],
    penguasaan_bahasa: ['Bahasa Indonesia Baik', 'Bahasa Inggris Baik'],
  });

  // Input fields for adding new items
  const [newPendidikanFormal, setNewPendidikanFormal] = useState('');
  const [newPendidikanNonFormal, setNewPendidikanNonFormal] = useState('');
  const [newBahasa, setNewBahasa] = useState('');

  useEffect(() => {
    if (expert) {
      setCvData({
        tempat_lahir: expert.tempat_lahir || '',
        tanggal_lahir: expert.tanggal_lahir || '',
        posisi_diusulkan: expert.posisi_diusulkan || 'Team Leader',
        pendidikan_formal: expert.pendidikan_formal || [],
        pendidikan_non_formal: expert.pendidikan_non_formal || [],
        penguasaan_bahasa: expert.penguasaan_bahasa || ['Bahasa Indonesia Baik', 'Bahasa Inggris Baik'],
      });
    }
  }, [expert]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Update expert CV data via API
      await api.patch(`/experts/${expert.id}`, cvData);
      
      setSuccess(true);
      setTimeout(() => {
        if (onSave) onSave();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error saving CV data:', err);
      setError(err.response?.data?.detail || 'Gagal menyimpan data CV. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const addPendidikanFormal = () => {
    if (newPendidikanFormal.trim()) {
      setCvData(prev => ({
        ...prev,
        pendidikan_formal: [...prev.pendidikan_formal, newPendidikanFormal.trim()]
      }));
      setNewPendidikanFormal('');
    }
  };

  const removePendidikanFormal = (index) => {
    setCvData(prev => ({
      ...prev,
      pendidikan_formal: prev.pendidikan_formal.filter((_, i) => i !== index)
    }));
  };

  const addPendidikanNonFormal = () => {
    if (newPendidikanNonFormal.trim()) {
      setCvData(prev => ({
        ...prev,
        pendidikan_non_formal: [...prev.pendidikan_non_formal, newPendidikanNonFormal.trim()]
      }));
      setNewPendidikanNonFormal('');
    }
  };

  const removePendidikanNonFormal = (index) => {
    setCvData(prev => ({
      ...prev,
      pendidikan_non_formal: prev.pendidikan_non_formal.filter((_, i) => i !== index)
    }));
  };

  const addBahasa = () => {
    if (newBahasa.trim()) {
      setCvData(prev => ({
        ...prev,
        penguasaan_bahasa: [...prev.penguasaan_bahasa, newBahasa.trim()]
      }));
      setNewBahasa('');
    }
  };

  const removeBahasa = (index) => {
    setCvData(prev => ({
      ...prev,
      penguasaan_bahasa: prev.penguasaan_bahasa.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-bold">Edit Data CV</h2>
              <p className="text-sm text-slate-500">{expert?.nama}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium">✓ Data CV berhasil disimpan!</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Informasi</h3>
            <p className="text-sm text-blue-700">
              Data ini akan digunakan untuk generate CV dengan format template Sucofindo. 
              Pastikan semua data diisi dengan lengkap dan benar.
            </p>
          </div>

          {/* Data Pribadi */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Data Pribadi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tempat Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cvData.tempat_lahir}
                  onChange={(e) => setCvData(prev => ({ ...prev, tempat_lahir: e.target.value }))}
                  placeholder="Contoh: Jakarta"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cvData.tanggal_lahir}
                  onChange={(e) => setCvData(prev => ({ ...prev, tanggal_lahir: e.target.value }))}
                  placeholder="Contoh: 7 Juli 1967"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Format: DD Bulan YYYY</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Posisi yang Diusulkan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cvData.posisi_diusulkan}
                  onChange={(e) => setCvData(prev => ({ ...prev, posisi_diusulkan: e.target.value }))}
                  placeholder="Contoh: Team Leader, Ahli Teknik, dll"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Pendidikan Formal */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Pendidikan Formal</h3>
            
            {/* List */}
            <div className="space-y-2">
              {cvData.pendidikan_formal.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="flex-1 text-sm">{item}</span>
                  <button
                    onClick={() => removePendidikanFormal(index)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {cvData.pendidikan_formal.length === 0 && (
                <p className="text-sm text-slate-500 italic">Belum ada pendidikan formal</p>
              )}
            </div>

            {/* Add New */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPendidikanFormal}
                onChange={(e) => setNewPendidikanFormal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPendidikanFormal()}
                placeholder="Contoh: S1 Teknik Sipil Universitas Indonesia (1997)"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <button
                onClick={addPendidikanFormal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Plus size={16} />
                Tambah
              </button>
            </div>
          </div>

          {/* Pendidikan Non Formal */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Pendidikan Non Formal</h3>
            
            {/* List */}
            <div className="space-y-2">
              {cvData.pendidikan_non_formal.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="flex-1 text-sm">{item}</span>
                  <button
                    onClick={() => removePendidikanNonFormal(index)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {cvData.pendidikan_non_formal.length === 0 && (
                <p className="text-sm text-slate-500 italic">Belum ada pendidikan non formal</p>
              )}
            </div>

            {/* Add New */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPendidikanNonFormal}
                onChange={(e) => setNewPendidikanNonFormal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPendidikanNonFormal()}
                placeholder="Contoh: Training Certificate Project Management Professional (PMP) - 2015"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <button
                onClick={addPendidikanNonFormal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Plus size={16} />
                Tambah
              </button>
            </div>
          </div>

          {/* Penguasaan Bahasa */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Penguasaan Bahasa</h3>
            
            {/* List */}
            <div className="space-y-2">
              {cvData.penguasaan_bahasa.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="flex-1 text-sm">{item}</span>
                  <button
                    onClick={() => removeBahasa(index)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newBahasa}
                onChange={(e) => setNewBahasa(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addBahasa()}
                placeholder="Contoh: Bahasa Mandarin Cukup"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <button
                onClick={addBahasa}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Plus size={16} />
                Tambah
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">📝 Catatan Penting</h4>
            <ul className="text-sm text-amber-700 space-y-1 ml-4 list-disc">
              <li>Data proyek akan diambil dari <strong>Riwayat Pekerjaan</strong> yang sudah ada di bawah</li>
              <li>Untuk edit data proyek (lokasi, pengguna jasa, uraian tugas, dll), gunakan form <strong>"Tambah Riwayat Pekerjaan"</strong></li>
              <li>Proyek akan dikelompokkan berdasarkan <strong>tahun</strong> di CV</li>
              <li>Pastikan data proyek sudah lengkap: lokasi, pengguna jasa, uraian tugas, waktu, posisi, status kepegawaian, surat referensi</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex items-center justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !cvData.tempat_lahir || !cvData.tanggal_lahir}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {loading ? 'Menyimpan...' : 'Simpan Data CV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVDataModal;
