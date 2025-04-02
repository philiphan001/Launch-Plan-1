import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface WheelOption {
  id: string;
  label: string;
  prompts: string[];
  color: string;
}

interface SpinWheelProps {
  title?: string;
  options: WheelOption[];
  onComplete: (results: Record<string, string>) => void;
}

const SpinWheel = ({ 
  title = "Spin the Wheel of Identity", 
  options, 
  onComplete 
}: SpinWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<WheelOption | null>(null);
  const [response, setResponse] = useState('');
  const [completedOptions, setCompletedOptions] = useState<Record<string, string>>({});
  const [remainingOptions, setRemainingOptions] = useState<WheelOption[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Initialize remaining options
  useEffect(() => {
    setRemainingOptions([...options]);
  }, [options]);

  const spinWheel = () => {
    if (spinning || remainingOptions.length === 0) return;
    
    setSpinning(true);
    setShowPrompt(false);
    
    // Select a random option from remaining options
    const randomIndex = Math.floor(Math.random() * remainingOptions.length);
    const selected = remainingOptions[randomIndex];
    
    // After "spinning" is done
    setTimeout(() => {
      setSelectedOption(selected);
      setSpinning(false);
      setShowPrompt(true);
      setCurrentPromptIndex(0);
      
      // Remove the selected option from remaining options
      const updatedOptions = remainingOptions.filter(opt => opt.id !== selected.id);
      setRemainingOptions(updatedOptions);
    }, 2000);
  };

  const handleResponseSubmit = () => {
    if (!selectedOption) return;
    
    // Store response
    const updatedResponses = {
      ...completedOptions,
      [selectedOption.id]: response
    };
    
    setCompletedOptions(updatedResponses);
    setResponse('');
    
    // Check if we've gone through all prompts for this option
    if (currentPromptIndex < selectedOption.prompts.length - 1) {
      // Move to next prompt
      setCurrentPromptIndex(currentPromptIndex + 1);
    } else {
      // If no more options, complete the activity
      if (remainingOptions.length === 0) {
        onComplete(updatedResponses);
      } else {
        // Reset for next spin
        setSelectedOption(null);
        setShowPrompt(false);
      }
    }
  };

  const calculateRotation = () => {
    return spinning ? 1440 + Math.random() * 360 : 0;
  };

  const getSegmentColors = () => {
    const segmentCount = options.length;
    const segmentSize = 360 / segmentCount;
    
    return options.map((option, index) => {
      const start = index * segmentSize;
      return `${option.color} ${start}deg ${start + segmentSize}deg`;
    }).join(', ');
  };

  const handleSkip = () => {
    if (remainingOptions.length === 0) {
      onComplete(completedOptions);
    } else {
      // Reset for next spin
      setSelectedOption(null);
      setShowPrompt(false);
    }
  };

  const handleFinish = () => {
    onComplete(completedOptions);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      {!showPrompt ? (
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-8">
            {/* Wheel */}
            <motion.div
              animate={{ rotate: calculateRotation() }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="w-64 h-64 rounded-full shadow-xl overflow-hidden relative"
              style={{ 
                background: `conic-gradient(${getSegmentColors()})`,
                transform: 'rotate(0deg)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center">
                  <span className="text-xl">🎡</span>
                </div>
              </div>
            </motion.div>
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-t-red-600 border-l-transparent border-r-transparent" />
            </div>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">
              {remainingOptions.length > 0 
                ? `${remainingOptions.length} categories remaining` 
                : 'All categories completed!'}
            </p>
            
            <Button 
              onClick={spinWheel} 
              disabled={spinning || remainingOptions.length === 0}
              className="bg-primary hover:bg-primary-dark"
            >
              {spinning ? 'Spinning...' : remainingOptions.length > 0 ? 'SPIN THE WHEEL' : 'COMPLETED'}
            </Button>
            
            {Object.keys(completedOptions).length > 0 && (
              <Button 
                variant="outline" 
                className="ml-2" 
                onClick={handleFinish}
              >
                Finish Early
              </Button>
            )}
          </div>
          
          {/* Results Summary */}
          {Object.keys(completedOptions).length > 0 && (
            <div className="w-full max-w-md mt-4">
              <h3 className="text-lg font-medium mb-2">Your Responses:</h3>
              <ul className="space-y-2">
                {Object.keys(completedOptions).map(optionId => {
                  const option = options.find(o => o.id === optionId);
                  return (
                    <li key={optionId} className="flex">
                      <span className="font-medium mr-2">{option?.label}:</span>
                      <span className="text-gray-600 truncate">{completedOptions[optionId]}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div 
                className="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white" 
                style={{ backgroundColor: selectedOption?.color || 'bg-primary' }}
              >
                <span>{"🎯"}</span>
              </div>
              <h3 className="text-xl font-bold">{selectedOption?.label}</h3>
            </div>
            
            <p className="text-gray-700 mb-4">{selectedOption?.prompts[currentPromptIndex]}</p>
            
            <Input
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your response here..."
              className="w-full mb-2"
            />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleSkip}>
              Skip
            </Button>
            <Button onClick={handleResponseSubmit} disabled={!response.trim()}>
              {currentPromptIndex < (selectedOption?.prompts.length || 0) - 1 ? 'Next Prompt' : 'Save Response'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default SpinWheel;