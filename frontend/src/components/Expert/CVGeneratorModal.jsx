import React, { useState } from 'react';
import { X, FileText, Download } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const CVGeneratorModal = ({ expert, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateFromTemplate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[CV Generator] Starting CV generation for expert:', expert.id);
      
      // Direct fetch instead of axios to avoid interceptor issues
      const response = await fetch(`${API_BASE}/cv/${expert.id}/cv`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      });
      
      console.log('[CV Generator] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get blob from response
      const blob = await response.blob();
      console.log('[CV Generator] Blob size:', blob.size);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const filename = `CV_${expert.nama.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('[CV Generator] Download triggered successfully');
      
      // Show success message
      alert('CV berhasil di-generate! File akan segera didownload.');
      onClose();
    } catch (err) {
      console.error('[CV Generator] Error:', err);
      setError(err.message || 'Gagal generate CV. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Generate CV</h2>
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
          {/* Info Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">📄 Generate CV dari Template Sucofindo</h3>
                <p className="text-sm text-blue-700 mb-3">
                  CV akan di-generate menggunakan template resmi Sucofindo dengan data expert yang sudah tersimpan.
                </p>
                
                {/* Expert Data Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Nama Lengkap</p>
                    <p className="text-sm font-semibold text-blue-900">{expert?.nama}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">No. HP</p>
                    <p className="text-sm font-semibold text-blue-900">{expert?.noHp || 'Belum diisi'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Instansi</p>
                    <p className="text-sm font-semibold text-blue-900">{expert?.instansi}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-medium mb-1">Rating</p>
                    <p className="text-sm font-semibold text-blue-900">{expert?.rating || 0}/5.0</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-blue-600 font-medium mb-1">Keahlian</p>
                    <p className="text-sm font-semibold text-blue-900">{expert?.keahlian?.join(', ') || 'Belum diisi'}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-blue-600 font-medium mb-1">Riwayat Proyek</p>
                    <p className="text-sm font-semibold text-blue-900">{expert?.history?.length || 0} proyek</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <div className="p-1 bg-red-100 rounded">
                <X className="text-red-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 mb-1">Gagal Generate CV</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              Catatan Penting
            </h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-amber-800">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>CV akan di-generate dalam format <strong>DOCX (Microsoft Word)</strong></span>
              </li>
              <li className="flex items-start gap-2 text-sm text-amber-800">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Anda bisa mengedit CV setelah di-download</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-amber-800">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Pastikan data expert sudah lengkap untuk hasil terbaik</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-amber-800">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>Template mengikuti format resmi Sucofindo</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t px-6 py-4 flex items-center justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 rounded-lg hover:bg-white transition-colors font-medium text-slate-700"
            disabled={loading}
          >
            Batal
          </button>
          <button
            onClick={handleGenerateFromTemplate}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
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
