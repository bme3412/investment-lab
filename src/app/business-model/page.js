'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function BusinessModelPage() {
  const [selectedFromModel, setSelectedFromModel] = useState('Any');
  const [selectedToModel, setSelectedToModel] = useState('Any');

  const data = [
    { quarter: 'Q1 2023', recurring: 30, license: 70 },
    { quarter: 'Q2 2023', recurring: 40, license: 60 },
    { quarter: 'Q3 2023', recurring: 50, license: 50 },
    { quarter: 'Q4 2023', recurring: 60, license: 40 },
    { quarter: 'Q1 2024', recurring: 70, license: 30 },
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
            From Business Model
          </label>
          <select
            value={selectedFromModel}
            onChange={(e) => setSelectedFromModel(e.target.value)}
            className="w-full p-2 rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="Any">Any Business Model</option>
            <option value="Licensed">Licensed Software</option>
            <option value="Hardware">Hardware</option>
            <option value="Services">Services</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
            To Business Model
          </label>
          <select
            value={selectedToModel}
            onChange={(e) => setSelectedToModel(e.target.value)}
            className="w-full p-2 rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="Any">Any Business Model</option>
            <option value="SaaS">SaaS</option>
            <option value="Platform">Platform</option>
            <option value="Marketplace">Marketplace</option>
          </select>
        </div>
      </div>

      {/* Transition Chart */}
      <Card>
        <CardContent className="pt-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Licensed Software → SaaS</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Example Companies: AUTD, CRM
            </p>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="recurring" 
                  stroke="#8884d8" 
                  name="Recurring Revenue %"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="license" 
                  stroke="#82ca9d" 
                  name="License Revenue %"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}