import React from 'react';
import { Play, Pause } from 'lucide-react';

const VideoPanel = ({ videos, selectedVideo, onSelectVideo, isPlaying, onTogglePlay }) => {
  return (
    <div className="w-[250px] bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Videos</h2>
        <div className="space-y-2">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video.id)}
              className={`px-4 py-3 rounded cursor-pointer transition-colors ${
                selectedVideo === video.id
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {video.name}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white mb-4">Video Player Area</div>
          <button
            onClick={onTogglePlay}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 transition-colors"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPanel;