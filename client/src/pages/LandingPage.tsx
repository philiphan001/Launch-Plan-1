import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  School, 
  Briefcase, 
  PiggyBank, 
  BarChart, 
  Calendar, 
  UserPlus, 
  Play, 
  Pause,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const [_, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Tutorial slides content
  const tutorialSlides = [
    {
      title: "Plan Your Future Path",
      description: "Explore different education and career paths with personalized financial projections.",
      icon: <School className="w-24 h-24 text-green-500" />,
      color: "bg-green-100"
    },
    {
      title: "Visualize Financial Milestones",
      description: "See how different life decisions impact your financial future including college, career, housing, and more.",
      icon: <PiggyBank className="w-24 h-24 text-blue-500" />,
      color: "bg-blue-100"
    },
    {
      title: "Compare Career Options",
      description: "Discover various career paths and their potential financial outcomes over time.",
      icon: <Briefcase className="w-24 h-24 text-purple-500" />,
      color: "bg-purple-100"
    },
    {
      title: "Track Key Life Events",
      description: "Plan for major life events like education, marriage, home buying, and more with financial clarity.",
      icon: <Calendar className="w-24 h-24 text-orange-500" />,
      color: "bg-orange-100"
    }
  ];

  // Auto-advance slides when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === tutorialSlides.length - 1 ? 0 : prev + 1));
      }, 5000); // Change slide every 5 seconds
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, tutorialSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === tutorialSlides.length - 1 ? 0 : prev + 1));
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? tutorialSlides.length - 1 : prev - 1));
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleGetStarted = () => {
    setLocation('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <header className="container mx-auto pt-20 pb-16 px-4">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-green-500">Launch</span> Plan
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
              Empowering high school students to make informed choices about their futures with clear financial visualization
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg flex items-center gap-2"
            >
              Get Started <ArrowRight className="ml-2" />
            </Button>
            <Button 
              onClick={() => setLocation('/explore')}
              variant="outline" 
              size="lg" 
              className="bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-8 py-6 text-lg"
            >
              Help Me With Ideas
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Animated Tutorial Section */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Launch Plan Works</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Our interactive platform helps you explore education paths, career options, and life milestones with financial clarity.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto relative bg-slate-900 rounded-xl shadow-2xl p-6 overflow-hidden">
            {/* Tutorial Controls */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Interactive Tutorial</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePrevSlide}
                  className="rounded-full hover:bg-slate-800/50"
                >
                  <ChevronLeft />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={togglePlayPause}
                  className="rounded-full hover:bg-slate-800/50"
                >
                  {isPlaying ? <Pause /> : <Play />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNextSlide}
                  className="rounded-full hover:bg-slate-800/50"
                >
                  <ChevronRight />
                </Button>
              </div>
            </div>
            
            {/* Tutorial Slides */}
            <div className="relative h-96 rounded-lg overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className={`w-full h-full flex flex-col items-center justify-center p-8 ${tutorialSlides[currentSlide].color}`}
                >
                  <div className="text-center">
                    {tutorialSlides[currentSlide].icon}
                    <h3 className="text-2xl font-bold mt-6 mb-3 text-slate-900">
                      {tutorialSlides[currentSlide].title}
                    </h3>
                    <p className="text-lg text-slate-700">
                      {tutorialSlides[currentSlide].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {tutorialSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full ${
                      index === currentSlide ? 'bg-white' : 'bg-white/30'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700"
            >
              <School className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Education Pathways</h3>
              <p className="text-gray-300">Explore 4-year college, community college, vocational training, and other education options with cost projections.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700"
            >
              <Briefcase className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Career Exploration</h3>
              <p className="text-gray-300">Discover careers that match your interests and see detailed income projections over time.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700"
            >
              <BarChart className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Financial Visualization</h3>
              <p className="text-gray-300">Interactive charts show how your choices affect savings, debt, and wealth over your lifetime.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700"
            >
              <Calendar className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Life Milestones</h3>
              <p className="text-gray-300">Plan for major events like marriage, home purchases, and family planning with financial clarity.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700"
            >
              <PiggyBank className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Savings Scenarios</h3>
              <p className="text-gray-300">Test different saving and spending strategies to see how they impact your long-term financial health.</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700"
            >
              <UserPlus className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personalized Guidance</h3>
              <p className="text-gray-300">Get customized recommendations based on your unique interests, goals, and financial situation.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Launch Your Future?</h2>
            <p className="text-xl text-gray-300 mb-10">
              Create a free account today and start exploring the possibilities for your future with clarity and confidence.
            </p>
            
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-green-500 hover:bg-green-600 text-white px-12 py-7 text-xl"
            >
              Create Free Account
            </Button>
            
            <p className="mt-6 text-gray-400">
              No credit card required. Start planning your future in minutes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-10 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">
                <span className="text-green-500">Launch</span> Plan
              </h2>
              <p className="text-gray-400 mt-2">Empowering your future decisions</p>
            </div>
            
            <div className="flex gap-8">
              <a href="#" className="text-gray-300 hover:text-white transition">About</a>
              <a href="#" className="text-gray-300 hover:text-white transition">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition">Privacy</a>
              <a href="#" className="text-gray-300 hover:text-white transition">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Launch Plan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}