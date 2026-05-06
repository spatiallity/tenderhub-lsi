import React, { useState } from 'react';
import { X, FileText, Download } from 'lucide-react';
import api from '../../services/api';

const CVGeneratorModal = ({ expert, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateFromTemplate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call backend API to generate CV from template
      const response = await api.get(`/cv/${expert.id}/cv`, {
        responseType: 'blob' // Important for file download
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CV_${expert.nama.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Show success message
      alert('CV berhasil di-generate! File akan segera didownload.');
      onClose();
    } catch (err) {
      console.error('Error generating CV:', err);
      setError(err.response?.data?.detail || 'Gagal generate CV. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-bold">Generate CV</h2>
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📄 Generate CV dari Template</h3>
            <p className="text-sm text-blue-700 mb-3">
              CV akan di-generate menggunakan template resmi Sucofindo dengan data expert yang sudah tersimpan:
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-4">
              <li>✓ Nama: {expert?.nama}</li>
              <li>✓ No. HP: {expert?.noHp || 'Belum diisi'}</li>
              <li>✓ Instansi: {expert?.instansi}</li>
              <li>✓ Keahlian: {expert?.keahlian?.join(', ') || 'Belum diisi'}</li>
              <li>✓ Riwayat Proyek: {expert?.history?.length || 0} proyek</li>
              <li>✓ Rating: {expert?.rating || 0}/5.0</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">⚠️ Catatan Penting</h4>
            <ul className="text-sm text-amber-700 space-y-1 ml-4">
              <li>• CV akan di-generate dalam format DOCX (Microsoft Word)</li>
              <li>• Anda bisa mengedit CV setelah di-download</li>
              <li>• Pastikan data expert sudah lengkap untuk hasil terbaik</li>
              <li>• Template mengikuti format resmi Sucofindo</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={handleGenerateFromTemplate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            {loading ? 'Generating...' : 'Generate CV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVGeneratorModal;
