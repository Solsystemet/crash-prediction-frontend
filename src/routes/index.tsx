import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useState } from 'react';
import { PredictionSidebar } from '@/components/PredictionSidebar';

const MapComponent = lazy(() => import('../components/Map'));

export const Route = createFileRoute("/")({ component: App })

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="h-screen w-full">
      <PredictionSidebar>
        <div className="h-[calc(100vh-48px)] w-full">
          {isMounted ? (
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading map...</div>}>
              <MapComponent />
            </Suspense>
          ) : (
            <div className="h-full w-full flex items-center justify-center">Loading map...</div>
          )}
        </div>
      </PredictionSidebar>
    </div>
  );
}
