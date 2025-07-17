import React from 'react';

const CodedTimeline = ({ tapLabels, duration = 120 }) => {
  return (
    <div>
      <div className="text-sm font-medium mb-1">Coded</div>
      <div className="h-10 bg-gray-200 rounded relative">
        {tapLabels.map((segment, index) => {
          const startTime = (segment.start / 100) * duration;
          const endTime = (segment.end / 100) * duration;
          const timeLabel = `${startTime.toFixed(1)}s-${endTime.toFixed(1)}s`;
          
          return (
            <div
              key={index}
              className={`absolute h-full rounded flex items-center justify-center text-white text-sm font-medium ${segment.color}`}
              style={{
                left: `${segment.start}%`,
                width: `${segment.end - segment.start}%`
              }}
              title={timeLabel}
            >
              {segment.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CodedTimeline;