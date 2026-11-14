import React from "react";

interface SoccerBallIconProps {
  className?: string;
}

export function SoccerBallIcon({ className = "h-5 w-5" }: SoccerBallIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer ball circle */}
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.9" />
      {/* Center pentagon */}
      <polygon
        points="12,7.3 16.3,10.4 14.7,15.3 9.3,15.3 7.7,10.4"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Seams connecting pentagon vertices to outer rim */}
      <line x1="12" y1="7.3" x2="12" y2="2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="16.3" y1="10.4" x2="21.0" y2="8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="14.7" y1="15.3" x2="17.8" y2="19.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="9.3" y1="15.3" x2="6.2" y2="19.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="7.7" y1="10.4" x2="3.0" y2="8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
