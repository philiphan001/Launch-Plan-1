import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

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
  { path: "/", label: "Dashboard", icon: "dashboard" },
  { path: "/pathways", label: "Pathways", icon: "alt_route" },
  { path: "/projections", label: "Financial Projections", icon: "trending_up" },
  { path: "/careers", label: "Career Exploration", icon: "work" },
  { path: "/colleges", label: "College Discovery", icon: "school" },
  { path: "/profile", label: "Profile", icon: "account_circle" },
];

const Sidebar = ({ user }: SidebarProps) => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

          {/* Separator and Test Tools section */}
          <li className="my-4">
            <div className="border-t border-gray-200 mx-4"></div>
          </li>
          <li className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Test Tools
          </li>
          <li className="mb-1">
            <Link 
              href="/test/parallel-search"
              className={`flex items-center px-4 py-3 ${
                location === "/test/parallel-search"
                  ? "text-primary bg-blue-50 border-l-4 border-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary"
              }`}
            >
              <span className="material-icons md:mr-3">search</span>
              <span className="hidden md:inline">Parallel Search</span>
            </Link>
          </li>
          <li className="mb-1">
            <Link 
              href="/test/four-year-path"
              className={`flex items-center px-4 py-3 ${
                location === "/test/four-year-path"
                  ? "text-primary bg-blue-50 border-l-4 border-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary"
              }`}
            >
              <span className="material-icons md:mr-3">school</span>
              <span className="hidden md:inline">Four Year Path</span>
            </Link>
          </li>
          <li className="mb-1">
            <Link 
              href="/test/two-year-path"
              className={`flex items-center px-4 py-3 ${
                location === "/test/two-year-path"
                  ? "text-primary bg-blue-50 border-l-4 border-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary"
              }`}
            >
              <span className="material-icons md:mr-3">school</span>
              <span className="hidden md:inline">Two Year Path</span>
            </Link>
          </li>
          <li className="mb-1">
            <Link 
              href="/test/vocational-path"
              className={`flex items-center px-4 py-3 ${
                location === "/test/vocational-path"
                  ? "text-primary bg-blue-50 border-l-4 border-primary"
                  : "text-gray-700 hover:bg-gray-100 hover:text-primary"
              }`}
            >
              <span className="material-icons md:mr-3">construction</span>
              <span className="hidden md:inline">Vocational Path</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
