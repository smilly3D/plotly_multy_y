'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for Canvas component
const CanvasMultiAxisChart = dynamic(
  () => import('./CanvasMultiAxisChart'),
  { ssr: false } // Disable server-side rendering for Canvas component
);

export default function CanvasChartWrapper() {
  return (
    <div className="w-full max-w-[1000px] p-4 bg-white rounded-lg shadow-md">
      <CanvasMultiAxisChart />
    </div>
  );
}