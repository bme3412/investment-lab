// src/config/sectors.js

export const sectors = {
    semiconductors: {
      label: 'Semiconductors',
      icon: 'Cpu',
      companies: ['NVDA', 'AMD', 'INTC', 'TSM', 'AVGO'],
      metrics: {
        index: 'SOX',
        keyMetrics: ['Process Node', 'Fab vs Fabless', 'End Markets']
      }
    },
    software: {
      label: 'Software',
      icon: 'Cloud',
      companies: ['MSFT', 'ORCL', 'CRM', 'ADBE', 'NOW'],
      metrics: {
        index: 'IGV',
        keyMetrics: ['ARR', 'NDR', 'CAC Ratio']
      }
    },
    hardware: {
      label: 'Hardware',
      icon: 'Monitor',
      companies: ['AAPL', 'HPQ', 'DELL', 'WDC', 'STX'],
      metrics: {
        index: 'XHB',
        keyMetrics: ['ASP', 'Inventory Turns', 'Channel Mix']
      }
    },
    internet: {
      label: 'Internet',
      icon: 'Share2',
      companies: ['GOOGL', 'META', 'AMZN', 'NFLX', 'UBER'],
      metrics: {
        index: 'FDN',
        keyMetrics: ['MAU', 'ARPU', 'TAM']
      }
    }
  };
  
  export const defaultSector = 'semiconductors';
  
  export const getMetricsForSector = (sectorKey) => {
    return sectors[sectorKey]?.metrics || sectors[defaultSector].metrics;
  };