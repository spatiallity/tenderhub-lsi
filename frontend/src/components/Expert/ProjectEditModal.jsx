import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const ProjectEditModal = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    lokasi_proyek: project?.lokasi_proyek || '',
    pengguna_jasa: project?.pengguna_jasa || project?.pemberi_kerja || '',
    uraian_tugas: project?.uraian_tugas || '',
    waktu_mulai: project?.waktu_mulai || '',
    waktu_selesai: project?.waktu_selesai || '',
    posisi_penugasan: project?.posisi_penugasan || project?.peran || '',
    status_kepegawaian: project?.status_kepegawaian || 'Tidak Tetap',
    surat_referensi: project?.surat_referensi || '-',
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-bold">Edit Data Proyek untuk CV</h3>
            <p className="text-sm text-slate-500">{project?.proyek || project?.nama_proyek}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Data ini akan digunakan untuk generate CV. Isi sesuai format template Sucofindo.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lokasi Proyek <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.lokasi_proyek}
              onChange={(e) => setFormData(prev => ({ ...prev, lokasi_proyek: e.target.value }))}
              placeholder="Contoh: Kel. Sepaku, Kec. Sapaku, Kab. Penajam Paser Utara - Provinsi Kalimantan Timur"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pengguna Jasa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pengguna_jasa}
              onChange={(e) => setFormData(prev => ({ ...prev, pengguna_jasa: e.target.value }))}
              placeholder="Contoh: Direktorat Perencanaan Mikro, Otorita Ibukota Nusantara"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Uraian Tugas <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.uraian_tugas}
              onChange={(e) => setFormData(prev => ({ ...prev, uraian_tugas: e.target.value }))}
              placeholder="Contoh: Membantu menyusun metodologi, rencana kerja, dan jadwal tim pelaksana pekerjaan..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none min-h-[100px] resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Waktu Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.waktu_mulai}
                onChange={(e) => setFormData(prev => ({ ...prev, waktu_mulai: e.target.value }))}
                placeholder="Contoh: Agustus 2025"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Waktu Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.waktu_selesai}
                onChange={(e) => setFormData(prev => ({ ...prev, waktu_selesai: e.target.value }))}
                placeholder="Contoh: Desember 2025"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Posisi Penugasan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.posisi_penugasan}
              onChange={(e) => setFormData(prev => ({ ...prev, posisi_penugasan: e.target.value }))}
              placeholder="Contoh: Ahli Perencanaan Wilayah dan Kota"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status Kepegawaian
            </label>
            <select
              value={formData.status_kepegawaian}
              onChange={(e) => setFormData(prev => ({ ...prev, status_kepegawaian: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value="Tidak Tetap">Tidak Tetap</option>
              <option value="Tetap">Tetap</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Surat Referensi
            </label>
            <input
              type="text"
              value={formData.surat_referensi}
              onChange={(e) => setFormData(prev => ({ ...prev, surat_referensi: e.target.value }))}
              placeholder="Contoh: 10/SK/RENTEK/04/2023 atau -"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex items-center justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Save size={18} />
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditModal;
