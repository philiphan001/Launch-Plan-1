import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

interface PromptOption {
  id: string;
  text: string;
}

interface WheelPrompt {
  id: string;
  question: string;
  category: 'superpower' | 'idealDay' | 'values' | 'likedActivities' | 'futureFeeling' | 'dreamLocation' | 'teamRole' | 'careerVibes' | 'timeCapsule' | 'wildcard';
  options: PromptOption[];
  isCustomInput?: boolean;
}

interface AdvancedWheelProps {
  onComplete: (results: Record<string, string>) => void;
}

export default function AdvancedWheel({ onComplete }: AdvancedWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [category, setCategory] = useState<WheelPrompt['category'] | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Define prompts based on user requirements
  const prompts: WheelPrompt[] = [
    {
      id: 'superpower',
      question: "What's something people come to you for help with?",
      category: 'superpower',
      options: [
        { id: 'listening', text: 'Listening and giving advice' },
        { id: 'solving', text: 'Solving problems' },
        { id: 'fixing', text: 'Fixing or building things' },
        { id: 'leading', text: 'Leading and organizing' },
        { id: 'humor', text: 'Making people laugh' },
      ]
    },
    {
      id: 'idealDay_setting',
      question: "In your perfect day, what's the setting?",
      category: 'idealDay',
      options: [
        { id: 'beach', text: 'Beach or tropical location' },
        { id: 'mountains', text: 'Mountains or forest' },
        { id: 'city', text: 'Busy city' },
        { id: 'home', text: 'Cozy home' },
        { id: 'travel', text: 'Traveling somewhere new' },
      ]
    },
    {
      id: 'idealDay_people',
      question: "Who would be with you in your perfect day?",
      category: 'idealDay',
      options: [
        { id: 'family', text: 'Family' },
        { id: 'friends', text: 'Close friends' },
        { id: 'partner', text: 'Romantic partner' },
        { id: 'alone', text: 'Enjoying time alone' },
        { id: 'new_people', text: 'Meeting new people' },
      ]
    },
    {
      id: 'idealDay_activities',
      question: "What would you be doing on your perfect day?",
      category: 'idealDay',
      options: [
        { id: 'relaxing', text: 'Relaxing and recharging' },
        { id: 'adventure', text: 'Having an adventure' },
        { id: 'creating', text: 'Creating or building something' },
        { id: 'learning', text: 'Learning something new' },
        { id: 'celebrating', text: 'Celebrating something special' },
      ]
    },
    {
      id: 'values',
      question: "Pick the 2 most important things to you right now.",
      category: 'values',
      options: [
        { id: 'security', text: 'Security and stability' },
        { id: 'adventure', text: 'Adventure and experiences' },
        { id: 'relationships', text: 'Relationships with others' },
        { id: 'independence', text: 'Independence and freedom' },
        { id: 'money', text: 'Financial success' },
        { id: 'impact', text: 'Making a positive impact' },
      ]
    },
    {
      id: 'likedActivities',
      question: "Which do you enjoy more?",
      category: 'likedActivities',
      options: [
        { id: 'building', text: 'Building or creating things' },
        { id: 'performing', text: 'Performing or entertaining' },
        { id: 'helping', text: 'Helping or teaching others' },
        { id: 'researching', text: 'Researching and learning' },
        { id: 'organizing', text: 'Organizing and planning' },
      ]
    },
    {
      id: 'futureFeeling',
      question: "When I think about life after high school, I feel...",
      category: 'futureFeeling',
      options: [
        { id: 'excited', text: 'Excited for new opportunities' },
        { id: 'nervous', text: 'Nervous about the unknown' },
        { id: 'lost', text: 'A bit lost or uncertain' },
        { id: 'determined', text: 'Determined to succeed' },
        { id: 'curious', text: 'Curious about what\'s possible' },
      ]
    },
    {
      id: 'dreamLocation',
      question: "Where would you love to live someday?",
      category: 'dreamLocation',
      options: [
        { id: 'rural', text: 'Rural countryside' },
        { id: 'urban', text: 'Urban city center' },
        { id: 'near_family', text: 'Near family and friends' },
        { id: 'new_country', text: 'A different country' },
        { id: 'coast', text: 'By the ocean' },
        { id: 'nature', text: 'Surrounded by nature' },
      ]
    },
    {
      id: 'teamRole',
      question: "In a group, I'm usually the...",
      category: 'teamRole',
      options: [
        { id: 'leader', text: 'Leader who takes charge' },
        { id: 'organizer', text: 'Organizer who manages details' },
        { id: 'ideas', text: 'Ideas person with creative solutions' },
        { id: 'helper', text: 'Helper who supports others' },
        { id: 'observer', text: 'Quiet observer who thinks deeply' },
      ]
    },
    {
      id: 'careerVibes',
      question: "Which of these sounds most fun?",
      category: 'careerVibes',
      options: [
        { id: 'fixing', text: 'Fixing a car or building something' },
        { id: 'teaching', text: 'Teaching a class or mentoring' },
        { id: 'business', text: 'Starting a business' },
        { id: 'coding', text: 'Coding an app or website' },
        { id: 'caring', text: 'Caring for someone who needs help' },
        { id: 'designing', text: 'Designing or creating art' },
      ]
    },
    {
      id: 'timeCapsule',
      question: "Write a 3-word message to your future self.",
      category: 'timeCapsule',
      isCustomInput: true,
      options: []
    },
    {
      id: 'wildcard',
      question: "If your life were a movie, what would be the title?",
      category: 'wildcard',
      isCustomInput: true,
      options: []
    },
  ];
  
  // Categories for the wheel
  const wheelCategories = [
    'Superpower', 'Ideal Day', 'Values', 'Liked Activities', 'Future Feeling', 
    'Dream Location', 'Team Role', 'Career Vibes', 'Time Capsule', 'Wildcard'
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
    
    // Land on one of the segments
    const segmentSize = 360 / wheelCategories.length;
    const randomSegment = Math.floor(Math.random() * wheelCategories.length);
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
      const categoryValues: WheelPrompt['category'][] = [
        'superpower', 'idealDay', 'values', 'likedActivities', 'futureFeeling', 
        'dreamLocation', 'teamRole', 'careerVibes', 'timeCapsule', 'wildcard'
      ];
      const landedCategory = categoryValues[randomSegment];
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
  
  const handleCustomInputChange = (value: string) => {
    setCustomInputs(prev => ({
      ...prev,
      [currentPrompt.id]: value
    }));
  };
  
  const handleNext = () => {
    // For custom input prompts, transfer the input to selected options
    if (currentPrompt.isCustomInput) {
      setSelectedOptions(prev => ({
        ...prev,
        [currentPrompt.id]: customInputs[currentPrompt.id] || ''
      }));
    }
    
    const answeredQuestions = Object.keys(selectedOptions).length;
    
    // If we've answered all questions
    if (answeredQuestions >= prompts.length - 1) {
      setIsComplete(true);
      onComplete({
        ...selectedOptions,
        // Add any custom inputs not yet in the options
        ...Object.fromEntries(
          Object.entries(customInputs).filter(([key]) => !selectedOptions[key])
        )
      });
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
      case 'superpower': return '💪';
      case 'idealDay': return '🌄';
      case 'values': return '💎';
      case 'likedActivities': return '🎯';
      case 'futureFeeling': return '🔮';
      case 'dreamLocation': return '🏠';
      case 'teamRole': return '👥';
      case 'careerVibes': return '💼';
      case 'timeCapsule': return '⏳';
      case 'wildcard': return '🎭';
      default: return '❓';
    }
  };
  
  const getCategoryTitle = (category: WheelPrompt['category']) => {
    switch (category) {
      case 'superpower': return 'My Superpower';
      case 'idealDay': return 'My Ideal Day';
      case 'values': return 'What I Value';
      case 'likedActivities': return 'What I Like to Do';
      case 'futureFeeling': return 'Future Feelings';
      case 'dreamLocation': return 'Dream Location';
      case 'teamRole': return 'My Role in a Team';
      case 'careerVibes': return 'Career Vibes';
      case 'timeCapsule': return 'Time Capsule';
      case 'wildcard': return 'Wildcard!';
      default: return 'Unknown';
    }
  };
  
  // Determine if we can proceed
  const canProceed = currentPrompt.isCustomInput 
    ? customInputs[currentPrompt.id]?.trim().length > 0 
    : selectedOptions[currentPrompt.id] !== undefined;
  
  // Calculate progress percentage
  const progressPercentage = Math.round((Object.keys(selectedOptions).length / prompts.length) * 100);
  
  if (isComplete) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Your Identity Profile</h2>
          <p className="text-gray-600">Based on your answers, here's what matters to you</p>
        </div>
        
        <div className="space-y-5">
          {prompts.map(prompt => {
            const value = selectedOptions[prompt.id] || '';
            const displayValue = prompt.isCustomInput
              ? value
              : prompt.options.find(o => o.id === value)?.text || 'Not answered';
              
            return (
              <Card key={prompt.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getCategoryEmoji(prompt.category)}</div>
                    <div>
                      <h4 className="font-medium text-lg">{prompt.question}</h4>
                      <p className="text-primary font-medium mt-1">
                        {displayValue}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
                  <div>The wheel will land on a category about your identity</div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center font-bold text-primary">3</div>
                  <div>Answer the question or complete the mini-activity</div>
                </li>
                <li className="flex gap-3">
                  <div className="bg-primary/10 rounded-full w-7 h-7 flex-shrink-0 flex items-center justify-center font-bold text-primary">4</div>
                  <div>Spin again to explore a new aspect of your identity!</div>
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
        <h3 className="text-xl font-semibold mb-2">Spin the Advanced Identity Wheel</h3>
        <p className="text-gray-600 text-sm">
          Discover more about yourself through fun prompts and mini-activities
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
                backgroundImage: 'conic-gradient(from 0deg, #f472b6, #60a5fa, #34d399, #a78bfa, #fbbf24, #f87171, #ec4899, #8b5cf6, #84cc16, #14b8a6)',
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
              {/* Wheel segments - displaying only shortened labels due to space */}
              {wheelCategories.map((label, i) => {
                // Calculate segment angle
                const segmentAngle = 360 / wheelCategories.length;
                const angle = segmentAngle * i;
                
                // Display shorter text on the wheel due to space constraints
                const shortLabel = label.split(' ')[0];
                
                return (
                  <div 
                    key={label} 
                    className="absolute top-1/2 left-1/2 text-white font-bold text-xs transform -translate-x-1/2"
                    style={{ 
                      transform: `rotate(${angle}deg) translate(0, -90px) rotate(-${angle}deg)`,
                    }}
                  >
                    {shortLabel}
                  </div>
                );
              })}
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
                  
                  {currentPrompt.isCustomInput ? (
                    <div className="space-y-2">
                      <Input
                        placeholder={currentPrompt.category === 'timeCapsule' ? 'Dream, Believe, Achieve' : 'Type your answer here...'}
                        value={customInputs[currentPrompt.id] || ''}
                        onChange={(e) => handleCustomInputChange(e.target.value)}
                        className="w-full"
                      />
                      {currentPrompt.category === 'timeCapsule' && (
                        <p className="text-xs text-gray-500">
                          What would you want to tell your future self? Just 3 meaningful words.
                        </p>
                      )}
                    </div>
                  ) : (
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
                  )}
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