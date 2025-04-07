
import NodeCache from 'node-cache';

// Cache with 5 minute TTL
const calculationCache = new NodeCache({ stdTTL: 300 });

export function getCachedCalculation(key: string): any {
  return calculationCache.get(key);
}

export function setCachedCalculation(key: string, value: any): void {
  calculationCache.set(key, value);
}

export function generateCacheKey(userId: number, inputData: any): string {
  return `calc_${userId}_${JSON.stringify(inputData)}`;
}
