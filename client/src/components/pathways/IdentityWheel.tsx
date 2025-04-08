import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

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
  resetKey?: number; // Add reset key prop for forcing re-mount
}

export default function IdentityWheel({ onComplete, resetKey = 0 }: IdentityWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [category, setCategory] = useState<WheelPrompt['category'] | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Reset state when resetKey changes
  useEffect(() => {
    setIsSpinning(false);
    setRotation(0);
    setCurrentPromptIndex(0);
    setSelectedOptions({});
    setIsComplete(false);
    setCategory(null);
    setShowPrompt(false);
    setShowInstructions(true);
    console.log('IdentityWheel reset with key:', resetKey);
  }, [resetKey]);
  
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
  
  // Find a prompt for current category or use default
  const currentPrompt = category 
    ? prompts.find(p => p.category === category && !selectedOptions[p.id]) || prompts[currentPromptIndex]
    : prompts[currentPromptIndex];
  
  const calculateRotation = () => {
    // More dramatic spin rotation - minimum of 4 full rotations (1440 degrees) plus random extra
    return isSpinning ? 1440 + Math.random() * 720 : rotation;
  };
  
  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowPrompt(false);
    
    // Land on one of the 5 segments (values, talents, fears, wishes, goals)
    const segmentSize = 360 / 5;
    const randomSegment = Math.floor(Math.random() * 5);
    const segmentRotation = randomSegment * segmentSize;
    
    // Calculate a final rotation that will land exactly on the chosen segment
    // We add a large number of full rotations first for a more dramatic spin
    const fullRotations = 4 + Math.floor(Math.random() * 2); // 4-5 full rotations
    const newRotation = (fullRotations * 360) + segmentRotation;
    
    // Set the final rotation value
    setRotation(prevRotation => {
      // Ensure the wheel actually spins by adding to previous rotation
      // This is important for repeated spins
      return (Math.floor(prevRotation / 360) * 360) + newRotation;
    });
    
    // Reset after spin completes
    setTimeout(() => {
      setIsSpinning(false);
      const categories: WheelPrompt['category'][] = ['values', 'talents', 'fears', 'wishes', 'goals'];
      const landedCategory = categories[randomSegment];
      setCategory(landedCategory);
      setShowPrompt(true);
    }, 3500); // Slightly longer duration for the more dramatic spin
  };
  
  const handleOptionSelect = (value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [currentPrompt.id]: value
    }));
  };
  
  const handleNext = () => {
    const answeredQuestions = Object.keys(selectedOptions).length;
    
    // If we've answered all questions
    if (answeredQuestions >= prompts.length) {
      setIsComplete(true);
      onComplete(selectedOptions);
      return;
    }
    
    // Reset category to prompt another spin
    setShowPrompt(false);
    setCategory(null);
    
    // Update current index to next unanswered question
    const nextIndex = prompts.findIndex(p => !selectedOptions[p.id]);
    if (nextIndex !== -1) {
      setCurrentPromptIndex(nextIndex);
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
  
  const getCategoryTitle = (category: WheelPrompt['category']) => {
    switch (category) {
      case 'values': return 'Values';
      case 'talents': return 'Talents';
      case 'fears': return 'Fears';
      case 'wishes': return 'Wishes';
      case 'goals': return 'Goals';
      default: return 'Unknown';
    }
  };
  
  // Determine if we can proceed
  const canProceed = selectedOptions[currentPrompt.id] !== undefined;
  
  // Calculate progress percentage
  const progressPercentage = Math.round((Object.keys(selectedOptions).length / prompts.length) * 100);
  
  if (isComplete) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Your Identity Profile</h2>
          <p className="text-gray-600">Based on your answers, here's what matters most to you</p>
        </div>
        
        <div className="space-y-5">
          {prompts.map(prompt => (
            <Card key={prompt.id} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{getCategoryEmoji(prompt.category)}</div>
                  <div>
                    <h4 className="font-medium text-lg">{prompt.question}</h4>
                    <p className="text-primary font-medium mt-1">
                      {prompt.options.find(o => o.id === selectedOptions[prompt.id])?.text || 'Not answered'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-end mt-6">
          <Button onClick={() => onComplete(selectedOptions)}>
            Continue to Recommendations
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto">
      {/* Instructions overlay */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div 
            className="fixed inset-0 z-50 bg-gray-900/90 flex items-center justify-center p-4"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4 text-center">How to Play</h3>
              
              <ol className="space-y-4 mb-6">
                <li className="flex gap-3">
                  <div className="bg-primary/10 rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center font-bold text-primary">1</div>
                  <div>Click the <strong>Spin the Wheel</strong> button to start</div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center font-bold text-primary">2</div>
                  <div>The wheel will land on a category (Values, Fears, etc.)</div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center font-bold text-primary">3</div>
                  <div>Answer the question that appears</div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center font-bold text-primary">4</div>
                  <div>Spin again to get a new question until you complete all 5 categories</div>
                </li>
              </ol>
              
              <div className="text-center">
                <Button onClick={() => setShowInstructions(false)}>Got it, Let's Play!</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Spin the Wheel of Identity</h3>
        <p className="text-gray-600 text-sm">
          Discover what matters most to you by spinning the wheel and answering questions
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Your Identity Profile</span>
          <span>{Object.keys(selectedOptions).length} of {prompts.length} complete</span>
        </div>
        <Progress value={progressPercentage} />
      </div>
      
      <div className="relative">
        {/* The Wheel */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-64 h-64 mb-2">
            <motion.div
              ref={wheelRef}
              className="w-full h-full rounded-full border-4 border-primary shadow-lg overflow-hidden"
              style={{
                backgroundImage: 'conic-gradient(from 0deg, #f472b6, #60a5fa, #34d399, #fbbf24, #f87171)',
                transform: `rotate(${rotation}deg)`,
              }}
              animate={{ rotate: calculateRotation() }}
              transition={{ 
                duration: isSpinning ? 3.5 : 1,
                type: isSpinning ? "spring" : "tween",
                damping: 10,
                stiffness: 80,
                ease: isSpinning ? "easeOut" : "easeInOut"
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
          
          {/* Category landed on */}
          {category && !isSpinning && (
            <motion.div 
              className="text-xl font-medium text-center mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-block mr-2">{getCategoryEmoji(category)}</span>
              <span>You landed on: <span className="text-primary font-semibold">{getCategoryTitle(category)}</span></span>
            </motion.div>
          )}
          
          {/* Spin button */}
          <Button 
            onClick={spinWheel} 
            disabled={isSpinning || showPrompt}
            size="lg"
            variant={showPrompt ? "outline" : "default"}
            className="mb-2"
          >
            {isSpinning ? 'Spinning...' : showPrompt ? 'Answer the question below' : 'Spin the Wheel!'}
          </Button>
        </div>
        
        {/* Prompt Card - Only shown after spinning */}
        <AnimatePresence>
          {showPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6 shadow-md border-t-4" style={{ borderTopColor: 'var(--primary)' }}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{getCategoryEmoji(currentPrompt.category)}</span>
                    <h4 className="text-lg font-medium">{currentPrompt.question}</h4>
                  </div>
                  
                  <RadioGroup value={selectedOptions[currentPrompt.id]} onValueChange={handleOptionSelect}>
                    <div className="space-y-3">
                      {currentPrompt.options.map(option => (
                        <div key={option.id} className="flex items-center space-x-2 border rounded-md p-3 hover:border-primary cursor-pointer transition-colors">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="cursor-pointer w-full">{option.text}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              
              {/* Navigation */}
              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={!canProceed}>
                  {Object.keys(selectedOptions).length < prompts.length - 1 ? 'Next Spin' : 'See Results'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}