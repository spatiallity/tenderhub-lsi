import { Fragment, useEffect, useMemo, useState } from 'react';
import { Filter, RefreshCw, Shield } from 'lucide-react';
import supabase from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

const ACTION_COLOR = {
  INSERT: 'bg-green-100 text-green-800 border-green-200',
  UPDATE: 'bg-amber-100 text-amber-800 border-amber-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
};

function fmtDate(s) {
  if (!s) return '-';
  try { return new Date(s).toLocaleString('id-ID'); } catch { return s; }
}

export default function AuditLogPage() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  const [filterUser, setFilterUser] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [limit, setLimit] = useState(100);

  const load = async () => {
    setLoading(true);
    setError(null);
    let q = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (filterEntity) q = q.eq('entity_table', filterEntity);
    if (filterAction) q = q.eq('action', filterAction);
    if (filterUser) q = q.ilike('actor_email', `%${filterUser}%`);
    const { data, error } = await q;
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]); // eslint-disable-line

  const entities = useMemo(() => {
    const s = new Set(rows.map(r => r.entity_table).filter(Boolean));
    return Array.from(s).sort();
  }, [rows]);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 rounded-xl border bg-white text-center">
        <Shield className="mx-auto mb-3 text-red-500" size={32} />
        <h2 className="font-bold mb-1">Akses Ditolak</h2>
        <p className="text-sm text-slate-500">Audit log hanya untuk admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Audit Log</h1>
          <p className="text-sm text-slate-500">Catatan perubahan data — siapa, apa, dan kapan.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border hover:bg-slate-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="p-3 rounded-xl border bg-white flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-slate-500" />
        <input
          placeholder="Email user…"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="text-sm border rounded-lg px-2 py-1.5"
        />
        <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} className="text-sm border rounded-lg px-2 py-1.5">
          <option value="">Semua tabel</option>
          {entities.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="text-sm border rounded-lg px-2 py-1.5">
          <option value="">Semua aksi</option>
          <option value="INSERT">INSERT</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <select value={limit} onChange={e => setLimit(Number(e.target.value))} className="text-sm border rounded-lg px-2 py-1.5">
          {[50,100,200,500].map(n => <option key={n} value={n}>{n} baris</option>)}
        </select>
        <button onClick={load} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Apply</button>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      {loading && <div className="text-sm text-slate-500">Memuat…</div>}

      {!loading && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left px-3 py-2">Waktu</th>
                <th className="text-left px-3 py-2">User</th>
                <th className="text-left px-3 py-2">Aksi</th>
                <th className="text-left px-3 py-2">Tabel</th>
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">Ringkasan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">Tidak ada log.</td></tr>
              )}
              {rows.map(r => (
                <Fragment key={r.id}>
                  <tr className="border-t hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(s => ({ ...s, [r.id]: !s[r.id] }))}>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-600">{fmtDate(r.created_at)}</td>
                    <td className="px-3 py-2 truncate max-w-[160px]">{r.actor_email || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded border ${ACTION_COLOR[r.action] || ''}`}>{r.action}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[12px]">{r.entity_table}</td>
                    <td className="px-3 py-2 font-mono text-[12px]">{r.entity_id}</td>
                    <td className="px-3 py-2 text-slate-700">{r.summary}</td>
                  </tr>
                  {expanded[r.id] && (
                    <tr className="border-t bg-slate-50">
                      <td colSpan={6} className="px-3 py-3">
                        <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap break-words">
{JSON.stringify({ changed_fields: r.changed_fields, old_data: r.old_data, new_data: r.new_data }, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
