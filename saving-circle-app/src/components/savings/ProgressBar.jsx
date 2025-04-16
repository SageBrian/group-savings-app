
import React from 'react';

const ProgressBar = ({ 
  current, 
  target, 
  showAmount = true,
  className = ''
}) => {
  const percentage = Math.min((current / target) * 100, 100);
  
  return (
    <div className={`w-full h-3 bg-background border border-border rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-primary to-blue-500 dark:from-blue-600 dark:to-purple-600 transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }} 
      />
      {showAmount && (
        <div className="flex justify-between text-xs font-medium mt-1">
          <span className="text-foreground">${current.toFixed(2)}</span>
          <span className="text-muted-foreground">${target.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
