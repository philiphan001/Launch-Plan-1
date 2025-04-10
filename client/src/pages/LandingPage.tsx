import { useState, useEffect, useRef, ReactNode } from 'react';
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
  ChevronRight,
  MapPin,
  Rocket,
  LineChart,
  DollarSign,
  GraduationCap,
  Zap,
  Sparkles,
  Lightbulb,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { User, AuthProps } from "@/interfaces/auth";

interface TutorialSlide {
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
  content?: ReactNode;
}

interface LandingPageProps extends AuthProps {}

export default function LandingPage({
  user,
  isAuthenticated,
  isFirstTimeUser,
  login,
  signup,
  logout,
  completeOnboarding
}: LandingPageProps) {
  const [_, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Update scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tutorial slides content
  const tutorialSlides = [
    {
      title: "Our Vision",
      description: "Launch Plan was born from the idea that visualizing your financial future leads to better decisions today. What do you aspire to do? Where do you want to live? We help create a vision of your future self to guide your choices now.",
      icon: <Sparkles className="w-20 h-20 text-indigo-400" />,
      color: "bg-gradient-to-br from-indigo-400/50 to-indigo-600/90"
    },
    {
      title: "Discover Your Path",
      description: "Explore diverse education and career paths with personalized financial insights.",
      icon: <Compass className="w-20 h-20 text-green-400" />,
      color: "bg-gradient-to-br from-green-400/50 to-green-600/90"
    },
    {
      title: "Visualize Your Future",
      description: "See the financial impact of different life decisions with interactive projections.",
      icon: <LineChart className="w-20 h-20 text-blue-400" />,
      color: "bg-gradient-to-br from-blue-400/50 to-blue-600/90"
    },
    {
      title: "Track Financial Health",
      description: "Monitor your net worth growth, cash flow, savings projections, and debt reduction with interactive graphs and dashboards.",
      content: (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
            <div className="h-20 bg-gradient-to-r from-green-500/70 to-green-300/70 rounded-md relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-12">
                  <path 
                    fill="rgba(52, 211, 153, 0.8)" 
                    d="M0 20 Q25 5 50 12 T100 8 V20 H0" 
                  />
                </svg>
              </div>
              <div className="absolute top-2 left-2 text-xs font-bold text-white">Net Worth</div>
            </div>
            <div className="text-xs text-center mt-1 text-white/80">Growing Assets</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
            <div className="h-20 bg-gradient-to-r from-blue-500/70 to-blue-300/70 rounded-md relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0">
                <div className="flex justify-between h-16 items-end px-1">
                  <div className="w-2 h-10 bg-blue-200/90 rounded-t"></div>
                  <div className="w-2 h-14 bg-blue-200/90 rounded-t"></div>
                  <div className="w-2 h-8 bg-blue-200/90 rounded-t"></div>
                  <div className="w-2 h-12 bg-blue-200/90 rounded-t"></div>
                  <div className="w-2 h-9 bg-blue-200/90 rounded-t"></div>
                  <div className="w-2 h-13 bg-blue-200/90 rounded-t"></div>
                </div>
              </div>
              <div className="absolute top-2 left-2 text-xs font-bold text-white">Cash Flow</div>
            </div>
            <div className="text-xs text-center mt-1 text-white/80">Monthly Balance</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
            <div className="h-20 bg-gradient-to-r from-purple-500/70 to-purple-300/70 rounded-md relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-purple-200/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-purple-200/60 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-purple-200/80"></div>
                  </div>
                </div>
              </div>
              <div className="absolute top-2 left-2 text-xs font-bold text-white">Debt Ratio</div>
            </div>
            <div className="text-xs text-center mt-1 text-white/80">Decreasing Over Time</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
            <div className="h-20 bg-gradient-to-r from-orange-500/70 to-orange-300/70 rounded-md relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="flex flex-col h-full justify-end">
                  <div className="flex items-end h-16">
                    <div className="w-1/3 h-1/4 bg-orange-200/80"></div>
                    <div className="w-1/3 h-2/4 bg-orange-200/80"></div>
                    <div className="w-1/3 h-3/4 bg-orange-200/80"></div>
                  </div>
                </div>
              </div>
              <div className="absolute top-2 left-2 text-xs font-bold text-white">Savings</div>
            </div>
            <div className="text-xs text-center mt-1 text-white/80">Future Growth</div>
          </div>
        </div>
      ),
      icon: <BarChart className="w-20 h-20 text-cyan-400" />,
      color: "bg-gradient-to-br from-cyan-400/50 to-cyan-600/90"
    },
    {
      title: "Compare Career Paths",
      description: "Explore various careers and compare lifetime earnings potential.",
      icon: <Briefcase className="w-20 h-20 text-purple-400" />,
      color: "bg-gradient-to-br from-purple-400/50 to-purple-600/90"
    },
    {
      title: "Map Life Milestones",
      description: "Plan for key moments like education, marriage, and home buying with confidence.",
      icon: <MapPin className="w-20 h-20 text-orange-400" />,
      color: "bg-gradient-to-br from-orange-400/50 to-orange-600/90"
    }
  ];

  // Success stories
  const successStories = [
    {
      name: "Alex Johnson",
      role: "College Student",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      testimonial: "Launch Plan helped me decide between a 4-year university and community college. I saved $40,000 by starting at community college before transferring.",
      gradient: "from-blue-600 to-indigo-700"
    },
    {
      name: "Maria Rodriguez",
      role: "Recent Graduate",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      testimonial: "I used Launch Plan to compare career paths in healthcare. Now I'm pursuing nursing with a clear understanding of my financial future.",
      gradient: "from-green-600 to-teal-700"
    },
    {
      name: "Jamal Williams",
      role: "Vocational Student",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      testimonial: "Launch Plan showed me that a vocational path in electrical engineering could be more profitable than a traditional 4-year degree for my situation.",
      gradient: "from-purple-600 to-pink-700"
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

  // Floating animation for hero elements
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
      {/* Hero Section with 3D Parallax Effect */}
      <div ref={heroRef} className="relative overflow-hidden">
        {/* Background Animated Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black animate-gradient-slow overflow-hidden">
          {/* Floating particle elements */}
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-green-500/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-40">
          {/* Floating financial icons */}
          <motion.div 
            animate={floatingAnimation}
            className="absolute top-1/4 left-[15%] hidden lg:block"
          >
            <DollarSign className="text-green-400/30 w-16 h-16" />
          </motion.div>
          
          <motion.div 
            animate={{
              ...floatingAnimation,
              transition: { ...floatingAnimation.transition, delay: 1 }
            }}
            className="absolute bottom-1/3 right-[10%] hidden lg:block"
          >
            <BarChart className="text-blue-400/30 w-20 h-20" />
          </motion.div>

          <motion.div 
            animate={{
              ...floatingAnimation,
              transition: { ...floatingAnimation.transition, delay: 0.5 }
            }}
            className="absolute top-1/3 right-[20%] hidden lg:block"
          >
            <GraduationCap className="text-purple-400/30 w-14 h-14" />
          </motion.div>
          
          <motion.div 
            animate={{
              ...floatingAnimation,
              transition: { ...floatingAnimation.transition, delay: 1.5 }
            }}
            className="absolute bottom-1/4 left-[20%] hidden lg:block"
          >
            <Briefcase className="text-orange-400/30 w-12 h-12" />
          </motion.div>

          {/* Main Hero Content */}
          <div className="max-w-4xl mx-auto text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block bg-gradient-to-r from-green-400 to-blue-500 mb-6 px-4 py-1 rounded-full text-sm font-medium">
                Your Future, Your Choices
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="block"
                >
                  Empowering
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="block"
                >
                  <span className="text-white">Your</span> Future Self
                </motion.span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10"
              >
                Make informed decisions today that will create the confident, financially secure future version of you
              </motion.p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
            >
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-6 text-lg rounded-xl"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <Rocket className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              </Button>
              
              <Button 
                onClick={() => setLocation('/explore')}
                variant="outline" 
                size="lg" 
                className="group relative overflow-hidden bg-transparent border-2 border-orange-500 text-orange-400 hover:text-white px-8 py-6 text-lg rounded-xl"
              >
                <span className="relative z-10 flex items-center">
                  Help Me With Ideas
                  <Lightbulb className="ml-2 group-hover:rotate-12 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              </Button>
            </motion.div>
            
            {/* Scroll indicator */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-400 mb-2">Scroll to explore</p>
                <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-1">
                  <motion.div 
                    animate={{ 
                      y: [0, 12, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                    className="w-1.5 h-1.5 bg-white rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 py-14 relative">
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="backdrop-blur-sm bg-white/10 p-6 rounded-2xl"
            >
              <h3 className="text-5xl font-bold mb-2">200k+</h3>
              <p className="text-gray-100 font-medium">Students Empowered</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="backdrop-blur-sm bg-white/10 p-6 rounded-2xl"
            >
              <h3 className="text-5xl font-bold mb-2">$43k</h3>
              <p className="text-gray-100 font-medium">Average Debt Avoided</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="backdrop-blur-sm bg-white/10 p-6 rounded-2xl"
            >
              <h3 className="text-5xl font-bold mb-2">92%</h3>
              <p className="text-gray-100 font-medium">Feel More Confident</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Animated Tutorial Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-slate-800 px-4 py-1 rounded-full text-sm font-medium text-blue-400 mb-4">
                Interactive Platform
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Visualize</span> Your Future Journey
              </h2>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Our interactive platform helps you explore paths and visualize outcomes with stunning clarity.
              </p>
            </motion.div>
          </div>
          
          <div className="max-w-5xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl border border-slate-700"
            >
              {/* Tutorial Controls */}
              <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Discover How It Works</h3>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handlePrevSlide}
                    className="rounded-full hover:bg-white/10 border border-slate-700"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={togglePlayPause}
                    className="rounded-full hover:bg-white/10 border border-slate-600"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleNextSlide}
                    className="rounded-full hover:bg-white/10 border border-slate-700"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Tutorial Slides */}
              <div className="relative h-[30rem] rounded-b-lg overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className={`w-full h-full flex items-center justify-center p-8 ${tutorialSlides[currentSlide].color}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
                      <div className="text-center md:text-left order-2 md:order-1">
                        <h3 className="text-3xl font-bold mb-4 text-white">
                          {tutorialSlides[currentSlide].title}
                        </h3>
                        <p className="text-xl text-white/90 mb-6">
                          {tutorialSlides[currentSlide].description}
                        </p>
                        {tutorialSlides[currentSlide].content}
                        {!tutorialSlides[currentSlide].content && (
                          <Button 
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
                            onClick={handleGetStarted}
                          >
                            Explore This Feature <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {!tutorialSlides[currentSlide].content && (
                        <div className="flex justify-center items-center order-1 md:order-2">
                          <div className="relative">
                            <div className="absolute inset-0 blur-3xl bg-white/20 rounded-full"></div>
                            <motion.div
                              animate={{ 
                                y: [0, -10, 0],
                                rotate: [0, 5, 0]
                              }}
                              transition={{
                                duration: 4,
                                repeat: Infinity,
                                repeatType: "mirror"
                              }}
                              className="relative bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-xl"
                            >
                              {tutorialSlides[currentSlide].icon}
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Slide Indicators */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                  {tutorialSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentSlide ? 'bg-white' : 'bg-white/30'
                      } transition-all duration-300 ${index === currentSlide ? 'scale-125' : 'scale-100'}`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-900 to-transparent"></div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-800 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-slate-800 px-4 py-1 rounded-full text-sm font-medium text-purple-400 mb-4">
                Success Stories
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Students <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Transforming</span> Their Futures
              </h2>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Hear from students who used Launch Plan to make confident decisions about their education and careers.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-700 flex flex-col"
              >
                <div className={`bg-gradient-to-r ${story.gradient} py-10 px-6`}>
                  <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden mx-auto mb-4">
                    <img src={story.avatar} alt={story.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-bold text-center text-white">{story.name}</h3>
                  <p className="text-white/80 text-center">{story.role}</p>
                </div>
                <div className="p-6 flex-grow">
                  <p className="text-gray-300 italic">"{story.testimonial}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid with Animated Icons */}
      <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-slate-800 px-4 py-1 rounded-full text-sm font-medium text-green-400 mb-4">
                Powerful Features
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Tools to <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">Design</span> Your Future
              </h2>
              
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Explore our comprehensive suite of planning and visualization tools.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl border border-slate-700 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-all duration-300">
                <GraduationCap className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-green-400 transition-colors duration-300">Education Pathways</h3>
              <p className="text-gray-300">Compare 4-year universities, community colleges, and vocational training with detailed cost analysis and ROI projections.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl border border-slate-700 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-all duration-300">
                <Briefcase className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors duration-300">Career Exploration</h3>
              <p className="text-gray-300">Discover careers aligned with your interests and visualize income potential, growth opportunities, and market demand.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl border border-slate-700 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-all duration-300">
                <LineChart className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors duration-300">Financial Visualization</h3>
              <p className="text-gray-300">Interactive charts and projections show how your choices affect savings, debt, and wealth over your lifetime.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl border border-slate-700 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-all duration-300">
                <MapPin className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-orange-400 transition-colors duration-300">Life Milestones</h3>
              <p className="text-gray-300">Plan for major events like marriage, home purchases, and family planning with financial clarity and confidence.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl border border-slate-700 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center mb-6 group-hover:bg-teal-500/30 transition-all duration-300">
                <PiggyBank className="h-8 w-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-teal-400 transition-colors duration-300">Savings Strategies</h3>
              <p className="text-gray-300">Test different saving, investing, and spending strategies to optimize your financial outcomes and security.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-xl border border-slate-700 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-6 group-hover:bg-pink-500/30 transition-all duration-300">
                <Sparkles className="h-8 w-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors duration-300">Personalized Guidance</h3>
              <p className="text-gray-300">Receive customized recommendations and insights based on your unique goals, interests, and financial situation.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-blue-600 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">Ready to Launch Your Future?</h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
              Join thousands of students who are designing their future with confidence and clarity today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="group relative overflow-hidden bg-white text-blue-600 hover:text-blue-700 px-10 py-6 text-xl rounded-xl shadow-lg"
              >
                <span className="relative z-10 flex items-center font-bold">
                  Create Free Account
                  <Zap className="ml-2 group-hover:rotate-12 transition-transform" />
                </span>
              </Button>
            </div>
            
            <p className="mt-8 text-white/80 flex items-center justify-center gap-2">
              <span className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-sm">✓</span>
              No credit card required • Start planning in minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="mb-6">
                <h2 className="text-3xl font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">Launch</span> Plan
                </h2>
                <p className="text-gray-400 mt-2 max-w-md">Empowering students to make informed decisions about their education, career, and financial future.</p>
              </div>
              
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-300 hover:bg-slate-700 hover:text-white transition-colors">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-300 hover:bg-slate-700 hover:text-white transition-colors">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-300 hover:bg-slate-700 hover:text-white transition-colors">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-300 hover:bg-slate-700 hover:text-white transition-colors">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4 text-white">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-slate-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Launch Plan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}