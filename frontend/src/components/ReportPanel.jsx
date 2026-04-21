// Componente reutilizable para reportes visuales.
// Dibuja gráficas y ofrece exportación a Excel o PDF.
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
  Legend,
} from 'recharts';
import { Download, FileText, Activity } from 'lucide-react';

const COLORS = ['#65c84b', '#8ddf67', '#43bb52', '#a3e579', '#d9f4c7'];

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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <div className="xl:col-span-2 rounded-[24px] border border-emerald-100 bg-white shadow-[0_10px_30px_rgba(34,197,94,0.08)] overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 border-b border-emerald-100 bg-gradient-to-r from-[#f6fff2] to-white">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onExportExcel} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-colors border border-emerald-100">
              <Download className="w-4 h-4" /> Excel
            </button>
            <button onClick={onExportPdf} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-lime-50 text-lime-700 font-semibold text-sm hover:bg-lime-100 transition-colors border border-lime-100">
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-2 items-stretch">
          <div className="h-[320px] min-h-[320px] min-w-0 w-full overflow-hidden rounded-2xl border border-emerald-100 bg-[#f8fff7] p-3">
            {chartsReady && (
              <ResponsiveContainer width="99%" height={280} debounce={120}>
                <BarChart data={safePrimaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbead6" />
                  <XAxis dataKey="name" tick={{ fill: '#607067', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#607067', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#43bb52" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="h-[320px] min-h-[320px] min-w-0 w-full overflow-hidden rounded-2xl border border-emerald-100 bg-[#f8fff7] p-3">
            {chartsReady && (
              <ResponsiveContainer width="99%" height={280} debounce={120}>
                <PieChart>
                  <Pie data={safeSecondaryData} dataKey="value" nameKey="name" outerRadius={95} innerRadius={45} label>
                    {safeSecondaryData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-emerald-100 bg-white shadow-[0_10px_30px_rgba(34,197,94,0.08)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-800">Actividad reciente</h3>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {activity.length === 0 ? (
            <p className="text-sm text-slate-500">No hay movimientos recientes.</p>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-emerald-100 bg-[#f8fff7] p-3">
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1">{item.detail}</p>
                <p className="text-[11px] text-emerald-600 mt-2">{item.date}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPanel;
