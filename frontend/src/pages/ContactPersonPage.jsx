import { useEffect, useMemo, useState } from 'react';
import { Phone, Mail, Plus, Pencil, Trash2, X } from 'lucide-react';
import supabase from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { normalizeWa, waLink } from '../utils/format';

const DIVISI_OPTIONS = ['FITI', 'FLP', 'SDA', 'Manajemen', 'Lainnya'];

const DIVISI_COLOR = {
  FITI: 'bg-amber-50 border-amber-200 text-amber-800',
  FLP: 'bg-blue-50 border-blue-200 text-blue-800',
  SDA: 'bg-green-50 border-green-200 text-green-800',
  Manajemen: 'bg-purple-50 border-purple-200 text-purple-800',
  Lainnya: 'bg-slate-50 border-slate-200 text-slate-700',
};

function ContactForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    nama: '', jabatan: '', divisi: 'FITI', no_wa: '', email: '', foto_url: '', catatan: ''
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
    >
      <input className="w-full border rounded-lg px-3 py-2 text-sm" required placeholder="Nama" value={form.nama} onChange={set('nama')} />
      <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Jabatan" value={form.jabatan || ''} onChange={set('jabatan')} />
      <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.divisi} onChange={set('divisi')}>
        {DIVISI_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="No WA (08xx / +62xx)" value={form.no_wa || ''} onChange={set('no_wa')} />
      <input className="w-full border rounded-lg px-3 py-2 text-sm" type="email" placeholder="Email" value={form.email || ''} onChange={set('email')} />
      <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="URL Foto (opsional)" value={form.foto_url || ''} onChange={set('foto_url')} />
      <textarea className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Catatan" value={form.catatan || ''} onChange={set('catatan')} />
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50">Batal</button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Simpan</button>
      </div>
    </form>
  );
}

export default function ContactPersonPage() {
  const { isAdmin, isGuest } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_persons')
      .select('*')
      .order('divisi', { ascending: true })
      .order('nama', { ascending: true });
    if (error) setError(error.message);
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const g = {};
    DIVISI_OPTIONS.forEach(d => { g[d] = []; });
    (items || []).forEach(c => {
      const d = DIVISI_OPTIONS.includes(c.divisi) ? c.divisi : 'Lainnya';
      g[d].push(c);
    });
    return g;
  }, [items]);

  const onSave = async (form) => {
    const payload = {
      nama: form.nama,
      jabatan: form.jabatan || null,
      divisi: form.divisi,
      no_wa: form.no_wa ? normalizeWa(form.no_wa) : null,
      email: form.email || null,
      foto_url: form.foto_url || null,
      catatan: form.catatan || null,
    };
    if (editing?.id) {
      const { error } = await supabase.from('contact_persons').update(payload).eq('id', editing.id);
      if (error) { alert(`Gagal update: ${error.message}`); return; }
    } else {
      const { error } = await supabase.from('contact_persons').insert(payload);
      if (error) { alert(`Gagal simpan: ${error.message}`); return; }
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const onDelete = async (id) => {
    if (!confirm('Hapus contact person ini?')) return;
    const { error } = await supabase.from('contact_persons').delete().eq('id', id);
    if (error) { alert(`Gagal hapus: ${error.message}`); return; }
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Contact Person</h1>
          <p className="text-sm text-slate-500">Kontak penting tiap divisi (FITI / FLP / SDA / Manajemen / Lainnya).</p>
        </div>
        {!isGuest && (
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
          >
            <Plus size={16} /> Tambah Kontak
          </button>
        )}
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      {loading && <div className="text-sm text-slate-500">Memuat…</div>}

      {!loading && DIVISI_OPTIONS.map(d => (
        <section key={d}>
          <h2 className="text-xs font-extrabold tracking-widest uppercase text-slate-500 mb-3">{d}</h2>
          {grouped[d].length === 0 ? (
            <div className="text-sm text-slate-400 italic">Belum ada kontak.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {grouped[d].map(c => (
                <div key={c.id} className={`p-4 rounded-xl border ${DIVISI_COLOR[d]}`}>
                  <div className="flex items-start gap-3">
                    {c.foto_url ? (
                      <img src={c.foto_url} alt={c.nama} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center font-bold text-slate-700">
                        {(c.nama || '?').slice(0,2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{c.nama}</div>
                      {c.jabatan && <div className="text-[12px] text-slate-600 truncate">{c.jabatan}</div>}
                    </div>
                    {!isGuest && (
                      <div className="flex gap-1">
                        <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 hover:bg-white/70 rounded">
                          <Pencil size={14} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => onDelete(c.id)} className="p-1.5 hover:bg-white/70 rounded text-red-600">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 space-y-1.5 text-[12px]">
                    {c.no_wa && (
                      <a href={waLink(c.no_wa)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                        <Phone size={13} /> {c.no_wa}
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-2 hover:underline">
                        <Mail size={13} /> {c.email}
                      </a>
                    )}
                    {c.catatan && <div className="text-slate-600 italic">{c.catatan}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-bold">{editing ? 'Edit Contact' : 'Tambah Contact'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-1.5 hover:bg-slate-100 rounded">
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <ContactForm
                initial={editing}
                onSubmit={onSave}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
