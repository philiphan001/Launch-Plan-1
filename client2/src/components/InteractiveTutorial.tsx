import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, GraduationCap, Briefcase, Calculator, ArrowRight } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  icon: React.ReactNode;
  color: string;
}

interface InteractiveTutorialProps {
  isFirstTimeUser: boolean;
  onComplete: () => void;
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ isFirstTimeUser, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log('Tutorial visibility check:', { 
      isFirstTimeUser,
      currentStep,
      isVisible 
    });
    if (isFirstTimeUser) {
      console.log('Showing tutorial for first-time user');
      setIsVisible(true);
    } else {
      console.log('Not showing tutorial - user is not first-time');
      setIsVisible(false);
    }
  }, [isFirstTimeUser]);

  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to Launch Plan!",
      description: "We're here to help you visualize your financial future and make better long-term decisions. Let's get started!",
      icon: <Sparkles className="w-8 h-8" />,
      color: "bg-gradient-to-r from-indigo-500 to-purple-500"
    },
    {
      title: "Explore Your Options",
      description: "You can use Launch Plan in two ways: Guided Pathways or Custom Planning. Let's explore both!",
      icon: <GraduationCap className="w-8 h-8" />,
      color: "bg-gradient-to-r from-green-500 to-teal-500"
    },
    {
      title: "Guided Pathways",
      description: "If you're not sure where to start, our AI-assisted pathways will help you explore your interests, goals, and values to find the perfect path.",
      icon: <Sparkles className="w-8 h-8" />,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    {
      title: "Custom Planning",
      description: "Already know what you want? You can directly select schools and careers, favorite your choices, and use our AI tools to tailor them to your needs.",
      icon: <Briefcase className="w-8 h-8" />,
      color: "bg-gradient-to-r from-orange-500 to-red-500"
    },
    {
      title: "Financial Projections",
      description: "Save your selections to your profile to generate personalized financial projections and see your future potential!",
      icon: <Calculator className="w-8 h-8" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`relative max-w-md mx-4 p-6 rounded-xl shadow-xl ${tutorialSteps[currentStep].color} text-white`}
        >
          <div className="flex items-center gap-4 mb-4">
            {tutorialSteps[currentStep].icon}
            <h3 className="text-xl font-bold">{tutorialSteps[currentStep].title}</h3>
          </div>
          <p className="mb-6 text-white/90">{tutorialSteps[currentStep].description}</p>
          
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Skip Tutorial
            </Button>
            <Button
              onClick={handleNext}
              className="bg-white text-gray-900 hover:bg-white/90"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-white"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default InteractiveTutorial; 