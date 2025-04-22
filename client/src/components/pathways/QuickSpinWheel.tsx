import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuickSpin } from '@/hooks/useQuickSpin';
import { quickWheelOptions } from '@/data/quickWheelOptions';

interface QuickSpinWheelProps {
  onComplete: (results: Record<string, string>) => void;
  resetKey?: number;
}

const QuickSpinWheel = ({ onComplete, resetKey = 0 }: QuickSpinWheelProps) => {
  const {
    spinning,
    selectedOption,
    response,
    completedOptions,
    remainingOptions,
    showPrompt,
    currentPromptIndex,
    setResponse,
    spinWheel,
    handleResponseSubmit,
    handleSkip,
    handleFinish
  } = useQuickSpin({
    options: quickWheelOptions,
    resetKey,
    onComplete: (results: Record<string, string[]>) => {
      // Convert the results to the expected format
      const formattedResults = Object.entries(results).reduce((acc, [key, responses]) => {
        acc[key] = responses.join(' | ');
        return acc;
      }, {} as Record<string, string>);
      onComplete(formattedResults);
    }
  });
  
  const calculateRotation = () => {
    return spinning ? 1440 + Math.random() * 360 : 0;
  };
  
  const getSegmentColors = () => {
    const segmentCount = quickWheelOptions.length;
    const segmentSize = 360 / segmentCount;
    
    return quickWheelOptions.map((option, index) => {
      const start = index * segmentSize;
      return `${option.color} ${start}deg ${start + segmentSize}deg`;
    }).join(', ');
  };
  
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Quick Identity Spin</h2>
      
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
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Your Responses</h3>
                  <div className="space-y-2">
                    {Object.entries(completedOptions).map(([id, responses]) => {
                      const option = quickWheelOptions.find(opt => opt.id === id);
                      return (
                        <div key={id} className="border-b pb-2 last:border-0">
                          <div className="font-medium" style={{ color: option?.color }}>
                            {option?.label}
                          </div>
                          <div className="text-sm text-gray-600">
                            {responses.join(' | ')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="text-lg font-semibold" style={{ color: selectedOption?.color }}>
                  {selectedOption?.label}
                </div>
                <p className="text-gray-600 mt-2">
                  {selectedOption?.prompts[currentPromptIndex]}
                </p>
              </div>
              
              <Input
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response..."
                className="mb-4"
              />
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
                
                <Button
                  onClick={handleResponseSubmit}
                  disabled={!response.trim()}
                >
                  {currentPromptIndex < (selectedOption?.prompts.length || 0) - 1 ? 'Next' : 'Complete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuickSpinWheel;