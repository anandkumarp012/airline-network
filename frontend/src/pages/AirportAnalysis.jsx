import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, Search } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';
import { useInitialLoading } from '../components/InitialLoadingContext';

export default function AirportAnalysis() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState('Degree');
  const [sortDirection, setSortDirection] = useState('desc');
  const { markInitialDataReady } = useInitialLoading();

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await api.get('/airports');
        setData(res.data);
      } catch (err) {
        setError('Unable to load airport analysis data.');
      } finally {
        setLoading(false);
        markInitialDataReady();
      }
    };
    fetchAirports();
  }, []);

  const filtered = useMemo(() => {
    const normalized = data.filter((item) => {
      const needle = search.toLowerCase();
      return !needle || [item['IATA'], item['Airport Name'], item.City].join(' ').toLowerCase().includes(needle);
    });

    return [...normalized].sort((a, b) => {
      const left = Number(a[sortKey] ?? 0);
      const right = Number(b[sortKey] ?? 0);
      if (sortDirection === 'asc') return left - right;
      return right - left;
    });
  }, [data, search, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const downloadCsv = () => {
    const rows = filtered.map((item) => ({
      IATA: item.IATA,
      Airport_Name: item['Airport Name'],
      City: item.City,
      Latitude: item.Latitude,
      Longitude: item.Longitude,
      Degree: item.Degree,
      Degree_Centrality: item['Degree Centrality'],
      Closeness_Centrality: item['Closeness Centrality'],
      Betweenness_Centrality: item['Betweenness Centrality'],
      Eigenvector_Centrality: item['Eigenvector Centrality'],
      PageRank: item.PageRank,
    }));

    const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map((row) => Object.values(row).map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'airport-analysis.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loading message="Loading airport analysis..." />;
  if (error) return <div className="card-surface rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-red-200"><AlertTriangle className="inline-block mr-2" size={18}/> {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <h2 className="text-3xl font-semibold text-white">Airport Analysis</h2>
        <button onClick={downloadCsv} className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100"><Download size={16}/> CSV Download</button>
      </div>

      <div className="card-surface rounded-2xl border p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search airport" className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none" />
          </label>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span>Rows</span>
            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }} className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                {['IATA','Airport Name','City','Latitude','Longitude','Degree','Degree Centrality','Closeness Centrality','Betweenness Centrality','Eigenvector Centrality','PageRank'].map((header) => (
                  <th key={header} className="border-b border-slate-700 px-3 py-3 font-medium">
                    <button onClick={() => handleSort(header === 'Airport Name' ? 'Airport Name' : header)} className="hover:text-white">{header}</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => (
                <tr key={item.IATA} className="border-b border-slate-800 hover:bg-slate-900/60">
                  <td className="px-3 py-3 font-medium text-white">{item.IATA}</td>
                  <td className="px-3 py-3">{item['Airport Name']}</td>
                  <td className="px-3 py-3">{item.City}</td>
                  <td className="px-3 py-3">{item.Latitude}</td>
                  <td className="px-3 py-3">{item.Longitude}</td>
                  <td className="px-3 py-3">{item.Degree}</td>
                  <td className="px-3 py-3">{Number(item['Degree Centrality'] || 0).toFixed(4)}</td>
                  <td className="px-3 py-3">{Number(item['Closeness Centrality'] || 0).toFixed(4)}</td>
                  <td className="px-3 py-3">{Number(item['Betweenness Centrality'] || 0).toFixed(4)}</td>
                  <td className="px-3 py-3">{Number(item['Eigenvector Centrality'] || 0).toFixed(4)}</td>
                  <td className="px-3 py-3">{Number(item.PageRank || 0).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-300">
        <div>Showing {paginated.length} of {filtered.length}</div>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 disabled:opacity-40">Previous</button>
          <span className="px-3 py-1">Page {page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
