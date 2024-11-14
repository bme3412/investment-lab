// src/app/api/sox-data/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');
  const API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'Start and end dates are required' },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/historical-price-full/%5ESOX`,
      {
        params: {
          from: startDate,
          to: endDate,
          apikey: API_KEY
        }
      }
    );

    if (response.data && response.data.historical) {
      const formattedData = response.data.historical
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(day => ({
          date: day.date,
          close: day.close
        }));

      return NextResponse.json({
        success: true,
        data: formattedData
      });
    }

    return NextResponse.json(
      { error: 'No data available' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error fetching SOX data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOX data' },
      { status: 500 }
    );
  }
}