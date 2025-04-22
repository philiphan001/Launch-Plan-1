import { AvatarAttributes } from '@/data/avatarOptions';

interface AvatarVisualizationProps {
  attributes: AvatarAttributes;
}

export function AvatarVisualization({ attributes }: AvatarVisualizationProps) {
  const getHairStyle = () => {
    switch (attributes.hairStyle) {
      case 'spiky':
        return (
          <path
            d="M50,20 Q60,10 70,20 Q80,30 70,40 Q60,50 50,40 Q40,30 50,20"
            className={getHairColorClass()}
          />
        );
      case 'straight':
        return (
          <path
            d="M30,20 L70,20 L70,40 L30,40 Z"
            className={getHairColorClass()}
          />
        );
      case 'curly':
        return (
          <path
            d="M30,20 Q40,10 50,20 Q60,30 50,40 Q40,50 30,40 Q20,30 30,20"
            className={getHairColorClass()}
          />
        );
      case 'wavy':
        return (
          <path
            d="M30,20 Q40,15 50,20 Q60,25 50,30 Q40,35 30,30 Q20,25 30,20"
            className={getHairColorClass()}
          />
        );
      case 'short':
        return (
          <path
            d="M30,20 L70,20 L70,30 L30,30 Z"
            className={getHairColorClass()}
          />
        );
      default:
        return null;
    }
  };

  const getEyeStyle = () => {
    switch (attributes.style) {
      case 'anime':
        return (
          <>
            <circle cx="40" cy="35" r="5" fill="black" />
            <circle cx="60" cy="35" r="5" fill="black" />
          </>
        );
      case 'realistic':
        return (
          <>
            <ellipse cx="40" cy="35" rx="4" ry="3" fill="black" />
            <ellipse cx="60" cy="35" rx="4" ry="3" fill="black" />
          </>
        );
      case 'cartoon':
        return (
          <>
            <circle cx="40" cy="35" r="4" fill="black" />
            <circle cx="60" cy="35" r="4" fill="black" />
          </>
        );
      default:
        return null;
    }
  };

  const getMouthStyle = () => {
    switch (attributes.style) {
      case 'anime':
        return (
          <path
            d="M40,45 Q50,50 60,45"
            stroke="black"
            strokeWidth="2"
            fill="none"
          />
        );
      case 'realistic':
        return (
          <path
            d="M40,45 Q50,48 60,45"
            stroke="black"
            strokeWidth="1"
            fill="none"
          />
        );
      case 'cartoon':
        return (
          <path
            d="M40,45 Q50,55 60,45"
            stroke="black"
            strokeWidth="2"
            fill="none"
          />
        );
      default:
        return null;
    }
  };

  const getOutfitSvg = () => {
    switch (attributes.outfit) {
      case 'schoolUniform':
        return (
          <path
            d="M30,50 L70,50 L70,80 L30,80 Z"
            fill={getOutfitColor(attributes.outfit)}
          />
        );
      case 'casual':
        return (
          <path
            d="M30,50 L70,50 L70,80 L30,80 Z"
            fill={getOutfitColor(attributes.outfit)}
          />
        );
      case 'business':
        return (
          <path
            d="M30,50 L70,50 L70,80 L30,80 Z"
            fill={getOutfitColor(attributes.outfit)}
          />
        );
      case 'sporty':
        return (
          <path
            d="M30,50 L70,50 L70,80 L30,80 Z"
            fill={getOutfitColor(attributes.outfit)}
          />
        );
      case 'creative':
        return (
          <path
            d="M30,50 L70,50 L70,80 L30,80 Z"
            fill={getOutfitColor(attributes.outfit)}
          />
        );
      default:
        return null;
    }
  };

  const getOutfitColor = (outfit: string) => {
    switch (outfit) {
      case 'schoolUniform':
        return '#4a90e2';
      case 'casual':
        return '#e2844a';
      case 'business':
        return '#2c3e50';
      case 'sporty':
        return '#e24a4a';
      case 'creative':
        return '#4ae284';
      default:
        return '#4a90e2';
    }
  };

  const getAccessoryElement = () => {
    switch (attributes.accessory) {
      case 'headphones':
        return (
          <path
            d="M20,30 Q30,20 40,30 M60,30 Q70,20 80,30"
            stroke="black"
            strokeWidth="2"
            fill="none"
          />
        );
      case 'glasses':
        return (
          <>
            <rect x="35" y="32" width="10" height="5" stroke="black" fill="none" />
            <rect x="55" y="32" width="10" height="5" stroke="black" fill="none" />
            <path d="M45,34 L55,34" stroke="black" strokeWidth="1" />
          </>
        );
      case 'hat':
        return (
          <path
            d="M30,15 Q50,5 70,15"
            stroke="black"
            strokeWidth="2"
            fill="none"
          />
        );
      case 'watch':
        return (
          <circle cx="70" cy="60" r="5" stroke="black" fill="none" />
        );
      default:
        return null;
    }
  };

  const getHairColorClass = () => {
    switch (attributes.hairColor) {
      case 'black':
        return 'fill-black';
      case 'brown':
        return 'fill-brown-600';
      case 'blonde':
        return 'fill-yellow-300';
      case 'red':
        return 'fill-red-600';
      case 'blue':
        return 'fill-blue-500';
      default:
        return 'fill-black';
    }
  };

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
      >
        {/* Background */}
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill="#f3f4f6"
          rx="10"
        />
        
        {/* Hair */}
        {getHairStyle()}
        
        {/* Face */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="#ffdbac"
        />
        
        {/* Eyes */}
        {getEyeStyle()}
        
        {/* Mouth */}
        {getMouthStyle()}
        
        {/* Outfit */}
        {getOutfitSvg()}
        
        {/* Accessory */}
        {getAccessoryElement()}
      </svg>
    </div>
  );
} 