import { Card, CardContent } from '@/components/ui/card';

interface PathSelectionStepProps {
  onPathSelect: (needsGuidance: boolean) => void;
  onNext: () => void;
}

const PathSelectionStep = ({ onPathSelect, onNext }: PathSelectionStepProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <p className="text-white/80 mb-4">Already have a game plan? Sweet. We'll show you the different ways to get there—school, jobs, training, the works—so you can see what it might actually look like in real life.</p>
          
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
          <p className="text-white/80 mb-4">Not sure what's next? No stress. We'll ask a few fun questions and help you discover paths that match your personality, skills, and dreams—even the ones you didn't know you had.</p>
          
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

      {/* "I just want to mess around with the numbers" option */}
      <div 
        className="group cursor-pointer transition-all duration-300 ease-in-out rounded-xl overflow-hidden shadow-lg hover:shadow-xl relative"
        onClick={() => {
          onPathSelect(false);
          onNext();
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-pink-600/90 transform transition-all duration-300 ease-in-out group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] group-hover:backdrop-blur-[0px] transition-all duration-300"></div>
        <div className="relative p-8 text-center text-white z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-5 shadow-glow transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
            <span className="material-icons text-3xl">calculate</span>
          </div>
          <h3 className="text-2xl font-display font-bold mb-3 text-white">I just want to mess around with the numbers</h3>
          <p className="text-white/80 mb-4">Not into labels or preset paths? No problem. You can jump right in and plug in your own income, expenses, goals—even dream scenarios like moving to L.A. or buying a food truck. See how it all adds up and what your future could look like, financially and otherwise.</p>
          
          {/* Numbers and calculations visualization */}
          <div className="relative my-4 py-2 px-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              {/* Calculator visualization */}
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 bg-white/10 rounded-lg border border-white/20 flex flex-col p-1">
                  <div className="h-4 bg-white/20 rounded mb-1"></div>
                  <div className="grid grid-cols-3 gap-1">
                    {[1,2,3,4,5,6,7,8,9].map((num) => (
                      <div key={num} className="h-4 bg-white/20 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="absolute text-xs text-white/80 mt-1 w-full text-center top-full">Calculate</div>
              </div>
              
              {/* Graph visualization */}
              <div className="relative h-20 w-20 mx-2">
                <div className="absolute inset-0 bg-white/10 rounded-lg border border-white/20 p-1">
                  <div className="h-full flex items-end justify-between">
                    {[30, 60, 40, 80, 50].map((height, i) => (
                      <div key={i} className="w-2 bg-white/40 rounded-t" style={{ height: `${height}%` }}></div>
                    ))}
                  </div>
                </div>
                <div className="absolute text-xs text-white/80 mt-1 w-full text-center top-full">Graph</div>
              </div>
              
              {/* Money bag visualization */}
              <div className="relative h-20 w-20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-16 bg-yellow-400/20 rounded-lg border border-yellow-400/40 flex items-center justify-center">
                    <span className="material-icons text-white text-sm">attach_money</span>
                  </div>
                </div>
                <div className="absolute text-xs text-white/80 mt-1 w-full text-center top-full">Money</div>
              </div>
            </div>
          </div>
          
          <div className="py-1 px-4 bg-white/20 rounded-full w-fit mx-auto backdrop-blur-sm text-sm font-medium">
            Free Play
          </div>
          
          <div className="absolute bottom-3 right-3 bg-white/10 rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="material-icons text-xl">arrow_forward</span>
          </div>
        </div>
      </div>

      {/* Bonus Round box - spans full width */}
      <div 
        className="group cursor-pointer transition-all duration-300 ease-in-out rounded-xl overflow-hidden shadow-lg hover:shadow-xl relative col-span-1 md:col-span-3"
        onClick={() => {
          onPathSelect(false);
          onNext();
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/90 via-orange-500/90 to-red-500/90 transform transition-all duration-300 ease-in-out group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] group-hover:backdrop-blur-[0px] transition-all duration-300"></div>
        <div className="relative p-8 text-center text-white z-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full h-16 w-16 flex items-center justify-center shadow-glow transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
              <span className="material-icons text-2xl">stars</span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white">Bonus Round: Ever Wonder How Rich SpongeBob Is?</h3>
          </div>
          <p className="text-white/80 max-w-3xl mx-auto">
            Okay, maybe not SpongeBob. But our Celebrity Financial Profiles let you peek into what your favorite characters' financial lives might look like. It's part fun, part "whoa, that's actually useful."
          </p>
          
          {/* Celebrity profiles visualization */}
          <div className="relative my-6 py-4 px-4 bg-white/10 rounded-lg backdrop-blur-sm max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-6">
              {/* Character cards */}
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 bg-blue-400/20 rounded-lg border border-blue-400/40 transform -rotate-6 shadow-md"></div>
                <div className="absolute inset-0 bg-green-400/20 rounded-lg border border-green-400/40 transform rotate-3 shadow-md"></div>
                <div className="absolute inset-0 bg-purple-400/20 rounded-lg border border-purple-400/40 shadow-md flex items-center justify-center">
                  <span className="material-icons text-white text-2xl">face</span>
                </div>
              </div>
              
              {/* Money bag */}
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-20 bg-yellow-400/20 rounded-lg border border-yellow-400/40 flex items-center justify-center">
                    <span className="material-icons text-white text-2xl">attach_money</span>
                  </div>
                </div>
              </div>
              
              {/* Calculator */}
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 bg-white/10 rounded-lg border border-white/20 flex flex-col p-2">
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="grid grid-cols-3 gap-1">
                    {[1,2,3,4,5,6,7,8,9].map((num) => (
                      <div key={num} className="h-3 bg-white/20 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="py-1 px-4 bg-white/20 rounded-full w-fit mx-auto backdrop-blur-sm text-sm font-medium">
            Fun with Finance
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