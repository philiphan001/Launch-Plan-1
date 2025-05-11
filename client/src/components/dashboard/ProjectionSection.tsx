import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createMainProjectionChart } from "@/lib/charts";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

type ProjectionType = "netWorth" | "income" | "expenses" | "assets" | "liabilities";

interface KeyFactor {
  type: "career" | "education" | "location";
  title: string;
  subtitle: string;
  detail: string;
  icon: string;
  changeUrl: string;
}

interface ProjectionSectionProps {
  projectionData?: any;
  keyFactors?: KeyFactor[];
}

const ProjectionSection = ({
  projectionData = {
    netWorth: [5000, 12000, -15000, -8000, 15000, 48000, 78000, 102000, 127540, 156000, 192000],
    ages: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
  },
  keyFactors = [
    {
      type: "career",
      title: "Career Path",
      subtitle: "Software Developer",
      detail: "Starting Salary: $75,000",
      icon: "work",
      changeUrl: "/careers"
    },
    {
      type: "education",
      title: "Education",
      subtitle: "University of Washington",
      detail: "Total Cost: $120,000",
      icon: "school",
      changeUrl: "/colleges"
    },
    {
      type: "location",
      title: "Location",
      subtitle: "Seattle, WA",
      detail: "Cost of Living: +18% vs national avg",
      icon: "location_on",
      changeUrl: "/settings"
    }
  ]
}: ProjectionSectionProps) => {
  const [activeTab, setActiveTab] = useState<ProjectionType>("netWorth");
  const [timeframe, setTimeframe] = useState<string>("10 Years");
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    console.log('[ProjectionSection] activeTab:', activeTab, 'projectionData:', projectionData);
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        // Create new chart
        chartInstance.current = createMainProjectionChart(ctx, projectionData, activeTab);
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [projectionData, activeTab, timeframe]);

  // Also log when the tab is switched
  useEffect(() => {
    console.log('[ProjectionSection] Tab switched to:', activeTab);
  }, [activeTab]);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-display font-semibold text-gray-800 mr-3">Financial Projection</h2>
          <Link to="/projections">
            <span className="text-primary text-sm flex items-center">
              View Full Projections <ArrowRight className="h-4 w-4 ml-1" />
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View:</span>
          <select 
            className="text-sm border border-gray-300 rounded px-3 py-1 bg-white"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option>10 Years</option>
            <option>5 Years</option>
            <option>20 Years</option>
            <option>All Years</option>
          </select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex flex-wrap mb-4">
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'netWorth' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('netWorth')}
              >
                Net Worth
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'income' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('income')}
              >
                Income
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'expenses' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('expenses')}
              >
                Expenses
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'assets' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('assets')}
              >
                Assets
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'liabilities' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('liabilities')}
              >
                Liabilities
              </button>
            </div>
            
            <div className="h-80">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Key Factors Influencing Projection</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {keyFactors.map((factor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="material-icons text-primary mr-2">{factor.icon}</span>
                    <div>
                      <h4 className="font-medium">{factor.title}</h4>
                      <p className="text-gray-600 text-sm">{factor.subtitle}</p>
                      <p className="text-gray-500 text-xs mt-1">{factor.detail}</p>
                      <a href={factor.changeUrl} className="text-primary text-xs mt-2 inline-block">
                        Change {factor.type}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Link to="/projections">
              <button className="px-6 py-3 bg-primary text-white font-medium rounded-lg flex items-center hover:bg-primary-dark transition-colors">
                View Full Financial Projections <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectionSection;
