import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Route } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';
import RouteMap from '../components/RouteMap';
import { useInitialLoading } from '../components/InitialLoadingContext';

function hasFiniteDistance(value) {
  return Number.isFinite(Number(value));
}

function formatDistance(result) {
  const value = Number(result?.total_distance_km ?? result?.distance_km);
  return hasFiniteDistance(value) ? `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} km` : 'Unavailable';
}

function formatCalculationMethod(method) {
  return {
    weighted: 'Weighted shortest path',
    unweighted: 'Unweighted shortest path',
    'geographic-distance-estimate': 'Estimated geographic distance',
  }[method] || 'Unavailable';
}

export default function ShortestPath() {
  const [airports, setAirports] = useState([]);
  const [source, setSource] = useState('HYD');
  const [destination, setDestination] = useState('DEL');
  const [result, setResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [fitSignal, setFitSignal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { markInitialDataReady } = useInitialLoading();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/airports');
        setAirports(res.data);
      } catch (err) {
        setError('Unable to load airports for shortest-path analysis.');
      } finally {
        setLoading(false);
        markInitialDataReady();
      }
    };
    fetch();
  }, []);

  const handleFindPath = async () => {
    if (source === destination) {
      setResult(null);
    }

    setRouteLoading(true);
    try {
      const res = await api.get('/shortest-path', {
        params: { source, destination },
      });
      setResult(res.data);
      setFitSignal((signal) => signal + 1);
    } catch (err) {
      setResult({
        exists: false,
        message: err.response?.data?.detail || 'Unable to calculate the shortest path.',
      });
    } finally {
      setRouteLoading(false);
    }
  };

  const mapNodes = useMemo(() => airports.map((airport) => ({
      id: airport.IATA,
      name: airport['Airport Name'],
      city: airport.City,
      latitude: airport.Latitude,
      longitude: airport.Longitude,
    })), [airports]);

  if (loading) return <Loading message="Loading shortest-path data..." />;
  if (error) return <div className="card-surface rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-red-200"><AlertTriangle className="inline-block mr-2" size={18}/> {error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-white">Shortest Path Finder</h2>
      <div className="card-surface rounded-2xl border p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.15em] text-slate-400">Source Airport</span>
            <select value={source} onChange={(e) => { setSource(e.target.value); setResult(null); }} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none">
              {airports.map((airport) => <option key={airport.IATA} value={airport.IATA}>{airport.IATA}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.15em] text-slate-400">Destination Airport</span>
            <select value={destination} onChange={(e) => { setDestination(e.target.value); setResult(null); }} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none">
              {airports.map((airport) => <option key={airport.IATA} value={airport.IATA}>{airport.IATA}</option>)}
            </select>
          </label>
          <div className="flex items-end">
            <button onClick={handleFindPath} disabled={routeLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"><Route size={16}/> {routeLoading ? 'Calculating...' : 'Find Shortest Path'}</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.8fr)]">
        <div className="card-surface rounded-2xl border p-3">
          <div className="mb-3 flex items-center justify-between px-2">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Calculated path map</div>
            <button onClick={() => setFitSignal((signal) => signal + 1)} className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50">Fit path</button>
          </div>
          <RouteMap
            nodes={mapNodes}
            path={result?.exists ? result.path : []}
            source={source}
            destination={destination}
            fitSignal={fitSignal}
            onMarkerClick={setSelectedAirport}
          />
        </div>

        <div className="card-surface rounded-2xl border p-6">
          {result ? (
            result.exists ? (
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Optimal Path</div>
                <div className="text-2xl font-semibold text-white">{Array.isArray(result.path) && result.path.length ? result.path.join(' → ') : 'Unavailable'}</div>
                <div className="text-slate-300">Total Network Distance: {formatDistance(result)}</div>
                <div className="text-slate-300">
                  Stops: {Number.isInteger(result.intermediate_stops) ? result.intermediate_stops : Math.max(0, (result.path?.length || 0) - 2)}
                  {' · '}Edges: {Number.isInteger(result.edges) ? result.edges : Math.max(0, (result.path?.length || 0) - 1)}
                </div>
                <div className="text-slate-400">Calculation: {formatCalculationMethod(result.calculation_method)}</div>
                <div className="text-slate-400">{result.message}</div>
              </div>
            ) : (
              <div className="text-red-200">{result.message}</div>
            )
          ) : (
            <div className="text-slate-400">Choose airports and run the weighted shortest-path calculation.</div>
          )}
          {selectedAirport && (
            <div className="mt-6 border-t border-sky-100 pt-4">
              <div className="text-xs uppercase tracking-[0.15em] text-slate-400">Selected location</div>
              <div className="mt-2 text-lg font-semibold text-white">{selectedAirport.name || selectedAirport.id}</div>
              <div className="text-sm text-slate-500">{selectedAirport.id} · {selectedAirport.city}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
