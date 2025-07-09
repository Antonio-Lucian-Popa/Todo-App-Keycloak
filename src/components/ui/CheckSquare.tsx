import React from 'react';
import { Check } from 'lucide-react';

interface CheckSquareProps {
  className?: string;
}

export const CheckSquare: React.FC<CheckSquareProps> = ({ className }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center">
        <Check className="h-4 w-4" />
      </div>
    </div>
  );
};