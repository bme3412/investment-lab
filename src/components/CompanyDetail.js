'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import BusinessModelClassifier from './BusinessModel';
import MarginAnalysis from './MarginAnalysis';

const CompanyDetail = ({ company }) => {
  return (
    <div className="space-y-6">
      <Card>
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
          {/* Add more details as needed */}
        </CardContent>
      </Card>

      {/* Embed existing analysis components with company-specific data */}
      <BusinessModelClassifier companyId={company.id} />
      <MarginAnalysis companyId={company.id} />
    </div>
  );
};

export default CompanyDetail;
