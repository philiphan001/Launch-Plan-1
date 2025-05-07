import { authenticatedFetch } from './favoritesService';

export interface CareerPath {
  id: number;
  field_of_study: string;
  career_title: string;
  option_rank: number;
}

export class CareerPathsService {
  static async getAllCareerPaths(): Promise<CareerPath[]> {
    try {
      console.log('[DEBUG] Fetching all career paths');
      const response = await authenticatedFetch('/api/career-paths');

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[DEBUG] Failed to fetch career paths. Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error('Failed to fetch career paths');
      }

      const data = await response.json();
      console.log(
        `[DEBUG] Successfully fetched ${data.length} career paths`
      );
      return data;
    } catch (error) {
      console.error('[DEBUG] Error fetching career paths:', error);
      return [];
    }
  }

  static async getCareerPathsByFieldOfStudy(fieldOfStudy: string): Promise<CareerPath[]> {
    try {
      console.log(`[DEBUG] Fetching career paths for field of study: ${fieldOfStudy}`);
      const response = await authenticatedFetch(`/api/career-paths?fieldOfStudy=${encodeURIComponent(fieldOfStudy)}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[DEBUG] Failed to fetch career paths by field. Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error('Failed to fetch career paths by field of study');
      }

      const data = await response.json();
      console.log(
        `[DEBUG] Successfully fetched ${data.length} career paths for field: ${fieldOfStudy}`
      );
      return data;
    } catch (error) {
      console.error('[DEBUG] Error fetching career paths by field:', error);
      return [];
    }
  }
} 