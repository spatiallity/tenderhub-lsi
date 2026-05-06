import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, FileText, ChevronDown, ChevronUp, CheckCircle, Loader } from 'lucide-react';
import api from '../../services/api';

const ProjectCVSection = ({ project, onSaveSuccess }) => {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [data, setData] = useState({
    nama_perusahaan_lain: project.nama_perusahaan_lain || '',
    lokasi_proyek: project.lokasi_proyek || '',
    pengguna_jasa: project.pengguna_jasa || project.klien || '',
    uraian_tugas: project.uraian_tugas || '',
    waktu_mulai: project.waktu_mulai || '',
    waktu_selesai: project.waktu_selesai || '',
    posisi_penugasan: project.posisi_penugasan || project.peran || '',
    status_kepegawaian: project.status_kepegawaian || 'Tidak Tetap',
    surat_referensi: project.surat_referensi || '-',
  });

  const isComplete = !!(data.lokasi_proyek && data.pengguna_jasa && data.uraian_tugas &&
    data.waktu_mulai && data.waktu_selesai && data.posisi_penugasan);

  const set = (key) => (e) => setData(p => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await api.patch(`/experts/projects/${project.id}`, data);
      setSaved(true);
      if (onSaveSuccess) onSaveSuccess(project.id, data);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.detail || 'Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${isComplete ? 'border-green-200' : 'border-amber-200'}`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
          isComplete ? 'bg-green-50 hover:bg-green-100' : 'bg-amber-50 hover:bg-amber-100'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {isComplete ? (
            <CheckCircle size={16} className="text-green-600 shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-amber-400 shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">
              {project.proyek || project.nama_proyek}
            </div>
            <div className="text-xs text-slate-500">
              {project.tahun || '-'} &middot; {isComplete ? 'Data lengkap' : 'Belum lengkap'}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="shrink-0 text-slate-500" /> : <ChevronDown size={18} className="shrink-0 text-slate-500" />}
      </button>

      {expanded && (
        <div className="p-4 bg-white space-y-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Perusahaan Pelaksana</label>
            <input
              type="text"
              value={data.nama_perusahaan_lain}
              onChange={set('nama_perusahaan_lain')}
              placeholder="Contoh: PT. Ciriajasa Engineering Consultant, Jakarta"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <p className="text-xs text-slate-400 mt-0.5">Kosongkan jika PT Sucofindo langsung</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lokasi Proyek <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.lokasi_proyek}
              onChange={set('lokasi_proyek')}
              placeholder="Contoh: Kel. Sepaku, Kab. Penajam Paser Utara - Provinsi Kalimantan Timur"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pengguna Jasa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.pengguna_jasa}
              onChange={set('pengguna_jasa')}
              placeholder="Contoh: Direktorat Perencanaan Mikro, Otorita Ibukota Nusantara"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Uraian Tugas <span className="text-red-500">*</span>
            </label>
            <textarea
              value={data.uraian_tugas}
              onChange={set('uraian_tugas')}
              placeholder="Pisahkan dengan titik koma (;). Contoh: Menyusun metodologi; Membuat rencana kerja; Melakukan koordinasi lapangan"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none min-h-[90px] resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waktu Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.waktu_mulai}
                onChange={set('waktu_mulai')}
                placeholder="Contoh: Agustus 2025"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Waktu Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.waktu_selesai}
                onChange={set('waktu_selesai')}
                placeholder="Contoh: Desember 2025"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Posisi Penugasan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.posisi_penugasan}
              onChange={set('posisi_penugasan')}
              placeholder="Contoh: Ahli Perencanaan Wilayah dan Kota"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
              <select
                value={data.status_kepegawaian}
                onChange={set('status_kepegawaian')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option value="Tidak Tetap">Tidak Tetap</option>
                <option value="Tetap">Tetap</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Surat Referensi</label>
              <input
                type="text"
                value={data.surat_referensi}
                onChange={set('surat_referensi')}
                placeholder="No. Surat atau -"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <p className="text-xs text-red-700">{saveError}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
              saved
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed'
            }`}
          >
            {saving ? (
              <><Loader size={15} className="animate-spin" /> Menyimpan...</>
            ) : saved ? (
              <><CheckCircle size={15} /> Tersimpan!</>
            ) : (
              <><Save size={15} /> Simpan Data Proyek Ini</>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const CVDataModal = ({ expert, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [cvData, setCvData] = useState({
    tempat_lahir: '',
    tanggal_lahir: '',
    posisi_diusulkan: 'Team Leader',
    pendidikan_formal: [],
    pendidikan_non_formal: [],
    penguasaan_bahasa: ['Bahasa Indonesia Baik', 'Bahasa Inggris Baik'],
  });

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

  const handleSaveExpert = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.patch(`/experts/${expert.id}`, cvData);
      setSuccess(true);
      setTimeout(() => {
        if (onSave) onSave();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal menyimpan data CV. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const addPendidikanFormal = () => {
    if (!newPendidikanFormal.trim()) return;
    setCvData(prev => ({ ...prev, pendidikan_formal: [...prev.pendidikan_formal, newPendidikanFormal.trim()] }));
    setNewPendidikanFormal('');
  };
  const removePendidikanFormal = (i) => setCvData(prev => ({ ...prev, pendidikan_formal: prev.pendidikan_formal.filter((_, idx) => idx !== i) }));

  const addPendidikanNonFormal = () => {
    if (!newPendidikanNonFormal.trim()) return;
    setCvData(prev => ({ ...prev, pendidikan_non_formal: [...prev.pendidikan_non_formal, newPendidikanNonFormal.trim()] }));
    setNewPendidikanNonFormal('');
  };
  const removePendidikanNonFormal = (i) => setCvData(prev => ({ ...prev, pendidikan_non_formal: prev.pendidikan_non_formal.filter((_, idx) => idx !== i) }));

  const addBahasa = () => {
    if (!newBahasa.trim()) return;
    setCvData(prev => ({ ...prev, penguasaan_bahasa: [...prev.penguasaan_bahasa, newBahasa.trim()] }));
    setNewBahasa('');
  };
  const removeBahasa = (i) => setCvData(prev => ({ ...prev, penguasaan_bahasa: prev.penguasaan_bahasa.filter((_, idx) => idx !== i) }));

  const projects = expert?.history || [];
  const completeCount = projects.filter(p => p.lokasi_proyek && p.pengguna_jasa && p.uraian_tugas && p.waktu_mulai && p.posisi_penugasan).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={22} />
            <div>
              <h2 className="text-lg font-bold">Edit Data CV</h2>
              <p className="text-sm text-slate-500">{expert?.nama}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 font-medium">Data CV berhasil disimpan!</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ── SECTION 1: Data Pribadi ── */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-800 border-b pb-2">Data Pribadi</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cvData.tempat_lahir}
                  onChange={e => setCvData(p => ({ ...p, tempat_lahir: e.target.value }))}
                  placeholder="Contoh: Jakarta"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cvData.tanggal_lahir}
                  onChange={e => setCvData(p => ({ ...p, tanggal_lahir: e.target.value }))}
                  placeholder="Contoh: 7 Juli 1967"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <p className="text-xs text-slate-400 mt-0.5">Format: DD Bulan YYYY</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Posisi yang Diusulkan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cvData.posisi_diusulkan}
                  onChange={e => setCvData(p => ({ ...p, posisi_diusulkan: e.target.value }))}
                  placeholder="Contoh: Team Leader, Ahli Teknik Sipil, dll"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Pendidikan Formal ── */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-800 border-b pb-2">Pendidikan Formal</h3>

            <div className="space-y-2">
              {cvData.pendidikan_formal.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <span className="flex-1 text-sm">{item}</span>
                  <button onClick={() => removePendidikanFormal(i)} className="text-red-400 hover:text-red-600 shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {cvData.pendidikan_formal.length === 0 && (
                <p className="text-sm text-slate-400 italic">Belum ada pendidikan formal</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newPendidikanFormal}
                onChange={e => setNewPendidikanFormal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPendidikanFormal()}
                placeholder="Contoh: S1 Teknik Sipil Universitas Indonesia (1997)"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <button
                onClick={addPendidikanFormal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1.5 shrink-0"
              >
                <Plus size={15} /> Tambah
              </button>
            </div>
          </div>

          {/* ── SECTION 3: Pendidikan Non Formal ── */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-800 border-b pb-2">Pendidikan Non Formal / Sertifikat</h3>

            <div className="space-y-2">
              {cvData.pendidikan_non_formal.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <span className="flex-1 text-sm">{item}</span>
                  <button onClick={() => removePendidikanNonFormal(i)} className="text-red-400 hover:text-red-600 shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {cvData.pendidikan_non_formal.length === 0 && (
                <p className="text-sm text-slate-400 italic">Belum ada pendidikan non formal</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newPendidikanNonFormal}
                onChange={e => setNewPendidikanNonFormal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPendidikanNonFormal()}
                placeholder="Contoh: Training PMP - Project Management Professional (2015)"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <button
                onClick={addPendidikanNonFormal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1.5 shrink-0"
              >
                <Plus size={15} /> Tambah
              </button>
            </div>
          </div>

          {/* ── SECTION 4: Penguasaan Bahasa ── */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-slate-800 border-b pb-2">Penguasaan Bahasa</h3>

            <div className="space-y-2">
              {cvData.penguasaan_bahasa.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                  <span className="flex-1 text-sm">{item}</span>
                  <button onClick={() => removeBahasa(i)} className="text-red-400 hover:text-red-600 shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newBahasa}
                onChange={e => setNewBahasa(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addBahasa()}
                placeholder="Contoh: Bahasa Inggris Aktif"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <button
                onClick={addBahasa}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-1.5 shrink-0"
              >
                <Plus size={15} /> Tambah
              </button>
            </div>
          </div>

          {/* ── SECTION 5: Data Proyek untuk CV ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base text-slate-800">Data Proyek untuk CV</h3>
              {projects.length > 0 && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  completeCount === projects.length ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {completeCount}/{projects.length} lengkap
                </span>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                Setiap proyek harus dilengkapi untuk generate CV. Klik proyek untuk expand dan isi datanya.
                Simpan masing-masing proyek secara individual.
              </p>
            </div>

            {projects.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                <p className="text-sm text-slate-500">Belum ada riwayat pekerjaan.</p>
                <p className="text-xs text-slate-400 mt-1">Tambahkan proyek di bagian "Tambah Riwayat Pekerjaan" di bawah halaman ini.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map(project => (
                  <ProjectCVSection key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-5 flex items-center justify-between gap-3 bg-slate-50">
          <p className="text-xs text-slate-500">
            Simpan data pribadi &amp; pendidikan, lalu simpan tiap proyek secara terpisah.
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
              disabled={loading}
            >
              Tutup
            </button>
            <button
              onClick={handleSaveExpert}
              disabled={loading || !cvData.tempat_lahir || !cvData.tanggal_lahir}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {loading ? 'Menyimpan...' : 'Simpan Data Pribadi & Pendidikan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVDataModal;
