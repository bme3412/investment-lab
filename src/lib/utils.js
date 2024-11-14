// src/lib/utils.js

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCycleData(rawData) {
    return rawData.map(item => ({
      date: new Date(item.date).toISOString(),
      composite_score: parseFloat(item.composite_score),
      cycle_phase: item.cycle_phase,
      momentum: parseFloat(item.momentum),
      acceleration: parseFloat(item.acceleration)
    }));
  }