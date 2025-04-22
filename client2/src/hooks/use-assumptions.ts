import { useQuery } from "@tanstack/react-query";

// Hard-coding user ID for demo purposes
const DEMO_USER_ID = 1;

export interface Assumption {
  id: number;
  userId: number;
  category: string;
  key: string;
  label: string;
  description: string;
  value: number;
  defaultValue: number;
  minValue: number;
  maxValue: number;
  stepValue: number;
  unit: string;
  isEnabled: boolean;
}

/**
 * Hook to fetch and provide all assumptions for the application
 */
export function useAssumptions() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['/api/assumptions/user', DEMO_USER_ID],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/assumptions/user/${DEMO_USER_ID}`);
        if (!response.ok) {
          throw new Error(`Error fetching assumptions: ${response.statusText}`);
        }
        return response.json() as Promise<Assumption[]>;
      } catch (err) {
        console.error("Failed to fetch assumptions:", err);
        return [] as Assumption[];
      }
    }
  });

  /**
   * Get a specific assumption by its key
   * @param key The unique key for the assumption
   * @param defaultVal Fallback default value if assumption not found
   */
  const getAssumptionValue = (key: string, defaultVal: number = 0): number => {
    if (!data || data.length === 0) return defaultVal;
    
    const assumption = data.find(a => a.key === key);
    if (!assumption) return defaultVal;
    
    return assumption.isEnabled ? assumption.value : defaultVal;
  };

  return {
    assumptions: data || [],
    isLoading,
    isError,
    error,
    getAssumptionValue
  };
}