import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Timeline, DataSet } from 'vis-timeline/standalone/esm/vis-timeline-graph2d';
import { Edit2, Trash2, Plus } from 'lucide-react';
import 'vis-timeline/dist/vis-timeline-graph2d.css';
import './UnifiedTimeline.css';

const UnifiedTimeline = ({
  selectedVideo,
  tapLabels,
  eventLogs,
  modifiableSegments,
  cursorPosition,
  onTimelineClick,
  isEditingModifiable,
  onToggleEdit,
  onAddSegment,
  onDeleteSegment,
  onUpdateSegment,
  duration = 120
}) => {
  const timelineRef = useRef(null);
  const timelineInstance = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState({ x: 0, y: 0 });
  const itemsDataSetRef = useRef(null);
  const groupsDataSetRef = useRef(null);

  // Function to load timeline data
  const loadTimelineData = useCallback(() => {
    if (!itemsDataSetRef.current || !timelineInstance.current) {
      console.log('Cannot load data - missing refs');
      return;
    }

    // Additional check to ensure timeline DOM element is ready
    if (!timelineRef.current || !timelineRef.current.firstChild) {
      console.log('Timeline DOM not ready, delaying data load...');
      setTimeout(() => loadTimelineData(), 50);
      return;
    }

    console.log('Loading timeline data...');
    const items = [];

    // Group 0: Coded - TAP labels as spans
    if (tapLabels && tapLabels.length > 0) {
      tapLabels.forEach((label, index) => {
        const startTime = (label.start / 100) * duration;
        const endTime = (label.end / 100) * duration;
        items.push({
          id: `coded-${index}`,
          content: label.label,
          start: new Date(2024, 0, 1, 0, 0, startTime),
          end: new Date(2024, 0, 1, 0, 0, endTime),
          group: 0,
          className: 'coded-item',
          editable: false,
          selectable: false
        });
      });
    }

    // Group 1: Eclipse - Event logs as dots from all streams
    if (eventLogs) {
      Object.entries(eventLogs).forEach(([streamName, streamData]) => {
        if (streamData[selectedVideo]) {
          streamData[selectedVideo].forEach((eventTime, index) => {
            const timeInSeconds = (eventTime / 100) * duration;
            items.push({
              id: `eclipse-${streamName}-${index}`,
              content: '',
              start: new Date(2024, 0, 1, 0, 0, timeInSeconds),
              group: 1,
              className: 'eclipse-item',
              type: 'point',
              editable: false,
              selectable: false,
              title: `${streamName}: ${timeInSeconds.toFixed(1)}s`
            });
          });
        }
      });
    }

    // Group 2: Modifiable - Similar to coded but editable (ranges/spans only)
    modifiableSegments.forEach((seg) => {
      const startTime = (seg.start / 100) * duration;
      const endTime = seg.type === 'range' ? (seg.end / 100) * duration : startTime;
      
      items.push({
        id: seg.id,
        content: seg.label,
        start: new Date(2024, 0, 1, 0, 0, startTime),
        end: seg.type === 'range' ? new Date(2024, 0, 1, 0, 0, endTime) : undefined,
        type: seg.type || 'range',
        group: 2,
        className: 'modifiable-item', // Always use modifiable-item style
        editable: isEditingModifiable,
        selectable: isEditingModifiable
      });
    });

    // Clear and update items
    itemsDataSetRef.current.clear();
    if (items.length > 0) {
      itemsDataSetRef.current.add(items);
    }
    
    console.log(`Added ${items.length} items to timeline`);

    // Update timeline options for edit mode
    if (timelineInstance.current) {
      timelineInstance.current.setOptions({
        selectable: isEditingModifiable,
        editable: {
          add: false,
          updateTime: isEditingModifiable,
          updateGroup: false,
          remove: false,
          overrideItems: false
        }
      });
      
      // Force redraw to prevent disappearing and ensure data visibility
      requestAnimationFrame(() => {
        if (timelineInstance.current) {
          timelineInstance.current.redraw();
          timelineInstance.current.fit();
        }
      });
    }
  }, [tapLabels, eventLogs, modifiableSegments, isEditingModifiable, duration, selectedVideo]);

  // Initialize timeline
  useEffect(() => {
    if (!timelineRef.current) return;

    // Destroy existing timeline if it exists
    if (timelineInstance.current) {
      timelineInstance.current.destroy();
      timelineInstance.current = null;
    }

    // Create groups - matching the EventPanel tabs
    const groups = new DataSet([
      { id: 0, content: 'Coded', stack: false },
      { id: 1, content: 'Eclipse', stack: false },
      { id: 2, content: 'Modifiable', stack: true, stackItems: true }
    ]);

    groupsDataSetRef.current = groups;

    // Timeline options
    const options = {
      height: '300px',
      min: new Date(2024, 0, 1, 0, 0, 0),
      max: new Date(2024, 0, 1, 0, 0, duration),
      start: new Date(2024, 0, 1, 0, 0, 0),
      end: new Date(2024, 0, 1, 0, 0, duration),
      showCurrentTime: false,
      showMajorLabels: true,
      showMinorLabels: true,
      zoomable: true,
      moveable: true,
      selectable: isEditingModifiable,
      stack: true,
      stackSubgroups: true,
      horizontalScroll: true,
      verticalScroll: false,
      zoomKey: 'ctrlKey',
      groupOrder: 'id',
      editable: {
        add: false,
        updateTime: isEditingModifiable,
        updateGroup: false,
        remove: false,
        overrideItems: false
      },
      margin: {
        item: {
          horizontal: 2,
          vertical: 5
        }
      },
      onMove: (item, callback) => {
        if (String(item.id).match(/^\\d+$/)) {
          callback(item);
          const startSeconds = (item.start - new Date(2024, 0, 1, 0, 0, 0)) / 1000;
          const startPercent = (startSeconds / duration) * 100;
          
          const updates = {
            start: Math.max(0, Math.min(100, startPercent))
          };

          if (item.end) {
            const endSeconds = (item.end - new Date(2024, 0, 1, 0, 0, 0)) / 1000;
            const endPercent = (endSeconds / duration) * 100;
            updates.end = Math.max(0, Math.min(100, endPercent));
          }

          onUpdateSegment(item.id, updates);
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
      }
    };

    // Create items dataset
    itemsDataSetRef.current = new DataSet();
    
    // Create timeline
    timelineInstance.current = new Timeline(timelineRef.current, itemsDataSetRef.current, groups, options);
    
    console.log('Timeline created successfully');
    
    // Wait for timeline to be fully rendered before proceeding
    timelineInstance.current.on('changed', () => {
      console.log('Timeline changed event fired');
      // Ensure timeline is properly sized and visible
      requestAnimationFrame(() => {
        if (timelineInstance.current) {
          timelineInstance.current.redraw();
        }
      });
    });

    // Add event listeners
    timelineInstance.current.on('select', (properties) => {
      if (isEditingModifiable) {
        const selectedId = properties.items[0];
        if (selectedId && String(selectedId).match(/^\\d+$/)) {
          setSelectedItem(selectedId);
        } else {
          setSelectedItem(null);
        }
      }
    });

    timelineInstance.current.on('click', (properties) => {
      if (properties.what === 'background' || properties.what === 'axis') {
        const time = properties.time;
        const seconds = (time - new Date(2024, 0, 1, 0, 0, 0)) / 1000;
        const position = (seconds / duration) * 100;
        onTimelineClick(Math.max(0, Math.min(100, position)));
        
        // Force redraw after click to prevent disappearing
        setTimeout(() => {
          if (timelineInstance.current) {
            timelineInstance.current.redraw();
          }
        }, 0);
      }
    });

    timelineInstance.current.on('doubleClick', (properties) => {
      if (isEditingModifiable && properties.what === 'background') {
        const time = properties.time;
        const seconds = (time - new Date(2024, 0, 1, 0, 0, 0)) / 1000;
        const position = (seconds / duration) * 100;
        
        setAddMenuPosition({ x: properties.event.center.x, y: properties.event.center.y });
        setShowAddMenu(true);
      }
    });

    // Ensure timeline is ready before loading data
    const initializeTimelineData = () => {
      if (timelineInstance.current && itemsDataSetRef.current) {
        console.log('Timeline ready, loading data...');
        loadTimelineData();
        updateCursorLine();
        
        // Force initial redraw to ensure content is visible
        requestAnimationFrame(() => {
          if (timelineInstance.current) {
            timelineInstance.current.redraw();
            timelineInstance.current.fit();
          }
        });
      } else {
        // Timeline not ready yet, retry
        setTimeout(initializeTimelineData, 50);
      }
    };
    
    // Start initialization
    setTimeout(initializeTimelineData, 100);

    // Add window resize handler with debouncing
    const handleResize = () => {
      if (timelineInstance.current) {
        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => {
          if (timelineInstance.current) {
            timelineInstance.current.redraw();
            timelineInstance.current.fit();
          }
        });
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timelineInstance.current) {
        timelineInstance.current.destroy();
        timelineInstance.current = null;
      }
    };
  }, [eventLogs, loadTimelineData]);

  // Load data when timeline is ready or data changes
  useEffect(() => {
    if (itemsDataSetRef.current && timelineInstance.current) {
      console.log('Data changed, reloading timeline...');
      loadTimelineData();
      
      // Ensure content is visible after data load
      setTimeout(() => {
        if (timelineInstance.current) {
          timelineInstance.current.redraw();
          timelineInstance.current.fit();
        }
      }, 50);
    }
  }, [loadTimelineData]);

  useEffect(() => {
    updateCursorLine();
  }, [cursorPosition, duration]);

  const updateCursorLine = () => {
    if (timelineInstance.current) {
      const cursorTime = new Date(2024, 0, 1, 0, 0, (cursorPosition / 100) * duration);
      try {
        timelineInstance.current.setCustomTime(cursorTime, 'cursor');
      } catch (e) {
        timelineInstance.current.addCustomTime(cursorTime, 'cursor');
      }
      
      // Force redraw after cursor update to ensure visibility
      requestAnimationFrame(() => {
        if (timelineInstance.current) {
          timelineInstance.current.redraw();
        }
      });
    }
  };

  const handleAddEvent = (type) => {
    // Check if there are existing segments at this position for stacking
    const existingAtPosition = modifiableSegments.filter(seg => {
      const segStart = seg.start;
      const segEnd = seg.end || seg.start;
      return cursorPosition >= segStart && cursorPosition <= segEnd;
    });
    
    const newSegment = {
      id: Date.now(),
      start: cursorPosition,
      end: Math.min(100, cursorPosition + (type === 'short' ? 5 : 10)),
      label: `${type === 'short' ? 'Short' : 'Long'} ${existingAtPosition.length > 0 ? `(${existingAtPosition.length + 1})` : ''}`,
      type: 'range'
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

  const formatTime = (position) => {
    const seconds = Math.round((position / 100) * duration);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const totalMins = Math.floor(duration / 60);
    const totalSecs = duration % 60;
    
    if (totalMins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')} / ${totalMins}:${totalSecs.toString().padStart(2, '0')}`;
    }
    return `${seconds}s / ${duration}s`;
  };

  return (
    <div className="unified-timeline-container">
      <div className="timeline-header">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <span className="text-sm text-gray-600">{formatTime(cursorPosition)}</span>
      </div>

      <div className="timeline-wrapper">
        <div ref={timelineRef} className="unified-timeline" />
      </div>

      <div className="timeline-footer">
        <div className="edit-controls">
          <span className="text-sm font-medium">Modifiable Track:</span>
          <button
            onClick={onToggleEdit}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              isEditingModifiable
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isEditingModifiable ? 'Disable Edit' : 'Open Edit'}
          </button>
        </div>

        {isEditingModifiable && (
          <div className="edit-actions">
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
          </div>
        )}

        <div className="timeline-info">
          <div className="keyboard-hints">
            <span className="hint-text">Click & drag to pan • Mouse wheel to zoom • Ctrl+wheel for fine zoom</span>
          </div>
          {isEditingModifiable && (
            <div className="stacking-info">
              <span className="info-text">Stacking enabled: Multiple segments can overlap</span>
            </div>
          )}
        </div>
      </div>

      {showAddMenu && isEditingModifiable && (
        <div 
          className="add-menu"
          style={{ 
            position: 'absolute',
            left: `${addMenuPosition.x}px`,
            top: `${addMenuPosition.y}px`
          }}
        >
          <div className="add-menu-header">Add Segment:</div>
          {(() => {
            const existingAtPosition = modifiableSegments.filter(seg => {
              const segStart = seg.start;
              const segEnd = seg.end || seg.start;
              return cursorPosition >= segStart && cursorPosition <= segEnd;
            });
            return existingAtPosition.length > 0 && (
              <div className="add-menu-info">
                {existingAtPosition.length} segment{existingAtPosition.length > 1 ? 's' : ''} at this position
              </div>
            );
          })()}
          <button onClick={() => handleAddEvent('short')} className="add-menu-item">
            Short Segment
          </button>
          <button onClick={() => handleAddEvent('long')} className="add-menu-item">
            Long Segment
          </button>
          <button onClick={() => setShowAddMenu(false)} className="add-menu-cancel">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default UnifiedTimeline;