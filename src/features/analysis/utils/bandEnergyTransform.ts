import type { FeatureData } from '../types';

/**
 * Transform band energy data from API format to visualization format
 * 
 * API provides:
 * {
 *   "band_energy": {
 *     "sub_bass": [0.01, 0.02, ...],
 *     "bass": [0.03, 0.04, ...],
 *     "mids": [0.05, 0.06, ...],
 *     "highs": [0.02, 0.03, ...]
 *   }
 * }
 * 
 * We need:
 * {
 *   times: [0, 0.1, 0.2, ...],
 *   values: [[0.01, 0.03, 0.05, 0.02], [0.02, 0.04, 0.06, 0.03], ...]
 * }
 */

export interface BandEnergyData {
  sub_bass?: number[];
  bass?: number[];
  mids?: number[];
  highs?: number[];
  times?: number[];
}

export interface TransformedBandEnergy {
  times: number[];
  values: number[][];
  bands: string[];
}

// Band definitions matching API structure (4 bands, not 6)
export const ENERGY_BANDS = [
  { key: 'sub_bass', name: 'Sub-bass', range: '20-60 Hz', color: 'rgba(139, 92, 246, 0.8)' },
  { key: 'bass', name: 'Bass', range: '60-250 Hz', color: 'rgba(124, 58, 237, 0.8)' },
  { key: 'mids', name: 'Mids', range: '250-4k Hz', color: 'rgba(109, 40, 217, 0.8)' },
  { key: 'highs', name: 'Highs', range: '4k-20k Hz', color: 'rgba(91, 33, 182, 0.8)' },
];

export function transformBandEnergyData(featureData: FeatureData | null): TransformedBandEnergy | null {
  if (!featureData) {
    console.warn('No feature data provided for band energy transformation');
    return null;
  }

  // Check if this is band energy data
  if (!featureData.data || typeof featureData.data !== 'object') {
    console.warn('Feature data does not contain data property');
    return null;
  }

  // Access the actual data structure
  const dataObj = featureData.data;
  if (!('values' in dataObj) || typeof dataObj.values !== 'object' || !dataObj.values) {
    console.warn('Feature data does not contain band energy structure');
    return null;
  }

  // Validate structure with type guard
  if (!isBandEnergyData(dataObj.values)) {
    console.warn('Data does not match expected band energy structure');
    return null;
  }
  
  const bandData = dataObj.values;
  
  // Validate that we have at least one band
  const availableBands = ENERGY_BANDS.filter(band => 
    Array.isArray(bandData[band.key as keyof BandEnergyData])
  );

  if (availableBands.length === 0) {
    console.warn('No valid band energy arrays found in data');
    return null;
  }

  // Get times from the feature data or generate them
  let times: number[] = [];
  if (dataObj.timestamps && Array.isArray(dataObj.timestamps)) {
    times = dataObj.timestamps;
  } else if (bandData.times && Array.isArray(bandData.times)) {
    times = bandData.times;
  } else {
    // Generate times based on the length of the first available band
    const firstBandKey = availableBands[0].key as keyof BandEnergyData;
    const firstBandData = bandData[firstBandKey] as number[];
    const sampleRate = 10; // 10 Hz default sample rate
    times = Array.from({ length: firstBandData.length }, (_, i) => i / sampleRate);
  }

  // Transform to 2D array format
  const values: number[][] = [];
  const numSamples = times.length;

  for (let i = 0; i < numSamples; i++) {
    const sample: number[] = [];
    
    // Always include all 4 bands in order, use 0 if data is missing
    for (const band of ENERGY_BANDS) {
      const bandKey = band.key as keyof BandEnergyData;
      const bandArray = bandData[bandKey];
      
      if (Array.isArray(bandArray) && i < bandArray.length) {
        sample.push(bandArray[i]);
      } else {
        sample.push(0);
      }
    }
    
    values.push(sample);
  }

  return {
    times,
    values,
    bands: ENERGY_BANDS.map(b => b.name),
  };
}

/**
 * Validate that band energy data has the expected structure
 */
export function isBandEnergyData(data: unknown): data is BandEnergyData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;
  
  // Check if at least one expected band exists and is an array
  return ENERGY_BANDS.some(band => 
    Array.isArray(obj[band.key])
  );
}