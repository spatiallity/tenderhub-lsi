import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Custom dot to match the design with value badges.
// Strip leading zeros (1 not 01) and skip badge when value is 0.
const CustomDot = (props) => {
  const { cx, cy, stroke, value, dataKey } = props;
  if (!cx || !cy) return null;
  const num = Number(value) || 0;
  const showBadge = num > 0;
  const text = dataKey === 'rate' ? `${num}%` : String(num);

  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#fff" stroke={stroke} strokeWidth={2.5} />
      {showBadge && (
        <g transform={`translate(${cx}, ${cy - 22})`}>
          <rect x={-18} y={-10} width={36} height={20} rx={4} fill={stroke} fillOpacity={0.15} />
          <text x={0} y={4} textAnchor="middle" fill={stroke} fontSize="11px" fontWeight="bold">
            {text}
          </text>
        </g>
      )}
    </g>
  );
};

export default function WinrateChart({ winrateRows, winrate, followed, won }) {
  const bestWinrate = winrateRows.reduce((best, row) => row.rate > best.rate ? row : best, winrateRows[0]);
  
  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-6 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Grafik Winrate</h2>
          <p className="text-slate-500 text-[13px] font-medium mt-1">Tender diikuti vs tender menang</p>
        </div>
        <div className="text-right">
          <div className="text-[36px] font-black text-emerald-500 leading-none tracking-tighter">{winrate}%</div>
          <div className="text-[12px] text-slate-500 font-medium mt-1">{won} menang dari {followed} diikuti</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-blue-500 rounded-full relative">
              <div className="absolute w-3 h-3 rounded-full bg-blue-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white" />
            </div>
            <span className="text-[12px] font-semibold text-slate-600">Tender Diikuti</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-emerald-500 rounded-full relative">
              <div className="absolute w-3 h-3 rounded-full bg-emerald-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white" />
            </div>
            <span className="text-[12px] font-semibold text-slate-600">Tender Menang</span>
          </div>
        </div>
        
        <div className="px-3 py-1.5 border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-600 flex items-center gap-2 cursor-pointer hover:bg-slate-50">
          % Winrate
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={winrateRows} margin={{ top: 30, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIkut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMenang" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
              tickFormatter={(val) => String(Number(val) || 0)}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
              labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="ikut" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIkut)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
              dot={<CustomDot />}
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="menang" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMenang)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
              dot={<CustomDot />}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Summary */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[12px] font-semibold text-slate-600">Diikuti</span>
            </div>
            <div className="text-[20px] font-black text-slate-800 ml-4">{followed}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-semibold text-slate-600">Menang</span>
            </div>
            <div className="text-[20px] font-black text-slate-800 ml-4">{won}</div>
          </div>
          
          <div className="w-[1px] h-10 bg-slate-200 mx-2" />
          
          <div className="text-[12px] text-slate-500 font-medium max-w-[280px] leading-relaxed">
            Menunjukkan performa akumulasi tender yang diikuti SBU LSI sepanjang periode 2025 - 2026.
          </div>
        </div>

        <div className="bg-[#fff8f0] px-6 py-3.5 rounded-2xl flex flex-col items-center">
          <div className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">Periode Terbaik</div>
          <div className="text-[16px] font-black text-amber-900">{bestWinrate.label}</div>
          <div className="text-[13px] font-bold text-amber-700">{bestWinrate.rate}% Winrate</div>
        </div>
      </div>
    </div>
  );
}
