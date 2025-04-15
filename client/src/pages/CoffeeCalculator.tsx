import { AuthProps } from "@/interfaces/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import DailyCoffeeCalculator from "@/components/financial/DailyCoffeeCalculator";
import { Button } from "@/components/ui/button";
import { Coffee, Coins, Calculator, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const CoffeeCalculatorPage = ({
  user,
  isAuthenticated,
  isFirstTimeUser,
  login,
  signup,
  logout,
  completeOnboarding
}: AuthProps) => {
  const [location, navigate] = useLocation();

  // Log when this component renders
  useEffect(() => {
    console.log("Coffee Calculator route rendering", { auth: isAuthenticated, firstTime: isFirstTimeUser, user });
  }, [isAuthenticated, isFirstTimeUser, user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Coffee className="h-8 w-8 text-amber-600" />
              <h1 className="text-3xl font-bold text-slate-800">The Daily Coffee Challenge</h1>
            </div>
            <p className="text-lg text-slate-600 max-w-3xl">
              See how your small daily expenses can have a <span className="font-semibold text-amber-600">HUGE impact</span> on your future finances and retirement goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-amber-100 text-amber-600 p-2 rounded-full">
                  <Coffee className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-semibold">The Coffee Effect</h2>
              </div>
              <p className="text-slate-600">
                That $5 coffee might not seem like much today, but when repeated daily for years, it adds up to a surprisingly large amount!
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-emerald-100 text-emerald-600 p-2 rounded-full">
                  <Coins className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-semibold">Compound Growth</h2>
              </div>
              <p className="text-slate-600">
                When invested at 8% annual return, your daily coffee money can grow exponentially through the power of compound interest.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-full">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-semibold">Early Retirement</h2>
              </div>
              <p className="text-slate-600">
                Small changes in spending habits today can potentially help you retire years earlier than you planned!
              </p>
            </motion.div>
          </div>
          
          <div className="mb-10">
            <DailyCoffeeCalculator />
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-lg border border-amber-100 mb-8">
            <h3 className="text-xl font-semibold text-amber-800 mb-3">Not Just About Coffee</h3>
            <p className="text-amber-700 mb-4">
              This calculator isn't about making you give up your favorite drinks - it's about understanding the long-term impact of small recurring expenses so you can make informed choices.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-amber-100">
                <h4 className="font-semibold text-amber-800">Other Daily Expenses to Consider:</h4>
                <ul className="mt-2 space-y-1 text-amber-700">
                  <li>• Bottled water or drinks</li>
                  <li>• Snacks and vending machine purchases</li>
                  <li>• Fast food lunches vs. bringing lunch</li>
                  <li>• Subscription services you barely use</li>
                </ul>
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-amber-100">
                <h4 className="font-semibold text-amber-800">Balanced Approach Tips:</h4>
                <ul className="mt-2 space-y-1 text-amber-700">
                  <li>• Make coffee at home most days, treat yourself occasionally</li>
                  <li>• Create a "fun money" budget for treats</li>
                  <li>• Automatically invest a portion of your income first</li>
                  <li>• Look for the biggest impact changes in your spending</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/projections')}
            >
              <Calculator className="h-4 w-4" />
              Try Financial Projections
            </Button>
            
            <Button
              className="gap-2"
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CoffeeCalculatorPage;