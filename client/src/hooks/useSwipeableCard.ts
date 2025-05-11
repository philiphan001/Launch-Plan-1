import { useState, useRef, useEffect } from 'react';
import { useAnimation } from 'framer-motion';
import { Scenario } from '@/data/swipeableScenarios';

interface UseSwipeableCardProps {
  scenarios: Scenario[];
  resetKey?: number;
  onComplete?: (results: Record<string, boolean>) => void;
}

export function useSwipeableCard({ scenarios, resetKey = 0, onComplete }: UseSwipeableCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const cardControls = useAnimation();
  const dragControls = useRef({ startX: 0 });
  const [dragOffset, setDragOffset] = useState(0);
  
  // Reset state when resetKey changes
  useEffect(() => {
    console.log('useSwipeableCard: resetKey changed to', resetKey);
    setCurrentIndex(0);
    setResults({});
    setDragOffset(0);
    cardControls.set({ x: 0, rotate: 0, opacity: 1 });
    
    // Force a repaint of the component
    const timer = setTimeout(() => {
      console.log('useSwipeableCard: Delayed reset complete');
      cardControls.set({ x: 0, rotate: 0, opacity: 1 });
    }, 50);
    
    return () => clearTimeout(timer);
  }, [resetKey, cardControls]);
  
  const handleDragStart = () => {
    dragControls.current.startX = 0;
  };
  
  const handleDrag = (_: any, info: any) => {
    dragControls.current.startX = info.offset.x;
    setDragOffset(info.offset.x);
  };
  
  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    const xOffset = info.offset.x;
    
    if (xOffset > threshold) {
      // Swiped right (like)
      handleSwipe(true);
    } else if (xOffset < -threshold) {
      // Swiped left (dislike)
      handleSwipe(false);
    } else {
      // Return to center
      cardControls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 }});
      setDragOffset(0);
    }
  };
  
  const handleSwipe = (liked: boolean) => {
    if (currentIndex < scenarios.length) {
      const scenario = scenarios[currentIndex];
      
      // Post response to backend
      const session_id = window.localStorage.getItem('swipe_session_id') || crypto.randomUUID();
      window.localStorage.setItem('swipe_session_id', session_id);
      const question_id = scenario.id;
      const response_value = liked;
      const device_info = window.navigator.userAgent;
      fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id,
          question_id,
          response_value,
          response_time_ms: null,
          device_info,
        }),
      })
        .then(res => res.json())
        .then(data => {
          // Optionally handle success
          console.log('Response saved:', data);
        })
        .catch(err => {
          // Optionally handle error
          console.error('Failed to save response:', err);
        });
      
      // Animate card off-screen
      cardControls.start({ 
        x: liked ? 500 : -500, 
        rotate: liked ? 30 : -30,
        opacity: 0,
        transition: { duration: 0.5 } 
      }).then(() => {
        // Track result
        const updatedResults = {
          ...results,
          [scenario.id]: liked
        };
        setResults(updatedResults);
        
        // Update index to move to next card
        if (currentIndex < scenarios.length - 1) {
          setCurrentIndex(currentIndex + 1);
          // Reset animation for next card
          setDragOffset(0);
          cardControls.set({ x: 0, rotate: 0, opacity: 1 });
        } else {
          // All scenarios done - use the updated results to ensure the last card is included
          if (onComplete) {
            onComplete(updatedResults);
          }
        }
      });
    }
  };
  
  const handleSkip = () => {
    if (currentIndex < scenarios.length) {
      const scenario = scenarios[currentIndex];
      // Post skipped response to backend
      const session_id = window.localStorage.getItem('swipe_session_id') || crypto.randomUUID();
      window.localStorage.setItem('swipe_session_id', session_id);
      const question_id = scenario.id;
      const response_value = false;
      const device_info = window.navigator.userAgent;
      fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id,
          question_id,
          response_value,
          response_time_ms: null,
          device_info,
        }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('Skipped response saved:', data);
        })
        .catch(err => {
          console.error('Failed to save skipped response:', err);
        });
      // Animate card off-screen (to the left)
      cardControls.start({
        x: -500,
        rotate: -30,
        opacity: 0,
        transition: { duration: 0.5 }
      }).then(() => {
        const updatedResults = {
          ...results,
          [scenario.id]: false
        };
        setResults(updatedResults);
        if (currentIndex < scenarios.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setDragOffset(0);
          cardControls.set({ x: 0, rotate: 0, opacity: 1 });
        } else {
          if (onComplete) {
            onComplete(updatedResults);
          }
        }
      });
    }
  };
  
  // Calculate whether we're showing a "like" or "dislike" indicator
  const swipeStatus = () => {
    if (dragOffset > 50) return 'like';
    if (dragOffset < -50) return 'dislike';
    return null;
  };
  
  return {
    currentIndex,
    results,
    dragOffset,
    cardControls,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleSkip,
    swipeStatus
  };
} 