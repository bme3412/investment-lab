'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getCompanyFinancials, getPeerComparison } from '@/services/fmp';

export default function MarginAnalysis() {
  const [selectedCompany, setSelectedCompany] = useState('AAPL');
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [peerData, setPeerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const financials = await getCompanyFinancials(selectedCompany, 8);
        const peers = await getPeerComparison(selectedCompany);
        
        // Format quarterly data
        const formattedQuarterly = financials.map(q => ({
          period: new Date(q.date).toLocaleDateString('en-US', {
            year: '2-digit',
            month: 'short',
          }),
          revenue: q.revenue / 1e9, // Convert to billions
          grossMargin: (q.grossProfitRatio * 100).toFixed(1),
          operatingMargin: (q.operatingIncomeRatio * 100).toFixed(1),
          netMargin: (q.netIncomeRatio * 100).toFixed(1),
          revenueGrowth: q.revenueGrowth ? (q.revenueGrowth * 100).toFixed(1) : 0,
        })).reverse();

        setQuarterlyData(formattedQuarterly);
        setPeerData(peers);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCompany]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">{error}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Company Selector and Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-2">Select Company</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full p-2 rounded-md border border-gray-300 bg-white dark:bg-gray-800"
          >
            <option value="AAPL">Apple (AAPL)</option>
            <option value="MSFT">Microsoft (MSFT)</option>
            <option value="GOOGL">Alphabet (GOOGL)</option>
            <option value="META">Meta (META)</option>
            <option value="AMZN">Amazon (AMZN)</option>
          </select>
        </div>
        {/* Key Metrics Cards */}
        <div className="col-span-3 grid grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="pt-4">
              <div className="text-sm text-gray-500">Latest Gross Margin</div>
              <div className="text-2xl font-bold">
                {quarterlyData[0]?.grossMargin}%
              </div>
              <div className={`text-sm ${
                parseFloat(quarterlyData[0]?.grossMargin) > parseFloat(quarterlyData[1]?.grossMargin)
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {(parseFloat(quarterlyData[0]?.grossMargin) - parseFloat(quarterlyData[1]?.grossMargin)).toFixed(1)}pp QoQ
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="pt-4">
              <div className="text-sm text-gray-500">Latest Operating Margin</div>
              <div className="text-2xl font-bold">
                {quarterlyData[0]?.operatingMargin}%
              </div>
              <div className={`text-sm ${
                parseFloat(quarterlyData[0]?.operatingMargin) > parseFloat(quarterlyData[1]?.operatingMargin)
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {(parseFloat(quarterlyData[0]?.operatingMargin) - parseFloat(quarterlyData[1]?.operatingMargin)).toFixed(1)}pp QoQ
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="pt-4">
              <div className="text-sm text-gray-500">Latest Net Margin</div>
              <div className="text-2xl font-bold">
                {quarterlyData[0]?.netMargin}%
              </div>
              <div className={`text-sm ${
                parseFloat(quarterlyData[0]?.netMargin) > parseFloat(quarterlyData[1]?.netMargin)
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {(parseFloat(quarterlyData[0]?.netMargin) - parseFloat(quarterlyData[1]?.netMargin)).toFixed(1)}pp QoQ
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quarterly Margin Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Margin Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyData} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  labelFormatter={(label) => `Quarter: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="grossMargin" 
                  name="Gross Margin" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="operatingMargin" 
                  name="Operating Margin" 
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="netMargin" 
                  name="Net Margin" 
                  fill="#ffc658"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Revenue and Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Revenue and Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyData} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === "Revenue" ? `$${value.toFixed(1)}B` : `${value}%`,
                    name
                  ]}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="revenue" 
                  name="Revenue" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right"
                  dataKey="revenueGrowth" 
                  name="Revenue Growth %" 
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Peer Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Peer Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peerData} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ticker" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar 
                  dataKey="grossProfitMargin" 
                  name="Gross Margin" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="operatingProfitMargin" 
                  name="Operating Margin" 
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="netProfitMargin" 
                  name="Net Margin" 
                  fill="#ffc658"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}