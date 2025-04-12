import { Link, useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  hasSubItems?: boolean;
}

interface FinancialProjection {
  id: number;
  name: string;
  createdAt: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: "dashboard" },
  { path: "/projections", label: "Financial Projections", icon: "trending_up", hasSubItems: true },
  { path: "/careers", label: "Career Exploration", icon: "work" },
  { path: "/colleges", label: "College Discovery", icon: "school" },
  { path: "/pathways", label: "Pathways", icon: "alt_route" },
  { path: "/profile", label: "Profile", icon: "account_circle" },
];

const Sidebar = () => {
  const [location, setLocation] = useLocation();
  const [projectionsOpen, setProjectionsOpen] = useState(false);
  
  // Temporary user ID for demo
  const userId = 1;
  
  // Fetch saved projections
  const { data: savedProjections = [] } = useQuery<FinancialProjection[]>({
    queryKey: ['/api/financial-projections', userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/financial-projections/${userId}`);
        if (!response.ok) return [];
        return response.json();
      } catch (error) {
        console.error('Error fetching projections:', error);
        return [];
      }
    }
  });

  // Automatically open projections menu if we're on the projections page
  useEffect(() => {
    if (location === "/projections" || location.startsWith("/projections/")) {
      setProjectionsOpen(true);
    }
  }, [location]);

  return (
    <aside className="w-16 md:w-64 bg-white shadow-lg flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto z-5">
      <nav className="py-4">
        <ul>
          {navItems.map((item) => 
            item.hasSubItems && item.path === "/projections" ? (
              <li className="mb-1" key={item.path}>
                <Collapsible
                  open={projectionsOpen}
                  onOpenChange={setProjectionsOpen}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <div 
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer ${
                        location === item.path || location.startsWith(item.path + "/")
                          ? "text-primary bg-blue-50 border-l-4 border-primary"
                          : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="material-icons md:mr-3">{item.icon}</span>
                        <span className="hidden md:inline">{item.label}</span>
                      </div>
                      <span className="hidden md:inline">
                        {projectionsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="pl-9 pr-2">
                      <li className="my-1">
                        <Link
                          href="/projections"
                          className={`block py-2 px-2 rounded text-sm ${
                            location === "/projections"
                              ? "text-primary bg-blue-50"
                              : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                          }`}
                        >
                          New Projection
                        </Link>
                      </li>
                      {savedProjections.length > 0 ? (
                        <>
                          <li className="my-1 border-t border-gray-200 pt-2 mt-2">
                            <span className="text-xs text-gray-500 px-2">Saved Projections</span>
                          </li>
                          {savedProjections.map(projection => (
                            <li className="my-1" key={projection.id}>
                              <div
                                onClick={() => {
                                  setLocation(`/projections/${projection.id}`);
                                }}
                                className={`block py-2 px-2 rounded text-sm truncate cursor-pointer ${
                                  location === `/projections/${projection.id}`
                                    ? "text-primary bg-blue-50"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                                }`}
                                title={projection.name}
                              >
                                {projection.name}
                              </div>
                            </li>
                          ))}
                        </>
                      ) : null}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>
            ) : (
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
              </li>
            )
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
