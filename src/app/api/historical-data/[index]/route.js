// src/app/api/historical-data/[index]/route.js
import axios from 'axios';

const INDEX_SYMBOLS = {
  sp500: '%5EGSPC',    // S&P 500
  nasdaq: '%5EIXIC',   // NASDAQ
  growth: 'IWF',       // Russell Growth ETF as proxy
  value: 'IWD'         // Russell Value ETF as proxy
};

export async function GET(req, { params }) {
  try {
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

    const API_KEY = process.env.FMP_API_KEY;
    if (!API_KEY) {
      console.error('API key is not set.');
      return new Response(
        JSON.stringify({ error: 'API key is not set.' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}`,
      {
        params: {
          apikey: API_KEY,
          serietype: 'line',
          timeseries: 6000,
        },
      }
    );

    if (!response.data.historical) {
      throw new Error('No historical data received');
    }

    const processedData = response.data.historical
      .map(point => ({
        date: point.date,
        value: point.close,
      }))
      .reverse();

    console.log(`Fetched ${processedData.length} data points for ${index}`);

    return new Response(
      JSON.stringify({ data: processedData }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600'
        }
      }
    );
  } catch (error) {
    console.error(`Error fetching ${params.index} historical data:`, error);
    
    const errorMessage = error.response?.data?.error || 'Failed to fetch historical data.';
    const statusCode = error.response?.status || 500;
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}