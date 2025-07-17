import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Timeline, DataSet } from 'vis-timeline/standalone/esm/vis-timeline-graph2d';
import { Edit2, Trash2, Plus } from 'lucide-react';
import 'vis-timeline/dist/vis-timeline-graph2d.css';
import './ModifiableTimelineVis.css';

const ModifiableTimelineVis = ({
  segments,
  isEditing,
  onUpdateSegment,
  onDeleteSegment,
  onAddSegment,
  cursorPosition,
  duration = 120
}) => {
  const timelineRef = useRef(null);
  const timelineInstance = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    // Convert segments to vis.js items format with vertical distribution
    const items = new DataSet(
      segments.map((seg, index) => {
        const startTime = (seg.start / 100) * duration;
        const endTime = seg.type === 'range' ? (seg.end / 100) * duration : startTime;
        
        // Format time display with decimal precision
        const formatTime = (seconds) => {
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          if (mins > 0) {
            return `${mins}:${secs.toFixed(1).padStart(4, '0')}`;
          }
          return `${secs.toFixed(1)}s`;
        };
        
        const timeDisplay = seg.type === 'range' 
          ? `${formatTime(startTime)} - ${formatTime(endTime)}`
          : formatTime(startTime);
        
        return {
          id: seg.id,
          content: `<div class="event-content">
            <div class="event-label">${seg.label}</div>
            <div class="event-time">${timeDisplay}</div>
          </div>`,
          start: new Date(2024, 0, 1, 0, 0, startTime),
          end: seg.type === 'range' ? new Date(2024, 0, 1, 0, 0, endTime) : undefined,
          type: seg.type || 'range',
          className: seg.type === 'point' ? 'timeline-point' : `timeline-range ${seg.color}`,
          editable: isEditing,
          group: index % 3 // Distribute events across 3 vertical lanes
        };
      })
    );

    // Create groups for vertical spacing
    const groups = new DataSet([
      { id: 0, content: '', className: 'timeline-group' },
      { id: 1, content: '', className: 'timeline-group' },
      { id: 2, content: '', className: 'timeline-group' }
    ]);

    // Timeline options
    const options = {
      height: '180px',
      min: new Date(2024, 0, 1, 0, 0, 0),
      max: new Date(2024, 0, 1, 0, 0, duration),
      start: new Date(2024, 0, 1, 0, 0, 0),
      end: new Date(2024, 0, 1, 0, 0, isEditing ? duration / 2 : duration), // Start zoomed in when editing
      showCurrentTime: false,
      showMajorLabels: true,
      showMinorLabels: true,
      zoomable: isEditing,
      moveable: isEditing,
      selectable: isEditing,
      stack: false,
      horizontalScroll: isEditing,
      verticalScroll: false,
      zoomKey: isEditing ? 'ctrlKey' : '',
      editable: {
        add: false,
        updateTime: isEditing,
        updateGroup: false,
        remove: false,
        overrideItems: false
      },
      snap: (date, scale, step) => {
        // Enhanced snapping function
        const seconds = date.getSeconds();
        const snapToSeconds = 0.5; // Snap to half-second intervals
        const snappedSeconds = Math.round(seconds / snapToSeconds) * snapToSeconds;
        
        // Check for nearby events and snap to their edges
        const currentTime = (snappedSeconds / duration) * 100;
        let snappedPosition = currentTime;
        
        segments.forEach(seg => {
          // Snap to start of events
          if (Math.abs(currentTime - seg.start) < 2) {
            snappedPosition = seg.start;
          }
          // Snap to end of range events
          if (seg.type === 'range' && Math.abs(currentTime - seg.end) < 2) {
            snappedPosition = seg.end;
          }
        });
        
        const finalSeconds = (snappedPosition / 100) * duration;
        date.setSeconds(Math.floor(finalSeconds));
        date.setMilliseconds((finalSeconds % 1) * 1000);
        return date;
      },
      onMove: (item, callback) => {
        if (isEditing) {
          callback(item);
          handleItemUpdate(item);
        }
      },
      format: {
        minorLabels: {
          second: 's',
          millisecond: 'SSS'
        },
        majorLabels: {
          second: 'mm:ss'
        }
      },
      timeAxis: {
        scale: 'second',
        step: 5
      },
      margin: {
        item: {
          horizontal: 2,
          vertical: 2
        }
      },
      groupOrder: 'id'
    };

    // Create timeline with groups
    timelineInstance.current = new Timeline(timelineRef.current, items, groups, options);

    // Add event listeners
    timelineInstance.current.on('select', (properties) => {
      setSelectedItem(properties.items[0] || null);
    });

    timelineInstance.current.on('doubleClick', (properties) => {
      if (isEditing && properties.what === 'background') {
        const time = properties.time;
        const seconds = (time - new Date(2024, 0, 1, 0, 0, 0)) / 1000;
        const position = (seconds / duration) * 100;
        
        setAddMenuPosition({ x: properties.event.center.x, y: properties.event.center.y });
        setShowAddMenu(true);
      }
    });

    // Update cursor position after a small delay to ensure timeline is ready
    setTimeout(() => {
      updateCursorLine();
    }, 100);

    return () => {
      if (timelineInstance.current) {
        timelineInstance.current.destroy();
        timelineInstance.current = null;
      }
    };
  }, [segments, isEditing, duration]);

  useEffect(() => {
    updateCursorLine();
  }, [cursorPosition, duration]);

  // Keyboard navigation
  useEffect(() => {
    if (!isEditing || !timelineInstance.current) return;

    const handleKeyDown = (e) => {
      if (!timelineInstance.current) return;
      
      const currentWindow = timelineInstance.current.getWindow();
      const windowWidth = currentWindow.end - currentWindow.start;
      const moveAmount = windowWidth * 0.1; // Move 10% of visible window
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          const newStartLeft = new Date(currentWindow.start.getTime() - moveAmount);
          const newEndLeft = new Date(currentWindow.end.getTime() - moveAmount);
          
          // Don't go before timeline start
          if (newStartLeft >= new Date(2024, 0, 1, 0, 0, 0)) {
            timelineInstance.current.setWindow(newStartLeft, newEndLeft, { animation: true });
          }
          break;
          
        case 'ArrowRight':
          e.preventDefault();
          const newStartRight = new Date(currentWindow.start.getTime() + moveAmount);
          const newEndRight = new Date(currentWindow.end.getTime() + moveAmount);
          
          // Don't go past timeline end
          if (newEndRight <= new Date(2024, 0, 1, 0, 0, duration * 1000)) {
            timelineInstance.current.setWindow(newStartRight, newEndRight, { animation: true });
          }
          break;
          
        case 'Home':
          e.preventDefault();
          // Go to beginning
          timelineInstance.current.setWindow(
            new Date(2024, 0, 1, 0, 0, 0),
            new Date(2024, 0, 1, 0, 0, duration),
            { animation: true }
          );
          break;
          
        case 'End':
          e.preventDefault();
          // Go to end
          timelineInstance.current.setWindow(
            new Date(2024, 0, 1, 0, 0, 0),
            new Date(2024, 0, 1, 0, 0, duration),
            { animation: true }
          );
          break;
      }
    };

    // Add event listener to the timeline container
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      // Make container focusable
      container.tabIndex = 0;
    }

    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isEditing, duration]);

  const updateCursorLine = () => {
    if (timelineInstance.current) {
      const cursorTime = new Date(2024, 0, 1, 0, 0, (cursorPosition / 100) * duration);
      try {
        timelineInstance.current.setCustomTime(cursorTime, 'cursor');
      } catch (e) {
        // If cursor doesn't exist, add it first
        timelineInstance.current.addCustomTime(cursorTime, 'cursor');
      }
    }
  };

  const handleItemUpdate = (item) => {
    const startSeconds = (item.start - new Date(2024, 0, 1, 0, 0, 0)) / 1000;
    const startPercent = (startSeconds / duration) * 100;
    
    const updates = {
      start: Math.max(0, Math.min(100, startPercent)),
      label: item.content
    };

    if (item.end) {
      const endSeconds = (item.end - new Date(2024, 0, 1, 0, 0, 0)) / 1000;
      const endPercent = (endSeconds / duration) * 100;
      updates.end = Math.max(0, Math.min(100, endPercent));
    }

    onUpdateSegment(item.id, updates);
  };

  const handleAddEvent = (type) => {
    const seconds = (cursorPosition / 100) * duration;
    const eventName = type === 'point' ? 'Event' : (type === 'short' ? 'Short Pause' : 'Long Pause');
    
    const newSegment = {
      id: Date.now(),
      start: cursorPosition,
      end: type === 'point' ? cursorPosition : Math.min(100, cursorPosition + (type === 'short' ? 2 : 5)),
      label: eventName,
      type: type === 'point' ? 'point' : 'range',
      color: type === 'point' ? 'bg-green-500' : 'bg-purple-500'
    };
    
    onAddSegment(newSegment);
    setShowAddMenu(false);
  };

  const handleDelete = () => {
    if (selectedItem) {
      onDeleteSegment(selectedItem);
      setSelectedItem(null);
    }
  };

  // Always use vis.js timeline for consistency

  return (
    <div ref={containerRef} className="modifiable-timeline-vis-container">
      <div ref={timelineRef} className={`timeline-vis ${isEditing ? 'editing' : ''}`} />
      
      {isEditing && (
        <>
          <div className="timeline-controls">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="control-btn add-btn"
              title="Add event at cursor"
            >
              <Plus size={16} />
              Add at Cursor
            </button>
            
            {selectedItem && (
              <button
                onClick={handleDelete}
                className="control-btn delete-btn"
                title="Delete selected"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
            
            <div className="keyboard-hints">
              <span className="hint-text">Click & drag to pan • ← → arrows to scroll • Mouse wheel to zoom • Ctrl+wheel to zoom</span>
            </div>
          </div>
        </>
      )}

      {showAddMenu && isEditing && (
        <div 
          className="add-menu"
          style={{ 
            position: 'absolute',
            left: `${addMenuPosition.x}px`,
            top: `${addMenuPosition.y}px`
          }}
        >
          <div className="add-menu-header">Add Event Type:</div>
          <button onClick={() => handleAddEvent('point')} className="add-menu-item">
            <div className="event-preview event-point"></div>
            Point Event
          </button>
          <button onClick={() => handleAddEvent('short')} className="add-menu-item">
            <div className="event-preview event-short"></div>
            Short Pause
          </button>
          <button onClick={() => handleAddEvent('long')} className="add-menu-item">
            <div className="event-preview event-long"></div>
            Long Pause
          </button>
          <button onClick={() => setShowAddMenu(false)} className="add-menu-cancel">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ModifiableTimelineVis;