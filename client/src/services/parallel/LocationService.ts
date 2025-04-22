import { Location } from '@/types/location';

export class LocationService {
  async searchLocations(query: string): Promise<Location[]> {
    try {
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      return response.json();
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  }
}

export const locationService = new LocationService(); 