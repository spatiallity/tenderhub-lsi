import { useEffect, useMemo, useState } from 'react';
import { Phone, Mail, Plus, Pencil, Trash2, X } from 'lucide-react';
import supabase from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { normalizeWa, waLink } from '../utils/format';

// Free-form divisi (Excel SBU LSI mengirim PDOS / PDOS-PJL / PDOS-PSD / Kepala SBU dll).
// Helpers di bawah memetakan ke 4 warna kategori broad.
const KNOWN_DIVISI = ['FITI', 'FLP', 'SDA', 'PDOS', 'PDOS-PJL', 'PDOS-PSD', 'Kepala SBU', 'Manajemen', 'Lainnya'];

function divisiBucket(d) {
  if (!d) return 'Lainnya';
  const u = d.toUpperCase();
  if (u.includes('FITI')) return 'FITI';
  if (u.includes('FLP')) return 'FLP';
  if (u.includes('SDA')) return 'SDA';
  if (u.includes('PDOS')) return 'PDOS';
  if (u.includes('KEPALA') || u.includes('MANAJ')) return 'Manajemen';
  return 'Lainnya';
}

const BUCKET_COLOR = {
  FITI: 'bg-amber-50 border-amber-200 text-amber-800',
  FLP: 'bg-blue-50 border-blue-200 text-blue-800',
  SDA: 'bg-green-50 border-green-200 text-green-800',
  PDOS: 'bg-rose-50 border-rose-200 text-rose-800',
  Manajemen: 'bg-purple-50 border-purple-200 text-purple-800',
  Lainnya: 'bg-slate-50 border-slate-200 text-slate-700',
};

function ContactForm({ initial, divisiOptions, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    nama: '', jabatan: '', divisi: divisiOptions[0] || 'Lainnya', sub_porto: '',
    no_wa: '', email: '', catatan: ''
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
    >
      <input className="w-full border rounded-lg px-3 py-2 text-sm" required placeholder="Nama" value={form.nama} onChange={set('nama')} />
      <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Jabatan" value={form.jabatan || ''} onChange={set('jabatan')} />
      <input
        className="w-full border rounded-lg px-3 py-2 text-sm"
        placeholder="Divisi (mis. FITI / FLP / SDA / PDOS-PJL)"
        list="divisi-options"
        value={form.divisi || ''}
        onChange={set('divisi')}
      />
      <datalist id="divisi-options">
        {divisiOptions.map(d => <option key={d} value={d} />)}
      </datalist>
      <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Sub-Porto (opsional, mis. PDOS-PJL)" value={form.sub_porto || ''} onChange={set('sub_porto')} />
      <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="No WA (08xx / +62xx)" value={form.no_wa || ''} onChange={set('no_wa')} />
      <input className="w-full border rounded-lg px-3 py-2 text-sm" type="email" placeholder="Email" value={form.email || ''} onChange={set('email')} />
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

  // Distinct divisi values present in the data, fallback ke KNOWN_DIVISI.
  const divisiOptions = useMemo(() => {
    const s = new Set([...KNOWN_DIVISI, ...items.map(i => i.divisi).filter(Boolean)]);
    return Array.from(s);
  }, [items]);

  // Group cards by exact divisi value (so PDOS-PJL beda dengan PDOS-PSD).
  const grouped = useMemo(() => {
    const g = {};
    (items || []).forEach(c => {
      const k = c.divisi || 'Lainnya';
      g[k] = g[k] || [];
      g[k].push(c);
    });
    return g;
  }, [items]);
  // Custom order: Kepala SBU → PDOS (any sub) → FLP → FITI → SDA → others (alphabetical).
  const groupKeys = useMemo(() => {
    const rank = (k) => {
      const u = (k || '').toUpperCase();
      if (u.includes('KEPALA') || u.includes('MANAJ')) return 0;
      if (u.includes('PDOS')) return 1;
      if (u.includes('FLP')) return 2;
      if (u.includes('FITI')) return 3;
      if (u.includes('SDA')) return 4;
      return 5;
    };
    return Object.keys(grouped).sort((a, b) => {
      const ra = rank(a), rb = rank(b);
      if (ra !== rb) return ra - rb;
      return a.localeCompare(b);
    });
  }, [grouped]);

  const onSave = async (form) => {
    const payload = {
      nama: form.nama,
      jabatan: form.jabatan || null,
      divisi: form.divisi || 'Lainnya',
      sub_porto: form.sub_porto || form.divisi || null,
      no_wa: form.no_wa ? normalizeWa(form.no_wa) : null,
      email: form.email || null,
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
          <p className="text-sm text-slate-500">Kontak SBU LSI per divisi/sub-porto.</p>
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

      {!loading && groupKeys.length === 0 && (
        <div className="text-sm text-slate-400 italic">Belum ada kontak.</div>
      )}

      {!loading && groupKeys.map(d => {
        const color = BUCKET_COLOR[divisiBucket(d)];
        return (
          <section key={d}>
            <h2 className="text-xs font-extrabold tracking-widest uppercase text-slate-500 mb-3">{d}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {grouped[d].map(c => (
                <div key={c.id} className={`p-4 rounded-xl border ${color}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center font-bold text-slate-700 shrink-0">
                      {(c.nama || '?').slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{c.nama}</div>
                      {c.jabatan && <div className="text-[12px] text-slate-600 truncate">{c.jabatan}</div>}
                      {c.sub_porto && c.sub_porto !== c.divisi && (
                        <div className="text-[11px] text-slate-500 mt-0.5">Sub-Porto: {c.sub_porto}</div>
                      )}
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
          </section>
        );
      })}

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
                divisiOptions={divisiOptions}
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
