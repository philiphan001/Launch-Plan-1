import { Card, CardContent } from '@/components/ui/card';

interface PathSelectionStepProps {
  onPathSelect: (needsGuidance: boolean) => void;
  onNext: () => void;
}

const PathSelectionStep = ({ onPathSelect, onNext }: PathSelectionStepProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* "I know what I want to do" option */}
      <div 
        className="group cursor-pointer transition-all duration-300 ease-in-out rounded-xl overflow-hidden shadow-lg hover:shadow-xl relative"
        onClick={() => {
          onPathSelect(false);
          onNext();
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/90 to-blue-500/90 transform transition-all duration-300 ease-in-out group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] group-hover:backdrop-blur-[0px] transition-all duration-300"></div>
        <div className="relative p-8 text-center text-white z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-5 shadow-glow transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
            <span className="material-icons text-3xl">map</span>
          </div>
          <h3 className="text-2xl font-display font-bold mb-3 text-white">I know what I want to do</h3>
          <p className="text-white/80 mb-4">I have a clear path in mind after high school and want to see where it leads</p>
          
          {/* Storyboard path visualization */}
          <div className="relative my-4 py-2 px-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              {/* Education icon */}
              <div className="relative">
                <div className="bg-blue-400/30 rounded-full h-12 w-12 flex items-center justify-center">
                  <span className="material-icons text-white text-xl">school</span>
                </div>
                <div className="text-xs text-white/80 mt-1">Education</div>
              </div>
              
              {/* Arrow */}
              <div className="flex-grow h-0.5 mx-1 bg-white/20 relative">
                <div className="absolute -top-1 animate-ping-slow w-1.5 h-1.5 bg-white rounded-full" style={{ left: '20%' }}></div>
                <div className="absolute -top-1 animate-ping-slow animation-delay-1000 w-1.5 h-1.5 bg-white rounded-full" style={{ left: '50%' }}></div>
                <div className="absolute -top-1 animate-ping-slow animation-delay-2000 w-1.5 h-1.5 bg-white rounded-full" style={{ left: '80%' }}></div>
              </div>
              
              {/* Career icon */}
              <div className="relative">
                <div className="bg-green-400/30 rounded-full h-12 w-12 flex items-center justify-center">
                  <span className="material-icons text-white text-xl">work</span>
                </div>
                <div className="text-xs text-white/80 mt-1">Career</div>
              </div>
              
              {/* Arrow */}
              <div className="flex-grow h-0.5 mx-1 bg-white/20 relative">
                <div className="absolute -top-1 animate-ping-slow w-1.5 h-1.5 bg-white rounded-full" style={{ left: '30%' }}></div>
                <div className="absolute -top-1 animate-ping-slow animation-delay-1500 w-1.5 h-1.5 bg-white rounded-full" style={{ left: '70%' }}></div>
              </div>
              
              {/* Success icon */}
              <div className="relative">
                <div className="bg-yellow-400/30 rounded-full h-12 w-12 flex items-center justify-center">
                  <span className="material-icons text-white text-xl">emoji_events</span>
                </div>
                <div className="text-xs text-white/80 mt-1">Success</div>
              </div>
            </div>
          </div>
          
          <div className="py-1 px-4 bg-white/20 rounded-full w-fit mx-auto backdrop-blur-sm text-sm font-medium">
            Direct Path
          </div>
          
          <div className="absolute bottom-3 right-3 bg-white/10 rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="material-icons text-xl">arrow_forward</span>
          </div>
        </div>
      </div>
      
      {/* "Help me explore options" option */}
      <div 
        className="group cursor-pointer transition-all duration-300 ease-in-out rounded-xl overflow-hidden shadow-lg hover:shadow-xl relative"
        onClick={() => {
          onPathSelect(true);
          onNext();
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 to-purple-600/90 transform transition-all duration-300 ease-in-out group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] group-hover:backdrop-blur-[0px] transition-all duration-300"></div>
        <div className="relative p-8 text-center text-white z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-5 shadow-glow transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
            <span className="material-icons text-3xl">explore</span>
          </div>
          <h3 className="text-2xl font-display font-bold mb-3 text-white">Help me explore options</h3>
          <p className="text-white/80 mb-4">I'm open to discovering possibilities that align with my interests and values</p>
          
          {/* Games and exploration interactive visualization */}
          <div className="relative my-4 py-2 px-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              {/* Spinning wheel visualization */}
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-purple-400/60 animate-spin-slow"></div>
                {/* Wheel segments */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-400/30 origin-bottom-right rotate-0"></div>
                  <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-green-400/30 origin-bottom-left rotate-0"></div>
                  <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-yellow-400/30 origin-top-left rotate-0"></div>
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-pink-400/30 origin-top-right rotate-0"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
                </div>
                {/* Spinner needle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-glow z-10"></div>
                <div className="absolute text-xs text-white/80 mt-1 w-full text-center top-full">Spin</div>
              </div>
              
              {/* Swipe cards visualization */}
              <div className="relative h-20 w-20 mx-2">
                <div className="absolute top-2 left-2 w-12 h-16 bg-green-400/20 rounded-md border border-green-400/40 transform -rotate-6 shadow-md"></div>
                <div className="absolute top-1 left-4 w-12 h-16 bg-blue-400/20 rounded-md border border-blue-400/40 transform rotate-3 shadow-md"></div>
                <div className="absolute top-0 left-6 w-12 h-16 bg-purple-400/20 rounded-md border border-purple-400/40 shadow-md">
                  <div className="h-full flex flex-col justify-center items-center">
                    <span className="material-icons text-white text-sm">thumb_up</span>
                  </div>
                </div>
                <div className="absolute text-xs text-white/80 mt-1 w-full text-center top-full">Swipe</div>
              </div>
              
              {/* Avatar visualization */}
              <div className="relative h-20 w-20">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-orange-400/20 rounded-full border border-orange-400/40 flex items-center justify-center">
                  <span className="material-icons text-white text-sm">face</span>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-blue-400/20 rounded-lg border border-blue-400/40"></div>
                <div className="absolute text-xs text-white/80 mt-1 w-full text-center top-full">Create</div>
              </div>
            </div>
          </div>
          
          <div className="py-1 px-4 bg-white/20 rounded-full w-fit mx-auto backdrop-blur-sm text-sm font-medium">
            Guided Discovery
          </div>
          
          <div className="absolute bottom-3 right-3 bg-white/10 rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="material-icons text-xl">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathSelectionStep; 