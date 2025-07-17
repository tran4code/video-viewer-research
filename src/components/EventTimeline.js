import React from 'react';

const EventTimeline = ({ streamName, events, duration = 120 }) => {
  return (
    <div>
      <div className="text-sm font-medium mb-1 capitalize">{streamName}</div>
      <div className="h-10 bg-gray-200 rounded relative">
        {events.map((eventTime, index) => {
          const timeInSeconds = (eventTime / 100) * duration;
          return (
            <div
              key={index}
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full"
              style={{ left: `${eventTime}%` }}
              title={`${timeInSeconds.toFixed(1)}s`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EventTimeline;