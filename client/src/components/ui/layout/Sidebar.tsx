import { Link, useLocation } from "wouter";

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: "/", label: "Dashboard", icon: "dashboard" },
  { path: "/projections", label: "Financial Projections", icon: "trending_up" },
  { path: "/careers", label: "Career Exploration", icon: "work" },
  { path: "/career-builder", label: "Career Builder", icon: "insights" },
  { path: "/colleges", label: "College Discovery", icon: "school" },
  { path: "/calculator", label: "Net Price Calculator", icon: "calculate" },
  { path: "/pathways", label: "Pathways", icon: "alt_route" },
  { path: "/assumptions", label: "Launch Plan Assumptions", icon: "settings" },
  { path: "/profile", label: "Profile", icon: "account_circle" },
];

const Sidebar = () => {
  const [location] = useLocation();

  return (
    <aside className="w-16 md:w-64 bg-white shadow-lg flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto z-5">
      <nav className="py-4">
        <ul>
          {navItems.map((item) => (
            <li className="mb-1" key={item.path}>
              <Link href={item.path}>
                <a 
                  className={`flex items-center px-4 py-3 ${
                    location === item.path
                      ? "text-primary bg-blue-50 border-l-4 border-primary"
                      : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                  }`}
                >
                  <span className="material-icons md:mr-3">{item.icon}</span>
                  <span className="hidden md:inline">{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
