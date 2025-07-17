import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';
import TimelinePanel from './components/TimelinePanel';
import EventPanel from './components/EventPanel';
import { loadVideoList, loadTAPLabels, loadEventLogs } from './utils/dataLoader';

function App() {
  const [selectedVideo, setSelectedVideo] = useState('P1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(30);
  const [selectedTab, setSelectedTab] = useState('coded');
  const [isEditingModifiable, setIsEditingModifiable] = useState(false);
  const [timeWindow, setTimeWindow] = useState(5);
  const [timelineDuration, setTimelineDuration] = useState(120); // Default 2 minutes
  const [modifiableSegments, setModifiableSegments] = useState([
    { id: 1, start: 15, end: 25, label: 'Short Pause', type: 'range' },
    { id: 2, start: 50, end: 65, label: 'Long Pause', type: 'range' },
    { id: 3, start: 35, end: 45, label: 'Custom Event', type: 'range' }
  ]);
  
  const [videos, setVideos] = useState([]);
  const [tapLabels, setTapLabels] = useState({});
  const [eventLogs, setEventLogs] = useState({});
  
  useEffect(() => {
    const loadData = async () => {
      const videoList = await loadVideoList();
      const tapData = await loadTAPLabels();
      const logData = await loadEventLogs();
      
      setVideos(videoList);
      setTapLabels(tapData);
      setEventLogs(logData);
    };
    
    loadData();
  }, []);

  const handleTimelineClick = (position) => {
    setCursorPosition(position);
  };

  const handleAddSegment = (newSegment) => {
    if (newSegment) {
      // If a segment object is passed from the timeline editor
      setModifiableSegments([...modifiableSegments, newSegment]);
    } else {
      // If called from the button, create a new segment at cursor
      const segment = {
        id: Date.now(),
        start: Math.max(0, cursorPosition - 5),
        end: Math.min(100, cursorPosition + 5),
        label: `Custom ${modifiableSegments.length + 1}`,
        color: 'bg-purple-500'
      };
      setModifiableSegments([...modifiableSegments, segment]);
    }
  };

  const handleDeleteSegment = (id) => {
    setModifiableSegments(modifiableSegments.filter(seg => seg.id !== id));
  };

  const handleUpdateSegment = (id, updates) => {
    setModifiableSegments(modifiableSegments.map(seg =>
      seg.id === id ? { ...seg, ...updates } : seg
    ));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <VideoList 
          videos={videos}
          selectedVideo={selectedVideo}
          onSelectVideo={setSelectedVideo}
        />
        
        <div className="flex-1 flex flex-col">
          <VideoPlayer
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
          />
          
          <TimelinePanel
            selectedVideo={selectedVideo}
            tapLabels={tapLabels[selectedVideo] || []}
            eventLogs={eventLogs}
            cursorPosition={cursorPosition}
            onTimelineClick={handleTimelineClick}
            isEditingModifiable={isEditingModifiable}
            onToggleEdit={() => setIsEditingModifiable(!isEditingModifiable)}
            modifiableSegments={modifiableSegments}
            onAddSegment={handleAddSegment}
            onDeleteSegment={handleDeleteSegment}
            onUpdateSegment={handleUpdateSegment}
            timelineDuration={timelineDuration}
            onDurationChange={setTimelineDuration}
          />
        </div>
        
        <EventPanel
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          cursorPosition={cursorPosition}
          timeWindow={timeWindow}
          onTimeWindowChange={setTimeWindow}
        />
      </div>
    </div>
  );
}

export default App;