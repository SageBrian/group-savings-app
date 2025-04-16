
import React from 'react';

const CircleProgress = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  fontSize = 24,
  showPercentage = true,
  className = '',
}) => {
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedPercentage / 100) * circumference;

  // Generate gradient ID
  const gradientId = `circleGradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`circle-progress ${className} animate-float`} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4085F3" />
            <stop offset="100%" stopColor="#1B53C9" />
          </linearGradient>
        </defs>
        <circle
          stroke="currentColor"
          className="text-savings-blue-100 dark:text-gray-800"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={normalizedPercentage >= 100 ? `url(#${gradientId})` : `url(#${gradientId})`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-500 ease-in-out"
          filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
        />
      </svg>
      {showPercentage && (
        <div
          className="circle-progress-number dark:text-white"
          style={{
            fontSize: `${fontSize}px`,
            width: size,
            height: size,
            lineHeight: `${size}px`,
          }}
        >
          {normalizedPercentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
};

export default CircleProgress;
