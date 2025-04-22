import React from 'react';
import "@/index.css";  // Import Tailwind CSS

interface StepProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const Step: React.FC<StepProps> = ({ children, title, subtitle }) => (
  <div className="mb-8 animate-fadeIn">
    <h3 className="text-2xl font-display font-bold text-primary mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
      {title}
    </h3>
    {subtitle && (
      <p className="text-base text-gray-600 mb-4 max-w-2xl">
        {subtitle}
      </p>
    )}
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
      {children}
    </div>
  </div>
); 