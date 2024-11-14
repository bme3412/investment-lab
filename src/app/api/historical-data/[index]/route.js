// src/app/api/historical-data/[index]/route.js
import axios from 'axios';
import sp500Data from '@/data/sp500-historical.json';
import nasdaqData from '@/data/nasdaq-historical.json';
import growthData from '@/data/growth-historical.json';
import valueData from '@/data/value-historical.json';

const INDEX_SYMBOLS = {
  sp500: '%5EGSPC',
  nasdaq: '%5EIXIC',
  growth: 'IWF',
  value: 'IWD'
};

const STATIC_DATA = {
  sp500: sp500Data,
  nasdaq: nasdaqData,
  growth: growthData,
  value: valueData
};

export async function GET(req, { params }) {
  const { index } = params;
  const symbol = INDEX_SYMBOLS[index];

  if (!symbol) {
    return new Response(
      JSON.stringify({ error: 'Invalid index specified.' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // First, return static data immediately
    const staticData = STATIC_DATA[index];
    
    // Then fetch latest data in the background
    const API_KEY = process.env.FMP_API_KEY;
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ data: staticData.data }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Only fetch data from the last known date in static data
    const lastKnownDate = staticData.data[staticData.data.length - 1].date;
    
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}`,
      {
        params: {
          apikey: API_KEY,
          from: lastKnownDate,
          serietype: 'line',
        },
      }
    );

    if (!response.data.historical) {
      return new Response(
        JSON.stringify({ data: staticData.data }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Process new data
    const newData = response.data.historical
      .map(point => ({
        date: point.date,
        value: point.close,
      }))
      .reverse();

    // Combine static and new data
    const combinedData = [
      ...staticData.data.filter(d => d.date < lastKnownDate),
      ...newData
    ];

    return new Response(
      JSON.stringify({ data: combinedData }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600'
        }
      }
    );
  } catch (error) {
    // If API call fails, return static data
    console.error(`Error fetching ${params.index} historical data:`, error);
    return new Response(
      JSON.stringify({ data: STATIC_DATA[index].data }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}