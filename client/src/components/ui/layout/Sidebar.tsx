import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface FinancialProjection {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: "dashboard" },
  { path: "/projections", label: "Financial Projections", icon: "trending_up" },
  { path: "/careers", label: "Career Exploration", icon: "work" },
  { path: "/colleges", label: "College Discovery", icon: "school" },
  { path: "/pathways", label: "Pathways", icon: "alt_route" },
  { path: "/profile", label: "Profile", icon: "account_circle" },
];

const Sidebar = () => {
  const [location, setLocation] = useLocation();
  const [savedProjections, setSavedProjections] = useState<FinancialProjection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandProjections, setExpandProjections] = useState(false);
  const { toast } = useToast();
  
  // For demonstration, we'll use userId 1
  const userId = 1;
  
  // Automatically expand the projections if we're on the projections page
  useEffect(() => {
    if (location.startsWith("/projections")) {
      setExpandProjections(true);
    }
  }, [location]);
  
  useEffect(() => {
    // Only fetch projections if we're on the projections page or projections are expanded
    if (location.startsWith("/projections") || expandProjections) {
      fetchSavedProjections();
    }
  }, [location, expandProjections]);
  
  const fetchSavedProjections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/financial-projections/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSavedProjections(data);
      } else {
        console.error("Failed to fetch projections");
      }
    } catch (error) {
      console.error("Error fetching projections:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteProjection = async (e: React.MouseEvent, projectionId: number, projectionName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete the projection "${projectionName}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/financial-projections/${projectionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // If we're viewing this projection, redirect to the main projections page
        const urlParams = new URLSearchParams(window.location.search);
        const currentId = urlParams.get('id');
        
        if (currentId && parseInt(currentId) === projectionId) {
          setLocation('/projections');
        }
        
        // Refresh the list
        fetchSavedProjections();
        
        toast({
          title: "Projection deleted",
          description: `Successfully deleted "${projectionName}"`,
        });
      } else {
        throw new Error("Failed to delete projection");
      }
    } catch (error) {
      console.error("Error deleting projection:", error);
      toast({
        title: "Error",
        description: "Failed to delete projection. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check if we're on a projections page by analyzing the URL
  const isProjectionsPage = location.startsWith("/projections");

  return (
    <aside className="w-16 md:w-64 bg-white shadow-lg flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto z-5">
      <nav className="py-4">
        <ul>
          {navItems.map((item) => (
            <li className="mb-1" key={item.path}>
              <Link 
                href={item.path}
                className={`flex items-center px-4 py-3 ${
                  (location === item.path || (item.path === "/projections" && isProjectionsPage))
                    ? "text-primary bg-blue-50 border-l-4 border-primary"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                }`}
              >
                <span className="material-icons md:mr-3">{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
              
              {/* Dropdown for Financial Projections */}
              {item.path === "/projections" && (
                <div className="ml-6 mt-1">
                  <button 
                    onClick={() => setExpandProjections(!expandProjections)}
                    className="flex items-center text-sm text-gray-600 hover:text-primary pl-4 py-2"
                  >
                    <span className="material-icons text-sm mr-2">
                      {expandProjections ? "expand_less" : "expand_more"}
                    </span>
                    <span className="hidden md:inline">Saved Projections</span>
                  </button>
                  
                  {expandProjections && (
                    <ul className="pl-6 mt-1">
                      {isLoading ? (
                        <li className="text-sm text-gray-500 pl-4 py-1">Loading...</li>
                      ) : savedProjections.length === 0 ? (
                        <li className="text-sm text-gray-500 pl-4 py-1">No saved projections</li>
                      ) : (
                        savedProjections.map(projection => {
                          // Extract URL params to determine the active projection
                          const urlParams = new URLSearchParams(window.location.search);
                          const activeId = urlParams.get('id');
                          const parsedActiveId = activeId ? parseInt(activeId) : null;
                          const isActive = parsedActiveId === projection.id;
                          
                          // Debug logging for the active projection state
                          console.log(`Projection ${projection.id} (${projection.name}) - Active ID: ${parsedActiveId} - Is Active: ${isActive}`);
                          
                          return (
                            <li key={projection.id} className="mb-1 flex items-center group">
                              <a
                                href={`/projections?id=${projection.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log("Sidebar: Loading projection with ID:", projection.id);
                                  
                                  // Use React navigation with wouter instead of direct browser navigation
                                  const timestamp = new Date().getTime();
                                  setLocation(`/projections?id=${projection.id}&t=${timestamp}`);
                                  
                                  // Refresh saved projections data to ensure we have the latest
                                  setTimeout(() => {
                                    console.log("Refreshing saved projections data after navigation");
                                    fetchSavedProjections();
                                  }, 100);
                                }}
                                className={`text-sm flex-grow truncate pl-4 py-1 block ${
                                  isActive 
                                    ? "text-primary font-medium" 
                                    : "text-gray-600 hover:text-primary"
                                }`}
                              >
                                {projection.name}
                              </a>
                              <button
                                onClick={(e) => handleDeleteProjection(e, projection.id, projection.name)}
                                className="hidden group-hover:inline-flex text-gray-400 hover:text-red-500 rounded-full p-1"
                                title="Delete projection"
                              >
                                <span className="material-icons text-sm">delete</span>
                              </button>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
