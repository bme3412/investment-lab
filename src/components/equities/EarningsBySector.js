'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EarningsBySector = () => {
  const sectorData = {
    'Tech.': { weight: 32 },
    'Financials': { weight: 13 },
    'Health Care': { weight: 11 },
    'Cons. Disc.': { weight: 10 },
    'Comm. Services': { weight: 9 },
    'Industrials': { weight: 9 },
    'Cons. Staples': { weight: 6 },
    'Energy': { weight: 3 },
    'Utilities': { weight: 3 },
    'Materials': { weight: 2 },
    'Real Estate': { weight: 2 },
    'S&P 500': { weight: null }
  };

  const quarterlyData = {
    '2022': {
      'Tech.': [14, 1, -1, -9],
      'Financials': [-19, -21, -18, -13],
      'Health Care': [15, 8, 0, -4],
      'Cons. Disc.': [-29, -16, 7, -19],
      'Comm. Services': [-1, -21, -23, -26],
      'Industrials': [39, 33, 20, 40],
      'Cons. Staples': [8, 2, 1, 1],
      'Energy': [282, 301, 140, 58],
      'Utilities': [27, -4, -8, 10],
      'Materials': [47, 17, -12, -19],
      'Real Estate': [19, 6, 11, 8],
      'S&P 500': [10, 7, 3, -3]
    },
    '2023': {
      'Tech.': [-8, 4, 14, 23],
      'Financials': [-5, -2, 12, -21],
      'Health Care': [-15, -27, -18, -15],
      'Cons. Disc.': [38, 48, 38, 27],
      'Comm. Services': [-14, 20, 44, 44],
      'Industrials': [24, 12, 9, 4],
      'Cons. Staples': [3, 8, 7, 6],
      'Energy': [19, -49, -34, -23],
      'Utilities': [-23, -3, 10, 31],
      'Materials': [-20, -24, -16, -31],
      'Real Estate': [-1, 5, -1, -2],
      'S&P 500': [-1, -4, 6, 4]
    },
    '2024': {
      'Tech.': [25, 20, 17, 15],
      'Financials': [9, 17, 7, 39],
      'Health Care': [-25, 19, 13, 16],
      'Cons. Disc.': [21, 10, 2, 8],
      'Comm. Services': [42, 8, 24, 22],
      'Industrials': [2, -3, -12, -1],
      'Cons. Staples': [6, 4, 4, 2],
      'Energy': [-24, 0, -29, -24],
      'Utilities': [28, 21, 5, -1],
      'Materials': [-21, -8, -9, 12],
      'Real Estate': [6, 0, 3, 2],
      'S&P 500': [6, 11, 5, 12]
    }
  };

  const getCellColor = (value) => {
    if (value >= 20) return 'bg-[#90EE90]';  // Bright green
    if (value >= 0) return 'bg-[#D9EAD3]';   // Light green
    if (value >= -10) return 'bg-[#F4C7C3]'; // Light red
    return 'bg-[#EA9999]';                    // Darker red
  };

  const shareholderYieldData = [
    { name: 'Energy', dividend: 3.2, buyback: 3.5, total: 6.8 },
    { name: 'Comm. Svcs.', dividend: 0.5, buyback: 3.4, total: 3.9 },
    { name: 'Financials', dividend: 1.6, buyback: 2.2, total: 3.8 },
    { name: 'Cons. Staples', dividend: 2.7, buyback: 1.2, total: 3.8 },
    { name: 'Industrials', dividend: 1.5, buyback: 1.8, total: 3.3 },
    { name: 'Materials', dividend: 1.8, buyback: 1.3, total: 3.1 },
    { name: 'S&P 500', dividend: 1.3, buyback: 1.8, total: 3.0 },
    { name: 'Utilities', dividend: 3.0, buyback: -0.2, total: 2.8 },
    { name: 'Health Care', dividend: 1.5, buyback: 1.1, total: 2.7 },
    { name: 'Cons. Disc.', dividend: 0.7, buyback: 1.5, total: 2.2 },
    { name: 'Info. Tech.', dividend: 0.6, buyback: 1.4, total: 2.1 },
    { name: 'Real Estate', dividend: 3.3, buyback: -1.4, total: 1.9 }
  ];

  return (
    <div className="space-y-8">
      {/* EPS Growth Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>S&P 500 sector pro-forma EPS growth</CardTitle>
          <div className="text-sm text-gray-500">Year-over-year</div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-2 px-2 font-medium border-b">Sector</th>
                  <th className="text-left py-2 px-2 font-medium border-b">Weight*</th>
                  {['2022', '2023', '2024'].map(year => (
                    <React.Fragment key={year}>
                      <th className="text-center py-2 px-1 font-medium border-b" colSpan="4">{year}</th>
                    </React.Fragment>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <th className="border-b"></th>
                  <th className="border-b"></th>
                  {['2022', '2023', '2024'].map(year => (
                    <React.Fragment key={year}>
                      {['1Q', '2Q', '3Q', '4Q'].map(quarter => (
                        <th key={`${year}-${quarter}`} className="text-right py-1 px-1 font-medium border-b w-14">{quarter}</th>
                      ))}
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(sectorData).map(([sector, { weight }]) => (
                  <tr key={sector} className="border-b">
                    <td className="py-1 px-2">{sector}</td>
                    <td className="py-1 px-2">{weight ? `${weight}%` : ''}</td>
                    {['2022', '2023', '2024'].map(year => (
                      <React.Fragment key={year}>
                        {[0, 1, 2, 3].map((quarter) => (
                          <td 
                            key={`${year}-${quarter}`}
                            className={`py-1 px-1 text-right ${getCellColor(quarterlyData[year][sector][quarter])}`}
                          >
                            {quarterlyData[year][sector][quarter]}%
                          </td>
                        ))}
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Shareholder Yield Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Total shareholder yield by sector</CardTitle>
          <div className="text-sm text-gray-500">
            Last 12-months dividends and buybacks minus issuance divided by market cap
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shareholderYieldData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                barSize={20}
              >
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  domain={[-2, 8]}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`]}
                />
                <Bar dataKey="dividend" stackId="a" fill="#4B5563" />
                <Bar dataKey="buyback" stackId="a" fill="#93C47D" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#93C47D]"></div>
              <span className="text-sm">Buyback yield</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#4B5563]"></div>
              <span className="text-sm">Dividend yield</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsBySector;