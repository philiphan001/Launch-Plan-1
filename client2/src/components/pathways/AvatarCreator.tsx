import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AvatarCreatorProps {
  onComplete: (results: Record<string, string>) => void;
  resetKey?: number; // Add reset key prop for forcing re-mount
}

export interface AvatarAttributes {
  style: string;
  hairColor: string;
  hairStyle: string;
  outfit: string;
  accessory: string;
  location: string;
  occupation: string;
  personality: string;
  values: string;
  lifestyle: string;
}

interface WorkLifeBalance {
  workLifeBalance: number;
  riskTolerance: number;
  teamPreference: number;
}

const AvatarCreator = ({ onComplete, resetKey = 0 }: AvatarCreatorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [avatarName, setAvatarName] = useState('');
  const [futureTitle, setFutureTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [completion, setCompletion] = useState({
    step1: 0, // 0-100 percentage
    step2: 0,
    step3: 0
  });
  const [workLifeBalance, setWorkLifeBalance] = useState<WorkLifeBalance>({
    workLifeBalance: 50,
    riskTolerance: 50,
    teamPreference: 50
  });
  const [attributes, setAttributes] = useState<AvatarAttributes>({
    style: 'anime',
    hairColor: 'black',
    hairStyle: 'spiky',
    outfit: 'schoolUniform',
    accessory: 'headphones',
    location: 'city',
    occupation: 'tech',
    personality: 'creative',
    values: 'family',
    lifestyle: 'balanced'
  });
  const [reflections, setReflections] = useState({
    workAttire: '',
    livingLocation: '',
    weekendActivity: '',
    dailyRoutine: '',
    biggestAspiration: ''
  });
  
  // DOM reference for scrolling to errors
  const errorRef = useRef<HTMLDivElement>(null);
  
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
  
  // Scroll to error message when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [error]);
  
  // Reset state when resetKey changes
  useEffect(() => {
    console.log('AvatarCreator: resetKey changed to', resetKey);
    // Reset all component state
    setCurrentStep(1);
    setAvatarName('');
    setFutureTitle('');
    setError(null);
    setSuccess(null);
    setWorkLifeBalance({
      workLifeBalance: 50,
      riskTolerance: 50,
      teamPreference: 50
    });
    setAttributes({
      style: 'anime',
      hairColor: 'black',
      hairStyle: 'spiky',
      outfit: 'schoolUniform',
      accessory: 'headphones',
      location: 'city',
      occupation: 'tech',
      personality: 'creative',
      values: 'family',
      lifestyle: 'balanced'
    });
    setReflections({
      workAttire: '',
      livingLocation: '',
      weekendActivity: '',
      dailyRoutine: '',
      biggestAspiration: ''
    });
    
    // Force a repaint of the component with a small delay
    const timer = setTimeout(() => {
      console.log('AvatarCreator: Delayed reset complete');
    }, 50);
    
    return () => clearTimeout(timer);
  }, [resetKey]);

  const handleAttributeChange = (category: keyof AvatarAttributes, value: string) => {
    setAttributes({
      ...attributes,
      [category]: value
    });
    // Clear any errors when user makes changes
    setError(null);
  };

  const handleReflectionChange = (field: keyof typeof reflections, value: string) => {
    setReflections({
      ...reflections,
      [field]: value
    });
    // Clear any errors when user makes changes
    setError(null);
  };
  
  const handleWorkLifeBalanceChange = (field: keyof WorkLifeBalance, value: number) => {
    setWorkLifeBalance({
      ...workLifeBalance,
      [field]: value
    });
  };
  
  // Validate the current step before proceeding
  const validateCurrentStep = (): boolean => {
    setError(null);
    setSuccess(null);
    
    if (currentStep === 1) {
      // Validate step 1 - at least name is required
      if (!avatarName.trim()) {
        setError("Please give your avatar a name before continuing");
        return false;
      }
      
      setSuccess("Avatar basic profile complete!");
      return true;
    } 
    else if (currentStep === 2) {
      // All fields are pre-selected, so validation always passes
      setSuccess("Values and lifestyle preferences saved!");
      return true;
    }
    else if (currentStep === 3) {
      // Require at least 3 reflection fields to be filled
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
    // Validate the current step first
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        // Create a more comprehensive avatar data with personal details
        // Add a catch block for any potential errors during this process
        
        // Convert our avatar and reflections to a format compatible with other exploration methods
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
        
        // Call the onComplete callback with our complete results
        onComplete(results);
      } catch (err) {
        console.error('Error creating avatar data:', err);
        setError('There was a problem saving your avatar. Please try again.');
      }
    }
  };

  const handleBack = () => {
    // Clear any errors or success messages when navigating between steps
    setError(null);
    setSuccess(null);
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Generate anime style avatar SVG based on selected attributes
  const renderAvatar = () => {
    return (
      <div className="relative w-64 h-64 mx-auto">
        {/* Background circle with gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-gray-100 shadow-lg" />
        
        {/* Head */}
        <div className="absolute w-48 h-48 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Face base with better skin tone and shading */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFE0BD] to-[#FFD1A1]">
            {/* Subtle face shading */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent" />
          </div>

          {/* Hair */}
          <div className={`absolute inset-0 ${getHairColorClass()}`}>
            {getHairStyle()}
          </div>

          {/* Face features */}
          <div className="absolute inset-0">
            {/* Eyes with better positioning and style */}
            <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center space-x-8">
              {getEyeStyle()}
            </div>
            
            {/* Mouth with better positioning */}
            <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2">
              {getMouthStyle()}
            </div>
          </div>

          {/* Accessories (glasses, etc) with better positioning */}
          {attributes.accessory !== 'none' && (
            <div className="absolute inset-0">
              {getAccessoryElement()}
            </div>
          )}
        </div>

        {/* Outfit/Clothing with better positioning and style */}
        <div className="absolute bottom-0 left-0 right-0">
          {getOutfitSvg()}
        </div>
      </div>
    );
  };

  const getHairStyle = () => {
    const baseClasses = `absolute inset-0`;
    
    switch (attributes.hairStyle) {
      case 'short':
        return (
          <div className={baseClasses}>
            <div className="absolute -top-4 -left-4 -right-4 h-32 rounded-t-[3rem] shadow-lg" />
          </div>
        );
      case 'long':
        return (
          <div className={baseClasses}>
            <div className="absolute -top-4 -left-6 -right-6 h-64">
              <div className="w-full h-32 rounded-t-[3rem] shadow-lg" />
              <div className="relative h-32">
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 h-full rounded-bl-3xl transform -skew-x-12 shadow-lg" />
                  <div className="w-1/2 h-full rounded-br-3xl transform skew-x-12 shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        );
      case 'spiky':
        return (
          <div className={baseClasses}>
            <div className="absolute -top-6 -left-6 -right-6 h-32">
              <div className="w-full h-full flex justify-between">
                {[...Array(11)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-4 transform rounded-t-lg shadow-lg"
                    style={{
                      height: `${70 + Math.sin(i * 0.7) * 30}%`,
                      transform: `rotate(${-25 + i * 5}deg)`,
                      transformOrigin: 'bottom'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 'twintails':
        return (
          <div className={baseClasses}>
            <div className="absolute -top-4 -left-6 -right-6 h-64">
              <div className="w-full h-32 rounded-t-[3rem] shadow-lg" />
              <div className="relative h-32 flex justify-between -mt-4">
                <div className="w-16 h-48 transform -rotate-12 -translate-x-6">
                  <div className="w-full h-full rounded-b-full shadow-lg" />
                </div>
                <div className="w-16 h-48 transform rotate-12 translate-x-6">
                  <div className="w-full h-full rounded-b-full shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={baseClasses}>
            <div className="absolute -top-4 -left-4 -right-4 h-32 rounded-t-[3rem] shadow-lg" />
          </div>
        );
    }
  };

  const getEyeStyle = () => {
    switch (attributes.personality) {
      case 'creative':
        return (
          <>
            <div className="w-8 h-8 rounded-full bg-black shadow-inner flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white shadow-sm relative">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-black shadow-inner flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white shadow-sm relative">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
          </>
        );
      case 'analytical':
        return (
          <div className="relative">
            <div className="flex space-x-8">
              <div className="w-8 h-8 rounded-full bg-black shadow-inner flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white" />
              </div>
              <div className="w-8 h-8 rounded-full bg-black shadow-inner flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white" />
              </div>
            </div>
            {attributes.accessory === 'glasses' && (
              <div className="absolute -inset-x-8 -inset-y-4">
                <div className="w-full h-full border-2 border-gray-700 rounded-lg shadow-md" />
              </div>
            )}
          </div>
        );
      default:
        return (
          <>
            <div className="w-8 h-8 rounded-full bg-black shadow-inner flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white" />
            </div>
            <div className="w-8 h-8 rounded-full bg-black shadow-inner flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white" />
            </div>
          </>
        );
    }
  };

  const getMouthStyle = () => {
    const baseClasses = "relative flex justify-center";
    
    switch (attributes.personality) {
      case 'creative':
        return (
          <div className={`${baseClasses} w-16 h-6`}>
            <div className="absolute inset-x-0 h-4 border-t-4 border-black rounded-t-full transform translate-y-1" />
          </div>
        );
      case 'analytical':
        return (
          <div className={`${baseClasses} w-12`}>
            <div className="h-1 w-full bg-black rounded-full" />
          </div>
        );
      case 'social':
        return (
          <div className={`${baseClasses} w-16 h-6`}>
            <div className="absolute inset-x-0 h-5 border-t-4 border-black rounded-t-[100%]" />
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} w-12 h-4`}>
            <div className="absolute inset-x-0 h-3 border-t-4 border-black rounded-t-md" />
          </div>
        );
    }
  };

  const getOutfitSvg = () => {
    const baseClass = "absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-all duration-300";
    const colorClass = getOutfitColor(attributes.outfit);
    
    switch (attributes.outfit) {
      case 'schoolUniform':
        return (
          <div className={`${baseClass} ${colorClass}`}>
            <svg viewBox="0 0 100 100" className="w-64 h-48">
              <path d="M20,40 L80,40 L80,100 L20,100 Z" className="fill-current" />
              <path d="M30,45 L70,45 L70,55 L30,55 Z" className="fill-white" />
              <path d="M35,40 C35,30 50,25 50,25 C50,25 65,30 65,40" className="fill-none stroke-white stroke-2" />
            </svg>
          </div>
        );
      case 'business':
        return (
          <div className={`${baseClass} ${colorClass}`}>
            <svg viewBox="0 0 100 100" className="w-64 h-48">
              <path d="M20,40 L80,40 L80,100 L20,100 Z" className="fill-current" />
              <path d="M30,40 L50,30 L70,40" className="fill-white" />
              <path d="M45,50 L55,50 M45,60 L55,60" className="stroke-white stroke-2" />
            </svg>
          </div>
        );
      case 'casual':
        return (
          <div className={`${baseClass} ${colorClass}`}>
            <svg viewBox="0 0 100 100" className="w-64 h-48">
              <path d="M20,40 L80,40 L80,100 L20,100 Z" className="fill-current" />
              <circle cx="50" cy="50" r="8" className="fill-white" />
              <path d="M35,70 L65,70" className="stroke-white stroke-2" />
            </svg>
          </div>
        );
      case 'athletic':
        return (
          <div className={`${baseClass} ${colorClass}`}>
            <svg viewBox="0 0 100 100" className="w-64 h-48">
              <path d="M20,40 L80,40 L80,100 L20,100 Z" className="fill-current" />
              <path d="M30,45 L45,60 L55,45 L70,60" className="stroke-white stroke-3 fill-none" />
            </svg>
          </div>
        );
      case 'creative':
        return (
          <div className={`${baseClass} ${colorClass}`}>
            <svg viewBox="0 0 100 100" className="w-64 h-48">
              <path d="M20,40 L80,40 L80,100 L20,100 Z" className="fill-current" />
              <path d="M30,45 Q50,35 70,45" className="fill-none stroke-white stroke-3" />
              <path d="M35,60 Q50,50 65,60" className="fill-none stroke-white stroke-2" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${baseClass} ${colorClass}`}>
            <svg viewBox="0 0 100 100" className="w-64 h-48">
              <path d="M20,40 L80,40 L80,100 L20,100 Z" className="fill-current" />
              <path d="M30,45 L70,45 L70,55 L30,55 Z" className="fill-white" />
            </svg>
          </div>
        );
    }
  };

  const getOutfitColor = (outfit: string) => {
    switch (outfit) {
      case 'schoolUniform':
        return 'text-blue-600';
      case 'businessCasual':
        return 'text-gray-600';
      case 'labCoat':
        return 'text-white';
      case 'construction':
        return 'text-orange-500';
      case 'chef':
        return 'text-white';
      case 'artist':
        return 'text-purple-500';
      case 'athletic':
        return 'text-red-500';
      case 'tech':
        return 'text-blue-500';
      default:
        return 'text-gray-600';
    }
  };

  const getAccessoryElement = () => {
    const baseClass = "absolute inset-0 flex items-center justify-center";
    
    switch (attributes.accessory) {
      case 'headphones':
        return (
          <div className={baseClass}>
            <svg viewBox="0 0 100 100" className="w-64 h-64 text-gray-700">
              <path d="M20,50 C20,30 35,20 50,20 C65,20 80,30 80,50" className="fill-none stroke-current stroke-4" />
              <circle cx="20" cy="50" r="8" className="fill-current" />
              <circle cx="80" cy="50" r="8" className="fill-current" />
            </svg>
          </div>
        );
      case 'glasses':
        return (
          <div className={baseClass}>
            <svg viewBox="0 0 100 100" className="w-64 h-64 text-gray-700">
              <circle cx="35" cy="50" r="12" className="fill-none stroke-current stroke-2" />
              <circle cx="65" cy="50" r="12" className="fill-none stroke-current stroke-2" />
              <path d="M47,50 L53,50" className="stroke-current stroke-2" />
              <path d="M15,50 L23,50" className="stroke-current stroke-2" />
              <path d="M77,50 L85,50" className="stroke-current stroke-2" />
            </svg>
          </div>
        );
      case 'hat':
        return (
          <div className={baseClass}>
            <svg viewBox="0 0 100 100" className="w-64 h-64 text-gray-700">
              <path d="M20,45 Q50,20 80,45 L75,50 Q50,30 25,50 Z" className="fill-current" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getHairColorClass = () => {
    switch (attributes.hairColor) {
      case 'black':
        return 'bg-gray-900';
      case 'brown':
        return 'bg-amber-800';
      case 'blonde':
        return 'bg-amber-300';
      case 'red':
        return 'bg-red-600';
      case 'gray':
        return 'bg-gray-400';
      case 'blue':
        return 'bg-blue-500';
      case 'pink':
        return 'bg-pink-400';
      case 'purple':
        return 'bg-purple-500';
      default:
        return 'bg-gray-900';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Create Your Future Self Avatar</h3>
        <div className="text-sm font-medium">Step {currentStep} of 3</div>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Basics</span>
          <span>Values</span>
          <span>Reflections</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <Progress 
            value={completion.step1} 
            className={`h-2 ${currentStep === 1 ? 'bg-primary' : 'bg-muted'}`} 
          />
          <Progress 
            value={completion.step2} 
            className={`h-2 ${currentStep === 2 ? 'bg-primary' : 'bg-muted'}`} 
          />
          <Progress 
            value={completion.step3} 
            className={`h-2 ${currentStep === 3 ? 'bg-primary' : 'bg-muted'}`} 
          />
        </div>
      </div>
      
      {/* Error and success messages */}
      {error && (
        <div ref={errorRef} className="mb-4">
          <Alert variant="destructive" className="border-red-500">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      
      {success && (
        <div className="mb-4">
          <Alert className="bg-green-50 border-green-500 text-green-800">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left panel: Avatar preview */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              {renderAvatar()}
              <div className="mt-4 text-center">
                <input
                  type="text"
                  placeholder="Name your avatar *"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  className={`w-full p-2 mb-2 border rounded ${!avatarName.trim() ? 'border-red-300' : ''}`}
                  aria-required="true"
                />
                <input
                  type="text"
                  placeholder="Future title (e.g. 'Creative Coder')"
                  value={futureTitle}
                  onChange={(e) => setFutureTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                />
                {!avatarName.trim() && (
                  <p className="text-xs text-red-500 text-left mt-1">Avatar name is required</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right panel: Configuration options */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              {currentStep === 1 && (
                <div>
                  <h4 className="text-lg font-medium mb-4">Customize Your Avatar</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Style</label>
                        <Select 
                          value={attributes.style} 
                          onValueChange={(value) => handleAttributeChange('style', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="artistic">Artistic</SelectItem>
                            <SelectItem value="athletic">Athletic</SelectItem>
                            <SelectItem value="techie">Techie</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Hair Color</label>
                        <Select 
                          value={attributes.hairColor} 
                          onValueChange={(value) => handleAttributeChange('hairColor', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select hair color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blonde">Blonde</SelectItem>
                            <SelectItem value="brown">Brown</SelectItem>
                            <SelectItem value="black">Black</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="gray">Gray/Silver</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="pink">Pink</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Hair Style</label>
                        <Select 
                          value={attributes.hairStyle} 
                          onValueChange={(value) => handleAttributeChange('hairStyle', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select hair style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="long">Long</SelectItem>
                            <SelectItem value="spiky">Spiky</SelectItem>
                            <SelectItem value="twintails">Twin Tails</SelectItem>
                            <SelectItem value="bald">Bald</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Outfit</label>
                        <Select 
                          value={attributes.outfit} 
                          onValueChange={(value) => handleAttributeChange('outfit', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select outfit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">Business Attire</SelectItem>
                            <SelectItem value="casual">Casual Wear</SelectItem>
                            <SelectItem value="formal">Formal Wear</SelectItem>
                            <SelectItem value="creative">Creative Outfit</SelectItem>
                            <SelectItem value="athletic">Athletic Wear</SelectItem>
                            <SelectItem value="schoolUniform">School Uniform</SelectItem>
                            <SelectItem value="cosplay">Cosplay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Accessory</label>
                        <Select 
                          value={attributes.accessory} 
                          onValueChange={(value) => handleAttributeChange('accessory', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select accessory" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="glasses">Glasses</SelectItem>
                            <SelectItem value="hat">Hat</SelectItem>
                            <SelectItem value="headphones">Headphones</SelectItem>
                            <SelectItem value="hairpin">Hairpin</SelectItem>
                            <SelectItem value="mask">Face Mask</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <Select 
                          value={attributes.location} 
                          onValueChange={(value) => handleAttributeChange('location', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select future location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="city">City</SelectItem>
                            <SelectItem value="suburb">Suburb</SelectItem>
                            <SelectItem value="rural">Rural Area</SelectItem>
                            <SelectItem value="beach">Beach/Coastal</SelectItem>
                            <SelectItem value="mountains">Mountains</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Occupation Field</label>
                        <Select 
                          value={attributes.occupation} 
                          onValueChange={(value) => handleAttributeChange('occupation', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tech">Technology</SelectItem>
                            <SelectItem value="health">Healthcare</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="creative">Creative Arts</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="trades">Skilled Trades</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Personality</label>
                        <Select 
                          value={attributes.personality} 
                          onValueChange={(value) => handleAttributeChange('personality', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select personality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="creative">Creative & Innovative</SelectItem>
                            <SelectItem value="analytical">Analytical & Thoughtful</SelectItem>
                            <SelectItem value="social">Outgoing & Social</SelectItem>
                            <SelectItem value="caring">Caring & Supportive</SelectItem>
                            <SelectItem value="ambitious">Ambitious & Driven</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div>
                  <h4 className="text-lg font-medium mb-4">Your Future Self Values & Lifestyle</h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">Core Values</label>
                      <RadioGroup 
                        value={attributes.values} 
                        onValueChange={(value) => handleAttributeChange('values', value)}
                        className="grid grid-cols-1 md:grid-cols-2 gap-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="achievement" id="achievement" />
                          <Label htmlFor="achievement">Achievement & Success</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="creativity" id="creativity" />
                          <Label htmlFor="creativity">Creativity & Expression</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="family" id="family" />
                          <Label htmlFor="family">Family & Relationships</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="freedom" id="freedom" />
                          <Label htmlFor="freedom">Freedom & Independence</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="helping" id="helping" />
                          <Label htmlFor="helping">Helping Others</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="learning" id="learning" />
                          <Label htmlFor="learning">Learning & Growth</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Lifestyle</label>
                      <RadioGroup 
                        value={attributes.lifestyle} 
                        onValueChange={(value) => handleAttributeChange('lifestyle', value)}
                        className="grid grid-cols-1 md:grid-cols-2 gap-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="balanced" id="balanced" />
                          <Label htmlFor="balanced">Balanced & Stable</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="adventurous" id="adventurous" />
                          <Label htmlFor="adventurous">Adventurous & Exciting</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="luxurious" id="luxurious" />
                          <Label htmlFor="luxurious">Luxurious & Comfortable</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="minimalist" id="minimalist" />
                          <Label htmlFor="minimalist">Minimalist & Simple</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="social" id="social" />
                          <Label htmlFor="social">Socially Connected</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="nature" id="nature" />
                          <Label htmlFor="nature">Nature & Outdoors</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Work-Life Balance</label>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Work-Focused</span>
                            <span>Balanced</span>
                            <span>Life-Focused</span>
                          </div>
                          <Slider
                            value={[workLifeBalance.workLifeBalance]}
                            max={100}
                            step={10}
                            className="w-full"
                            onValueChange={(values) => handleWorkLifeBalanceChange('workLifeBalance', values[0])}
                          />
                          <div className="text-center text-xs text-gray-500 mt-1">
                            {workLifeBalance.workLifeBalance < 40 ? 'Prioritizing career advancement' : 
                             workLifeBalance.workLifeBalance > 60 ? 'Prioritizing personal fulfillment' : 
                             'Seeking work-life harmony'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Security</span>
                            <span>Risk & Reward</span>
                          </div>
                          <Slider
                            value={[workLifeBalance.riskTolerance]}
                            max={100}
                            step={10}
                            className="w-full"
                            onValueChange={(values) => handleWorkLifeBalanceChange('riskTolerance', values[0])}
                          />
                          <div className="text-center text-xs text-gray-500 mt-1">
                            {workLifeBalance.riskTolerance < 40 ? 'Preferring stability and predictability' : 
                             workLifeBalance.riskTolerance > 60 ? 'Comfortable with uncertainty for potential gains' : 
                             'Balanced approach to risk'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Solo Work</span>
                            <span>Team-Based</span>
                          </div>
                          <Slider
                            value={[workLifeBalance.teamPreference]}
                            max={100}
                            step={10}
                            className="w-full"
                            onValueChange={(values) => handleWorkLifeBalanceChange('teamPreference', values[0])}
                          />
                          <div className="text-center text-xs text-gray-500 mt-1">
                            {workLifeBalance.teamPreference < 40 ? 'Thriving in independent work environments' : 
                             workLifeBalance.teamPreference > 60 ? 'Energized by collaboration and teamwork' : 
                             'Adaptable to both individual and group settings'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div>
                  <h4 className="text-lg font-medium mb-4">Reflect on Your Future Self</h4>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 italic mb-3">
                      Please complete at least 3 reflections below to help define your future self.
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center">
                        What does your future self wear to work?
                        {reflections.workAttire && (
                          <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </label>
                      <Input
                        placeholder="Describe what you're wearing on a typical workday..."
                        value={reflections.workAttire}
                        onChange={(e) => handleReflectionChange('workAttire', e.target.value)}
                        className={reflections.workAttire ? 'border-green-200 bg-green-50' : ''}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center">
                        Where does your future self live?
                        {reflections.livingLocation && (
                          <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </label>
                      <Input
                        placeholder="Describe your ideal living situation..."
                        value={reflections.livingLocation}
                        onChange={(e) => handleReflectionChange('livingLocation', e.target.value)}
                        className={reflections.livingLocation ? 'border-green-200 bg-green-50' : ''}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center">
                        How does your future self spend weekends?
                        {reflections.weekendActivity && (
                          <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </label>
                      <Input
                        placeholder="What activities do you enjoy on your free time?"
                        value={reflections.weekendActivity}
                        onChange={(e) => handleReflectionChange('weekendActivity', e.target.value)}
                        className={reflections.weekendActivity ? 'border-green-200 bg-green-50' : ''}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center">
                        What does a typical day look like for your future self?
                        {reflections.dailyRoutine && (
                          <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </label>
                      <Input
                        placeholder="Describe a day in your life..."
                        value={reflections.dailyRoutine}
                        onChange={(e) => handleReflectionChange('dailyRoutine', e.target.value)}
                        className={reflections.dailyRoutine ? 'border-green-200 bg-green-50' : ''}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center">
                        What is your future self's biggest aspiration?
                        {reflections.biggestAspiration && (
                          <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </label>
                      <Input
                        placeholder="What big goal are you working toward?"
                        value={reflections.biggestAspiration}
                        onChange={(e) => handleReflectionChange('biggestAspiration', e.target.value)}
                        className={reflections.biggestAspiration ? 'border-green-200 bg-green-50' : ''}
                      />
                    </div>
                    
                    {/* Visual indicator of completion */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0/5 complete</span>
                        <span>3/5 required</span>
                        <span>5/5 complete</span>
                      </div>
                      <Progress 
                        value={Object.values(reflections).filter(v => v.trim().length > 0).length * 20} 
                        className={`h-2 ${Object.values(reflections).filter(v => v.trim().length > 0).length >= 3 ? 'bg-green-500' : 'bg-amber-500'}`} 
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                )}
                
                <Button 
                  onClick={handleNext}
                  className="ml-auto"
                >
                  {currentStep < 3 ? 'Next Step' : 'Save Avatar & Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AvatarCreator;