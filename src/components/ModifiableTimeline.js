import React from 'react';
import { X } from 'lucide-react';

const ModifiableTimeline = ({ segments, isEditing, onDeleteSegment, onUpdateSegment }) => {
  return (
    <div className="h-10 bg-gray-200 rounded relative">
      {segments.map((segment) => (
        <div
          key={segment.id}
          className={`absolute h-full rounded flex items-center justify-center text-white text-sm font-medium ${segment.color} ${
            isEditing ? 'cursor-move' : ''
          }`}
          style={{
            left: `${segment.start}%`,
            width: `${segment.end - segment.start}%`
          }}
        >
          {segment.label}
          {isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSegment(segment.id);
              }}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 hover:bg-red-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ModifiableTimeline;