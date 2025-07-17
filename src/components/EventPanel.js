import React from 'react';
import { getTimelineEvents } from '../utils/eventData';

const EventPanel = ({ selectedTab, onTabChange, cursorPosition, timeWindow, onTimeWindowChange }) => {
  const tabs = ['coded', 'eclipse', 'modifiable'];
  
  const getAllEventsWithinWindow = () => {
    const events = getTimelineEvents()[selectedTab];
    if (!events) return [];
    
    const allEvents = [
      ...events.before.map(e => ({ ...e, isAfter: false })),
      ...events.after.map(e => ({ ...e, isAfter: true }))
    ];
    
    return allEvents.filter(event => {
      const eventTimeValue = parseInt(event.time.replace(/[^\d-]/g, ''));
      return Math.abs(eventTimeValue) <= timeWindow;
    });
  };
  
  const eventsToShow = getAllEventsWithinWindow();

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-4 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`pb-2 px-1 capitalize transition-colors ${
                selectedTab === tab
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Cursor at: {Math.round(cursorPosition)}s</span>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <label className="text-sm text-gray-600">Time window:</label>
          <input
            type="number"
            min="1"
            value={timeWindow}
            onChange={(e) => onTimeWindowChange(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
          />
          <span className="text-sm text-gray-600">seconds</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <h3 className="font-semibold mb-3">Events within {timeWindow}s window</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Time</th>
                <th className="text-left py-2 px-2">Event</th>
                <th className="text-left py-2 px-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {eventsToShow.map((event, index) => (
                <tr
                  key={index}
                  className={`border-b ${
                    event.isAfter ? 'bg-green-50' : 'bg-blue-50'
                  }`}
                >
                  <td className="py-2 px-2">{event.time}</td>
                  <td className="py-2 px-2 font-medium">{event.event}</td>
                  <td className="py-2 px-2">{event.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-gray-300"></div>
            <span>Before cursor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-gray-300"></div>
            <span>After cursor</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPanel;