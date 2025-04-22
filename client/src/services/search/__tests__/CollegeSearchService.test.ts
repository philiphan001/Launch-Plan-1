import { CollegeSearchService } from '../CollegeSearchService';
import { College } from '@/types/college';

// Mock fetch
global.fetch = jest.fn();

describe('CollegeSearchService', () => {
  let service: CollegeSearchService;

  beforeEach(() => {
    service = CollegeSearchService.getInstance();
    (global.fetch as jest.Mock).mockClear();
    service.clearCache();
  });

  describe('search', () => {
    it('should search colleges with filters', async () => {
      const mockColleges: College[] = [
        {
          id: 1,
          name: 'Test University',
          city: 'Test City',
          state: 'TS',
          type: '4year',
          description: 'Test description',
          website: 'https://test.edu',
          tuition_in_state: 10000,
          tuition_out_state: 20000,
          room_and_board: 5000,
          total_cost_in_state: 15000,
          total_cost_out_state: 25000,
          acceptance_rate: 0.5,
          graduation_rate: 0.8,
          enrollment: 10000,
          student_faculty_ratio: 15,
          sat_math_25: 500,
          sat_math_75: 700,
          sat_reading_25: 500,
          sat_reading_75: 700,
          act_25: 20,
          act_75: 30,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockColleges)
      });

      const result = await service.search({
        query: 'Test',
        type: '4year',
        state: 'TS'
      });

      expect(result).toEqual(mockColleges);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/colleges/search?q=Test&type=4year&state=TS')
      );
    });

    it('should use cache for repeated searches', async () => {
      const mockColleges: College[] = [
        {
          id: 1,
          name: 'Test University',
          city: 'Test City',
          state: 'TS',
          type: '4year',
          description: 'Test description',
          website: 'https://test.edu',
          tuition_in_state: 10000,
          tuition_out_state: 20000,
          room_and_board: 5000,
          total_cost_in_state: 15000,
          total_cost_out_state: 25000,
          acceptance_rate: 0.5,
          graduation_rate: 0.8,
          enrollment: 10000,
          student_faculty_ratio: 15,
          sat_math_25: 500,
          sat_math_75: 700,
          sat_reading_25: 500,
          sat_reading_75: 700,
          act_25: 20,
          act_75: 30,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockColleges)
      });

      // First search
      await service.search({ query: 'Test' });
      // Second search with same parameters
      await service.search({ query: 'Test' });

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCollegeById', () => {
    it('should fetch college by id', async () => {
      const mockCollege: College = {
        id: 1,
        name: 'Test University',
        city: 'Test City',
        state: 'TS',
        type: '4year',
        description: 'Test description',
        website: 'https://test.edu',
        tuition_in_state: 10000,
        tuition_out_state: 20000,
        room_and_board: 5000,
        total_cost_in_state: 15000,
        total_cost_out_state: 25000,
        acceptance_rate: 0.5,
        graduation_rate: 0.8,
        enrollment: 10000,
        student_faculty_ratio: 15,
        sat_math_25: 500,
        sat_math_75: 700,
        sat_reading_25: 500,
        sat_reading_75: 700,
        act_25: 20,
        act_75: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCollege)
      });

      const result = await service.getCollegeById(1);

      expect(result).toEqual(mockCollege);
      expect(global.fetch).toHaveBeenCalledWith('/api/colleges/1');
    });

    it('should return null for non-existent college', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      const result = await service.getCollegeById(999);

      expect(result).toBeNull();
    });
  });

  describe('favorites', () => {
    it('should get favorite colleges', async () => {
      const mockFavorites = [
        {
          id: 1,
          userId: 1,
          collegeId: 1,
          college: {
            id: 1,
            name: 'Test University',
            city: 'Test City',
            state: 'TS',
            type: '4year',
            description: 'Test description',
            website: 'https://test.edu',
            tuition_in_state: 10000,
            tuition_out_state: 20000,
            room_and_board: 5000,
            total_cost_in_state: 15000,
            total_cost_out_state: 25000,
            acceptance_rate: 0.5,
            graduation_rate: 0.8,
            enrollment: 10000,
            student_faculty_ratio: 15,
            sat_math_25: 500,
            sat_math_75: 700,
            sat_reading_25: 500,
            sat_reading_75: 700,
            act_25: 20,
            act_75: 30,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          createdAt: new Date().toISOString()
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFavorites)
      });

      const result = await service.getFavoriteColleges(1);

      expect(result).toEqual(mockFavorites);
      expect(global.fetch).toHaveBeenCalledWith('/api/favorites/colleges/1');
    });

    it('should add college to favorites', async () => {
      const mockFavorite = {
        id: 1,
        userId: 1,
        collegeId: 1,
        college: {
          id: 1,
          name: 'Test University',
          city: 'Test City',
          state: 'TS',
          type: '4year',
          description: 'Test description',
          website: 'https://test.edu',
          tuition_in_state: 10000,
          tuition_out_state: 20000,
          room_and_board: 5000,
          total_cost_in_state: 15000,
          total_cost_out_state: 25000,
          acceptance_rate: 0.5,
          graduation_rate: 0.8,
          enrollment: 10000,
          student_faculty_ratio: 15,
          sat_math_25: 500,
          sat_math_75: 700,
          sat_reading_25: 500,
          sat_reading_75: 700,
          act_25: 20,
          act_75: 30,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFavorite)
      });

      const result = await service.addToFavorites(1, 1);

      expect(result).toEqual(mockFavorite);
      expect(global.fetch).toHaveBeenCalledWith('/api/favorites/colleges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 1, collegeId: 1 })
      });
    });

    it('should remove college from favorites', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await service.removeFromFavorites(1);

      expect(global.fetch).toHaveBeenCalledWith('/api/favorites/colleges/1', {
        method: 'DELETE'
      });
    });
  });

  describe('autoFavoriteCollege', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should auto-favorite a college', async () => {
      const mockFavorite = {
        id: 1,
        userId: 1,
        collegeId: 1,
        college: {
          id: 1,
          name: 'Test University',
          city: 'Test City',
          state: 'TS',
          type: '4year',
          description: 'Test description',
          website: 'https://test.edu',
          tuition_in_state: 10000,
          tuition_out_state: 20000,
          room_and_board: 5000,
          total_cost_in_state: 15000,
          total_cost_out_state: 25000,
          acceptance_rate: 0.5,
          graduation_rate: 0.8,
          enrollment: 10000,
          student_faculty_ratio: 15,
          sat_math_25: 500,
          sat_math_75: 700,
          sat_reading_25: 500,
          sat_reading_75: 700,
          act_25: 20,
          act_75: 30,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFavorite)
      });

      const result = await service.autoFavoriteCollege(1, 1);

      expect(result).toEqual(mockFavorite);
      expect(localStorage.getItem('lastAutoFavoritedCollege')).toBe('1');
    });

    it('should not auto-favorite if already favorited', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ collegeId: 1 }])
      });

      const result = await service.autoFavoriteCollege(1, 1);

      expect(result).toBeNull();
      expect(localStorage.getItem('lastAutoFavoritedCollege')).toBeNull();
    });

    it('should not auto-favorite if recently favorited', async () => {
      localStorage.setItem('lastAutoFavoritedCollege', '1');

      const result = await service.autoFavoriteCollege(1, 1);

      expect(result).toBeNull();
    });
  });
}); 