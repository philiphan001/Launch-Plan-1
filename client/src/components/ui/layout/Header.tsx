import { Link } from "wouter";

const Header = () => {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="material-icons">account_balance</span>
          <Link href="/">
            <h1 className="text-xl font-display font-semibold cursor-pointer">FinancialFuture</h1>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button className="hidden md:flex items-center space-x-1 hover:bg-primary-dark px-3 py-1 rounded">
            <span className="material-icons text-sm">help_outline</span>
            <span>Help</span>
          </button>
          <Link href="/profile">
            <button className="flex items-center space-x-1 hover:bg-primary-dark px-3 py-1 rounded">
              <span className="material-icons text-sm">person</span>
              <span className="hidden md:inline">Profile</span>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
