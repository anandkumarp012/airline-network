import { useEffect, useState } from 'react';
import { AlertTriangle, Plane, Route, Network, Waypoints } from 'lucide-react';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import api from '../services/api';
import { useInitialLoading } from '../components/InitialLoadingContext';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { markInitialDataReady } = useInitialLoading();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, insightsRes] = await Promise.all([
          api.get('/summary'),
          api.get('/insights'),
        ]);

        setSummary(summaryRes.data);
        setInsights(insightsRes.data);
      } catch (err) {
        setError('Unable to load network data. Please check that the Python backend is running.');
      } finally {
        setLoading(false);
        markInitialDataReady();
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading message="Loading network dashboard..." />;
  if (error) return <div className="card-surface rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-red-200"><AlertTriangle className="inline-block mr-2" size={18}/> {error}</div>;
  if (!summary || !insights) return null;

  const insightRows = Object.values(insights).filter((item) => item && typeof item === 'object' && (item.airport || item.value || item.metric));

  const topMetricData = [
    { name: 'Degree', value: insights.highest_degree_airport?.score ?? 0 },
    { name: 'Closeness', value: insights.highest_closeness_centrality_airport?.score ?? 0 },
    { name: 'Betweenness', value: insights.highest_betweenness_centrality_airport?.score ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white">Indian Airline Network Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Airports" value={summary.total_airports} detail="Airport nodes in the Indian network" accent="cyan" />
        <StatCard label="Total Routes" value={summary.total_routes} detail="Unique undirected route connections" accent="blue" />
        <StatCard label="Network Density" value={summary.network_density.toFixed(4)} detail="Graph connectivity measure" accent="emerald" />
        <StatCard label="Average Degree" value={summary.average_degree.toFixed(2)} detail="Mean direct connections per airport" accent="purple" />
        <StatCard label="Connected Components" value={summary.connected_components} detail="Separate connected subgraphs" accent="amber" />
        <StatCard label="Communities" value={summary.communities} detail="Greedy modularity communities" accent="cyan" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="card-surface rounded-2xl border p-5">
          <div className="mb-4 flex items-center gap-3">
            <Waypoints className="text-cyan-300" size={18} />
            <h3 className="text-xl font-semibold text-white">Key Insights</h3>
          </div>
          <div className="space-y-3">
            {insightRows.map((insight, index) => (
              <div key={index} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <div className="text-xs uppercase tracking-[0.15em] text-slate-400">{insight.metric || insight.label || 'Insight'}</div>
                  <div className="mt-2 text-lg font-medium text-white">{insight.airport || insight.value || 'N/A'}</div>
                {insight.score !== undefined && <div className="text-sm text-slate-300">Score: {Number(insight.score).toFixed(4)}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-2xl border p-5">
          <div className="mb-4 flex items-center gap-3">
            <Plane className="text-cyan-300" size={18} />
            <h3 className="text-xl font-semibold text-white">Top Centrality Signals</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMetricData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#bae6fd" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #bae6fd', borderRadius: 12 }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-surface rounded-2xl border p-5">
        <div className="mb-4 flex items-center gap-3">
          <Route className="text-cyan-300" size={18} />
          <h3 className="text-xl font-semibold text-white">Network Structure Overview</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Most Connected Airport</div>
            <div className="mt-3 text-2xl font-semibold text-white">{insights.highest_degree_airport?.airport || '—'}</div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Highest Betweenness</div>
            <div className="mt-3 text-2xl font-semibold text-white">{insights.highest_betweenness_centrality_airport?.airport || '—'}</div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-400">PageRank Leader</div>
            <div className="mt-3 text-2xl font-semibold text-white">{insights.highest_pagerank_airport?.airport || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
