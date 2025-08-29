'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for Plotly component
const PlotlyMultiAxisChart = dynamic(
  () => import('./PlotlyMultiAxisChart'),
  { ssr: false } // Disable server-side rendering for Plotly component
);

export default function ChartWrapper() {
  return (
    <div className="w-full max-w-[1000px] p-4 bg-white rounded-lg shadow-md">
      <PlotlyMultiAxisChart />
    </div>
  );
}