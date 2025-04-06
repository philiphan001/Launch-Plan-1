import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface Milestone {
  id: string;
  type: "school" | "work" | "home" | "other";
  title: string;
  date: string;
  yearsAway: number;
  color?: string;
}

interface MilestonesCardProps {
  milestones: Milestone[];
  onAddMilestone?: () => void;
}

const getIconAndColor = (type: string) => {
  switch (type) {
    case "school":
      return { icon: "school", color: "bg-primary-light" };
    case "work":
      return { icon: "work", color: "bg-secondary-light" };
    case "home":
      return { icon: "home", color: "bg-accent-light" };
    default:
      return { icon: "event", color: "bg-gray-400" };
  }
};

const MilestonesCard = ({ 
  milestones = [
    {
      id: "1",
      type: "school",
      title: "College Graduation",
      date: "May 2024",
      yearsAway: 2,
    },
    {
      id: "2",
      type: "work",
      title: "First Job",
      date: "June 2024",
      yearsAway: 2,
    },
    {
      id: "3",
      type: "home",
      title: "Buy First Home",
      date: "March 2028",
      yearsAway: 6,
    },
  ],
  onAddMilestone = () => {}
}: MilestonesCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">Life Milestones</h3>
        <div className="flex items-center space-x-3">
          <button 
            className="text-primary hover:text-primary-dark text-sm"
            onClick={onAddMilestone}
          >
            Add
          </button>
          <Link to="/projections">
            <span className="text-primary text-sm flex items-center">
              Details <ArrowRight className="h-4 w-4 ml-1" />
            </span>
          </Link>
        </div>
      </div>
      <CardContent className="px-6 py-4">
        <ul className="divide-y divide-gray-200">
          {milestones.map((milestone) => {
            const { icon, color } = getIconAndColor(milestone.type);
            return (
              <li key={milestone.id} className="py-3 flex items-start">
                <div className={`h-8 w-8 ${color} rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0`}>
                  <span className="material-icons text-sm">{icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{milestone.title}</p>
                  <p className="text-xs text-gray-500">
                    {milestone.date} • {milestone.yearsAway} years away
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 text-center">
          <Link to="/projections" className="text-primary text-sm">
            Manage Milestones
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestonesCard;
