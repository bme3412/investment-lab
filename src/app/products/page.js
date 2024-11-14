// src/app/products/page.js

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
import { 
  getCompanyFinancials,
  getKeyMetrics,
  getCompanyProfile 
} from '@/services/fmp';
import { sectors } from '@/config/sectors';


export default function ProductsPage() {
  const [selectedSector, setSelectedSector] = useState('semiconductors');
  const [symbol, setSymbol] = useState('NVDA');
  const [periodType, setPeriodType] = useState('quarterly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [incomeStatements, metrics, profile] = await Promise.all([
          getCompanyFinancials(symbol, 4),
          getKeyMetrics(symbol, periodType, 4),
          getCompanyProfile(symbol)
        ]);
        
        const formattedData = {
          companyName: profile[0]?.companyName || symbol,
          sector: profile[0]?.sector,
          industry: profile[0]?.industry,
          description: profile[0]?.description,
          quarters: incomeStatements.map(q => ({
            period: q.date,
            revenue: q.revenue,
            grossProfit: q.grossProfit,
            operatingIncome: q.operatingIncome,
            rdExpense: q.researchAndDevelopmentExpenses,
            sgaExpense: q.sellingGeneralAndAdministrativeExpenses
          })),
          keyMetrics: metrics.map(m => ({
            period: m.date,
            roic: m.roic,
            roa: m.returnOnAssets,
            inventoryTurnover: m.inventoryTurnover,
            daysOfInventory: m.daysOfInventoryOnHand
          }))
        };

        setBusinessData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, periodType]);

  const renderRevenueChart = (data) => {
    if (!data?.length) return null;
    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              stroke="#8884d8"
              tickFormatter={value => `$${(value / 1e9).toFixed(1)}B`}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#82ca9d"
              tickFormatter={value => `$${(value / 1e9).toFixed(1)}B`}
            />
            <Tooltip 
              formatter={value => `$${(value / 1e9).toFixed(2)}B`}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#8884d8"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="operatingIncome"
              name="Operating Income"
              stroke="#82ca9d"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderExpenseBreakdown = (data) => {
    if (!data?.length) return null;
    const latest = data[0];
    const expenseData = [
      { name: 'R&D', value: latest.rdExpense },
      { name: 'SG&A', value: latest.sgaExpense },
      { name: 'COGS', value: latest.revenue - latest.grossProfit }
    ];

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={value => `$${(value / 1e9).toFixed(2)}B`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderMetricsCards = (metrics) => {
    if (!metrics?.length) return null;
    const latest = metrics[0];

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600">ROIC</div>
          <div className="text-2xl font-bold text-blue-700">
            {(latest.roic * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600">ROA</div>
          <div className="text-2xl font-bold text-green-700">
            {(latest.roa * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600">Gross Margin</div>
          <div className="text-2xl font-bold text-purple-700">
            {((businessData.quarters[0].grossProfit / businessData.quarters[0].revenue) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-orange-600">R&D % Revenue</div>
          <div className="text-2xl font-bold text-orange-700">
            {((businessData.quarters[0].rdExpense / businessData.quarters[0].revenue) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Business Mix Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Sector:</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedSector}
                onChange={(e) => {
                  setSelectedSector(e.target.value);
                  setSymbol(sectors[e.target.value].companies[0]);
                }}
              >
                {Object.entries(sectors).map(([key, sector]) => (
                  <option key={key} value={key}>
                    {sector.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company:</label>
              <select
                className="w-full p-2 border rounded"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              >
                {sectors[selectedSector].companies.map(company => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Period:</label>
              <select
                className="w-full p-2 border rounded"
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
              >
                <option value="quarter">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">Loading...</div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              Error: {error}
            </div>
          )}
          
          {businessData && (
            <>
              {/* Company Info */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium mb-2">{businessData.companyName}</h3>
                <div className="text-sm text-gray-600 mb-2">
                  {businessData.sector} | {businessData.industry}
                </div>
                <div className="text-sm text-gray-500 line-clamp-3">
                  {businessData.description}
                </div>
              </div>

              {/* Key Metrics */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMetricsCards(businessData.keyMetrics)}
                </CardContent>
              </Card>

              {/* Revenue Trend */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Revenue & Operating Income Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderRevenueChart(businessData.quarters)}
                </CardContent>
              </Card>

              {/* Expense Mix */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderExpenseBreakdown(businessData.quarters)}
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}