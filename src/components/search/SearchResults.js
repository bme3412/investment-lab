'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SearchResults({ results }) {
  if (!results?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((company, index) => (
            <div 
              key={company.ticker || index}
              className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">
                    {company.name} ({company.ticker})
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {company.sector}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    Market Cap: ${company.marketCap}B
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Price: ${company.price}
                  </div>
                </div>
              </div>
              
              {/* Key Metrics */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Revenue Growth</div>
                  <div className={`text-lg font-medium ${
                    company.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {company.revenueGrowth}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Gross Margin</div>
                  <div className="text-lg font-medium">{company.grossMargin}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</div>
                  <div className="text-lg font-medium">{company.peRatio}x</div>
                </div>
              </div>

              {/* Screening Criteria Matches */}
              {company.matches && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Matched Criteria:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {company.matches.map((match, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm rounded-full"
                      >
                        {match}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}