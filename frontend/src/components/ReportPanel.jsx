// Componente reutilizable para reportes visuales — Tema Laboratorio Claro
import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, FileText, Activity } from 'lucide-react';

const COLORS = ['#1FA971', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#06b6d4'];

// Formatea ISO → "Hoy 14:32", "Ayer 09:15", "23 abr 2026"
const formatDate = (raw) => {
  if (!raw) return null;
  try {
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    const hhmm = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 0) return `Hoy ${hhmm}`;
    if (diffDays === 1) return `Ayer ${hhmm}`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return raw; }
};

const LightTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-md px-3 py-2 shadow-lg">
      {label && <p className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-mono" style={{ color: p.color || '#1FA971' }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const ReportPanel = ({ title, subtitle, primaryData = [], secondaryData = [], activity = [], onExportExcel, onExportPdf }) => {
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChartsReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const safePrimaryData = useMemo(
    () => (primaryData?.length ? primaryData : [{ name: 'Sin datos', value: 0 }]),
    [primaryData]
  );

  const safeSecondaryData = useMemo(
    () => (secondaryData?.length ? secondaryData : [{ name: 'Sin datos', value: 1 }]),
    [secondaryData]
  );

  const compactSecondaryData = useMemo(() => {
    const normalized = [...safeSecondaryData]
      .map((item) => ({
        name: String(item.name || 'General'),
        value: Number(item.value || 0),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    if (normalized.length <= 8) {
      return normalized;
    }

    const top = normalized.slice(0, 7);
    const restValue = normalized.slice(7).reduce((acc, item) => acc + item.value, 0);
    return [...top, { name: 'Otros', value: restValue }];
  }, [safeSecondaryData]);

  const secondaryTotal = useMemo(
    () => compactSecondaryData.reduce((acc, item) => acc + item.value, 0),
    [compactSecondaryData]
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
      {/* ── Charts panel ── */}
      <div className="xl:col-span-2 bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-5 py-4 border-b border-[#E0E0E0] bg-[#E8F5F0]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white border border-[#1FA971]/20 shadow-sm">
              <Activity className="w-3.5 h-3.5 text-[#1FA971]" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-[#157A55] uppercase tracking-wider">{title}</h3>
              {subtitle && <p className="text-[10px] font-mono text-stone-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono font-bold bg-[#E8F5F0] text-[#157A55] border border-[#1FA971]/30 hover:bg-[#1FA971]/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Excel
            </button>
            <button
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          {/* Bar chart */}
          <div className="h-[280px] w-full bg-stone-50 border border-[#E0E0E0] rounded-lg p-3">
            {chartsReady && (
              <ResponsiveContainer width="99%" height={256} debounce={120}>
                <BarChart data={safePrimaryData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#78716c', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<LightTooltip />} cursor={{ fill: '#E8F5F0' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {safePrimaryData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div className="h-[280px] w-full bg-stone-50 border border-[#E0E0E0] rounded-lg p-3">
            {chartsReady && (
              <div className="h-full flex flex-col sm:flex-row gap-3">
                <div className="h-[160px] sm:h-full flex-1">
                  <ResponsiveContainer width="99%" height="100%" debounce={120}>
                    <PieChart>
                      <Pie
                        data={compactSecondaryData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={85}
                        innerRadius={40}
                        paddingAngle={3}
                        label={false}
                        labelLine={false}
                      >
                        {compactSecondaryData.map((entry, index) => (
                          <Cell key={`pie-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<LightTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="sm:w-[45%] max-h-[92px] sm:max-h-full overflow-y-auto pr-1 space-y-1">
                  {compactSecondaryData.map((item, index) => {
                    const pct = secondaryTotal > 0 ? Math.round((item.value * 100) / secondaryTotal) : 0;
                    return (
                      <div key={`legend-${item.name}-${index}`} className="flex items-center justify-between gap-2 rounded border border-stone-200 bg-white px-2 py-1">
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="truncate text-[10px] font-mono text-stone-600">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-stone-700">{item.value} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Activity feed ── */}
      <div className="bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E0E0E0] bg-[#E8F5F0]">
          <div className="p-2 rounded-lg bg-white border border-[#1FA971]/20 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-[#1FA971]" />
          </div>
          <span className="text-xs font-mono font-bold text-[#157A55] uppercase tracking-wider">Actividad reciente</span>
        </div>
        <div className="p-4 space-y-2 max-h-[340px] overflow-y-auto">
          {activity.length === 0 ? (
            <p className="text-xs font-mono text-stone-400 py-4 text-center">Sin actividad reciente</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="bg-stone-50 border border-[#E0E0E0] rounded-lg p-3 hover:bg-[#E8F5F0]/60 hover:border-[#1FA971]/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-mono font-semibold text-stone-700 leading-tight">{item.title}</p>
                  {item.badge && (
                    <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${item.badgeCls || 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-mono text-stone-500 mt-1 leading-relaxed">{item.detail}</p>
                {item.date && (
                  <p className="text-[9px] font-mono text-[#1FA971] mt-1.5">{formatDate(item.date)}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPanel;
