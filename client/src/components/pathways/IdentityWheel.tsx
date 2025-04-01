import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PromptOption {
  id: string;
  text: string;
}

interface WheelPrompt {
  id: string;
  question: string;
  category: 'values' | 'talents' | 'fears' | 'wishes' | 'goals';
  options: PromptOption[];
}

interface IdentityWheelProps {
  onComplete: (results: Record<string, string>) => void;
}

export default function IdentityWheel({ onComplete }: IdentityWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Define prompts
  const prompts: WheelPrompt[] = [
    {
      id: 'success_meaning',
      question: 'Being successful means...',
      category: 'values',
      options: [
        { id: 'freedom', text: 'Having freedom' },
        { id: 'respect', text: 'Being respected' },
        { id: 'wealth', text: 'Making money' },
        { id: 'impact', text: 'Making an impact' },
      ]
    },
    {
      id: 'dream_environment',
      question: 'My ideal working environment is...',
      category: 'wishes',
      options: [
        { id: 'office', text: 'A professional office' },
        { id: 'remote', text: 'Working from anywhere' },
        { id: 'outdoors', text: 'Being outdoors' },
        { id: 'creative', text: 'A creative studio' },
      ]
    },
    {
      id: 'talent_recognition',
      question: 'People often compliment me on my ability to...',
      category: 'talents',
      options: [
        { id: 'solve', text: 'Solve problems' },
        { id: 'create', text: 'Create or design things' },
        { id: 'communicate', text: 'Communicate effectively' },
        { id: 'organize', text: 'Organize and plan' },
      ]
    },
    {
      id: 'biggest_fear',
      question: 'My biggest worry about the future is...',
      category: 'fears',
      options: [
        { id: 'wrong_path', text: 'Choosing the wrong path' },
        { id: 'financial', text: 'Not having financial security' },
        { id: 'unfulfilled', text: 'Having an unfulfilling career' },
        { id: 'failure', text: 'Failing to achieve my goals' },
      ]
    },
    {
      id: 'ten_years',
      question: 'In 10 years, I hope to...',
      category: 'goals',
      options: [
        { id: 'expert', text: 'Be an expert in my field' },
        { id: 'leader', text: 'Lead a team or organization' },
        { id: 'balance', text: 'Have work-life balance' },
        { id: 'entrepreneur', text: 'Run my own business' },
      ]
    },
  ];
  
  const currentPrompt = prompts[currentPromptIndex];
  
  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Generate a random rotation between 720 and 1080 degrees (2-3 full spins)
    // plus a partial rotation to land on a specific segment
    const spinDegrees = 720 + Math.floor(Math.random() * 360);
    
    setRotation(prevRotation => prevRotation + spinDegrees);
    
    // Reset after spin completes
    setTimeout(() => {
      setIsSpinning(false);
    }, 3000); // Match this with the animation duration
  };
  
  const handleOptionSelect = (value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [currentPrompt.id]: value
    }));
  };
  
  const handleNext = () => {
    if (currentPromptIndex < prompts.length - 1) {
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else {
      setIsComplete(true);
      onComplete(selectedOptions);
    }
  };
  
  const getCategoryEmoji = (category: WheelPrompt['category']) => {
    switch (category) {
      case 'values': return '💎';
      case 'talents': return '✨';
      case 'fears': return '😨';
      case 'wishes': return '🌟';
      case 'goals': return '🎯';
      default: return '❓';
    }
  };
  
  // Determine if we can proceed
  const canProceed = selectedOptions[currentPrompt.id] !== undefined;
  
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Spin the Wheel of Identity</h3>
        <p className="text-gray-600 text-sm">
          Discover what matters most to you by spinning the wheel and answering quick questions
        </p>
      </div>
      
      <div className="flex flex-col items-center mb-8">
        {/* The Wheel */}
        <div className="relative w-64 h-64 mb-6">
          <motion.div
            ref={wheelRef}
            className="w-full h-full rounded-full border-4 border-primary"
            style={{
              backgroundImage: 'conic-gradient(from 0deg, #f472b6, #60a5fa, #34d399, #fbbf24, #f87171)',
              transform: `rotate(${rotation}deg)`,
            }}
            animate={{ rotate: rotation }}
            transition={{ 
              duration: 3,
              type: "spring",
              damping: 15,
              stiffness: 100
            }}
          >
            {/* Wheel segments */}
            {['Values', 'Talents', 'Fears', 'Wishes', 'Goals'].map((label, i) => (
              <div 
                key={label} 
                className="absolute top-1/2 left-1/2 text-white font-bold text-xs transform -translate-x-1/2"
                style={{ 
                  transform: `rotate(${72 * i}deg) translate(0, -90px) rotate(-${72 * i}deg)`,
                }}
              >
                {label}
              </div>
            ))}
          </motion.div>
          
          {/* The pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[20px] border-l-transparent border-r-transparent border-b-primary"></div>
          </div>
        </div>
        
        {/* Spin button */}
        <Button 
          onClick={spinWheel} 
          disabled={isSpinning}
          size="lg"
          className="mb-6"
        >
          {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
        </Button>
      </div>
      
      {/* Prompt Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">{getCategoryEmoji(currentPrompt.category)}</span>
            <h4 className="text-lg font-medium">{currentPrompt.question}</h4>
          </div>
          
          <RadioGroup value={selectedOptions[currentPrompt.id]} onValueChange={handleOptionSelect}>
            <div className="space-y-3">
              {currentPrompt.options.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="cursor-pointer">{option.text}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!canProceed}>
          {currentPromptIndex < prompts.length - 1 ? 'Next Question' : 'See Results'}
        </Button>
      </div>
      
      {/* Progress indicator */}
      <div className="flex justify-between mt-4 text-sm text-gray-500">
        <span>Question {currentPromptIndex + 1} of {prompts.length}</span>
        <span>{Math.round((currentPromptIndex / prompts.length) * 100)}% complete</span>
      </div>
    </div>
  );
}