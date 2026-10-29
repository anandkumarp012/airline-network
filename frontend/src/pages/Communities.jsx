import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';
import { useInitialLoading } from '../components/InitialLoadingContext';

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { markInitialDataReady } = useInitialLoading();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/communities');
        setCommunities(res.data.communities || []);
      } catch (err) {
        setError('Unable to load community data.');
      } finally {
        setLoading(false);
        markInitialDataReady();
      }
    };
    fetch();
  }, []);

  if (loading) return <Loading message="Loading communities..." />;
  if (error) return <div className="card-surface rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-red-200"><AlertTriangle className="inline-block mr-2" size={18}/> {error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-white">Network Communities</h2>
      <div className="card-surface rounded-2xl border p-5">
        <div className="text-xl font-semibold text-white">Total Communities: {communities.length}</div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {communities.map((community) => (
          <button key={community.community_id} onClick={() => setSelectedCommunity(community)} className={`rounded-2xl border p-4 text-left ${selectedCommunity?.community_id === community.community_id ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-slate-700 bg-slate-900/60'}`}>
            <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Community {community.community_id}</div>
            <div className="mt-2 text-2xl font-semibold text-white">{community.airport_count} airports</div>
          </button>
        ))}
      </div>

      {selectedCommunity && (
        <div className="card-surface rounded-2xl border p-5">
          <div className="mb-4 text-xl font-semibold text-white">Community {selectedCommunity.community_id} Members</div>
          <div className="flex flex-wrap gap-2">
            {selectedCommunity.airports.map((airport) => (
              <span key={airport} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-200">{airport}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
