import { useRef } from 'react';
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
import { useAvatarCreator } from '@/hooks/useAvatarCreator';
import { AvatarVisualization } from './AvatarVisualization';
import {
  avatarStyles,
  hairColors,
  hairStyles,
  outfits,
  accessories,
  locations,
  occupations,
  personalities,
  values,
  lifestyles
} from '@/data/avatarOptions';

interface AvatarCreatorProps {
  onComplete: (results: Record<string, string>) => void;
  resetKey?: number;
}

export default function AvatarCreator({ onComplete, resetKey = 0 }: AvatarCreatorProps) {
  const errorRef = useRef<HTMLDivElement>(null);
  
  const {
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
  } = useAvatarCreator({
    resetKey,
    onComplete
  });
  
  // Scroll to error message when it appears
  if (error && errorRef.current) {
    errorRef.current.scrollIntoView({ behavior: 'smooth' });
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Creating Your Avatar</span>
          <span>Step {currentStep} of 3</span>
        </div>
        <Progress value={completion[`step${currentStep}` as keyof typeof completion]} />
      </div>
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-4" ref={errorRef}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Success message */}
      {success && (
        <Alert className="mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      {/* Step 1: Basic Profile */}
      {currentStep === 1 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Create Your Avatar</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="avatarName">Avatar Name</Label>
                <Input
                  id="avatarName"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  placeholder="Give your avatar a name"
                />
              </div>
              
              <div>
                <Label htmlFor="futureTitle">Future Title</Label>
                <Input
                  id="futureTitle"
                  value={futureTitle}
                  onChange={(e) => setFutureTitle(e.target.value)}
                  placeholder="What would you like to be called in the future?"
                />
              </div>
              
              <div>
                <Label>Avatar Style</Label>
                <Select
                  value={attributes.style}
                  onValueChange={(value) => handleAttributeChange('style', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    {avatarStyles.map(style => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Hair Color</Label>
                <Select
                  value={attributes.hairColor}
                  onValueChange={(value) => handleAttributeChange('hairColor', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hair color" />
                  </SelectTrigger>
                  <SelectContent>
                    {hairColors.map(color => (
                      <SelectItem key={color.id} value={color.id}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Hair Style</Label>
                <Select
                  value={attributes.hairStyle}
                  onValueChange={(value) => handleAttributeChange('hairStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hair style" />
                  </SelectTrigger>
                  <SelectContent>
                    {hairStyles.map(style => (
                      <SelectItem key={style.id} value={style.id}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Outfit</Label>
                <Select
                  value={attributes.outfit}
                  onValueChange={(value) => handleAttributeChange('outfit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an outfit" />
                  </SelectTrigger>
                  <SelectContent>
                    {outfits.map(outfit => (
                      <SelectItem key={outfit.id} value={outfit.id}>
                        {outfit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Accessory</Label>
                <Select
                  value={attributes.accessory}
                  onValueChange={(value) => handleAttributeChange('accessory', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an accessory" />
                  </SelectTrigger>
                  <SelectContent>
                    {accessories.map(accessory => (
                      <SelectItem key={accessory.id} value={accessory.id}>
                        {accessory.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Avatar Preview */}
            <div className="mt-6">
              <AvatarVisualization attributes={attributes} />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 2: Values and Lifestyle */}
      {currentStep === 2 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Values and Lifestyle</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Location</Label>
                <Select
                  value={attributes.location}
                  onValueChange={(value) => handleAttributeChange('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Occupation</Label>
                <Select
                  value={attributes.occupation}
                  onValueChange={(value) => handleAttributeChange('occupation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupations.map(occupation => (
                      <SelectItem key={occupation.id} value={occupation.id}>
                        {occupation.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Personality</Label>
                <Select
                  value={attributes.personality}
                  onValueChange={(value) => handleAttributeChange('personality', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a personality" />
                  </SelectTrigger>
                  <SelectContent>
                    {personalities.map(personality => (
                      <SelectItem key={personality.id} value={personality.id}>
                        {personality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Values</Label>
                <Select
                  value={attributes.values}
                  onValueChange={(value) => handleAttributeChange('values', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your values" />
                  </SelectTrigger>
                  <SelectContent>
                    {values.map(value => (
                      <SelectItem key={value.id} value={value.id}>
                        {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Lifestyle</Label>
                <Select
                  value={attributes.lifestyle}
                  onValueChange={(value) => handleAttributeChange('lifestyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lifestyle" />
                  </SelectTrigger>
                  <SelectContent>
                    {lifestyles.map(lifestyle => (
                      <SelectItem key={lifestyle.id} value={lifestyle.id}>
                        {lifestyle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Work-Life Balance</Label>
                <Slider
                  value={[workLifeBalance.workLifeBalance]}
                  onValueChange={([value]) => handleWorkLifeBalanceChange('workLifeBalance', value)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
              
              <div>
                <Label>Risk Tolerance</Label>
                <Slider
                  value={[workLifeBalance.riskTolerance]}
                  onValueChange={([value]) => handleWorkLifeBalanceChange('riskTolerance', value)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
              
              <div>
                <Label>Team Preference</Label>
                <Slider
                  value={[workLifeBalance.teamPreference]}
                  onValueChange={([value]) => handleWorkLifeBalanceChange('teamPreference', value)}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Step 3: Reflections */}
      {currentStep === 3 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Future Self Reflections</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="workAttire">What would you wear to work?</Label>
                <Input
                  id="workAttire"
                  value={reflections.workAttire}
                  onChange={(e) => handleReflectionChange('workAttire', e.target.value)}
                  placeholder="Describe your ideal work attire"
                />
              </div>
              
              <div>
                <Label htmlFor="livingLocation">Where would you live?</Label>
                <Input
                  id="livingLocation"
                  value={reflections.livingLocation}
                  onChange={(e) => handleReflectionChange('livingLocation', e.target.value)}
                  placeholder="Describe your ideal living location"
                />
              </div>
              
              <div>
                <Label htmlFor="weekendActivity">What would you do on weekends?</Label>
                <Input
                  id="weekendActivity"
                  value={reflections.weekendActivity}
                  onChange={(e) => handleReflectionChange('weekendActivity', e.target.value)}
                  placeholder="Describe your ideal weekend activities"
                />
              </div>
              
              <div>
                <Label htmlFor="dailyRoutine">What would your daily routine look like?</Label>
                <Input
                  id="dailyRoutine"
                  value={reflections.dailyRoutine}
                  onChange={(e) => handleReflectionChange('dailyRoutine', e.target.value)}
                  placeholder="Describe your ideal daily routine"
                />
              </div>
              
              <div>
                <Label htmlFor="biggestAspiration">What's your biggest aspiration?</Label>
                <Input
                  id="biggestAspiration"
                  value={reflections.biggestAspiration}
                  onChange={(e) => handleReflectionChange('biggestAspiration', e.target.value)}
                  placeholder="Describe your biggest aspiration"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button
          onClick={handleBack}
          variant="outline"
          disabled={currentStep === 1}
        >
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={currentStep === 3 && Object.values(reflections).filter(v => v.trim().length > 0).length < 3}
        >
          {currentStep === 3 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
}