import { Career } from '@/types/career';

export interface CareerSearchFilters {
  query?: string;
  education?: string;
  category?: string;
  minSalary?: number;
  maxSalary?: number;
  growthRate?: number;
  jobType?: 'fulltime' | 'parttime';
  fieldOfStudy?: string;
  globalSearch?: boolean;
}

export interface FavoriteCareer {
  id: number;
  userId: number;
  careerId: number;
  career: Career;
  createdAt: string;
}

export class CareerSearchService {
  private static instance: CareerSearchService;
  private cache: Map<string, Career[]> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): CareerSearchService {
    if (!CareerSearchService.instance) {
      CareerSearchService.instance = new CareerSearchService();
    }
    return CareerSearchService.instance;
  }

  private isCacheValid(cacheKey: string): boolean {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.cacheTimeout;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryOperation(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async search(filters: CareerSearchFilters): Promise<Career[]> {
    const cacheKey = JSON.stringify(filters);
    
    // Check cache first
    if (this.cache.has(cacheKey) && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const queryParams = new URLSearchParams();
      if (filters.query) queryParams.append('q', filters.query);
      if (filters.education) queryParams.append('education', filters.education);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minSalary) queryParams.append('minSalary', filters.minSalary.toString());
      if (filters.maxSalary) queryParams.append('maxSalary', filters.maxSalary.toString());
      if (filters.growthRate) queryParams.append('growthRate', filters.growthRate.toString());
      if (filters.jobType) queryParams.append('jobType', filters.jobType);
      if (filters.fieldOfStudy) queryParams.append('fieldOfStudy', filters.fieldOfStudy);
      if (filters.globalSearch) queryParams.append('globalSearch', filters.globalSearch.toString());

      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/careers/search?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch careers');
        }
        return res;
      });

      const data = await response.json();
      
      // Cache the results
      this.cache.set(cacheKey, data);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      return data;
    } catch (error) {
      console.error('Error searching careers:', error);
      throw error;
    }
  }

  async getCareerById(id: number): Promise<Career | null> {
    try {
      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/careers/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch career');
        }
        return res;
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching career:', error);
      return null;
    }
  }

  async getFavoriteCareers(userId: number): Promise<FavoriteCareer[]> {
    try {
      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/favorites/careers/${userId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch favorite careers');
        }
        return res;
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching favorite careers:', error);
      throw error;
    }
  }

  async isCareerFavorited(userId: number, careerId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavoriteCareers(userId);
      return favorites.some(fav => fav.careerId === careerId);
    } catch (error) {
      console.error('Error checking if career is favorited:', error);
      return false;
    }
  }

  async addToFavorites(userId: number, careerId: number): Promise<FavoriteCareer> {
    return this.retryOperation(async () => {
      const response = await fetch('/api/favorites/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, careerId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add career to favorites');
      }
      
      return await response.json();
    });
  }

  async removeFromFavorites(favoriteId: number): Promise<void> {
    return this.retryOperation(async () => {
      const response = await fetch(`/api/favorites/careers/${favoriteId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove career from favorites');
      }
    });
  }

  async addMultipleToFavorites(userId: number, careerIds: number[]): Promise<FavoriteCareer[]> {
    try {
      // Filter out careers that are already favorited
      const newFavorites = [];
      for (const careerId of careerIds) {
        const isAlreadyFavorited = await this.isCareerFavorited(userId, careerId);
        if (!isAlreadyFavorited) {
          const favorite = await this.addToFavorites(userId, careerId);
          newFavorites.push(favorite);
        }
      }
      return newFavorites;
    } catch (error) {
      console.error('Error adding multiple careers to favorites:', error);
      throw error;
    }
  }

  async autoFavoriteCareer(userId: number, careerId: number): Promise<FavoriteCareer | null> {
    try {
      // Check if this career was recently auto-favorited
      const lastAutoFavorited = localStorage.getItem('lastAutoFavoritedCareer');
      if (lastAutoFavorited === careerId.toString()) {
        console.log('Career was recently auto-favorited, skipping');
        return null;
      }

      // Check if already favorited
      const isAlreadyFavorited = await this.isCareerFavorited(userId, careerId);
      if (isAlreadyFavorited) {
        console.log('Career is already favorited, skipping');
        return null;
      }

      // Add to favorites
      const favorite = await this.addToFavorites(userId, careerId);
      
      // Store the last auto-favorited career ID
      localStorage.setItem('lastAutoFavoritedCareer', careerId.toString());
      
      return favorite;
    } catch (error) {
      console.error('Error auto-favoriting career:', error);
      return null;
    }
  }

  async getSuggestedCareersByField(fieldOfStudy: string): Promise<Career[]> {
    try {
      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/careers/suggestions/${encodeURIComponent(fieldOfStudy)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch suggested careers');
        }
        return res;
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching suggested careers:', error);
      return [];
    }
  }

  async getTopCareersByField(fieldOfStudy: string, limit: number = 5): Promise<Career[]> {
    try {
      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/careers/top/${encodeURIComponent(fieldOfStudy)}?limit=${limit}`);
        if (!res.ok) {
          throw new Error('Failed to fetch top careers');
        }
        return res;
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching top careers:', error);
      return [];
    }
  }

  async getCareerSuggestions(fieldOfStudy: string, options: {
    includeTopCareers?: boolean;
    includeSuggestedCareers?: boolean;
    limit?: number;
  } = {}): Promise<Career[]> {
    const {
      includeTopCareers = true,
      includeSuggestedCareers = true,
      limit = 5
    } = options;

    try {
      const results: Career[] = [];

      if (includeTopCareers) {
        const topCareers = await this.getTopCareersByField(fieldOfStudy, limit);
        results.push(...topCareers);
      }

      if (includeSuggestedCareers) {
        const suggestedCareers = await this.getSuggestedCareersByField(fieldOfStudy);
        // Filter out duplicates
        const uniqueSuggestedCareers = suggestedCareers.filter(
          suggested => !results.some(existing => existing.id === suggested.id)
        );
        results.push(...uniqueSuggestedCareers);
      }

      // Limit total results
      return results.slice(0, limit);
    } catch (error) {
      console.error('Error getting career suggestions:', error);
      return [];
    }
  }

  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }
}

export const careerSearchService = CareerSearchService.getInstance(); 