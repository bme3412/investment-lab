// src/services/fmp.js

const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

export async function getFMPData(endpoint) {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${FMP_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching FMP data:', error);
    throw error;
  }
}

export async function getCompanyFinancials(ticker, limit = 5) {
  return getFMPData(`/income-statement/${ticker}?limit=${limit}`);
}

export async function getPeerComparison(ticker) {
  try {
    const peersData = await getFMPData(`/stock_peers?symbol=${ticker}`);
    const peers = peersData[0]?.peersList || [];
    const peerFinancials = await Promise.all(
      [ticker, ...peers].slice(0, 5).map(async (peerTicker) => {
        const data = await getFMPData(`/ratios/${peerTicker}?limit=1`);
        return {
          ticker: peerTicker,
          ...data[0]
        };
      })
    );
    return peerFinancials;
  } catch (error) {
    console.error('Error fetching peer comparison:', error);
    throw error;
  }
}

export async function getMarginTrends(ticker, limit = 5) {
  try {
    const data = await getFMPData(`/income-statement/${ticker}?limit=${limit}`);
    return data.map(period => ({
      date: new Date(period.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      }),
      grossMargin: (period.grossProfitRatio * 100).toFixed(2),
      operatingMargin: (period.operatingIncomeRatio * 100).toFixed(2),
      netMargin: (period.netIncomeRatio * 100).toFixed(2)
    }));
  } catch (error) {
    console.error('Error fetching margin trends:', error);
    throw error;
  }
}

export async function getCompanyProfile(ticker) {
  return getFMPData(`/profile/${ticker}`);
}

export async function getKeyMetrics(ticker, period = 'quarter', limit = 4) {
  return getFMPData(`/key-metrics/${ticker}?period=${period}&limit=${limit}`);
}