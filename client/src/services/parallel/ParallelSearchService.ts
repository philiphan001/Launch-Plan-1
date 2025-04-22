import { College } from '@/types/college';
import { Career } from '@/types/career';
import { Location } from '@/types/location';

export class ParallelSearchService {
  private static instance: ParallelSearchService;
  private collegeCache: Map<string, College[]> = new Map();
  private careerCache: Map<string, Career[]> = new Map();
  private singleCollegeCache: Map<string, College> = new Map();
  private singleCareerCache: Map<string, Career> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): ParallelSearchService {
    if (!ParallelSearchService.instance) {
      ParallelSearchService.instance = new ParallelSearchService();
    }
    return ParallelSearchService.instance;
  }

  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.cacheTimeout;
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error | null = null;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
      }
    }
    throw lastError;
  }

  // College Search Methods
  async searchColleges(query: string, educationType: '4year' | '2year'): Promise<College[]> {
    const cacheKey = `colleges:${query}:${educationType}`;
    
    if (this.collegeCache.has(cacheKey) && this.isCacheValid(cacheKey)) {
      return this.collegeCache.get(cacheKey)!;
    }

    try {
      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/colleges/search?q=${encodeURIComponent(query)}&educationType=${educationType}`);
        if (!res.ok) {
          throw new Error('Failed to fetch colleges');
        }
        return res;
      });

      const data = await response.json() as College[];
      
      this.collegeCache.set(cacheKey, data);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      return data;
    } catch (error) {
      console.error('Error searching colleges:', error);
      throw error;
    }
  }

  async getCollegeById(id: number): Promise<College | null> {
    const cacheKey = `college:${id}`;
    
    if (this.singleCollegeCache.has(cacheKey) && this.isCacheValid(cacheKey)) {
      return this.singleCollegeCache.get(cacheKey)!;
    }

    try {
      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/colleges/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch college');
        }
        return res;
      });

      const data = await response.json() as College;
      
      this.singleCollegeCache.set(cacheKey, data);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      return data;
    } catch (error) {
      console.error('Error fetching college:', error);
      return null;
    }
  }

  // Career Search Methods
  async searchCareers(query: string): Promise<Career[]> {
    const cacheKey = `careers:${query}`;
    
    if (this.careerCache.has(cacheKey) && this.isCacheValid(cacheKey)) {
      return this.careerCache.get(cacheKey)!;
    }

    try {
      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/careers/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch careers');
        }
        return res;
      });

      const data = await response.json() as Career[];
      
      this.careerCache.set(cacheKey, data);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      return data;
    } catch (error) {
      console.error('Error searching careers:', error);
      throw error;
    }
  }

  async getCareerById(id: number): Promise<Career | null> {
    const cacheKey = `career:${id}`;
    
    if (this.singleCareerCache.has(cacheKey) && this.isCacheValid(cacheKey)) {
      return this.singleCareerCache.get(cacheKey)!;
    }

    try {
      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/careers/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch career');
        }
        return res;
      });

      const data = await response.json() as Career;
      
      this.singleCareerCache.set(cacheKey, data);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      return data;
    } catch (error) {
      console.error('Error fetching career:', error);
      return null;
    }
  }

  async searchLocations(query: string): Promise<Location[]> {
    try {
      // First try to search by zip code if the query looks like one
      if (/^\d{5}$/.test(query)) {
        const response = await fetch(`/api/location-cost-of-living/zip/${query}`);
        if (response.ok) {
          const location = await response.json();
          return location ? [location] : [];
        }
      }

      // If not a zip code or zip search failed, try city/state search
      // Attempt to parse city and state from query (e.g. "San Francisco, CA" or "San Francisco CA")
      const match = query.match(/^(.*?)[,\s]+([A-Za-z]{2})$/);
      if (match) {
        const [, city, state] = match;
        const response = await fetch(`/api/location-cost-of-living/city?city=${encodeURIComponent(city.trim())}&state=${state.toUpperCase()}`);
        if (response.ok) {
          return response.json();
        }
      }

      // If no results found or query doesn't match expected formats
      return [];
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  }
}

export const parallelSearchService = ParallelSearchService.getInstance(); 