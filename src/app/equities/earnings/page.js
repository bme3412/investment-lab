'use client';

import EarningsBySector from '@/components/equities/EarningsBySector';

export default function EarningsPage() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Earnings by Sector</h1>
      
      <div className="w-full">
        <EarningsBySector />
      </div>
    </div>
  );
}