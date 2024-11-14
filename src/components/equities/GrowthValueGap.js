'use client';

// src/components/equities/GrowthValueGap.js

import React, { useState, useEffect } from 'react';
import { 
  ComposedChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const YearlyChart = ({ data, year, type = "daily" }) => {
  const COLORS = {
    growth: '#3b82f6',  // Brighter blue
    value: '#8b5cf6',   // Brighter purple
    grid: '#f1f5f9',    // Lighter grid
    axis: '#94a3b8',
  };

  // Calculate y-axis range based on data
  const allValues = data.flatMap(d => [d.growth, d.value]);
  const maxValue = Math.ceil(Math.max(...allValues) + 0.5);
  const minValue = Math.floor(Math.min(...allValues) - 0.5);
  const range = maxValue - minValue;
  
  // Create nice tick values
  const tickCount = 5;
  const interval = range / (tickCount - 1);
  const ticks = Array.from({ length: tickCount }, (_, i) => 
    Number((minValue + i * interval).toFixed(2))
  );

  // Format x-axis labels to show each month only once
  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Custom x-axis tick filter to avoid repetition
  const filterTicks = (allTicks) => {
    const seen = new Set();
    return allTicks.filter(tick => {
      const month = new Date(tick).getMonth();
      if (!seen.has(month)) {
        seen.add(month);
        return true;
      }
      return false;
    });
  };

  return (
    <div className="h-[250px] w-full mb-8">
      <div className="flex items-start gap-4">
        <h3 className="text-2xl font-bold text-gray-800 w-24">{year}</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 50,
                bottom: 5,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={COLORS.grid} 
                horizontal={true}
                vertical={false}
                strokeWidth={1.5}
              />
              <XAxis 
                dataKey="date"
                tickFormatter={formatXAxis}
                ticks={filterTicks(data.map(d => d.date))}
                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                tickMargin={10}
                axisLine={{ stroke: '#e5e7eb', strokeWidth: 1.5 }}
              />
              <YAxis
                domain={[minValue, maxValue]}
                ticks={ticks}
                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                tickMargin={10}
                axisLine={{ stroke: '#e5e7eb', strokeWidth: 1.5 }}
                label={{ 
                  value: type === "daily" ? "Return (%)" : "Cumulative Return (%)", 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: '#6b7280', fontWeight: 500 },
                  offset: -35
                }}
              />
              
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS.value}
                dot={false}
                strokeWidth={1.75}
                opacity={0.9}
              />
              <Line
                type="monotone"
                dataKey="growth"
                stroke={COLORS.growth}
                dot={false}
                strokeWidth={1.75}
                opacity={0.9}
              />
              
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const date = new Date(label).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    });
                    return (
                      <div className="bg-white p-3 border shadow-lg rounded">
                        <div className="font-medium mb-1">{date}</div>
                        <div style={{ color: COLORS.value, fontWeight: 500 }}>
                          Value: {payload[0].value.toFixed(2)}%
                        </div>
                        <div style={{ color: COLORS.growth, fontWeight: 500 }}>
                          Growth: {payload[1].value.toFixed(2)}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const GrowthValueGap = () => {
  const [dailyData, setDailyData] = useState({});
  const [cumulativeData, setCumulativeData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState("daily");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [growthResponse, valueResponse] = await Promise.all([
          fetch('/api/historical-data/growth'),
          fetch('/api/historical-data/value')
        ]);

        if (!growthResponse.ok || !valueResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const growthData = await growthResponse.json();
        const valueData = await valueResponse.json();
        
        const growthPrices = growthData.data;
        const valuePrices = valueData.data;

        const dailyYearData = {};
        const cumulativeYearData = {};
        
        for (let year = 2008; year <= new Date().getFullYear(); year++) {
          const yearStart = new Date(`${year}-01-01`);
          const yearEnd = new Date(`${year}-12-31`);
          
          // Filter data for current year
          const yearGrowthData = growthPrices.filter(item => {
            const date = new Date(item.date);
            return date >= yearStart && date <= yearEnd;
          });

          const yearValueData = valuePrices.filter(item => {
            const date = new Date(item.date);
            return date >= yearStart && date <= yearEnd;
          });

          if (yearGrowthData.length > 0 && yearValueData.length > 0) {
            // Calculate daily returns and cumulative returns
            const dailyProcessedData = [];
            const cumulativeProcessedData = [];
            
            let cumGrowthReturn = 0;
            let cumValueReturn = 0;

            for (let i = 1; i < yearGrowthData.length; i++) {
              const growthItem = yearGrowthData[i];
              const valueItem = yearValueData[i];
              const prevGrowthItem = yearGrowthData[i - 1];
              const prevValueItem = yearValueData[i - 1];

              // Daily returns
              const growthReturn = ((growthItem.value - prevGrowthItem.value) / prevGrowthItem.value) * 100;
              const valueReturn = ((valueItem.value - prevValueItem.value) / prevValueItem.value) * 100;
              
              dailyProcessedData.push({
                date: growthItem.date,
                growth: parseFloat(growthReturn.toFixed(2)),
                value: parseFloat(valueReturn.toFixed(2))
              });

              // Cumulative returns
              cumGrowthReturn += growthReturn;
              cumValueReturn += valueReturn;

              cumulativeProcessedData.push({
                date: growthItem.date,
                growth: parseFloat(cumGrowthReturn.toFixed(2)),
                value: parseFloat(cumValueReturn.toFixed(2))
              });
            }

            dailyYearData[year] = dailyProcessedData;
            cumulativeYearData[year] = cumulativeProcessedData;
          }
        }

        setDailyData(dailyYearData);
        setCumulativeData(cumulativeYearData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing data:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error || isLoading) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-lg text-gray-500">
          {error ? `Error: ${error}` : 'Loading data...'}
        </div>
      </Card>
    );
  }

  const currentData = viewType === "daily" ? dailyData : cumulativeData;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Value vs. Growth Returns by Year</CardTitle>
            <p className="text-base text-gray-500">
              {viewType === "daily" ? "Daily" : "Cumulative"} returns (2008-present)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewType("daily")}
              className={`px-3 py-1 rounded ${
                viewType === "daily" 
                  ? "bg-gray-200 text-gray-800 font-medium" 
                  : "text-gray-600"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewType("cumulative")}
              className={`px-3 py-1 rounded ${
                viewType === "cumulative" 
                  ? "bg-gray-200 text-gray-800 font-medium" 
                  : "text-gray-600"
              }`}
            >
              Cumulative
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2.5 rounded" style={{ backgroundColor: '#8b5cf6' }}></div>
            <span className="text-sm font-medium">Value</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2.5 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
            <span className="text-sm font-medium">Growth</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(currentData)
            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
            .map(([year, data]) => (
              <YearlyChart 
                key={year} 
                data={data} 
                year={year} 
                type={viewType}
              />
            ))}
        </div>
        <div className="text-xs text-gray-500 mt-6">
          Source: Historical market data
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthValueGap;