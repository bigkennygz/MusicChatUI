/**
 * Data decimation utilities for performance optimization
 * Reduces the number of data points while preserving visual characteristics
 */

export interface DecimationOptions {
  targetPoints?: number;
  method?: 'lttb' | 'nth' | 'min-max';
  preservePeaks?: boolean;
}

/**
 * Largest Triangle Three Buckets (LTTB) algorithm
 * Efficient downsampling that preserves the shape of the data
 */
export function lttbDecimate(
  times: number[],
  values: number[],
  targetPoints: number
): { times: number[]; values: number[] } {
  if (times.length <= targetPoints) {
    return { times, values };
  }

  const decimated = {
    times: [] as number[],
    values: [] as number[],
  };

  // Always keep first point
  decimated.times.push(times[0]);
  decimated.values.push(values[0]);

  const bucketSize = (times.length - 2) / (targetPoints - 2);
  let previousSelectedIndex = 0;

  for (let i = 1; i < targetPoints - 1; i++) {
    const bucketStart = Math.floor((i - 1) * bucketSize) + 1;
    const bucketEnd = Math.floor(i * bucketSize) + 1;
    const nextBucketStart = Math.floor(i * bucketSize) + 1;
    const nextBucketEnd = Math.floor((i + 1) * bucketSize) + 1;

    // Calculate average point in next bucket
    let avgX = 0;
    let avgY = 0;
    let avgCount = 0;

    for (let j = nextBucketStart; j < nextBucketEnd && j < times.length; j++) {
      avgX += times[j];
      avgY += values[j];
      avgCount++;
    }

    avgX /= avgCount;
    avgY /= avgCount;

    // Find point in current bucket with largest triangle area
    let maxArea = -1;
    let selectedIndex = bucketStart;

    for (let j = bucketStart; j < bucketEnd && j < times.length; j++) {
      const area = Math.abs(
        (times[previousSelectedIndex] - avgX) * (values[j] - values[previousSelectedIndex]) -
        (times[previousSelectedIndex] - times[j]) * (avgY - values[previousSelectedIndex])
      );

      if (area > maxArea) {
        maxArea = area;
        selectedIndex = j;
      }
    }

    decimated.times.push(times[selectedIndex]);
    decimated.values.push(values[selectedIndex]);
    previousSelectedIndex = selectedIndex;
  }

  // Always keep last point
  decimated.times.push(times[times.length - 1]);
  decimated.values.push(values[values.length - 1]);

  return decimated;
}

/**
 * Simple nth-point decimation
 */
export function nthPointDecimate(
  times: number[],
  values: number[],
  targetPoints: number
): { times: number[]; values: number[] } {
  if (times.length <= targetPoints) {
    return { times, values };
  }

  const step = Math.ceil(times.length / targetPoints);
  const decimated = {
    times: [] as number[],
    values: [] as number[],
  };

  for (let i = 0; i < times.length; i += step) {
    decimated.times.push(times[i]);
    decimated.values.push(values[i]);
  }

  return decimated;
}

/**
 * Min-max decimation preserves extremes in each bucket
 */
export function minMaxDecimate(
  times: number[],
  values: number[],
  targetPoints: number
): { times: number[]; values: number[] } {
  if (times.length <= targetPoints) {
    return { times, values };
  }

  const bucketSize = Math.ceil(times.length / (targetPoints / 2));
  const decimated = {
    times: [] as number[],
    values: [] as number[],
  };

  for (let i = 0; i < times.length; i += bucketSize) {
    const bucketEnd = Math.min(i + bucketSize, times.length);
    let minVal = values[i];
    let maxVal = values[i];
    let minIdx = i;
    let maxIdx = i;

    // Find min and max in bucket
    for (let j = i + 1; j < bucketEnd; j++) {
      if (values[j] < minVal) {
        minVal = values[j];
        minIdx = j;
      }
      if (values[j] > maxVal) {
        maxVal = values[j];
        maxIdx = j;
      }
    }

    // Add min and max in time order
    if (minIdx < maxIdx) {
      decimated.times.push(times[minIdx], times[maxIdx]);
      decimated.values.push(values[minIdx], values[maxIdx]);
    } else if (maxIdx < minIdx) {
      decimated.times.push(times[maxIdx], times[minIdx]);
      decimated.values.push(values[maxIdx], values[minIdx]);
    } else {
      // Same point is both min and max
      decimated.times.push(times[minIdx]);
      decimated.values.push(values[minIdx]);
    }
  }

  return decimated;
}

/**
 * Main decimation function that selects the appropriate algorithm
 */
export function decimateData(
  times: number[],
  values: number[],
  options: DecimationOptions = {}
): { times: number[]; values: number[] } {
  const {
    targetPoints = 1000,
    method = 'lttb',
  } = options;

  // No decimation needed
  if (times.length <= targetPoints) {
    return { times, values };
  }

  // Select decimation method
  switch (method) {
    case 'lttb':
      return lttbDecimate(times, values, targetPoints);
    case 'nth':
      return nthPointDecimate(times, values, targetPoints);
    case 'min-max':
      return minMaxDecimate(times, values, targetPoints);
    default:
      return lttbDecimate(times, values, targetPoints);
  }
}

/**
 * Decimate multi-dimensional data (e.g., multi-band energy)
 */
export function decimateMultiDimensional(
  times: number[],
  values: number[][],
  options: DecimationOptions = {}
): { times: number[]; values: number[][] } {
  if (!values.length || !values[0].length) {
    return { times: [], values: [] };
  }

  const dimensions = values[0].length;
  const decimatedValues: number[][] = [];
  
  // Decimate each dimension separately
  for (let dim = 0; dim < dimensions; dim++) {
    const dimValues = values.map(v => v[dim]);
    const decimated = decimateData(times, dimValues, options);
    
    // Initialize arrays on first dimension
    if (dim === 0) {
      times = decimated.times;
      for (let i = 0; i < decimated.times.length; i++) {
        decimatedValues[i] = [];
      }
    }
    
    // Add decimated values for this dimension
    decimated.values.forEach((val, i) => {
      decimatedValues[i][dim] = val;
    });
  }

  return { times, values: decimatedValues };
}