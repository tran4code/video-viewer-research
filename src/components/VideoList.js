import React from 'react';

const VideoList = ({ videos, selectedVideo, onSelectVideo }) => {
  return (
    <div className="w-[250px] bg-white border-r border-gray-200">
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
    </div>
  );
};

export default VideoList;