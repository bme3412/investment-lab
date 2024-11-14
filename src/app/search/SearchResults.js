'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';

const SearchResults = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-center text-gray-500">No companies match the search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {results.map((company) => (
        <Card key={company.id}>
          <CardHeader>
            <CardTitle>
              {company.name} ({company.ticker})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Sector:</strong> {company.sector}
            </p>
            <p>
              <strong>Market Cap:</strong> ${company.market_cap}M
            </p>
            {/* Add more relevant details as needed */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchResults;
