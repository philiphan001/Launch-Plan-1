import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { User } from "@/interfaces/auth";

interface AppShellProps {
  children: ReactNode;
  user: User | null;
  logout: () => void;
}

const AppShell = ({ children, user, logout }: AppShellProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} logout={logout} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-100 pt-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
