import { useState, useRef, useEffect } from 'react';

interface UseWheelSpinProps {
  resetKey?: number;
  onSpinComplete?: (category: string) => void;
}

export function useWheelSpin({ resetKey = 0, onSpinComplete }: UseWheelSpinProps = {}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Reset state when resetKey changes
  useEffect(() => {
    console.log('useWheelSpin: resetKey changed to', resetKey);
    setIsSpinning(false);
    setRotation(0);
    
    // Force a repaint of the component with a small delay
    const timer = setTimeout(() => {
      console.log('useWheelSpin: Delayed reset complete');
      if (wheelRef.current) {
        const currentDisplay = wheelRef.current.style.display;
        wheelRef.current.style.display = 'none';
        void wheelRef.current.offsetHeight;
        wheelRef.current.style.display = currentDisplay;
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [resetKey]);
  
  const spinWheel = (categories: string[]) => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Land on one of the segments
    const segmentSize = 360 / categories.length;
    const randomSegment = Math.floor(Math.random() * categories.length);
    const segmentRotation = randomSegment * segmentSize;
    
    // Calculate a final rotation that will land exactly on the chosen segment
    const fullRotations = 4 + Math.floor(Math.random() * 2); // 4-5 full rotations
    const newRotation = (fullRotations * 360) + segmentRotation;
    
    // Set the final rotation value
    setRotation(newRotation);
    
    // Call onSpinComplete with the selected category after the spin
    setTimeout(() => {
      setIsSpinning(false);
      if (onSpinComplete) {
        onSpinComplete(categories[randomSegment]);
      }
    }, 3000); // Match the CSS animation duration
  };
  
  return {
    isSpinning,
    rotation,
    wheelRef,
    spinWheel
  };
} 