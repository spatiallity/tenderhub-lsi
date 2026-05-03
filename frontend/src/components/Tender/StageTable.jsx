import React from 'react';
import { Card, Badge } from '../UI/index';

export default function StageTable({ title, sub, rows }) {
  return (
    <Card>
      <h3 className="text-base font-extrabold tracking-tight">{title}</h3>
      <p className="text-slate-500 text-xs mb-3 mt-0.5">{sub}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-2 w-11">No</th>
              <th className="bg-slate-50/50 text-slate-500 text-[11px] font-bold uppercase tracking-wider px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(([name, color], i) => (
              <tr key={name} className="hover:bg-slate-50">
                <td className="font-extrabold text-xs px-3 py-2.5">{i + 1}</td>
                <td className="px-3 py-2.5">
                  <Badge color={color}>{name}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
