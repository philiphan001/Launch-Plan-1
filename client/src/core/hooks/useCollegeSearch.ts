import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collegeSearchService, EducationType, SearchMode, FavoriteCollege } from '../services/CollegeSearchService';
import type { College } from '@/types/college';
import { useToast } from '@/hooks/use-toast';

interface UseCollegeSearchProps {
  query: string;
  educationType: EducationType;
  searchMode: SearchMode;
  userId?: number;
  enabled?: boolean;
}

export function useCollegeSearch({
  query,
  educationType,
  searchMode,
  userId,
  enabled = true
}: UseCollegeSearchProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);

  // Search colleges
  const {
    data: colleges = [],
    isLoading: isLoadingSearch,
    isError: isSearchError,
    error: searchError
  } = useQuery<College[]>({
    queryKey: ['collegeSearch', { query, educationType, searchMode }],
    queryFn: () => collegeSearchService.searchColleges({ query, educationType, searchMode }),
    enabled: enabled && query.length >= 2
  });

  // Get favorites
  const {
    data: favorites = [],
    isLoading: isLoadingFavorites
  } = useQuery<FavoriteCollege[]>({
    queryKey: ['collegeFavorites', userId],
    queryFn: () => collegeSearchService.getFavoriteColleges(userId!),
    enabled: !!userId
  });

  // Add to favorites mutation
  const addToFavorites = useMutation({
    mutationFn: (collegeId: number) => collegeSearchService.addToFavorites(userId!, collegeId),
    onSuccess: (data, collegeId) => {
      queryClient.invalidateQueries({ queryKey: ['collegeFavorites', userId] });
      const college = colleges.find(c => c.id === collegeId);
      toast({
        title: "Added to favorites",
        description: `${college?.name || 'College'} has been added to your favorites.`,
      });
    },
    onError: (error) => {
      console.error('Error adding college to favorites:', error);
      toast({
        title: "Error adding to favorites",
        description: "There was a problem adding this college to your favorites.",
        variant: "destructive",
      });
    }
  });

  // Remove from favorites mutation
  const removeFromFavorites = useMutation({
    mutationFn: (favoriteId: number) => collegeSearchService.removeFromFavorites(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collegeFavorites', userId] });
      toast({
        title: "Removed from favorites",
        description: "College has been removed from your favorites.",
      });
    },
    onError: (error) => {
      console.error('Error removing college from favorites:', error);
      toast({
        title: "Error removing from favorites",
        description: "There was a problem removing this college from your favorites.",
        variant: "destructive",
      });
    }
  });

  const handleSelectCollege = async (collegeId: number) => {
    const college = await collegeSearchService.getCollegeById(collegeId);
    setSelectedCollege(college);
    return college;
  };

  const isCollegeFavorite = (collegeId: number) => {
    return favorites.some(fav => fav.collegeId === collegeId);
  };

  const getFavoriteId = (collegeId: number) => {
    const favorite = favorites.find(fav => fav.collegeId === collegeId);
    return favorite?.id;
  };

  return {
    // Search
    colleges,
    selectedCollege,
    selectCollege: handleSelectCollege,
    isLoadingSearch,
    isSearchError,
    searchError,

    // Favorites
    favorites,
    isLoadingFavorites,
    isCollegeFavorite,
    addToFavorites: addToFavorites.mutate,
    removeFromFavorites: removeFromFavorites.mutate,
    getFavoriteId
  };
} 