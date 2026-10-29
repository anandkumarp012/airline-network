import { useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { AlertTriangle, LocateFixed, Maximize2, Search, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import Loading from '../components/Loading';
import { useInitialLoading } from '../components/InitialLoadingContext';

const metricOptions = [
  'degree',
  'degree_centrality',
  'closeness_centrality',
  'betweenness_centrality',
  'eigenvector_centrality',
  'pagerank',
];

export default function NetworkGraphPage() {
  const cyRef = useRef(null);
  const [network, setNetwork] = useState({ nodes: [], edges: [] });
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [search, setSearch] = useState('');
  const [metric, setMetric] = useState('degree');
  const [minDegree, setMinDegree] = useState(0);
  const [showLabels, setShowLabels] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { markInitialDataReady } = useInitialLoading();

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        setLoading(true);
        const res = await api.get('/network');
        setNetwork(res.data);
      } catch (err) {
        setError('Unable to load network data. Please check that the Python backend is running.');
      } finally {
        setLoading(false);
        markInitialDataReady();
      }
    };

    fetchNetwork();
  }, []);

  const filteredNodes = useMemo(() => {
    return network.nodes.filter((node) => {
      const matchesSearch = !search || node.id.toLowerCase().includes(search.toLowerCase()) || node.name?.toLowerCase().includes(search.toLowerCase());
      const matchesDegree = node.degree >= Number(minDegree);
      return matchesSearch && matchesDegree;
    });
  }, [network, search, minDegree]);

  const nodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = network.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

  const elements = useMemo(() => {
    const nodes = filteredNodes.map((node) => ({
      data: {
        id: node.id,
        label: showLabels ? node.id : '',
        name: node.name,
        degree: node.degree,
        value: node[metric] || 0,
        longitude: node.longitude,
        latitude: node.latitude,
      },
      classes: 'airport-node',
      style: {
        width: Math.max(18, Math.min(40, 12 + ((node[metric] || 0) * 100))),
        height: Math.max(18, Math.min(40, 12 + ((node[metric] || 0) * 100))),
        'background-color': '#0ea5e9',
        'border-width': 1,
        'border-color': '#ffffff',
        'font-size': 10,
        color: '#0f172a',
        'text-wrap': 'wrap',
      },
    }));

    const edges = filteredEdges.map((edge) => ({
      data: { source: edge.source, target: edge.target, weight: edge.weight },
      style: { width: 1.2, 'line-color': '#7dd3fc', 'target-arrow-shape': 'none' },
    }));

    return [...nodes, ...edges];
  }, [filteredNodes, filteredEdges, showLabels, metric]);

  const handleAirportSelect = (event) => {
    const id = event.target.id();
    const airport = network.nodes.find((node) => node.id === id);
    setSelectedAirport(airport || null);
  };

  const fitGraph = () => {
    if (cyRef.current) {
      cyRef.current.fit();
    }
  };

  const resetGraph = () => {
    setSearch('');
    setMinDegree(0);
    setShowLabels(true);
    setMetric('degree');
    if (cyRef.current) {
      cyRef.current.fit();
    }
  };

  if (loading) return <Loading message="Loading network graph..." />;
  if (error) return <div className="card-surface rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-red-200"><AlertTriangle className="inline-block mr-2" size={18}/> {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white">Indian Airline Network</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fitGraph} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"><Maximize2 size={16}/> Fit Network</button>
          <button onClick={resetGraph} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"><SlidersHorizontal size={16}/> Reset Graph</button>
        </div>
      </div>

      <div className="card-surface rounded-2xl border p-4">
        <div className="grid gap-4 xl:grid-cols-6">
          <label className="xl:col-span-2 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Airport" className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.15em] text-slate-400">Node Size By</span>
            <select value={metric} onChange={(e) => setMetric(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none">
              {metricOptions.map((option) => (
                <option key={option} value={option}>{option.replace('_', ' ')}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.15em] text-slate-400">Minimum Degree</span>
            <input type="number" min="0" value={minDegree} onChange={(e) => setMinDegree(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none" />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">
            <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
            Show Labels
          </label>

          <button onClick={() => setSearch('')} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">Clear</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="card-surface grid-graph min-h-[560px] rounded-2xl border p-3">
          <CytoscapeComponent
            elements={elements}
            stylesheet={[
              {
                selector: 'node',
                style: {
                  label: 'data(label)',
                  'text-opacity': 0.9,
                  'font-family': 'Segoe UI, sans-serif',
                  'font-size': 10,
                  'text-valign': 'center',
                  'background-color': '#0ea5e9',
                  'border-width': 1,
                  'border-color': '#ffffff',
                  color: '#0f172a',
                  width: 'mapData(value, 0, 1, 18, 42)',
                  height: 'mapData(value, 0, 1, 18, 42)',
                },
              },
              {
                selector: 'edge',
                style: {
                  width: 1.2,
                  'line-color': '#7dd3fc',
                  'curve-style': 'bezier',
                },
              },
            ]}
            style={{ width: '100%', minHeight: '560px', backgroundColor: '#f0f9ff' }}
            cy={(cy) => { cyRef.current = cy; cy.on('tap', 'node', handleAirportSelect); cy.on('tap', () => setSelectedAirport(null)); cy.fit(); }}
            zoomingEnabled={true}
            userZoomingEnabled={true}
            panningEnabled={true}
            boxSelectionEnabled={false}
            autounselectify={true}
            minZoom={0.2}
            maxZoom={2.5}
          />
        </div>

        <div className="card-surface rounded-2xl border p-5">
          {selectedAirport ? (
            <div>
              <div className="mb-4 text-xs uppercase tracking-[0.2em] text-slate-400">Selected Airport</div>
              <h3 className="text-2xl font-semibold text-white">{selectedAirport.name || selectedAirport.id}</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <div><span className="text-slate-400">IATA</span> <span className="ml-2 text-white">{selectedAirport.id}</span></div>
                <div><span className="text-slate-400">City</span> <span className="ml-2 text-white">{selectedAirport.city}</span></div>
                <div><span className="text-slate-400">Country</span> <span className="ml-2 text-white">India</span></div>
              </div>
              <div className="mt-6 border-t border-slate-700 pt-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Network Metrics</div>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between"><span>Degree</span><span>{selectedAirport.degree}</span></div>
                  <div className="flex justify-between"><span>Degree Centrality</span><span>{(selectedAirport.degree_centrality || 0).toFixed(4)}</span></div>
                  <div className="flex justify-between"><span>Closeness Centrality</span><span>{(selectedAirport.closeness_centrality || 0).toFixed(4)}</span></div>
                  <div className="flex justify-between"><span>Betweenness Centrality</span><span>{(selectedAirport.betweenness_centrality || 0).toFixed(4)}</span></div>
                  <div className="flex justify-between"><span>Eigenvector Centrality</span><span>{(selectedAirport.eigenvector_centrality || 0).toFixed(4)}</span></div>
                  <div className="flex justify-between"><span>PageRank</span><span>{(selectedAirport.pagerank || 0).toFixed(4)}</span></div>
                </div>
              </div>
              <div className="mt-6 border-t border-slate-700 pt-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Directly Connected Airports</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {network.edges.filter((edge) => edge.source === selectedAirport.id || edge.target === selectedAirport.id).map((edge) => {
                    const neighbor = edge.source === selectedAirport.id ? edge.target : edge.source;
                    return <span key={`${selectedAirport.id}-${neighbor}`} className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-200">{neighbor}</span>;
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center text-center text-slate-400">
              Click an airport node to inspect graph-level metrics and direct connections.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
