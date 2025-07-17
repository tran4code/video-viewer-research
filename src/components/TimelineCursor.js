import React from 'react';

const TimelineCursor = ({ position }) => {
  return (
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
      style={{ left: `${position}%` }}
    >
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500"></div>
      </div>
    </div>
  );
};

export default TimelineCursor;