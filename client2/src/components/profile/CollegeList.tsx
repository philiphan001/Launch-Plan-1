import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { College } from "@/lib/types";

type FavoriteCollege = {
  id: number;
  userId: number;
  collegeId: number;
  college: College;
};

interface CollegeListProps {
  userId: number;
}

const CollegeList = ({ userId }: CollegeListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch favorite colleges
  const { data: favoriteColleges = [], isLoading } = useQuery<FavoriteCollege[]>({
    queryKey: ['/api/favorites/colleges', userId],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/colleges/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch favorite colleges');
      return response.json();
    }
  });

  // Remove favorite college mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      const response = await fetch(`/api/favorites/colleges/${favoriteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove favorite college');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/colleges', userId] });
      toast({
        title: "College removed",
        description: "College has been removed from your favorites.",
      });
    },
    onError: (error) => {
      console.error("Error removing favorite college:", error);
      toast({
        title: "Error removing college",
        description: "There was a problem removing this college from your favorites.",
        variant: "destructive",
      });
    }
  });

  // Categorize colleges based on degreePredominant and type
  const categorizedColleges = {
    vocational: [] as FavoriteCollege[],
    community: [] as FavoriteCollege[],
    fourYear: [] as FavoriteCollege[],
    graduate: [] as FavoriteCollege[],
  };

  favoriteColleges.forEach(favorite => {
    const college = favorite.college;
    
    // Primary categorization based on degreePredominant
    // 1 = Certificate/vocational
    // 2 = Associate's degree (community college)
    // 3 = Bachelor's degree (4-year)
    // 4 = Graduate degree
    
    if (college.degreesAwardedPredominant === 1) {
      categorizedColleges.vocational.push(favorite);
    }
    else if (college.degreesAwardedPredominant === 2) {
      categorizedColleges.community.push(favorite);
    }
    else if (college.degreesAwardedPredominant === 4) {
      categorizedColleges.graduate.push(favorite);
    }
    else if (college.degreesAwardedPredominant === 3) {
      categorizedColleges.fourYear.push(favorite);
    }
    // Fallback to type field only if degreePredominant is missing or invalid
    else if (college.type) {
      if (/vocational|technical|trade/i.test(college.type)) {
        categorizedColleges.vocational.push(favorite);
      }
      else if (/community|junior/i.test(college.type)) {
        categorizedColleges.community.push(favorite);
      }
      else if (/graduate|professional/i.test(college.type)) {
        categorizedColleges.graduate.push(favorite);
      }
      else {
        // Default to 4-year if type doesn't match other categories
        categorizedColleges.fourYear.push(favorite);
      }
    }
    else {
      // Default to 4-year if no categorization information is available
      categorizedColleges.fourYear.push(favorite);
    }
  });

  const renderCollegeSection = (title: string, colleges: FavoriteCollege[]) => (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
      {colleges.length > 0 ? (
        <div className="space-y-2">
          {colleges.map((favorite) => (
            <div 
              key={favorite.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="font-medium">{favorite.college.name}</div>
                {favorite.college.location && (
                  <div className="text-sm text-gray-600">{favorite.college.location}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-600"
                onClick={() => removeFavoriteMutation.mutate(favorite.id)}
              >
                <span className="material-icons text-lg">close</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">No colleges in this category</div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="text-gray-500">Loading favorite colleges...</div>;
  }

  if (favoriteColleges.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <span className="text-gray-400 text-3xl">📚</span>
            <p className="text-gray-500 mt-2">No favorite colleges added yet</p>
            <Button className="mt-4" onClick={() => window.location.href = "/colleges"}>
              Explore Colleges
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-6">Favorite Colleges</h3>
        
        {renderCollegeSection("Vocational & Technical Schools", categorizedColleges.vocational)}
        {renderCollegeSection("Community Colleges", categorizedColleges.community)}
        {renderCollegeSection("4-Year Colleges & Universities", categorizedColleges.fourYear)}
        {renderCollegeSection("Graduate & Professional Schools", categorizedColleges.graduate)}
      </CardContent>
    </Card>
  );
};

export default CollegeList; 