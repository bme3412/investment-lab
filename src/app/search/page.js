'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SearchResults from '@/components/search/SearchResults';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useState({
    guidanceCutThreshold: '',
    ceoChange: false,
    turnaroundPlan: false,
    debateKeywords: '',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/screening/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('An error occurred while searching');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Investment Screening</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Guidance Cut Threshold */}
            <div>
              <label htmlFor="guidanceCutThreshold" className="block text-sm font-medium mb-2">
                Top-Line Guidance Cut Threshold (%)
              </label>
              <input
                id="guidanceCutThreshold"
                type="number"
                step="0.01"
                value={searchParams.guidanceCutThreshold}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  guidanceCutThreshold: e.target.value
                }))}
                className="w-full p-2 border rounded dark:bg-gray-800"
                placeholder="e.g., 5"
              />
            </div>

            {/* CEO Change */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ceoChange"
                checked={searchParams.ceoChange}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  ceoChange: e.target.checked
                }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="ceoChange">
                CEO has changed within last year
              </label>
            </div>

            {/* Turnaround Plan */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="turnaroundPlan"
                checked={searchParams.turnaroundPlan}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  turnaroundPlan: e.target.checked
                }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="turnaroundPlan">
                CEO has announced turnaround plan
              </label>
            </div>

            {/* Keywords */}
            <div>
              <label htmlFor="debateKeywords" className="block text-sm font-medium mb-2">
                Key Debates (comma separated)
              </label>
              <input
                id="debateKeywords"
                type="text"
                value={searchParams.debateKeywords}
                onChange={(e) => setSearchParams(prev => ({
                  ...prev,
                  debateKeywords: e.target.value
                }))}
                className="w-full p-2 border rounded dark:bg-gray-800"
                placeholder="e.g., growth acceleration, market expansion"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <SearchResults results={results} />
      )}
    </div>
  );
}