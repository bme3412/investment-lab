// src/services/sox.js
import soxData from '@/data/sox-historical.json';

export function getSOXData(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return soxData.data.filter(point => {
    const date = new Date(point.date);
    return date >= start && date <= end;
  });
}

export function getLatestSOX() {
  return soxData.data[soxData.data.length - 1];
}