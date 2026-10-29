import { useEffect, useState } from 'react';
import { AlertTriangle, Route as RouteIcon } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';
import RouteMap from '../components/RouteMap';
import { useInitialLoading } from '../components/InitialLoadingContext';

export default function RouteExplorer() {
  const [airports, setAirports] = useState([]);
  const [network, setNetwork] = useState({ nodes: [], edges: [] });
  const [source, setSource] = useState('HYD');
  const [destination, setDestination] = useState('DEL');
  const [route, setRoute] = useState(null);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [fitSignal, setFitSignal] = useState(0);
  const [error, setError] = useState('');
  const { markInitialDataReady } = useInitialLoading();

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const [airportsRes, networkRes] = await Promise.all([
          api.get('/airports'),
          api.get('/network'),
        ]);
        setAirports(airportsRes.data);
        setNetwork(networkRes.data);
      } catch (err) {
        setError('Unable to load airport list.');
      } finally {
        setLoading(false);
        markInitialDataReady();
      }
    };
    fetchAirports();
  }, []);

  const handleCheckRoute = async () => {
    setRouteLoading(true);
    try {
      const res = await api.get(`/routes/${source}/${destination}`);
      setRoute(res.data);
      setFitSignal((signal) => signal + 1);
    } catch (err) {
      setRoute({ direct_connection: false, source, destination, route_distance: null, message: 'No direct route found in the analyzed network.' });
    } finally {
      setRouteLoading(false);
    }
  };

  const selectedPath = route?.direct_connection ? [route.source, route.destination] : [];
  const selectedAirportData = selectedAirport || network.nodes.find((node) => node.id === source);

  if (loading) return <Loading message="Loading route explorer..." />;
  if (error) return <div className="card-surface rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-red-200"><AlertTriangle className="inline-block mr-2" size={18}/> {error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-white">Route Explorer</h2>
      <div className="card-surface rounded-2xl border p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.15em] text-slate-400">Source Airport</span>
            <select value={source} onChange={(e) => { setSource(e.target.value); setRoute(null); }} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none">
              {airports.map((airport) => <option key={airport.IATA} value={airport.IATA}>{airport.IATA}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.15em] text-slate-400">Destination Airport</span>
            <select value={destination} onChange={(e) => { setDestination(e.target.value); setRoute(null); }} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none">
              {airports.map((airport) => <option key={airport.IATA} value={airport.IATA}>{airport.IATA}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button onClick={handleCheckRoute} disabled={routeLoading || source === destination} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"><RouteIcon size={16}/> {routeLoading ? 'Checking...' : 'Check Route'}</button>
          </div>
        </div>
        {source === destination && (
          <div className="mt-3 text-sm text-amber-700">Choose two different airports to inspect a route.</div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.8fr)]">
        <div className="card-surface rounded-2xl border p-3">
          <div className="mb-3 flex items-center justify-between px-2">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Network map</div>
            <button onClick={() => setFitSignal((signal) => signal + 1)} className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50">Fit view</button>
          </div>
          <RouteMap
            nodes={network.nodes}
            edges={network.edges}
            path={selectedPath}
            source={source}
            destination={destination}
            fitSignal={fitSignal}
            showNetwork
            onMarkerClick={setSelectedAirport}
          />
        </div>

        <div className="card-surface rounded-2xl border p-6">
          {route ? (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Route Details</div>
              <div className="text-2xl font-semibold text-white">{route.source} → {route.destination}</div>
              <div className="text-slate-300">{route.direct_connection ? 'Direct Connection' : 'No direct route found in the analyzed network.'}</div>
              <div className="text-slate-300">Route Distance: {route.route_distance !== null ? `${Number(route.route_distance).toFixed(2)} km` : '—'}</div>
            </div>
          ) : (
            <div className="text-slate-400">Select a valid pair of airports to inspect their direct connection.</div>
          )}
          {selectedAirportData && (
            <div className="mt-6 border-t border-sky-100 pt-4">
              <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Selected location</div>
              <div className="mt-2 text-lg font-semibold text-white">{selectedAirportData.name || selectedAirportData.id}</div>
              <div className="text-sm text-slate-500">{selectedAirportData.id} · {selectedAirportData.city}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
