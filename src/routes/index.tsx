import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useState } from 'react';

const MapComponent = lazy(() => import('../components/Map'));

export const Route = createFileRoute("/")({ component: App })

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="h-screen w-full">
      {isMounted ? (
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading map...</div>}>
          <MapComponent />
        </Suspense>
      ) : (
        <div className="h-full w-full flex items-center justify-center">Loading map...</div>
      )}
    </div>
  );
}
