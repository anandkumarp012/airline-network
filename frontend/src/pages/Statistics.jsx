import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';
import { useInitialLoading } from '../components/InitialLoadingContext';

const metrics = [
  ['Number of Nodes', 'num_nodes', 'Total airports in the analyzed Indian network.'],
  ['Number of Edges', 'num_edges', 'Total route connections represented by undirected graph edges.'],
  ['Network Density', 'network_density', 'Measures how many of the possible airport connections exist in the network.'],
  ['Average Degree', 'average_degree', 'Mean number of direct connections per airport.'],
  ['Maximum Degree', 'maximum_degree', 'Highest number of direct connections associated with any airport.'],
  ['Minimum Degree', 'minimum_degree', 'Lowest number of direct connections observed in the network.'],
  ['Connected Components', 'connected_components', 'Number of connected clusters in the graph.'],
  ['Number of Communities', 'communities', 'Count of communities detected by greedy modularity.'],
];

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { markInitialDataReady } = useInitialLoading();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/statistics');
        setStats(res.data);
      } catch (err) {
        setError('Unable to load network statistics.');
      } finally {
        setLoading(false);
        markInitialDataReady();
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading message="Loading statistics..." />;
  if (error) return <div className="card-surface rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-red-200"><AlertTriangle className="inline-block mr-2" size={18}/> {error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-white">Network Statistics</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {metrics.map(([label, key, description]) => (
          <div key={key} className="card-surface rounded-2xl border p-5">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-400">{label}</div>
            <div className="mt-2 text-2xl font-semibold text-white">{typeof stats?.[key] === 'number' ? Number(stats[key]).toFixed(key === 'network_density' || key === 'average_degree' ? 4 : 0) : stats?.[key]}</div>
            <div className="mt-3 text-sm text-slate-300">{description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
