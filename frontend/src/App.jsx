import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GlobalLoadingScreen from './components/GlobalLoadingScreen';
import { useInitialLoading } from './components/InitialLoadingContext';
import Dashboard from './pages/Dashboard';
import NetworkGraphPage from './pages/NetworkGraphPage';
import AirportAnalysis from './pages/AirportAnalysis';
import CentralityAnalysis from './pages/CentralityAnalysis';
import RouteExplorer from './pages/RouteExplorer';
import ShortestPath from './pages/ShortestPath';
import Communities from './pages/Communities';
import Statistics from './pages/Statistics';
import About from './pages/About';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [minimumLoadingTime, setMinimumLoadingTime] = useState(false);
  const [loaderMounted, setLoaderMounted] = useState(true);
  const { dataLoading } = useInitialLoading();
  const isLoading = !minimumLoadingTime || dataLoading;

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadingTime(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) {
      setLoaderMounted(true);
      return undefined;
    }

    const timer = setTimeout(() => {
      setLoaderMounted(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <>
      {loaderMounted && <GlobalLoadingScreen exiting={!isLoading} />}
      <div className="flex min-h-screen bg-white text-slate-900">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-slate-900/60 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        <div className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-72 transition-transform lg:hidden`}>
          <Sidebar collapsed={false} setCollapsed={() => {}} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header title="Airline Network Intelligence" subtitle="Interactive Graph Analytics of the Indian Airline Network" onMenuClick={() => setMobileOpen(!mobileOpen)} />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/network" element={<NetworkGraphPage />} />
              <Route path="/airports" element={<AirportAnalysis />} />
              <Route path="/centrality" element={<CentralityAnalysis />} />
              <Route path="/routes" element={<RouteExplorer />} />
              <Route path="/shortest-path" element={<ShortestPath />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  );
}
