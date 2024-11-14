import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const BusinessSegmentAnalyzer = () => {
  const [selectedCompany, setSelectedCompany] = useState('MSFT');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [timeframe, setTimeframe] = useState('TTM');
  const [companyData, setCompanyData] = useState([]);

  useEffect(() => {
    // Simulated company segment data - in real app, fetch from API
    setCompanyData([
      {
        ticker: 'MSFT',
        name: 'Microsoft',
        segments: [
          {
            name: 'Productivity & Business',
            metrics: {
              revenue: 63.4,
              growth: 16.8,
              margin: 45.2,
              arr: 58.2
            },
            subSegments: ['Office 365', 'Dynamics', 'LinkedIn'],
            quarterly_trend: [
              { quarter: 'Q1 2023', revenue: 15.2, margin: 44.1 },
              { quarter: 'Q2 2023', revenue: 15.8, margin: 44.8 },
              { quarter: 'Q3 2023', revenue: 16.1, margin: 45.0 },
              { quarter: 'Q4 2023', revenue: 16.3, margin: 45.2 }
            ]
          },
          {
            name: 'Intelligent Cloud',
            metrics: {
              revenue: 75.2,
              growth: 28.5,
              margin: 48.5,
              arr: 70.1
            },
            subSegments: ['Azure', 'Server Products', 'Enterprise Services'],
            quarterly_trend: [
              { quarter: 'Q1 2023', revenue: 17.8, margin: 47.2 },
              { quarter: 'Q2 2023', revenue: 18.3, margin: 47.8 },
              { quarter: 'Q3 2023', revenue: 19.1, margin: 48.1 },
              { quarter: 'Q4 2023', revenue: 20.0, margin: 48.5 }
            ]
          },
          {
            name: 'More Personal Computing',
            metrics: {
              revenue: 54.8,
              growth: 5.2,
              margin: 35.4,
              arr: 12.5
            },
            subSegments: ['Windows', 'Gaming', 'Devices'],
            quarterly_trend: [
              { quarter: 'Q1 2023', revenue: 13.5, margin: 34.8 },
              { quarter: 'Q2 2023', revenue: 13.7, margin: 35.0 },
              { quarter: 'Q3 2023', revenue: 13.8, margin: 35.2 },
              { quarter: 'Q4 2023', revenue: 13.8, margin: 35.4 }
            ]
          }
        ]
      },
      {
        ticker: 'ORCL',
        name: 'Oracle',
        segments: [
          {
            name: 'Cloud Services',
            metrics: {
              revenue: 44.2,
              growth: 45.2,
              margin: 42.1,
              arr: 40.5
            },
            subSegments: ['OCI', 'SaaS Applications', 'Cloud@Customer'],
            quarterly_trend: [
              { quarter: 'Q1 2023', revenue: 10.2, margin: 41.0 },
              { quarter: 'Q2 2023', revenue: 10.8, margin: 41.5 },
              { quarter: 'Q3 2023', revenue: 11.4, margin: 41.8 },
              { quarter: 'Q4 2023', revenue: 11.8, margin: 42.1 }
            ]
          }
        ]
      }
    ]);
  }, []);

  const selectedCompanyData = companyData.find(c => c.ticker === selectedCompany);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const renderSegmentAnalysis = (segment) => (
    <Card key={segment.name} className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">{segment.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Metrics Dashboard */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">Revenue ($B)</div>
              <div className="text-2xl font-bold text-blue-700">
                {segment.metrics.revenue.toFixed(1)}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">Growth (%)</div>
              <div className="text-2xl font-bold text-green-700">
                {segment.metrics.growth.toFixed(1)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600">Margin (%)</div>
              <div className="text-2xl font-bold text-purple-700">
                {segment.metrics.margin.toFixed(1)}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600">ARR ($B)</div>
              <div className="text-2xl font-bold text-orange-700">
                {segment.metrics.arr.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Quarterly Trend Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={segment.quarterly_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  name="Revenue ($B)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="margin"
                  stroke="#82ca9d"
                  name="Margin (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sub-segments */}
        <div className="mt-4">
          <div className="font-medium mb-2">Sub-segments:</div>
          <div className="flex flex-wrap gap-2">
            {segment.subSegments.map((sub, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Business Segment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company:</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                {companyData.map(company => (
                  <option key={company.ticker} value={company.ticker}>
                    {company.name} ({company.ticker})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Primary Metric:</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="revenue">Revenue</option>
                <option value="growth">Growth</option>
                <option value="margin">Margin</option>
                <option value="arr">ARR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timeframe:</label>
              <select
                className="w-full p-2 border rounded"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="TTM">TTM</option>
                <option value="YTD">YTD</option>
                <option value="FY">Full Year</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Overview */}
      {selectedCompanyData && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Segment Mix Pie Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={selectedCompanyData.segments}
                      dataKey="metrics.revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {selectedCompanyData.segments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Segment Comparison Bar Chart */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedCompanyData.segments}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="metrics.growth" name="Growth %" fill="#8884d8" />
                    <Bar dataKey="metrics.margin" name="Margin %" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Segment Analysis */}
      {selectedCompanyData?.segments.map(segment => renderSegmentAnalysis(segment))}
    </div>
  );
};

export default BusinessSegmentAnalyzer;