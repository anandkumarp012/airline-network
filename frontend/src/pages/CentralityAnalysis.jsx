import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../services/api';
import Loading from '../components/Loading';
import { useInitialLoading } from '../components/InitialLoadingContext';

const metricMap = {
  degree: 'Degree Centrality',
  closeness_centrality: 'Closeness Centrality',
  betweenness_centrality: 'Betweenness Centrality',
  eigenvector_centrality: 'Eigenvector Centrality',
  pagerank: 'PageRank',
};

export default function CentralityAnalysis() {
  const [selectedMetric, setSelectedMetric] = useState('degree');
  const [topN, setTopN] = useState(10);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { markInitialDataReady } = useInitialLoading();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/centrality/${selectedMetric}`);
        const list = res.data.data || [];
        setChartData(list.slice(0, topN));
      } catch (err) {
        setError('Unable to load centrality metrics.');
      } finally {
        setLoading(false);
        markInitialDataReady();
      }
    };

    fetchData();
  }, [selectedMetric, topN]);

  if (loading) return <Loading message="Loading centrality analysis..." />;
  if (error) return <div className="card-surface rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-red-200"><AlertTriangle className="inline-block mr-2" size={18}/> {error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-white">Centrality Analysis</h2>

      <div className="card-surface rounded-2xl border p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.15em] text-slate-400">Metric</span>
            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none">
              {Object.entries(metricMap).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.15em] text-slate-400">Top N</span>
            <select value={topN} onChange={(e) => setTopN(Number(e.target.value))} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none">
              {[5,10,15,20].map((val) => <option key={val} value={val}>{val}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="card-surface rounded-2xl border p-5">
        <div className="mb-4 text-xl font-semibold text-white">{metricMap[selectedMetric]}</div>
        <div className="h-[440px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 24, left: 12, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#bae6fd" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis type="category" dataKey="airport" width={80} stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #bae6fd', borderRadius: 12 }} />
              <Bar dataKey="score" fill="#0ea5e9" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
