// scripts/downloadHistoricalData.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: '.env.local' });
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const INDICES = {
    sp500: { symbol: '%5EGSPC', name: 'S&P 500' },
    nasdaq: { symbol: '%5EIXIC', name: 'NASDAQ' },
    growth: { symbol: 'IWF', name: 'Russell Growth ETF' },
    value: { symbol: 'IWD', name: 'Russell Value ETF' },
    sox: { symbol: 'SOXX', name: 'Philadelphia Semiconductor Index' }  // Changed from %5ESOX to SOX
};

const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES = 1000;
const MAX_RETRIES = 3;

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, params, retries = 0) {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Retrying ${url} (Attempt ${retries + 1}/${MAX_RETRIES})`);
      await delay(1000 * (retries + 1));
      return fetchWithRetry(url, params, retries + 1);
    }
    throw error;
  }
}

async function downloadHistoricalData() {
  const API_KEY = process.env.FMP_API_KEY;
  if (!API_KEY) {
    throw new Error('FMP_API_KEY not found in environment variables');
  }

  await fs.mkdir(DATA_DIR, { recursive: true });

  const indices = Object.entries(INDICES);
  for (let i = 0; i < indices.length; i += BATCH_SIZE) {
    const batch = indices.slice(i, i + BATCH_SIZE);
    
    console.log(`Processing batch ${i / BATCH_SIZE + 1}...`);
    
    await Promise.all(batch.map(async ([indexKey, indexInfo]) => {
      const filename = path.join(DATA_DIR, `${indexKey}-historical.json`);
      console.log(`Downloading ${indexInfo.name} data...`);

      try {
        const data = await fetchWithRetry(
          `https://financialmodelingprep.com/api/v3/historical-price-full/${indexInfo.symbol}`,
          {
            apikey: API_KEY,
            serietype: 'line',
            timeseries: 6000
          }
        );

        if (!data.historical || !data.historical.length) {
          throw new Error(`No historical data received for ${indexInfo.name}`);
        }

        const processedData = {
          lastUpdated: new Date().toISOString(),
          metadata: {
            symbol: indexInfo.symbol,
            name: indexInfo.name,
            dataPoints: data.historical.length
          },
          data: data.historical
            .map(point => ({
              date: point.date,
              close: point.close,  // Changed value to close for consistency
              volume: point.volume,
              change: point.change,
              change_percent: point.changePercent
            }))
            .reverse()
        };

        await fs.writeFile(
          filename,
          JSON.stringify(processedData, null, 2)
        );

        console.log(`✓ ${indexInfo.name} data saved successfully`);
      } catch (error) {
        console.error(`✗ Error downloading ${indexInfo.name} data:`, error.message);
      }
    }));

    if (i + BATCH_SIZE < indices.length) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }
}

async function updateHistoricalData() {
  const API_KEY = process.env.FMP_API_KEY;
  if (!API_KEY) {
    throw new Error('FMP_API_KEY not found in environment variables');
  }

  for (const [indexKey, indexInfo] of Object.entries(INDICES)) {
    const filename = path.join(DATA_DIR, `${indexKey}-historical.json`);
    
    try {
      const fileData = JSON.parse(await fs.readFile(filename, 'utf-8'));
      const lastDate = fileData.data[fileData.data.length - 1].date;

      console.log(`Updating ${indexInfo.name} data since ${lastDate}...`);

      const newData = await fetchWithRetry(
        `https://financialmodelingprep.com/api/v3/historical-price-full/${indexInfo.symbol}`,
        {
          apikey: API_KEY,
          from: lastDate,
          serietype: 'line'
        }
      );

      if (!newData.historical || !newData.historical.length) {
        console.log(`No new data available for ${indexInfo.name}`);
        continue;
      }

      const processedNewData = newData.historical
        .filter(point => point.date > lastDate)
        .map(point => ({
          date: point.date,
          close: point.close,  // Changed value to close
          volume: point.volume,
          change: point.change,
          change_percent: point.changePercent
        }));

      if (processedNewData.length > 0) {
        fileData.data.push(...processedNewData);
        fileData.lastUpdated = new Date().toISOString();
        fileData.metadata.dataPoints = fileData.data.length;

        await fs.writeFile(filename, JSON.stringify(fileData, null, 2));
        console.log(`✓ ${indexInfo.name} updated with ${processedNewData.length} new data points`);
      } else {
        console.log(`No new data points for ${indexInfo.name}`);
      }

      await delay(1000);
    } catch (error) {
      console.error(`✗ Error updating ${indexInfo.name} data:`, error.message);
    }
  }
}

const command = process.argv[2];
if (command === 'download') {
  downloadHistoricalData()
    .then(() => console.log('Initial download complete'))
    .catch(console.error);
} else if (command === 'update') {
  updateHistoricalData()
    .then(() => console.log('Update complete'))
    .catch(console.error);
} else {
  console.log('Please specify either "download" or "update" command');
}