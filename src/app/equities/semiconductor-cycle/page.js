'use client';

import { useState, useEffect } from 'react';
import SemiconductorCycleChart from '@/components/visualizations/SemiconductorCycleChart';

export default function SemiconductorCyclePage() {
  const [cycleData, setCycleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCycleData() {
      try {
        // Update path to match your file structure
        const response = await fetch('/api/cycle-data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        
        // Format the data for the chart
        const formattedData = result.historical_data.map(item => ({
          date: item.date,
          composite_score: item.composite_score,
          cycle_phase: item.cycle_phase,
          momentum: item.momentum,
          acceleration: item.acceleration
        }));
        
        setCycleData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading cycle data:', err);
        setError('Failed to load semiconductor cycle data');
        setLoading(false);
      }
    }

    loadCycleData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Semiconductor Industry Cycle Analysis</h1>
      <SemiconductorCycleChart data={cycleData} />
    </div>
  );
}