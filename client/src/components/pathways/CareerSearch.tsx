import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Career {
  id: number;
  title: string;
  description: string;
  salary: number;
  growth_rate: number;
  education: string;
  category: string;
  salary_pct_10: number;
  salary_pct_25: number;
  salary_median: number;
  salary_pct_75: number;
  salary_pct_90: number;
}

interface CareerSearchProps {
  onCareerSelect: (careerId: number) => void;
  showEducationWarning?: boolean;
  selectedPath?: 'education' | 'job' | 'military' | 'gap';
  educationType?: '4year' | '2year' | 'vocational' | null;
  transferOption?: 'yes' | 'no' | null;
}

const CareerSearch = ({ 
  onCareerSelect, 
  showEducationWarning = true,
  selectedPath,
  educationType,
  transferOption 
}: CareerSearchProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [allCareers, setAllCareers] = useState<Career[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedCareerEducation, setSelectedCareerEducation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all careers on component mount
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const response = await fetch('/api/careers');
        const data = await response.json();
        setAllCareers(data);
      } catch (error) {
        console.error('Error fetching careers:', error);
        toast({
          title: "Error",
          description: "Failed to load careers. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchCareers();
  }, []);

  const searchCareers = (searchTerm: string, showWarnings = false) => {
    if (!allCareers || !Array.isArray(allCareers)) return;
    
    const searchTermLower = searchTerm.toLowerCase();
    const filtered = allCareers.filter(career => {
      const titleMatch = career.title.toLowerCase().includes(searchTermLower);
      const descriptionMatch = career.description.toLowerCase().includes(searchTermLower);
      const categoryMatch = career.category.toLowerCase().includes(searchTermLower);
      return titleMatch || descriptionMatch || categoryMatch;
    });
    
    setFilteredCareers(filtered);
  };

  const checkCareerEducationRequirement = (careerId: number) => {
    if (!allCareers || !Array.isArray(allCareers)) return;
    
    const career = allCareers.find(c => c.id === careerId);
    if (!career) return;
    
    const educationReq = career.education;
    
    if (educationReq && (
        educationReq.toLowerCase().includes("bachelor") || 
        educationReq.toLowerCase().includes("degree") ||
        educationReq.toLowerCase().includes("master") ||
        educationReq.toLowerCase().includes("phd") ||
        educationReq.toLowerCase().includes("doctorate")
    )) {
      setSelectedCareerEducation(educationReq);
      
      if (showEducationWarning && selectedPath === 'job' || 
          (selectedPath === 'education' && 
           ((educationType === '2year' && transferOption !== 'yes') || 
            educationType === 'vocational'))) {
        setShowWarning(true);
      }
    }
  };

  const handleCareerSelect = (careerId: number) => {
    checkCareerEducationRequirement(careerId);
    onCareerSelect(careerId);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for careers..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            searchCareers(e.target.value);
          }}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        {filteredCareers.map((career) => (
          <Card 
            key={career.id}
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => handleCareerSelect(career.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{career.title}</h3>
                  <p className="text-sm text-gray-600">{career.description}</p>
                  <div className="mt-2 space-x-2">
                    <Badge variant="secondary">
                      {formatSalary(career.salary_median)}/year
                    </Badge>
                    <Badge variant="outline">
                      {career.growth_rate}% growth
                    </Badge>
                    {career.education && (
                      <Badge variant="outline">
                        {career.education}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Education Requirement Warning</AlertDialogTitle>
            <AlertDialogDescription>
              This career typically requires {selectedCareerEducation}. 
              {selectedPath === 'job' ? 
                " You may need to consider additional education to pursue this career." :
                selectedPath === 'education' && educationType === '2year' && transferOption !== 'yes' ?
                " A 2-year degree without transfer may not be sufficient for this career." :
                selectedPath === 'education' && educationType === 'vocational' ?
                " A vocational program may not provide the education needed for this career." :
                ""
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowWarning(false)}>
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Helper function to format salary
const formatSalary = (salary: number): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(salary);
};

export default CareerSearch; 