import { Link } from "wouter";

interface User {
  id: number;
  name: string;
  email: string;
  isFirstTimeUser: boolean;
}

interface HeaderProps {
  user: User | null;
  logout: () => void;
}

const Header = ({ user, logout }: HeaderProps) => {
  return (
    <header className="bg-primary text-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="material-icons">account_balance</span>
          <Link href="/dashboard">
            <h1 className="text-xl font-display font-semibold cursor-pointer">Launch Plan</h1>
          </Link>
          <div className="ml-6 flex items-center">
            <Link href="/">
              <span className="flex items-center space-x-1 hover:bg-primary-dark px-3 py-1 rounded cursor-pointer">
                <span className="material-icons text-sm">home</span>
                <span className="hidden md:inline">Home</span>
              </span>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center mr-4">
              <span className="hidden md:inline text-sm mr-2">
                Welcome, {user.name}
              </span>
              <span className="material-icons text-sm">person</span>
            </div>
          )}
          <button 
            className="hidden md:flex items-center space-x-1 hover:bg-primary-dark px-3 py-1 rounded"
          >
            <span className="material-icons text-sm">help_outline</span>
            <span>Help</span>
          </button>
          <Link href="/settings">
            <button className="flex items-center space-x-1 hover:bg-primary-dark px-3 py-1 rounded">
              <span className="material-icons text-sm">settings</span>
              <span className="hidden md:inline">Settings</span>
            </button>
          </Link>
          <button 
            onClick={logout}
            className="flex items-center space-x-1 hover:bg-primary-dark px-3 py-1 rounded"
          >
            <span className="material-icons text-sm">logout</span>
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
