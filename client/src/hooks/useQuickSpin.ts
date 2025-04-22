import { useState, useEffect } from 'react';
import { useSounds } from './useSounds';
import { WheelOption } from '@/data/quickWheelOptions';

interface UseQuickSpinProps {
  options: WheelOption[];
  resetKey?: number;
  onComplete?: (results: Record<string, string[]>) => void;
}

export function useQuickSpin({ options, resetKey = 0, onComplete }: UseQuickSpinProps) {
  const [spinning, setSpinning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<WheelOption | null>(null);
  const [response, setResponse] = useState('');
  const [completedOptions, setCompletedOptions] = useState<Record<string, string[]>>({});
  const [remainingOptions, setRemainingOptions] = useState<WheelOption[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  // Get sound functions from our custom hook
  const { playClick, playSpin, playWinning, startTicking, stopTicking } = useSounds();
  
  // Initialize remaining options
  useEffect(() => {
    setRemainingOptions([...options]);
  }, [options]);
  
  // Reset state when resetKey changes
  useEffect(() => {
    console.log('useQuickSpin: resetKey changed to', resetKey);
    setSpinning(false);
    setSelectedOption(null);
    setResponse('');
    setCompletedOptions({});
    setRemainingOptions([...options]);
    setShowPrompt(false);
    setCurrentPromptIndex(0);
    
    // Stop any ongoing sounds when component resets
    stopTicking();
    
    // Force a repaint of the component with a small delay
    const timer = setTimeout(() => {
      console.log('useQuickSpin: Delayed reset complete');
    }, 50);
    
    return () => {
      clearTimeout(timer);
      stopTicking(); // Make sure to stop sounds on cleanup
    };
  }, [resetKey, options, stopTicking]);
  
  // Make sure to stop all sounds when component unmounts
  useEffect(() => {
    return () => {
      console.log('useQuickSpin: Unmounting, cleaning up sounds');
      stopTicking();
    };
  }, [stopTicking]);
  
  const spinWheel = () => {
    if (spinning || remainingOptions.length === 0) return;
    
    // Play initial click sound when button is pressed
    playClick();
    
    // Start spinning process
    setSpinning(true);
    setShowPrompt(false);
    
    // Play the continuous spin sound
    playSpin();
    
    // Start the ticking sound that speeds up as the wheel spins
    // Start with a slower interval that speeds up
    setTimeout(() => startTicking(150), 300);
    setTimeout(() => startTicking(100), 800);
    setTimeout(() => startTicking(50), 1300);
    
    // Select a random option from remaining options
    const randomIndex = Math.floor(Math.random() * remainingOptions.length);
    const selected = remainingOptions[randomIndex];
    
    // After "spinning" is done
    setTimeout(() => {
      // Stop the ticking sound
      stopTicking();
      
      // Play the winning sound
      playWinning();
      
      // Update the UI
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
    
    // Play click sound when button is pressed
    playClick();
    
    // Store response
    const updatedResponses = {
      ...completedOptions,
      [selectedOption.id]: completedOptions[selectedOption.id] 
        ? [...completedOptions[selectedOption.id], response]
        : [response]
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
        // Play winning sound when completing all questions
        playWinning();
        if (onComplete) {
          onComplete(updatedResponses);
        }
      } else {
        // Reset for next spin
        setSelectedOption(null);
        setShowPrompt(false);
      }
    }
  };
  
  const handleSkip = () => {
    // Play click sound when skipping
    playClick();
    
    if (remainingOptions.length === 0) {
      if (onComplete) {
        onComplete(completedOptions);
      }
    } else {
      // Reset for next spin
      setSelectedOption(null);
      setShowPrompt(false);
    }
  };
  
  const handleFinish = () => {
    // Play click sound when finishing
    playClick();
    // Also play a winning sound for completion
    setTimeout(() => playWinning(), 300);
    
    if (onComplete) {
      onComplete(completedOptions);
    }
  };
  
  return {
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
  };
} 