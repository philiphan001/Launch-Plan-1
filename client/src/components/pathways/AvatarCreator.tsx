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
    const skinTone = '#FFDBAC'; // Default skin tone
    
    const getHairColorClass = () => {
      switch(attributes.hairColor) {
        case 'blonde': return '#FFD700'; // Bright yellow gold
        case 'red': return '#FF4500'; // Vibrant red
        case 'black': return '#191970'; // Midnight blue-black
        case 'gray': return '#C0C0C0'; // Silver
        case 'blue': return '#6495ED'; // Fantasy blue
        case 'pink': return '#FF69B4'; // Hot pink
        case 'purple': return '#9370DB'; // Medium purple
        default: return '#8B4513'; // Brown
      }
    };
    
    const getHairStyle = () => {
      switch(attributes.hairStyle) {
        case 'short':
          return (
            <path 
              d={`M32,20 
                 C42,5 58,5 68,20
                 C68,30 68,35 68,35
                 C58,35 42,35 32,35
                 C32,35 32,30 32,20Z`} 
              fill={getHairColorClass()} 
            />
          );
        case 'medium':
          return (
            <path 
              d={`M25,20 
                 C40,0 60,0 75,20
                 L75,45
                 C65,45 35,45 25,45
                 L25,20Z
                 M25,45
                 C30,60 32,70 33,75
                 M75,45
                 C70,60 68,70 67,75`} 
              fill={getHairColorClass()} 
              stroke={getHairColorClass()}
              strokeWidth="2"
            />
          );
        case 'long':
          return (
            <path 
              d={`M20,20 
                 C40,-5 60,-5 80,20
                 L85,90
                 C75,95 25,95 15,90
                 L20,20Z`} 
              fill={getHairColorClass()} 
            />
          );
        case 'spiky':
          return (
            <path 
              d={`M30,35 
                 L25,15 L35,20 L30,5 L40,15 L50,0 L60,15 L70,5 L65,20 L75,15 L70,35
                 C60,40 40,40 30,35Z`} 
              fill={getHairColorClass()} 
            />
          );
        case 'twintails':
          return (
            <>
              <path 
                d={`M25,20 
                   C40,0 60,0 75,20
                   L75,40
                   C65,45 35,45 25,40
                   L25,20Z`} 
                fill={getHairColorClass()} 
              />
              <path 
                d={`M25,40 
                   C20,50 15,70 25,90
                   C30,85 30,60 28,40`} 
                fill={getHairColorClass()} 
              />
              <path 
                d={`M75,40 
                   C80,50 85,70 75,90
                   C70,85 70,60 72,40`} 
                fill={getHairColorClass()} 
              />
            </>
          );
        case 'bald':
          return null;
        default:
          return (
            <path 
              d={`M32,20 
                 C42,5 58,5 68,20
                 C68,30 68,35 68,35
                 C58,35 42,35 32,35
                 C32,35 32,30 32,20Z`} 
              fill={getHairColorClass()} 
            />
          );
      }
    };
    
    const getOutfitColor = () => {
      switch(attributes.outfit) {
        case 'casual': return '#4169E1'; // Royal blue
        case 'formal': return '#2F4F4F'; // Dark slate gray
        case 'creative': return '#8A2BE2'; // Blue violet
        case 'athletic': return '#32CD32'; // Lime green
        case 'schoolUniform': return '#000080'; // Navy
        case 'cosplay': return '#FF1493'; // Deep pink
        default: return '#0047AB'; // Business - Cobalt blue
      }
    };
    
    const getOutfitSvg = () => {
      const color = getOutfitColor();
      
      switch(attributes.outfit) {
        case 'schoolUniform':
          return (
            <>
              <path 
                d="M25,50 L25,100 L75,100 L75,50" 
                fill="#FFFFFF" 
              />
              <path 
                d="M35,50 L35,85 L65,85 L65,50" 
                fill={color} 
              />
              <path 
                d="M35,85 L40,100 M65,85 L60,100" 
                stroke="#FFFFFF" 
                strokeWidth="5"
              />
              <path 
                d="M50,50 L50,75" 
                stroke="#FF0000" 
                strokeWidth="2" 
              />
              <path 
                d="M35,60 L65,60" 
                stroke="#FFFFFF" 
                strokeWidth="1" 
              />
            </>
          );
        case 'cosplay':
          return (
            <>
              <path 
                d="M25,50 L25,100 L75,100 L75,50" 
                fill={color} 
              />
              <path 
                d="M35,50 L35,75 L65,75 L65,50" 
                fill="#FFD700" 
              />
              <path 
                d="M25,60 L20,70 L25,80 M75,60 L80,70 L75,80" 
                stroke={color} 
                fill="none"
                strokeWidth="3"
              />
              <circle cx="50" cy="65" r="5" fill="#FFD700" />
            </>
          );
        default:
          return (
            <path 
              d="M25,50 L25,100 L75,100 L75,50" 
              fill={color} 
            />
          );
      }
    };
    
    const getEyeStyle = () => {
      switch(attributes.personality) {
        case 'creative':
          return (
            <>
              <ellipse cx="35" cy="40" rx="5" ry="7" fill="#FFFFFF" />
              <ellipse cx="65" cy="40" rx="5" ry="7" fill="#FFFFFF" />
              <ellipse cx="35" cy="40" rx="2" ry="3" fill="#000000" />
              <ellipse cx="65" cy="40" rx="2" ry="3" fill="#000000" />
              <ellipse cx="33" cy="37" rx="1.5" ry="1.5" fill="#FFFFFF" />
              <ellipse cx="63" cy="37" rx="1.5" ry="1.5" fill="#FFFFFF" />
            </>
          );
        case 'analytical':
          return (
            <>
              <ellipse cx="35" cy="40" rx="4" ry="5" fill="#FFFFFF" />
              <ellipse cx="65" cy="40" rx="4" ry="5" fill="#FFFFFF" />
              <ellipse cx="35" cy="40" rx="1.5" ry="2" fill="#000000" />
              <ellipse cx="65" cy="40" rx="1.5" ry="2" fill="#000000" />
              <path d="M30,34 L40,37" stroke="#000000" strokeWidth="1" fill="none" />
              <path d="M60,37 L70,34" stroke="#000000" strokeWidth="1" fill="none" />
            </>
          );
        case 'social':
          return (
            <>
              <ellipse cx="35" cy="40" rx="6" ry="8" fill="#FFFFFF" />
              <ellipse cx="65" cy="40" rx="6" ry="8" fill="#FFFFFF" />
              <ellipse cx="35" cy="40" rx="3" ry="4" fill="#000000" />
              <ellipse cx="65" cy="40" rx="3" ry="4" fill="#000000" />
              <ellipse cx="33" cy="36" rx="2" ry="2" fill="#FFFFFF" />
              <ellipse cx="63" cy="36" rx="2" ry="2" fill="#FFFFFF" />
              <path d="M32,48 C40,52 45,52 48,48" stroke="#000000" strokeWidth="0.5" fill="none" />
              <path d="M52,48 C55,52 60,52 68,48" stroke="#000000" strokeWidth="0.5" fill="none" />
            </>
          );
        case 'caring':
          return (
            <>
              <ellipse cx="35" cy="40" rx="5" ry="6" fill="#FFFFFF" />
              <ellipse cx="65" cy="40" rx="5" ry="6" fill="#FFFFFF" />
              <ellipse cx="35" cy="40" rx="2" ry="2.5" fill="#000000" />
              <ellipse cx="65" cy="40" rx="2" ry="2.5" fill="#000000" />
              <path d="M35,34 C35,32 40,32 40,35" stroke="#000000" strokeWidth="0.5" fill="none" />
              <path d="M60,35 C60,32 65,32 65,34" stroke="#000000" strokeWidth="0.5" fill="none" />
            </>
          );
        case 'ambitious':
          return (
            <>
              <ellipse cx="35" cy="40" rx="5" ry="6" fill="#FFFFFF" />
              <ellipse cx="65" cy="40" rx="5" ry="6" fill="#FFFFFF" />
              <ellipse cx="36" cy="40" rx="2" ry="2.5" fill="#000000" />
              <ellipse cx="64" cy="40" rx="2" ry="2.5" fill="#000000" />
              <path d="M28,36 L42,36" stroke="#000000" strokeWidth="1" fill="none" />
              <path d="M58,36 L72,36" stroke="#000000" strokeWidth="1" fill="none" />
            </>
          );
        default:
          return (
            <>
              <ellipse cx="35" cy="40" rx="5" ry="7" fill="#FFFFFF" />
              <ellipse cx="65" cy="40" rx="5" ry="7" fill="#FFFFFF" />
              <ellipse cx="35" cy="40" rx="2" ry="3" fill="#000000" />
              <ellipse cx="65" cy="40" rx="2" ry="3" fill="#000000" />
              <ellipse cx="33" cy="37" rx="1.5" ry="1.5" fill="#FFFFFF" />
              <ellipse cx="63" cy="37" rx="1.5" ry="1.5" fill="#FFFFFF" />
            </>
          );
      }
    };
    
    const getMouthStyle = () => {
      switch(attributes.personality) {
        case 'creative':
          return <path d="M40,60 C45,65 55,65 60,60" stroke="#FF5555" strokeWidth="2" fill="none" />;
        case 'analytical':
          return <path d="M42,60 L58,60" stroke="#FF5555" strokeWidth="2" fill="none" />;
        case 'social':
          return <path d="M40,60 C45,67 55,67 60,60" stroke="#FF5555" strokeWidth="2" fill="none" />;
        case 'caring':
          return <path d="M40,58 C45,64 55,64 60,58" stroke="#FF5555" strokeWidth="2" fill="none" />;
        case 'ambitious':
          return <path d="M40,60 C45,62 55,62 60,60" stroke="#FF5555" strokeWidth="2" fill="none" />;
        default:
          return <path d="M40,60 C45,65 55,65 60,60" stroke="#FF5555" strokeWidth="2" fill="none" />;
      }
    };
    
    const getAccessoryElement = () => {
      switch(attributes.accessory) {
        case 'glasses':
          return (
            <>
              <circle cx="35" cy="40" r="8" stroke="#000000" strokeWidth="1.5" fill="none" />
              <circle cx="65" cy="40" r="8" stroke="#000000" strokeWidth="1.5" fill="none" />
              <path d="M43,40 L57,40" stroke="#000000" strokeWidth="1.5" fill="none" />
              <path d="M27,40 L24,38" stroke="#000000" strokeWidth="1.5" fill="none" />
              <path d="M73,40 L76,38" stroke="#000000" strokeWidth="1.5" fill="none" />
            </>
          );
        case 'hat':
          return (
            <path 
              d="M20,20 C20,10 40,0 80,20 C75,25 25,25 20,20Z" 
              fill="#FF0000"
            />
          );
        case 'headphones':
          return (
            <>
              <path 
                d="M25,20 C25,15 40,5 75,20" 
                stroke="#444444" 
                strokeWidth="3" 
                fill="none" 
              />
              <rect x="20" y="25" width="8" height="15" rx="4" fill="#444444" />
              <rect x="72" y="25" width="8" height="15" rx="4" fill="#444444" />
            </>
          );
        case 'hairpin':
          return (
            <path 
              d="M35,25 L25,20 L35,15" 
              stroke="#FFD700" 
              strokeWidth="2" 
              fill="none" 
            />
          );
        case 'mask':
          return (
            <path 
              d="M35,50 C50,60 65,50 65,50 L65,60 C50,70 35,60 35,60 Z" 
              fill="#FFFFFF" 
              stroke="#CCCCCC" 
              strokeWidth="1"
            />
          );
        default:
          return null;
      }
    };
    
    const getLocationBackground = () => {
      switch(attributes.location) {
        case 'city':
          return (
            <g>
              <linearGradient id="cityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#87CEEB" />
                <stop offset="100%" stopColor="#4682B4" />
              </linearGradient>
              <rect width="100%" height="100%" fill="url(#cityGradient)" />
              <path d="M0,80 L20,80 L20,60 L30,60 L30,70 L40,70 L40,40 L45,40 L45,65 L55,65 L55,50 L65,50 L65,75 L75,75 L75,55 L85,55 L85,80 L100,80"
                fill="#263238" />
            </g>
          );
        case 'rural':
          return (
            <g>
              <linearGradient id="ruralGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#87CEEB" />
                <stop offset="100%" stopColor="#8FBC8F" />
              </linearGradient>
              <rect width="100%" height="100%" fill="url(#ruralGradient)" />
              <path d="M0,80 Q25,75 50,80 Q75,85 100,80" fill="#8FBC8F" />
              <path d="M10,80 L20,65 L30,80" fill="#5D4037" />
              <path d="M70,80 L80,65 L90,80" fill="#5D4037" />
              <path d="M40,80 L50,55 L60,80" fill="#5D4037" />
            </g>
          );
        case 'beach':
          return (
            <g>
              <linearGradient id="beachGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#87CEEB" />
                <stop offset="60%" stopColor="#00BFFF" />
                <stop offset="60.1%" stopColor="#F0E68C" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
              <rect width="100%" height="100%" fill="url(#beachGradient)" />
              <circle cx="80" cy="20" r="10" fill="#FFFF00" />
              <path d="M20,60 Q25,55 30,60 Q35,65 40,60 Q45,55 50,60 Q55,65 60,60 Q65,55 70,60 Q75,65 80,60"
                stroke="#00BFFF" strokeWidth="2" fill="none" />
            </g>
          );
        case 'mountains':
          return (
            <g>
              <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#87CEEB" />
                <stop offset="100%" stopColor="#006400" />
              </linearGradient>
              <rect width="100%" height="100%" fill="url(#mountainGradient)" />
              <path d="M0,80 L30,30 L60,80" fill="#8B4513" />
              <path d="M40,80 L70,20 L100,80" fill="#5D4037" />
              <path d="M70,20 L75,25 L65,25" fill="#FFFFFF" />
            </g>
          );
        default: // suburb
          return (
            <g>
              <linearGradient id="suburbGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#87CEEB" />
                <stop offset="100%" stopColor="#6A5ACD" />
              </linearGradient>
              <rect width="100%" height="100%" fill="url(#suburbGradient)" />
              <path d="M10,80 L10,65 L30,65 L30,80" fill="#4CAF50" />
              <path d="M15,65 L15,50 L25,50 L25,65" fill="#B39DDB" />
              <path d="M10,50 L20,40 L30,50" fill="#FF5722" />
              <path d="M50,80 L50,60 L70,60 L70,80" fill="#FF9800" />
              <path d="M50,60 L60,50 L70,60" fill="#9C27B0" />
            </g>
          );
      }
    };

    return (
      <div className="relative w-64 h-64 mx-auto rounded-xl overflow-hidden bg-gray-100">
        <svg 
          viewBox="0 0 100 100" 
          width="100%" 
          height="100%" 
          className="w-full h-full rounded-xl"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background based on location */}
          {getLocationBackground()}
          
          {/* Body base - simplified anime style */}
          <rect x="35" y="80" width="30" height="20" fill={skinTone} />
          <circle cx="50" cy="50" r="25" fill={skinTone} />
          
          {/* Clothing/Outfit */}
          {getOutfitSvg()}
          
          {/* Hair must be above head but below accessories */}
          {getHairStyle()}
          
          {/* Facial features */}
          {getEyeStyle()}
          {getMouthStyle()}
          
          {/* Accessories on top */}
          {getAccessoryElement()}
          
          {/* Name label at bottom */}
          {avatarName && (
            <g>
              <rect x="0" y="90" width="100" height="10" fill="rgba(0,0,0,0.5)" />
              <text 
                x="50" 
                y="97" 
                textAnchor="middle" 
                fill="white" 
                fontSize="5"
                fontWeight="bold"
                fontFamily="'Segoe UI', Arial, sans-serif"
              >
                {avatarName}
              </text>
              {futureTitle && (
                <text 
                  x="50" 
                  y="102" 
                  textAnchor="middle" 
                  fill="white" 
                  fontSize="3"
                  fontFamily="'Segoe UI', Arial, sans-serif"
                >
                  {futureTitle}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>
    );
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