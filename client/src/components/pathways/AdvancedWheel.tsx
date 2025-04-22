import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useWheelSpin } from '@/hooks/useWheelSpin';
import { prompts, wheelCategories, type WheelPrompt, type WheelPromptCategory } from '@/data/wheelPrompts';

interface AdvancedWheelProps {
  onComplete: (results: Record<string, string>) => void;
  resetKey?: number;
}

export default function AdvancedWheel({ onComplete, resetKey = 0 }: AdvancedWheelProps) {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [category, setCategory] = useState<WheelPromptCategory | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const {
    isSpinning,
    rotation,
    wheelRef,
    spinWheel
  } = useWheelSpin({
    resetKey,
    onSpinComplete: (selectedCategory) => {
      setCategory(selectedCategory.toLowerCase() as WheelPromptCategory);
      setShowPrompt(true);
    }
  });
  
  // Find a prompt for current category or use default
  const currentPrompt = category 
    ? prompts.find(p => p.category === category && !selectedOptions[p.id]) || prompts[currentPromptIndex]
    : prompts[currentPromptIndex];
  
  const handleOptionSelect = (value: string) => {
    if (!currentPrompt) return;
    setSelectedOptions(prev => ({ ...prev, [currentPrompt.id]: value }));
  };
  
  const handleCustomInputChange = (value: string) => {
    if (!currentPrompt) return;
    setCustomInputs(prev => ({ ...prev, [currentPrompt.id]: value }));
  };
  
  const handleNext = () => {
    if (!currentPrompt) return;
    
    // Check if we have a valid selection
    const hasSelection = currentPrompt.isCustomInput 
      ? customInputs[currentPrompt.id]?.trim()
      : selectedOptions[currentPrompt.id];
      
    if (!hasSelection) return;
    
    // Move to next prompt
    const nextIndex = currentPromptIndex + 1;
    if (nextIndex >= prompts.length) {
      setIsComplete(true);
      onComplete({
        ...selectedOptions,
        ...customInputs
      });
    } else {
      setCurrentPromptIndex(nextIndex);
      setShowPrompt(false);
      setCategory(null);
      // Spin the wheel again for the next question
      spinWheel(wheelCategories);
    }
  };
  
  const getCategoryEmoji = (category: WheelPromptCategory) => {
    switch (category) {
      case 'superpower': return '💪';
      case 'idealDay': return '🌟';
      case 'values': return '❤️';
      case 'likedActivities': return '🎯';
      case 'futureFeeling': return '🔮';
      case 'dreamLocation': return '🏠';
      case 'teamRole': return '👥';
      case 'careerVibes': return '💼';
      case 'timeCapsule': return '⏳';
      case 'wildcard': return '🎲';
      default: return '❓';
    }
  };
  
  const getCategoryTitle = (category: WheelPromptCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      {showInstructions ? (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Advanced Wheel</h2>
            <p className="mb-4">
              Spin the wheel to explore different aspects of your personality and preferences.
              Each spin will reveal a new question to help us understand you better.
            </p>
            <Button 
              onClick={() => {
                setShowInstructions(false);
                spinWheel(wheelCategories);
              }}
              className="w-full"
            >
              Start Spinning
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="relative w-64 h-64 mb-8">
            {/* The pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-b-[20px] border-l-transparent border-r-transparent border-b-primary"></div>
            </div>
            
            {/* The wheel */}
            <div 
              ref={wheelRef}
              className="absolute w-full h-full rounded-full border-4 border-primary shadow-lg overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)' : 'none',
                backgroundImage: 'conic-gradient(from 0deg, #f472b6, #60a5fa, #34d399, #a78bfa, #fbbf24, #f87171, #ec4899, #8b5cf6, #84cc16, #14b8a6)'
              }}
            >
              {/* Wheel segments */}
              {wheelCategories.map((cat, index) => {
                const angle = (360 / wheelCategories.length) * index;
                return (
                  <div
                    key={cat}
                    className="absolute w-full h-full"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: '50% 50%'
                    }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-transparent border-b-white" />
                    <div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 text-white font-bold text-xs"
                      style={{
                        transform: `rotate(${angle}deg) translate(0, -90px) rotate(-${angle}deg)`
                      }}
                    >
                      {cat.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <AnimatePresence>
            {showPrompt && currentPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-md"
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{getCategoryEmoji(currentPrompt.category)}</span>
                      <h3 className="text-xl font-semibold">{getCategoryTitle(currentPrompt.category)}</h3>
                    </div>
                    
                    <p className="mb-4">{currentPrompt.question}</p>
                    
                    {currentPrompt.isCustomInput ? (
                      <Input
                        value={customInputs[currentPrompt.id] || ''}
                        onChange={(e) => handleCustomInputChange(e.target.value)}
                        placeholder="Type your answer..."
                        className="mb-4"
                      />
                    ) : (
                      <RadioGroup
                        value={selectedOptions[currentPrompt.id] || ''}
                        onValueChange={handleOptionSelect}
                        className="mb-4"
                      >
                        {currentPrompt.options.map(option => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id}>{option.text}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    <Button 
                      onClick={handleNext}
                      className="w-full"
                      disabled={!selectedOptions[currentPrompt.id] && !customInputs[currentPrompt.id]}
                    >
                      Next
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Progress 
            value={(currentPromptIndex / prompts.length) * 100} 
            className="w-full max-w-md"
          />
        </>
      )}
    </div>
  );
}