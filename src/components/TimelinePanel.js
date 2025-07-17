import React from 'react';
import { Save } from 'lucide-react';
import UnifiedTimeline from './UnifiedTimeline';

const TimelinePanel = ({
  selectedVideo,
  tapLabels,
  eventLogs,
  cursorPosition,
  onTimelineClick,
  isEditingModifiable,
  onToggleEdit,
  modifiableSegments,
  onAddSegment,
  onDeleteSegment,
  onUpdateSegment,
  timelineDuration,
  onDurationChange
}) => {
  const durationOptions = [
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 120, label: '2 minutes' },
    { value: 300, label: '5 minutes' }
  ];

  return (
    <div className="flex-1 bg-white border-b border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Duration:</span>
            <select
              value={timelineDuration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {durationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2">
            <Save size={16} />
            Save
          </button>
        </div>
        
        <UnifiedTimeline
          selectedVideo={selectedVideo}
          tapLabels={tapLabels}
          eventLogs={eventLogs}
          modifiableSegments={modifiableSegments}
          cursorPosition={cursorPosition}
          onTimelineClick={onTimelineClick}
          isEditingModifiable={isEditingModifiable}
          onToggleEdit={onToggleEdit}
          onAddSegment={onAddSegment}
          onDeleteSegment={onDeleteSegment}
          onUpdateSegment={onUpdateSegment}
          duration={timelineDuration}
        />
      </div>
    </div>
  );
};

export default TimelinePanel;