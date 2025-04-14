import { Link } from "wouter";

interface WelcomeCardProps {
  username?: string;
}

const WelcomeCard = ({ username = "User" }: WelcomeCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-800">
            Welcome back, {username}
          </h2>
          <p className="text-gray-600 mt-1">Continue planning your financial future</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
