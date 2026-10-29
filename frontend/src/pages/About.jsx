import { useEffect } from 'react';
import { useInitialLoading } from '../components/InitialLoadingContext';

export default function About() {
  const { markInitialDataReady } = useInitialLoading();

  useEffect(() => {
    markInitialDataReady();
  }, [markInitialDataReady]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-white">About Airline Network Graph Analytics</h2>

      <div className="card-surface rounded-2xl border p-6 text-slate-200">
        <div className="space-y-5">
          <section>
            <h3 className="mb-2 text-xl font-semibold text-white">Objective</h3>
            <p>Analyze the structure and connectivity of the Indian airline network using graph theory and network measures.</p>
          </section>

          <section>
            <h3 className="mb-2 text-xl font-semibold text-white">Data</h3>
            <p>OpenFlights airport and route data are used as the source dataset for building the graph model.</p>
          </section>

          <section>
            <h3 className="mb-2 text-xl font-semibold text-white">Graph Model</h3>
            <p>Airport = Node, Route = Edge, Distance = Edge Weight.</p>
          </section>

          <section>
            <h3 className="mb-2 text-xl font-semibold text-white">Algorithms</h3>
            <p>Degree centrality, closeness centrality, betweenness centrality, eigenvector centrality, PageRank, shortest path, and greedy modularity community detection are all computed from the NetworkX graph.</p>
          </section>

          <section>
            <h3 className="mb-2 text-xl font-semibold text-white">Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {['Python','Pandas','NumPy','NetworkX','FastAPI','React','Vite','Tailwind CSS','Cytoscape.js','Recharts'].map((tool) => (
                <span key={tool} className="rounded-full border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs text-slate-200">{tool}</span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
