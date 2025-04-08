import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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

const AvatarCreator = ({ onComplete, resetKey = 0 }: AvatarCreatorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [avatarName, setAvatarName] = useState('');
  const [futureTitle, setFutureTitle] = useState('');
  const [attributes, setAttributes] = useState<AvatarAttributes>({
    style: 'casual',
    hairColor: 'brown',
    hairStyle: 'short',
    outfit: 'business',
    accessory: 'glasses',
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
  
  // Reset state when resetKey changes
  useEffect(() => {
    console.log('AvatarCreator: resetKey changed to', resetKey);
    // Reset all component state
    setCurrentStep(1);
    setAvatarName('');
    setFutureTitle('');
    setAttributes({
      style: 'casual',
      hairColor: 'brown',
      hairStyle: 'short',
      outfit: 'business',
      accessory: 'glasses',
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
  };

  const handleReflectionChange = (field: keyof typeof reflections, value: string) => {
    setReflections({
      ...reflections,
      [field]: value
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Convert our avatar and reflections to a format compatible with other exploration methods
      const results: Record<string, string> = {
        avatar_name: avatarName,
        future_title: futureTitle,
        avatar_style: attributes.style,
        avatar_hair: `${attributes.hairColor}-${attributes.hairStyle}`,
        avatar_outfit: attributes.outfit,
        avatar_accessory: attributes.accessory,
        avatar_location: attributes.location,
        avatar_occupation: attributes.occupation,
        avatar_personality: attributes.personality,
        avatar_values: attributes.values,
        avatar_lifestyle: attributes.lifestyle,
        reflection_work_attire: reflections.workAttire,
        reflection_living_location: reflections.livingLocation,
        reflection_weekend: reflections.weekendActivity,
        reflection_routine: reflections.dailyRoutine,
        reflection_aspiration: reflections.biggestAspiration
      };
      
      onComplete(results);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Generate avatar SVG based on selected attributes
  const renderAvatar = () => {
    // This is a simplified placeholder rendering
    // In a real implementation, this would create a more complex SVG or use a library
    
    const getHairColorClass = () => {
      switch(attributes.hairColor) {
        case 'blonde': return 'bg-yellow-300';
        case 'red': return 'bg-red-500';
        case 'black': return 'bg-gray-900';
        case 'gray': return 'bg-gray-400';
        default: return 'bg-amber-700'; // brown
      }
    };
    
    const getOutfitClass = () => {
      switch(attributes.outfit) {
        case 'casual': return 'bg-blue-500';
        case 'formal': return 'bg-gray-800';
        case 'creative': return 'bg-purple-500';
        case 'athletic': return 'bg-green-500';
        default: return 'bg-blue-700'; // business
      }
    };
    
    const getAccessoryElement = () => {
      switch(attributes.accessory) {
        case 'glasses':
          return (
            <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 w-12 h-3 border-2 border-black rounded-full"></div>
          );
        case 'hat':
          return (
            <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 w-16 h-6 bg-red-500 rounded-full"></div>
          );
        case 'tie':
          return (
            <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 w-4 h-12 bg-red-600"></div>
          );
        case 'necklace':
          return (
            <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 w-8 h-2 bg-yellow-300 rounded-full"></div>
          );
        default:
          return null;
      }
    };
    
    const getLocationBackground = () => {
      switch(attributes.location) {
        case 'city': return 'bg-gradient-to-b from-blue-400 to-gray-600';
        case 'rural': return 'bg-gradient-to-b from-blue-400 to-green-700';
        case 'beach': return 'bg-gradient-to-b from-blue-400 to-yellow-200';
        case 'mountains': return 'bg-gradient-to-b from-blue-400 to-green-900';
        default: return 'bg-gradient-to-b from-blue-400 to-purple-600'; // suburb
      }
    };

    return (
      <div className={`relative w-64 h-64 mx-auto rounded-xl overflow-hidden ${getLocationBackground()}`}>
        {/* Body */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-48 bg-gray-100 rounded-t-full">
          {/* Outfit */}
          <div className={`absolute bottom-0 left-0 w-full h-2/3 ${getOutfitClass()} rounded-t-lg`}></div>
          
          {/* Accessory */}
          {getAccessoryElement()}
        </div>
        
        {/* Head */}
        <div className="absolute top-[25%] left-1/2 transform -translate-x-1/2 w-24 h-24 bg-[#FFDBAC] rounded-full">
          {/* Hair */}
          <div className={`absolute top-[-15%] left-1/2 transform -translate-x-1/2 w-28 h-14 ${getHairColorClass()} rounded-t-full`}></div>
          
          {/* Eyes */}
          <div className="absolute top-[40%] left-[30%] w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black rounded-full"></div>
          </div>
          <div className="absolute top-[40%] right-[30%] w-3 h-3 bg-white rounded-full">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black rounded-full"></div>
          </div>
          
          {/* Mouth */}
          <div className="absolute bottom-[30%] left-1/2 transform -translate-x-1/2 w-8 h-2 bg-red-400 rounded-full"></div>
        </div>
        
        {/* Show name and title if provided */}
        {avatarName && (
          <div className="absolute bottom-2 left-0 right-0 text-center text-white font-bold text-shadow">
            {avatarName}
            {futureTitle && <div className="text-xs">{futureTitle}</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Create Your Future Self Avatar</h3>
        <div className="text-sm font-medium">Step {currentStep} of 3</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left panel: Avatar preview */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              {renderAvatar()}
              <div className="mt-4 text-center">
                <input
                  type="text"
                  placeholder="Name your avatar"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Future title (e.g. 'Creative Coder')"
                  value={futureTitle}
                  onChange={(e) => setFutureTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                />
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
                            <SelectItem value="curly">Curly</SelectItem>
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
                            <SelectItem value="tie">Tie</SelectItem>
                            <SelectItem value="necklace">Necklace</SelectItem>
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
                            defaultValue={[50]}
                            max={100}
                            step={10}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Security</span>
                            <span>Risk & Reward</span>
                          </div>
                          <Slider
                            defaultValue={[50]}
                            max={100}
                            step={10}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Solo Work</span>
                            <span>Team-Based</span>
                          </div>
                          <Slider
                            defaultValue={[50]}
                            max={100}
                            step={10}
                            className="w-full"
                          />
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
                    <div>
                      <label className="block text-sm font-medium mb-1">What does your future self wear to work?</label>
                      <Input
                        placeholder="Describe what you're wearing on a typical workday..."
                        value={reflections.workAttire}
                        onChange={(e) => handleReflectionChange('workAttire', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Where does your future self live?</label>
                      <Input
                        placeholder="Describe your ideal living situation..."
                        value={reflections.livingLocation}
                        onChange={(e) => handleReflectionChange('livingLocation', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">How does your future self spend weekends?</label>
                      <Input
                        placeholder="What activities do you enjoy on your free time?"
                        value={reflections.weekendActivity}
                        onChange={(e) => handleReflectionChange('weekendActivity', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">What does a typical day look like for your future self?</label>
                      <Input
                        placeholder="Describe a day in your life..."
                        value={reflections.dailyRoutine}
                        onChange={(e) => handleReflectionChange('dailyRoutine', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">What is your future self's biggest aspiration?</label>
                      <Input
                        placeholder="What big goal are you working toward?"
                        value={reflections.biggestAspiration}
                        onChange={(e) => handleReflectionChange('biggestAspiration', e.target.value)}
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