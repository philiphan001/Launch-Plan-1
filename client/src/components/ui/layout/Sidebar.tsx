import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import ProjectionAvatar from "@/components/ProjectionAvatar";
import { Coffee, User as UserIcon } from "lucide-react";

// Props-based approach for more reliable auth
interface SidebarProps {
  user: User | null;
}

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
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/pathways", label: "Pathways", icon: "alt_route" },
  { path: "/projections", label: "Financial Projections", icon: "trending_up" },
  { path: "/career-exploration", label: "Career Exploration", icon: "work" },
  { path: "/college-discovery", label: "College Discovery", icon: "school" },
  { path: "/city-exploration", label: "City Exploration", icon: "location_city" },
  { path: "/profile", label: "Profile", icon: "account_circle" },
];

const Sidebar = ({ user }: SidebarProps) => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if we're on a projections page by analyzing the URL
  const isProjectionsPage = location.startsWith("/projections");

  return (
    <aside className="w-64 bg-white shadow flex flex-col h-full">
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
            </li>
          ))}
          
          {/* Separator and Fun Money Facts section */}
          <li className="my-4">
            <div className="border-t border-gray-200 mx-4"></div>
          </li>
          <li className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Fun Money Facts
          </li>
          <li className="mb-1">
            <Link 
              href="/coffee-calculator"
              className={`flex items-center px-4 py-3 ${
                location === "/coffee-calculator"
                  ? "text-primary bg-blue-50 border-l-4 border-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary"
              }`}
            >
              <span className="material-icons md:mr-3">coffee</span>
              <span className="hidden md:inline">Coffee Calculator</span>
            </Link>
          </li>
          <li className="mb-1">
            <Link
              href="/celebrity-profiles"
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary"
            >
              <span className="material-icons md:mr-3">star</span>
              <span className="hidden md:inline">Celebrity Profiles</span>
            </Link>
          </li>
          <li className="my-4">
            <div className="border-t border-gray-200 mx-4"></div>
          </li>
          <li className="flex justify-center py-4">
            <ProjectionAvatar />
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
