import React from 'react';
import { Play, Pause } from 'lucide-react';

const VideoPlayer = ({ isPlaying, onTogglePlay }) => {
  return (
    <div className="bg-gray-900 h-96 flex items-center justify-center">
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
  );
};

export default VideoPlayer;