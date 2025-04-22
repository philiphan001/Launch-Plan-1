import { useState, useEffect } from 'react';
import { WheelOption } from '@/data/identityWheelOptions';
import { useSounds } from './useSounds';

interface UseIdentityWheelProps {
  options: WheelOption[];
  resetKey?: number;
  onComplete?: (results: Record<string, string[]>) => void;
}

export const useIdentityWheel = ({ options, resetKey = 0, onComplete }: UseIdentityWheelProps) => {
  const [spinning, setSpinning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<WheelOption | null>(null);
  const [response, setResponse] = useState('');
  const [completedOptions, setCompletedOptions] = useState<Record<string, string[]>>({});
  const [remainingOptions, setRemainingOptions] = useState<WheelOption[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  
  const { playSpin, playClick, playWinning } = useSounds();
  
  // Initialize remaining options
  useEffect(() => {
    setRemainingOptions([...options]);
  }, [options]);
  
  // Reset state when resetKey changes
  useEffect(() => {
    setSpinning(false);
    setSelectedOption(null);
    setResponse('');
    setCompletedOptions({});
    setRemainingOptions([...options]);
    setShowPrompt(false);
    setCurrentPromptIndex(0);
  }, [resetKey, options]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setSpinning(false);
      setSelectedOption(null);
      setResponse('');
      setCompletedOptions({});
      setRemainingOptions([]);
      setShowPrompt(false);
      setCurrentPromptIndex(0);
    };
  }, []);
  
  const spinWheel = () => {
    if (spinning || remainingOptions.length === 0) return;
    
    setSpinning(true);
    playSpin();
    
    // Select a random option from remaining options
    const randomIndex = Math.floor(Math.random() * remainingOptions.length);
    const selected = remainingOptions[randomIndex];
    
    // Update remaining options
    const newRemainingOptions = remainingOptions.filter(opt => opt.id !== selected.id);
    setRemainingOptions(newRemainingOptions);
    
    // After animation completes, show the prompt
    setTimeout(() => {
      setSpinning(false);
      setSelectedOption(selected);
      setShowPrompt(true);
      setCurrentPromptIndex(0);
      playClick();
    }, 2000);
  };
  
  const handleResponseSubmit = () => {
    if (!selectedOption || !response.trim()) return;
    
    const newResponses = [...(completedOptions[selectedOption.id] || []), response.trim()];
    setCompletedOptions(prev => ({
      ...prev,
      [selectedOption.id]: newResponses
    }));
    
    setResponse('');
    
    // Move to next prompt or complete the option
    if (currentPromptIndex < selectedOption.prompts.length - 1) {
      setCurrentPromptIndex(prev => prev + 1);
    } else {
      setShowPrompt(false);
      setSelectedOption(null);
      
      // Check if all options are completed
      if (remainingOptions.length === 0) {
        playWinning();
        onComplete?.(completedOptions);
      }
    }
  };
  
  const handleSkip = () => {
    if (!selectedOption) return;
    
    // Move to next prompt or complete the option
    if (currentPromptIndex < selectedOption.prompts.length - 1) {
      setCurrentPromptIndex(prev => prev + 1);
    } else {
      setShowPrompt(false);
      setSelectedOption(null);
      
      // Check if all options are completed
      if (remainingOptions.length === 0) {
        playWinning();
        onComplete?.(completedOptions);
      }
    }
  };
  
  const handleFinish = () => {
    if (Object.keys(completedOptions).length > 0) {
      playWinning();
      onComplete?.(completedOptions);
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
}; 