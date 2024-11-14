'use client';

import InflectionPointsChart from '@/components/equities/InflectionPointsChart';

export default function InflectionPoints() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Market Inflection Points</h1>
      
      <div className="w-full">
        <InflectionPointsChart />
      </div>
    </div>
  );
}