// Tabla genérica reutilizable con búsqueda y paginación.
// Se usa para mostrar pedidos u otros listados del sistema.
import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const defaultRows = [
  { id: 1, codigo: 'PED-2026-001', producto: 'Alcohol etílico', solicitante: 'Laura', estado: 'aprobado', fecha: '2026-04-15' },
  { id: 2, codigo: 'PED-2026-002', producto: 'Guantes nitrilo', solicitante: 'Carlos', estado: 'pendiente', fecha: '2026-04-14' },
  { id: 3, codigo: 'PED-2026-003', producto: 'Ácido acético', solicitante: 'María', estado: 'rechazado', fecha: '2026-04-13' },
  { id: 4, codigo: 'PED-2026-004', producto: 'Mascarillas', solicitante: 'Ana', estado: 'aprobado', fecha: '2026-04-12' },
  { id: 5, codigo: 'PED-2026-005', producto: 'Pipetas', solicitante: 'Luis', estado: 'pendiente', fecha: '2026-04-11' },
  { id: 6, codigo: 'PED-2026-006', producto: 'Reactivo X', solicitante: 'Jorge', estado: 'rechazado', fecha: '2026-04-10' },
];

const getStatusBadge = (estado) => {
  const styles = {
    aprobado: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
    pendiente: 'bg-amber-100 text-amber-700 border border-amber-300',
    rechazado: 'bg-rose-100 text-rose-700 border border-rose-300',
    entregado: 'bg-blue-100 text-blue-700 border border-blue-300',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${styles[estado] || 'bg-slate-100 text-slate-700 border border-slate-300'}`}>
      {estado || 'sin estado'}
    </span>
  );
};

const Tabla = ({ data = [], title = 'Pedidos recientes' }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const rows = useMemo(() => (data.length ? data : defaultRows), [data]);

  const filteredRows = useMemo(() => {
    const text = search.toLowerCase();

    return rows.filter((row) => {
      const joined = [row.codigo, row.producto, row.solicitante, row.estado, row.fecha]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = joined.includes(text);
      const matchesStatus = statusFilter === 'todos' || row.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'codigo',
        header: 'Código',
      },
      {
        accessorKey: 'producto',
        header: 'Producto',
      },
      {
        accessorKey: 'solicitante',
        header: 'Solicitante',
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ getValue }) => getStatusBadge(getValue()),
      },
      {
        accessorKey: 'fecha',
        header: 'Fecha',
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-md">
      <div className="flex flex-col gap-3 border-b border-emerald-100 bg-gradient-to-r from-[#f7fff5] to-white p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">Búsqueda, filtros y paginación integrados.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-xl border border-emerald-100 bg-[#f8fff7] py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-300 sm:w-56"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-emerald-100 bg-[#f8fff7] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <option value="todos">Todos</option>
            <option value="aprobado">Aprobado</option>
            <option value="pendiente">Pendiente</option>
            <option value="rechazado">Rechazado</option>
            <option value="entregado">Entregado</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-[#f6fff2]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-emerald-700">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-emerald-100/80">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-sm font-medium text-slate-500">
                  No se encontraron registros.
                 </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-emerald-50/60">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-4 text-sm text-slate-700">
                      {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-emerald-100 bg-[#fbfffb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="inline-flex items-center gap-1 rounded-xl border border-emerald-100 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#78d64b] to-[#43bb52] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tabla;