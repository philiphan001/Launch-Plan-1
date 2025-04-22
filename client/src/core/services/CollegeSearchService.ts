import { College } from '@/types/college';

export type EducationType = '4year' | '2year' | 'vocational';
export type SearchMode = 'direct' | 'transfer';

export interface CollegeSearchFilters {
  query: string;
  educationType: EducationType;
  searchMode: SearchMode;
}

export interface FavoriteCollege {
  id: number;
  userId: number;
  collegeId: number;
  college: College;
  createdAt: string;
}

export class CollegeSearchService {
  private static instance: CollegeSearchService;
  private cache: Map<string, College[]> = new Map();

  private constructor() {}

  static getInstance(): CollegeSearchService {
    if (!CollegeSearchService.instance) {
      CollegeSearchService.instance = new CollegeSearchService();
    }
    return CollegeSearchService.instance;
  }

  async searchColleges(filters: CollegeSearchFilters): Promise<College[]> {
    const { query, educationType, searchMode } = filters;
    
    // Don't search if query is too short
    if (!query || query.length < 2) {
      return [];
    }

    // Generate cache key based on all filters
    const cacheKey = JSON.stringify(filters);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('q', query);
      queryParams.append('educationType', educationType);
      
      // For transfer mode, we always search 4-year colleges regardless of current education type
      if (searchMode === 'transfer') {
        queryParams.set('educationType', '4year');
      }

      const response = await fetch(`/api/colleges/search?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch colleges');
      }

      const data = await response.json();
      
      // Cache the results
      this.cache.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error searching colleges:', error);
      throw error;
    }
  }

  async getCollegeById(id: number): Promise<College | null> {
    try {
      const response = await fetch(`/api/colleges/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch college');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching college:', error);
      return null;
    }
  }

  async getFavoriteColleges(userId: number): Promise<FavoriteCollege[]> {
    try {
      const response = await fetch(`/api/favorites/colleges/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch favorite colleges');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching favorite colleges:', error);
      throw error;
    }
  }

  async isCollegeFavorited(userId: number, collegeId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavoriteColleges(userId);
      return favorites.some(fav => fav.collegeId === collegeId);
    } catch (error) {
      console.error('Error checking if college is favorited:', error);
      return false;
    }
  }

  async addMultipleToFavorites(userId: number, collegeIds: number[]): Promise<FavoriteCollege[]> {
    try {
      // Filter out colleges that are already favorited
      const newFavorites = [];
      for (const collegeId of collegeIds) {
        const isAlreadyFavorited = await this.isCollegeFavorited(userId, collegeId);
        if (!isAlreadyFavorited) {
          const favorite = await this.addToFavorites(userId, collegeId);
          newFavorites.push(favorite);
        }
      }
      return newFavorites;
    } catch (error) {
      console.error('Error adding multiple colleges to favorites:', error);
      throw error;
    }
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

  async addToFavorites(userId: number, collegeId: number): Promise<FavoriteCollege> {
    return this.retryOperation(async () => {
      const response = await fetch('/api/favorites/colleges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, collegeId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add college to favorites');
      }
      
      return await response.json();
    });
  }

  async removeFromFavorites(favoriteId: number): Promise<void> {
    return this.retryOperation(async () => {
      const response = await fetch(`/api/favorites/colleges/${favoriteId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove college from favorites');
      }
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

export const collegeSearchService = CollegeSearchService.getInstance(); 