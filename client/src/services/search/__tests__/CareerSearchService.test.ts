import { CareerSearchService } from '../CareerSearchService';
import { Career } from '@/types/career';

// Mock fetch
global.fetch = jest.fn();

describe('CareerSearchService', () => {
  let service: CareerSearchService;

  beforeEach(() => {
    service = CareerSearchService.getInstance();
    (global.fetch as jest.Mock).mockClear();
    service.clearCache();
  });

  describe('search', () => {
    it('should search careers with filters', async () => {
      const mockCareers: Career[] = [
        {
          id: 1,
          title: 'Software Developer',
          description: 'Develops software applications',
          category: 'Technology',
          education: 'Bachelor\'s',
          salary: 100000,
          salary_median: 100000,
          salary_pct_10: 80000,
          salary_pct_25: 90000,
          salary_pct_75: 110000,
          salary_pct_90: 120000,
          growth_rate: 15,
          alias1: 'Programmer',
          alias2: 'Coder',
          alias3: 'Developer',
          alias4: 'Software Engineer',
          alias5: 'Application Developer'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCareers)
      });

      const result = await service.search({
        query: 'Software',
        education: 'Bachelor\'s',
        category: 'Technology'
      });

      expect(result).toEqual(mockCareers);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/careers/search?q=Software&education=Bachelor%27s&category=Technology')
      );
    });

    it('should use cache for repeated searches', async () => {
      const mockCareers: Career[] = [
        {
          id: 1,
          title: 'Software Developer',
          description: 'Develops software applications',
          category: 'Technology',
          education: 'Bachelor\'s',
          salary: 100000,
          salary_median: 100000,
          salary_pct_10: 80000,
          salary_pct_25: 90000,
          salary_pct_75: 110000,
          salary_pct_90: 120000,
          growth_rate: 15,
          alias1: 'Programmer',
          alias2: 'Coder',
          alias3: 'Developer',
          alias4: 'Software Engineer',
          alias5: 'Application Developer'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCareers)
      });

      // First search
      await service.search({ query: 'Software' });
      // Second search with same parameters
      await service.search({ query: 'Software' });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCareerById', () => {
    it('should fetch career by id', async () => {
      const mockCareer: Career = {
        id: 1,
        title: 'Software Developer',
        description: 'Develops software applications',
        category: 'Technology',
        education: 'Bachelor\'s',
        salary: 100000,
        salary_median: 100000,
        salary_pct_10: 80000,
        salary_pct_25: 90000,
        salary_pct_75: 110000,
        salary_pct_90: 120000,
        growth_rate: 15,
        alias1: 'Programmer',
        alias2: 'Coder',
        alias3: 'Developer',
        alias4: 'Software Engineer',
        alias5: 'Application Developer'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCareer)
      });

      const result = await service.getCareerById(1);

      expect(result).toEqual(mockCareer);
      expect(global.fetch).toHaveBeenCalledWith('/api/careers/1');
    });

    it('should return null for non-existent career', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      const result = await service.getCareerById(999);

      expect(result).toBeNull();
    });
  });

  describe('favorites', () => {
    it('should get favorite careers', async () => {
      const mockFavorites = [
        {
          id: 1,
          userId: 1,
          careerId: 1,
          career: {
            id: 1,
            title: 'Software Developer',
            description: 'Develops software applications',
            category: 'Technology',
            education: 'Bachelor\'s',
            salary: 100000,
            salary_median: 100000,
            salary_pct_10: 80000,
            salary_pct_25: 90000,
            salary_pct_75: 110000,
            salary_pct_90: 120000,
            growth_rate: 15,
            alias1: 'Programmer',
            alias2: 'Coder',
            alias3: 'Developer',
            alias4: 'Software Engineer',
            alias5: 'Application Developer'
          },
          createdAt: new Date().toISOString()
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFavorites)
      });

      const result = await service.getFavoriteCareers(1);

      expect(result).toEqual(mockFavorites);
      expect(global.fetch).toHaveBeenCalledWith('/api/favorites/careers/1');
    });

    it('should add career to favorites', async () => {
      const mockFavorite = {
        id: 1,
        userId: 1,
        careerId: 1,
        career: {
          id: 1,
          title: 'Software Developer',
          description: 'Develops software applications',
          category: 'Technology',
          education: 'Bachelor\'s',
          salary: 100000,
          salary_median: 100000,
          salary_pct_10: 80000,
          salary_pct_25: 90000,
          salary_pct_75: 110000,
          salary_pct_90: 120000,
          growth_rate: 15,
          alias1: 'Programmer',
          alias2: 'Coder',
          alias3: 'Developer',
          alias4: 'Software Engineer',
          alias5: 'Application Developer'
        },
        createdAt: new Date().toISOString()
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFavorite)
      });

      const result = await service.addToFavorites(1, 1);

      expect(result).toEqual(mockFavorite);
      expect(global.fetch).toHaveBeenCalledWith('/api/favorites/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 1, careerId: 1 })
      });
    });

    it('should remove career from favorites', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await service.removeFromFavorites(1);

      expect(global.fetch).toHaveBeenCalledWith('/api/favorites/careers/1', {
        method: 'DELETE'
      });
    });
  });

  describe('autoFavoriteCareer', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should auto-favorite a career', async () => {
      const mockFavorite = {
        id: 1,
        userId: 1,
        careerId: 1,
        career: {
          id: 1,
          title: 'Software Developer',
          description: 'Develops software applications',
          category: 'Technology',
          education: 'Bachelor\'s',
          salary: 100000,
          salary_median: 100000,
          salary_pct_10: 80000,
          salary_pct_25: 90000,
          salary_pct_75: 110000,
          salary_pct_90: 120000,
          growth_rate: 15,
          alias1: 'Programmer',
          alias2: 'Coder',
          alias3: 'Developer',
          alias4: 'Software Engineer',
          alias5: 'Application Developer'
        },
        createdAt: new Date().toISOString()
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFavorite)
      });

      const result = await service.autoFavoriteCareer(1, 1);

      expect(result).toEqual(mockFavorite);
      expect(localStorage.getItem('lastAutoFavoritedCareer')).toBe('1');
    });

    it('should not auto-favorite if already favorited', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ careerId: 1 }])
      });

      const result = await service.autoFavoriteCareer(1, 1);

      expect(result).toBeNull();
      expect(localStorage.getItem('lastAutoFavoritedCareer')).toBeNull();
    });

    it('should not auto-favorite if recently favorited', async () => {
      localStorage.setItem('lastAutoFavoritedCareer', '1');

      const result = await service.autoFavoriteCareer(1, 1);

      expect(result).toBeNull();
    });
  });

  describe('field of study suggestions', () => {
    it('should get suggested careers by field', async () => {
      const mockCareers: Career[] = [
        {
          id: 1,
          title: 'Software Developer',
          description: 'Develops software applications',
          category: 'Technology',
          education: 'Bachelor\'s',
          salary: 100000,
          salary_median: 100000,
          salary_pct_10: 80000,
          salary_pct_25: 90000,
          salary_pct_75: 110000,
          salary_pct_90: 120000,
          growth_rate: 15,
          alias1: 'Programmer',
          alias2: 'Coder',
          alias3: 'Developer',
          alias4: 'Software Engineer',
          alias5: 'Application Developer'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCareers)
      });

      const result = await service.getSuggestedCareersByField('Computer Science');

      expect(result).toEqual(mockCareers);
      expect(global.fetch).toHaveBeenCalledWith('/api/careers/suggestions/Computer%20Science');
    });

    it('should get top careers by field', async () => {
      const mockCareers: Career[] = [
        {
          id: 1,
          title: 'Software Developer',
          description: 'Develops software applications',
          category: 'Technology',
          education: 'Bachelor\'s',
          salary: 100000,
          salary_median: 100000,
          salary_pct_10: 80000,
          salary_pct_25: 90000,
          salary_pct_75: 110000,
          salary_pct_90: 120000,
          growth_rate: 15,
          alias1: 'Programmer',
          alias2: 'Coder',
          alias3: 'Developer',
          alias4: 'Software Engineer',
          alias5: 'Application Developer'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCareers)
      });

      const result = await service.getTopCareersByField('Computer Science', 5);

      expect(result).toEqual(mockCareers);
      expect(global.fetch).toHaveBeenCalledWith('/api/careers/top/Computer%20Science?limit=5');
    });

    it('should get combined career suggestions', async () => {
      const mockTopCareers: Career[] = [
        {
          id: 1,
          title: 'Software Developer',
          description: 'Develops software applications',
          category: 'Technology',
          education: 'Bachelor\'s',
          salary: 100000,
          salary_median: 100000,
          salary_pct_10: 80000,
          salary_pct_25: 90000,
          salary_pct_75: 110000,
          salary_pct_90: 120000,
          growth_rate: 15,
          alias1: 'Programmer',
          alias2: 'Coder',
          alias3: 'Developer',
          alias4: 'Software Engineer',
          alias5: 'Application Developer'
        }
      ];

      const mockSuggestedCareers: Career[] = [
        {
          id: 2,
          title: 'Data Scientist',
          description: 'Analyzes complex data sets',
          category: 'Technology',
          education: 'Master\'s',
          salary: 120000,
          salary_median: 120000,
          salary_pct_10: 100000,
          salary_pct_25: 110000,
          salary_pct_75: 130000,
          salary_pct_90: 140000,
          growth_rate: 20,
          alias1: 'Data Analyst',
          alias2: 'Machine Learning Engineer',
          alias3: 'AI Specialist',
          alias4: 'Data Engineer',
          alias5: 'Business Intelligence Analyst'
        }
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTopCareers)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSuggestedCareers)
        });

      const result = await service.getCareerSuggestions('Computer Science', {
        includeTopCareers: true,
        includeSuggestedCareers: true,
        limit: 5
      });

      expect(result).toHaveLength(2);
      expect(result).toEqual([...mockTopCareers, ...mockSuggestedCareers]);
    });
  });
}); 