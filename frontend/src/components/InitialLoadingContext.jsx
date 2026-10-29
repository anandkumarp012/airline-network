import { createContext, useContext, useMemo, useRef, useState } from 'react';

const InitialLoadingContext = createContext(null);

export function InitialLoadingProvider({ children }) {
  const [dataLoading, setDataLoading] = useState(true);
  const initialReady = useRef(false);

  const value = useMemo(() => ({
    dataLoading,
    markInitialDataReady: () => {
      if (!initialReady.current) {
        initialReady.current = true;
        setDataLoading(false);
      }
    },
  }), [dataLoading]);

  return (
    <InitialLoadingContext.Provider value={value}>
      {children}
    </InitialLoadingContext.Provider>
  );
}

export function useInitialLoading() {
  const context = useContext(InitialLoadingContext);
  if (!context) {
    throw new Error('useInitialLoading must be used inside InitialLoadingProvider');
  }
  return context;
}
