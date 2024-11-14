import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Update path to point to semi-cycle directory
    const dataPath = path.join(process.cwd(), 'semi-cycle', 'semi_cycle_data.csv');
    
    // Read the CSV file
    const fileContents = await fs.readFile(dataPath, 'utf8');
    
    // Parse CSV to JSON
    const rows = fileContents.split('\n');
    const headers = rows[0].split(',');
    
    const historical_data = rows.slice(1)
      .filter(row => row.trim()) // Remove empty rows
      .map(row => {
        const values = row.split(',');
        const record = {};
        headers.forEach((header, index) => {
          // Parse numbers where appropriate
          const value = values[index];
          record[header.trim()] = isNaN(value) ? value : parseFloat(value);
        });
        return record;
      });

    const data = {
      metadata: {
        last_updated: new Date().toISOString(),
        data_points: historical_data.length
      },
      historical_data
    };
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading cycle data:', error);
    return NextResponse.json(
      { error: 'Failed to load cycle data' },
      { status: 500 }
    );
  }
}