// favoritesService.ts - Centralized service for handling favorites functionality
import { getCurrentUser, getFreshToken } from "./firebase-auth";

// Interface for favorite college data
export interface FavoriteCollege {
  id: number;
  userId: number;
  collegeId: number;
  createdAt: string;
  name?: string;
  state?: string;
  type?: string;
  college?: {
    id: number;
    name: string;
    location: string;
    state: string;
    type: string;
    tuition: number;
    roomAndBoard: number;
    acceptanceRate?: number | null;
    rating?: number | null;
    size?: string | null;
    rank?: number | null;
    feesByIncome?: any;
    usNewsTop150?: number | null;
    bestLiberalArtsColleges?: number | null;
  };
}

// Interface for favorite career data
export interface FavoriteCareer {
  id: number;
  userId: number;
  careerId: number;
  createdAt: string;
  title?: string;
  median_salary?: number;
  career?: {
    id: number;
    title: string;
    description: string;
    salary: number;
    growth_rate: number;
    education: string;
    category: string;
  };
}

// Interface for favorite location data
export interface FavoriteLocation {
  id: number;
  userId: number;
  zipCode: string;
  city: string;
  state: string;
  createdAt?: string;
}

// Helper for making authenticated API requests with improved error handling
async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    console.log(
      "[DEBUG] Getting fresh Firebase token for authenticated request"
    );

    // Use our new getFreshToken function from firebase-auth
    const idToken = await getFreshToken();

    if (!idToken) {
      console.error("[DEBUG] No valid authentication token available");
      throw new Error("Authentication required");
    }

    console.log("[DEBUG] Successfully got Firebase token");

    // Create headers with authorization
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      ...options.headers,
    };

    // Log the API call
    console.log(`[DEBUG] Making authenticated API call to: ${url}`);

    // Make the authenticated request
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Always include credentials for cookies
    });

    // Log the response status
    console.log(`[DEBUG] API response status for ${url}:`, response.status);

    // If unauthorized, try one more refresh and retry
    if (response.status === 401) {
      console.log("[DEBUG] Received 401, forcing token refresh and retry");

      // Force a new token
      const freshToken = await getFreshToken();

      if (!freshToken) {
        throw new Error("Unable to refresh authentication token");
      }

      const refreshedHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${freshToken}`,
        ...options.headers,
      };

      console.log(`[DEBUG] Retrying API call to: ${url} with fresh token`);
      return fetch(url, {
        ...options,
        headers: refreshedHeaders,
        credentials: "include",
      });
    }

    return response;
  } catch (error) {
    // Enhanced error logging
    console.error(`[DEBUG] Error in authenticatedFetch for ${url}:`, error);
    throw error;
  }
}

// Favorites Service class to handle all favorites operations
export class FavoritesService {
  // Get a user's favorite colleges
  static async getFavoriteColleges(userId: number): Promise<FavoriteCollege[]> {
    try {
      // Check if userId is valid
      if (!userId || userId <= 0) {
        console.log("[DEBUG] Invalid or missing user ID for getFavoriteColleges:", userId);
        return [];  // Return empty array instead of making an invalid API call
      }
      
      console.log(`[DEBUG] Getting favorite colleges for user ID: ${userId}`);
      const response = await authenticatedFetch(
        `/api/favorites/colleges/${userId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[DEBUG] Failed to fetch favorite colleges. Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error("Failed to fetch favorite colleges");
      }

      const data = await response.json();
      console.log(
        `[DEBUG] Successfully fetched ${data.length} favorite colleges`
      );

      // Normalize data structure to ensure college property exists
      return data.map((item: any) => {
        // If the college data is nested in a 'college' property, keep it
        if (item.college) {
          return item;
        }

        // If the college data is directly on the favorite object without a 'college' property,
        // restructure it to match the expected format
        const { id, userId, collegeId, createdAt, ...collegeData } = item;
        return {
          id,
          userId,
          collegeId,
          createdAt,
          college: collegeData,
        };
      });
    } catch (error) {
      console.error("[DEBUG] Error fetching favorite colleges:", error);
      return [];
    }
  }

  // Alias for backwards compatibility
  static async getFavoriteCollegesByUserId(
    userId: number
  ): Promise<FavoriteCollege[]> {
    return this.getFavoriteColleges(userId);
  }

  // Add a college to favorites
  static async addCollegeToFavorites(
    userId: number,
    collegeId: number
  ): Promise<FavoriteCollege | { alreadyAdded?: boolean }> {
    try {
      // Check if userId is valid
      if (!userId || userId <= 0) {
        console.log("[DEBUG] Invalid or missing user ID for addCollegeToFavorites:", userId);
        throw new Error("Invalid user ID");
      }

      console.log(
        `[DEBUG] Adding college ${collegeId} to favorites for user ${userId}`
      );
      const response = await authenticatedFetch("/api/favorites/colleges", {
        method: "POST",
        body: JSON.stringify({ userId, collegeId }),
      });

      if (response.status === 409) {
        return { alreadyAdded: true };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[DEBUG] Failed to add college to favorites. Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error("Failed to add college to favorites");
      }

      const data = await response.json();
      console.log(`[DEBUG] Successfully added college to favorites`);
      return data;
    } catch (error) {
      console.error("[DEBUG] Error adding college to favorites:", error);
      throw error;
    }
  }

  // Remove a college from favorites
  static async removeCollegeFromFavorites(favoriteId: number): Promise<void> {
    try {
      console.log(`[DEBUG] Removing college favorite with ID: ${favoriteId}`);
      const response = await authenticatedFetch(
        `/api/favorites/colleges/${favoriteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[DEBUG] Failed to remove college from favorites. Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error("Failed to remove college from favorites");
      }

      console.log(`[DEBUG] Successfully removed college from favorites`);
    } catch (error) {
      console.error("[DEBUG] Error removing college from favorites:", error);
      throw error;
    }
  }

  // Get a user's favorite careers
  static async getFavoriteCareers(userId: number): Promise<FavoriteCareer[]> {
    try {
      // Check if userId is valid
      if (!userId || userId <= 0) {
        console.log("[DEBUG] Invalid or missing user ID for getFavoriteCareers:", userId);
        return [];  // Return empty array instead of making an invalid API call
      }
      
      console.log(`[DEBUG] Getting favorite careers for user ID: ${userId}`);
      const response = await authenticatedFetch(
        `/api/favorites/careers/${userId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[DEBUG] Failed to fetch favorite careers. Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error("Failed to fetch favorite careers");
      }

      const data = await response.json();
      console.log(
        `[DEBUG] Successfully fetched ${data.length} favorite careers`
      );

      // Normalize data structure like we did with colleges
      return data.map((item: any) => {
        if (item.career) {
          return item;
        }

        const { id, userId, careerId, createdAt, ...careerData } = item;
        return {
          id,
          userId,
          careerId,
          createdAt,
          career: careerData,
        };
      });
    } catch (error) {
      console.error("[DEBUG] Error fetching favorite careers:", error);
      return [];
    }
  }

  // Alias for backwards compatibility
  static async getFavoriteCareersByUserId(
    userId: number
  ): Promise<FavoriteCareer[]> {
    return this.getFavoriteCareers(userId);
  }

  // Add a career to favorites
  static async addCareerToFavorites(
    userId: number,
    careerId: number
  ): Promise<FavoriteCareer | { alreadyAdded?: boolean }> {
    try {
      // Check if userId is valid
      if (!userId || userId <= 0) {
        console.log("[DEBUG] Invalid or missing user ID for addCareerToFavorites:", userId);
        throw new Error("Invalid user ID");
      }

      console.log(
        `[DEBUG] Adding career ${careerId} to favorites for user ${userId}`
      );
      const response = await authenticatedFetch("/api/favorites/careers", {
        method: "POST",
        body: JSON.stringify({ userId, careerId }),
      });

      if (response.status === 409) {
        return { alreadyAdded: true };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[DEBUG] Failed to add career to favorites. Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error("Failed to add career to favorites");
      }

      const data = await response.json();
      console.log(`[DEBUG] Successfully added career to favorites`);
      return data;
    } catch (error) {
      console.error("[DEBUG] Error adding career to favorites:", error);
      throw error;
    }
  }

  // Remove a career from favorites
  static async removeCareerFromFavorites(favoriteId: number): Promise<void> {
    try {
      console.log(`[DEBUG] Removing career favorite with ID: ${favoriteId}`);
      const response = await authenticatedFetch(
        `/api/favorites/careers/${favoriteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[DEBUG] Failed to remove career from favorites. Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error("Failed to remove career from favorites");
      }

      console.log(`[DEBUG] Successfully removed career from favorites`);
    } catch (error) {
      console.error("[DEBUG] Error removing career from favorites:", error);
      throw error;
    }
  }

  // Get a user's favorite locations
  static async getFavoriteLocations(
    userId: number
  ): Promise<FavoriteLocation[]> {
    try {
      // Check if userId is valid
      if (!userId || userId <= 0) {
        console.log("[DEBUG] Invalid or missing user ID for getFavoriteLocations:", userId);
        return [];  // Return empty array instead of making an invalid API call
      }
      
      console.log(`[DEBUG] Getting favorite locations for user ID: ${userId}`);
      const response = await authenticatedFetch(
        `/api/favorites/locations/${userId}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[DEBUG] Failed to fetch favorite locations. Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error("Failed to fetch favorite locations");
      }

      const data = await response.json();
      console.log(
        `[DEBUG] Successfully fetched ${data.length} favorite locations`
      );
      return data;
    } catch (error) {
      console.error("[DEBUG] Error fetching favorite locations:", error);
      return [];
    }
  }

  // Alias for backwards compatibility
  static async getFavoriteLocationsByUserId(
    userId: number
  ): Promise<FavoriteLocation[]> {
    return this.getFavoriteLocations(userId);
  }

  // Add a location to favorites
  static async addLocationToFavorites(
    userId: number,
    location: { zipCode: string; city: string; state: string }
  ): Promise<FavoriteLocation | { alreadyAdded?: boolean }> {
    try {
      // Check if userId is valid
      if (!userId || userId <= 0) {
        console.log("[DEBUG] Invalid or missing user ID for addLocationToFavorites:", userId);
        throw new Error("Invalid user ID");
      }

      console.log(
        `[DEBUG] Adding location ${location.city}, ${location.state} to favorites for user ${userId}`
      );
      const response = await authenticatedFetch("/api/favorites/locations", {
        method: "POST",
        body: JSON.stringify({ userId, ...location }),
      });

      if (response.status === 409) {
        return { alreadyAdded: true };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[DEBUG] Failed to add location to favorites. Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error("Failed to add location to favorites");
      }

      const data = await response.json();
      console.log(`[DEBUG] Successfully added location to favorites`);
      return data;
    } catch (error) {
      console.error("[DEBUG] Error adding location to favorites:", error);
      throw error;
    }
  }

  // Remove a location from favorites
  static async removeLocationFromFavorites(favoriteId: number): Promise<void> {
    try {
      console.log(`[DEBUG] Removing location favorite with ID: ${favoriteId}`);
      const response = await authenticatedFetch(
        `/api/favorites/locations/${favoriteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[DEBUG] Failed to remove location from favorites. Status: ${response.status}, Response: ${errorText}`
        );
        throw new Error("Failed to remove location from favorites");
      }

      console.log(`[DEBUG] Successfully removed location from favorites`);
    } catch (error) {
      console.error("[DEBUG] Error removing location from favorites:", error);
      throw error;
    }
  }

  // Check if a college is already in favorites
  static async isCollegeFavorited(
    userId: number,
    collegeId: number
  ): Promise<boolean> {
    try {
      // Check if userId is valid
      if (!userId || userId <= 0) {
        console.log("[DEBUG] Invalid or missing user ID for isCollegeFavorited:", userId);
        return false;
      }

      const favorites = await this.getFavoriteColleges(userId);
      return favorites.some((fav) => fav.collegeId === collegeId);
    } catch (error) {
      console.error("[DEBUG] Error checking if college is favorited:", error);
      return false;
    }
  }

  // Check if a career is already in favorites
  static async isCareerFavorited(
    userId: number,
    careerId: number
  ): Promise<boolean> {
    try {
      // Check if userId is valid
      if (!userId || userId <= 0) {
        console.log("[DEBUG] Invalid or missing user ID for isCareerFavorited:", userId);
        return false;
      }

      const favorites = await this.getFavoriteCareers(userId);
      return favorites.some((fav) => fav.careerId === careerId);
    } catch (error) {
      console.error("[DEBUG] Error checking if career is favorited:", error);
      return false;
    }
  }
}
