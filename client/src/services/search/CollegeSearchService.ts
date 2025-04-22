import { College, FavoriteCollege, SearchFilters } from '@/types/college';

export class CollegeSearchService {
  private static instance: CollegeSearchService;
  private cache: Map<string, College[]> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): CollegeSearchService {
    if (!CollegeSearchService.instance) {
      CollegeSearchService.instance = new CollegeSearchService();
    }
    return CollegeSearchService.instance;
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

  async search(filters: SearchFilters): Promise<College[]> {
    const cacheKey = JSON.stringify(filters);
    
    // Check cache first
    if (this.cache.has(cacheKey) && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const queryParams = new URLSearchParams();
      if (filters.query) queryParams.append('q', filters.query);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.minTuition) queryParams.append('minTuition', filters.minTuition.toString());
      if (filters.maxTuition) queryParams.append('maxTuition', filters.maxTuition.toString());
      if (filters.minAcceptanceRate) queryParams.append('minAcceptanceRate', filters.minAcceptanceRate.toString());
      if (filters.maxAcceptanceRate) queryParams.append('maxAcceptanceRate', filters.maxAcceptanceRate.toString());
      if (filters.minGraduationRate) queryParams.append('minGraduationRate', filters.minGraduationRate.toString());
      if (filters.maxGraduationRate) queryParams.append('maxGraduationRate', filters.maxGraduationRate.toString());
      if (filters.minEnrollment) queryParams.append('minEnrollment', filters.minEnrollment.toString());
      if (filters.maxEnrollment) queryParams.append('maxEnrollment', filters.maxEnrollment.toString());
      if (filters.minStudentFacultyRatio) queryParams.append('minStudentFacultyRatio', filters.minStudentFacultyRatio.toString());
      if (filters.maxStudentFacultyRatio) queryParams.append('maxStudentFacultyRatio', filters.maxStudentFacultyRatio.toString());
      if (filters.minSatMath) queryParams.append('minSatMath', filters.minSatMath.toString());
      if (filters.maxSatMath) queryParams.append('maxSatMath', filters.maxSatMath.toString());
      if (filters.minSatReading) queryParams.append('minSatReading', filters.minSatReading.toString());
      if (filters.maxSatReading) queryParams.append('maxSatReading', filters.maxSatReading.toString());
      if (filters.minAct) queryParams.append('minAct', filters.minAct.toString());
      if (filters.maxAct) queryParams.append('maxAct', filters.maxAct.toString());

      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/colleges/search?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to fetch colleges');
        }
        return res;
      });

      const data = await response.json();
      
      // Cache the results
      this.cache.set(cacheKey, data);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      return data;
    } catch (error) {
      console.error('Error searching colleges:', error);
      throw error;
    }
  }

  async getCollegeById(id: number): Promise<College | null> {
    try {
      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/colleges/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch college');
        }
        return res;
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching college:', error);
      return null;
    }
  }

  async getFavoriteColleges(userId: number): Promise<FavoriteCollege[]> {
    try {
      const response = await this.retryOperation(async () => {
        const res = await fetch(`/api/favorites/colleges/${userId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch favorite colleges');
        }
        return res;
      });
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

  async autoFavoriteCollege(userId: number, collegeId: number): Promise<FavoriteCollege | null> {
    try {
      // Check if this college was recently auto-favorited
      const lastAutoFavorited = localStorage.getItem('lastAutoFavoritedCollege');
      if (lastAutoFavorited === collegeId.toString()) {
        console.log('College was recently auto-favorited, skipping');
        return null;
      }

      // Check if already favorited
      const isAlreadyFavorited = await this.isCollegeFavorited(userId, collegeId);
      if (isAlreadyFavorited) {
        console.log('College is already favorited, skipping');
        return null;
      }

      // Add to favorites
      const favorite = await this.addToFavorites(userId, collegeId);
      
      // Store the last auto-favorited college ID
      localStorage.setItem('lastAutoFavoritedCollege', collegeId.toString());
      
      return favorite;
    } catch (error) {
      console.error('Error auto-favoriting college:', error);
      return null;
    }
  }

  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }
}

export const collegeSearchService = CollegeSearchService.getInstance(); 