import { useState, useRef, useEffect } from 'react';
import { FileText, ChevronDown, Loader2 } from 'lucide-react';

const MIME = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pdf: 'application/pdf',
};

export default function CvDownloadMenu({ expert }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const fetchAndSave = async (url, accept, filename) => {
    const res = await fetch(url, { method: 'GET', headers: { Accept: accept } });
    if (!res.ok) {
      const txt = await res.text();
      const err = new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
      err.status = res.status;
      throw err;
    }
    const blob = await res.blob();
    const objUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objUrl);
  };

  const download = async (fmt) => {
    if (!expert?.id) return;
    setBusy(fmt);
    setOpen(false);
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const safeName = (expert.nama || 'expert').replace(/\s+/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const url = fmt === 'pdf'
      ? `${apiBase}/cv/${expert.id}/cv/pdf`
      : `${apiBase}/cv/${expert.id}/cv`;
    try {
      await fetchAndSave(url, MIME[fmt], `CV_${safeName}_${date}.${fmt}`);
    } catch (err) {
      console.error('[CvDownloadMenu] download failed', err);
      // 503 / 502 / 504 = HF Space crashed or sleeping. PDF needs LibreOffice on
      // the backend; fall back to DOCX if user asked for PDF.
      const isUpstreamDown = [502, 503, 504].includes(err.status);
      if (fmt === 'pdf' && isUpstreamDown) {
        try {
          const docxUrl = `${apiBase}/cv/${expert.id}/cv`;
          await fetchAndSave(docxUrl, MIME.docx, `CV_${safeName}_${date}.docx`);
          alert('Server PDF sedang down (HuggingFace Space error 503). Otomatis download DOCX sebagai gantinya.');
          setBusy(null);
          return;
        } catch (fallbackErr) {
          console.error('[CvDownloadMenu] DOCX fallback failed', fallbackErr);
        }
      }
      const friendly = isUpstreamDown
        ? `Server CV sedang down (HTTP ${err.status}). Coba lagi beberapa menit lagi atau restart HuggingFace Space.`
        : `Gagal download CV (${fmt.toUpperCase()}): ${err.message}`;
      alert(friendly);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={busy !== null}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-60"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
        {busy ? `Generating ${busy.toUpperCase()}…` : 'Generate CV'}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => download('docx')}
            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
          >
            <FileText size={14} /> Download DOCX
          </button>
          <button
            onClick={() => download('pdf')}
            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 border-t"
          >
            <FileText size={14} /> Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
