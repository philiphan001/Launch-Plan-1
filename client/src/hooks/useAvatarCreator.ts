import { useState, useEffect } from 'react';
import { 
  AvatarAttributes, 
  WorkLifeBalance, 
  Reflections,
  defaultAttributes,
  defaultWorkLifeBalance,
  defaultReflections
} from '@/data/avatarOptions';

interface UseAvatarCreatorProps {
  resetKey?: number;
  onComplete?: (results: Record<string, string>) => void;
}

export function useAvatarCreator({ resetKey = 0, onComplete }: UseAvatarCreatorProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [avatarName, setAvatarName] = useState('');
  const [futureTitle, setFutureTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [completion, setCompletion] = useState({
    step1: 0,
    step2: 0,
    step3: 0
  });
  const [workLifeBalance, setWorkLifeBalance] = useState<WorkLifeBalance>(defaultWorkLifeBalance);
  const [attributes, setAttributes] = useState<AvatarAttributes>(defaultAttributes);
  const [reflections, setReflections] = useState<Reflections>(defaultReflections);
  
  // Reset state when resetKey changes
  useEffect(() => {
    console.log('useAvatarCreator: resetKey changed to', resetKey);
    setCurrentStep(1);
    setAvatarName('');
    setFutureTitle('');
    setError(null);
    setSuccess(null);
    setWorkLifeBalance(defaultWorkLifeBalance);
    setAttributes(defaultAttributes);
    setReflections(defaultReflections);
  }, [resetKey]);
  
  // Calculate completion percentage for each step
  useEffect(() => {
    // Step 1 completion: Avatar name + future title + attributes
    const step1Items = 2 + Object.keys(attributes).length;
    const step1Completed = (avatarName ? 1 : 0) + (futureTitle ? 1 : 0) + Object.keys(attributes).length;
    const step1Percentage = Math.round((step1Completed / step1Items) * 100);
    
    // Step 2 completion: Values + lifestyle + work-life balance settings
    const step2Items = 2 + Object.keys(workLifeBalance).length;
    const step2Completed = 2 + Object.keys(workLifeBalance).length; // These are always selected
    const step2Percentage = Math.round((step2Completed / step2Items) * 100);
    
    // Step 3 completion: Reflections
    const step3Items = Object.keys(reflections).length;
    const step3Completed = Object.values(reflections).filter(v => v.trim().length > 0).length;
    const step3Percentage = Math.round((step3Completed / step3Items) * 100);
    
    setCompletion({
      step1: step1Percentage,
      step2: step2Percentage,
      step3: step3Percentage
    });
  }, [avatarName, futureTitle, attributes, workLifeBalance, reflections]);
  
  const handleAttributeChange = (category: keyof AvatarAttributes, value: string) => {
    setAttributes(prev => ({
      ...prev,
      [category]: value
    }));
    setError(null);
  };
  
  const handleReflectionChange = (field: keyof Reflections, value: string) => {
    setReflections(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };
  
  const handleWorkLifeBalanceChange = (field: keyof WorkLifeBalance, value: number) => {
    setWorkLifeBalance(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const validateCurrentStep = (): boolean => {
    setError(null);
    setSuccess(null);
    
    if (currentStep === 1) {
      if (!avatarName.trim()) {
        setError("Please give your avatar a name before continuing");
        return false;
      }
      setSuccess("Avatar basic profile complete!");
      return true;
    } 
    else if (currentStep === 2) {
      setSuccess("Values and lifestyle preferences saved!");
      return true;
    }
    else if (currentStep === 3) {
      const filledFields = Object.values(reflections).filter(value => value.trim().length > 0).length;
      
      if (filledFields < 3) {
        setError("Please fill in at least 3 reflection fields to complete your avatar");
        return false;
      }
      
      setSuccess("Future self reflections complete!");
      return true;
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        const results: Record<string, string> = {
          avatar_name: avatarName,
          future_title: futureTitle || 'Future Professional',
          avatar_style: attributes.style,
          avatar_hair: `${attributes.hairColor}-${attributes.hairStyle}`,
          avatar_outfit: attributes.outfit,
          avatar_accessory: attributes.accessory,
          avatar_location: attributes.location,
          avatar_occupation: attributes.occupation,
          avatar_personality: attributes.personality,
          avatar_values: attributes.values,
          avatar_lifestyle: attributes.lifestyle,
          avatar_work_life_balance: workLifeBalance.workLifeBalance.toString(),
          avatar_risk_tolerance: workLifeBalance.riskTolerance.toString(),
          avatar_team_preference: workLifeBalance.teamPreference.toString(),
          reflection_work_attire: reflections.workAttire || 'Professional attire appropriate for my field',
          reflection_living_location: reflections.livingLocation || 'A comfortable place that fits my lifestyle',
          reflection_weekend: reflections.weekendActivity || 'Activities that help me recharge and grow',
          reflection_routine: reflections.dailyRoutine || 'A balanced day of productive work and personal time',
          reflection_aspiration: reflections.biggestAspiration || 'To succeed in my chosen field and find fulfillment'
        };
        
        if (onComplete) {
          onComplete(results);
        }
      } catch (err) {
        console.error('Error creating avatar data:', err);
        setError('An error occurred while saving your avatar. Please try again.');
      }
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
      setSuccess(null);
    }
  };
  
  return {
    currentStep,
    avatarName,
    futureTitle,
    error,
    success,
    completion,
    workLifeBalance,
    attributes,
    reflections,
    setAvatarName,
    setFutureTitle,
    handleAttributeChange,
    handleReflectionChange,
    handleWorkLifeBalanceChange,
    handleNext,
    handleBack
  };
} 