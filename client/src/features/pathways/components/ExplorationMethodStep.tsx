import { Card, CardContent } from '@/components/ui/card';

interface ExplorationMethodStepProps {
  onMethodSelect: (method: 'swipe' | 'wheel' | 'advancedWheel' | 'quickSpin' | 'avatar') => void;
  onNext: () => void;
  onReset: () => void;
}

const ExplorationMethodStep = ({ onMethodSelect, onNext, onReset }: ExplorationMethodStepProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
      {/* Swipe Cards Option */}
      <Card 
        className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary overflow-hidden"
        onClick={() => {
          onMethodSelect('swipe');
          onReset();
          onNext();
        }}
      >
        <div className="bg-gradient-to-r from-blue-400 to-cyan-500 py-5">
          <div className="rounded-full bg-white h-16 w-16 flex items-center justify-center mx-auto mb-2 shadow-lg">
            <span className="material-icons text-2xl text-blue-500">swipe</span>
          </div>
        </div>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold mb-2 text-gray-800">Swipe Cards</h3>
          <p className="text-sm text-gray-600">Swipe left or right on different interests, values and lifestyle options</p>
        </CardContent>
      </Card>
      
      {/* Identity Wheel Option */}
      <Card 
        className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary overflow-hidden"
        onClick={() => {
          onMethodSelect('wheel');
          onReset();
          onNext();
        }}
      >
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 py-5">
          <div className="rounded-full bg-white h-16 w-16 flex items-center justify-center mx-auto mb-2 shadow-lg">
            <span className="material-icons text-2xl text-purple-500">casino</span>
          </div>
        </div>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold mb-2 text-gray-800">Identity Wheel</h3>
          <p className="text-sm text-gray-600">Spin a wheel to discover prompts about your values, talents, fears and wishes</p>
        </CardContent>
      </Card>
      
      {/* Advanced Wheel Option */}
      <Card 
        className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary overflow-hidden"
        onClick={() => {
          onMethodSelect('advancedWheel');
          onReset();
          onNext();
        }}
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-5">
          <div className="rounded-full bg-white h-16 w-16 flex items-center justify-center mx-auto mb-2 shadow-lg">
            <span className="material-icons text-2xl text-indigo-500">settings</span>
          </div>
        </div>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold mb-2 text-gray-800">Advanced Wheel</h3>
          <p className="text-sm text-gray-600">A more detailed exploration of your interests and preferences</p>
        </CardContent>
      </Card>
      
      {/* Quick Spin Option */}
      <Card 
        className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary overflow-hidden"
        onClick={() => {
          onMethodSelect('quickSpin');
          onReset();
          onNext();
        }}
      >
        <div className="bg-gradient-to-r from-green-500 to-teal-500 py-5">
          <div className="rounded-full bg-white h-16 w-16 flex items-center justify-center mx-auto mb-2 shadow-lg">
            <span className="material-icons text-2xl text-green-500">bolt</span>
          </div>
        </div>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold mb-2 text-gray-800">Quick Spin</h3>
          <p className="text-sm text-gray-600">A fast-paced way to discover your preferences and interests</p>
        </CardContent>
      </Card>
      
      {/* Avatar Creator Option */}
      <Card 
        className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary overflow-hidden"
        onClick={() => {
          onMethodSelect('avatar');
          onReset();
          onNext();
        }}
      >
        <div className="bg-gradient-to-r from-orange-500 to-red-500 py-5">
          <div className="rounded-full bg-white h-16 w-16 flex items-center justify-center mx-auto mb-2 shadow-lg">
            <span className="material-icons text-2xl text-orange-500">face</span>
          </div>
        </div>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-bold mb-2 text-gray-800">Avatar Creator</h3>
          <p className="text-sm text-gray-600">Create an avatar that represents your ideal future self</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExplorationMethodStep; 