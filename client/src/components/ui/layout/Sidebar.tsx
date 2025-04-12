import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

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
  const [location] = useLocation();
  const [savedProjections, setSavedProjections] = useState<FinancialProjection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandProjections, setExpandProjections] = useState(false);
  
  // For demonstration, we'll use userId 1
  const userId = 1;
  
  useEffect(() => {
    // Only fetch projections if we're on the projections page or projections are expanded
    if (location === "/projections" || expandProjections) {
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

  return (
    <aside className="w-16 md:w-64 bg-white shadow-lg flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto z-5">
      <nav className="py-4">
        <ul>
          {navItems.map((item) => (
            <li className="mb-1" key={item.path}>
              <Link 
                href={item.path}
                className={`flex items-center px-4 py-3 ${
                  location === item.path
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
                        savedProjections.map(projection => (
                          <li key={projection.id} className="mb-1">
                            <Link
                              href={`/projections?id=${projection.id}`}
                              className="text-sm text-gray-600 hover:text-primary pl-4 py-1 block truncate"
                            >
                              {projection.name}
                            </Link>
                          </li>
                        ))
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
