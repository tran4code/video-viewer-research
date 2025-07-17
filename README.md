# Video Viewer - Video Analysis Web Application

A React-based video analysis web application that allows users to analyze videos with multiple timeline tracks, annotations, and event tracking.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
video-viewer-research/
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── VideoPanel.js
│   │   ├── TimelinePanel.js
│   │   ├── TimelineCursor.js
│   │   ├── CodedTimeline.js
│   │   ├── EventTimeline.js
│   │   ├── ModifiableTimeline.js
│   │   └── EventPanel.js
│   ├── utils/
│   │   ├── dataLoader.js
│   │   └── eventData.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── data/
│   ├── TAP/
│   │   └── tap_labels.json
│   ├── log/
│   │   ├── stream1/
│   │   │   └── events.json
│   │   ├── stream2/
│   │   │   └── events.json
│   │   └── stream3/
│   │       └── events.json
│   └── videos/
│       └── video_list.json
├── public/
│   └── index.html
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Features

- **Video Selection**: Browse and select videos from the playlist (P1, P2, P3, P4)
- **Timeline Visualization**: 
  - TAP Labels track with colored segments
  - Multiple event log tracks from different data streams
  - Modifiable track for custom annotations
- **Timeline Cursor**: Click anywhere on the timeline to move the cursor
- **Event Panel**: View events within a specified time window around the cursor
- **Tab Navigation**: Switch between Coded, Eclipse, and Modifiable event views
- **Edit Mode**: Add, delete, and modify segments in the Modifiable timeline

## Data Structure

- **TAP Labels**: Located in `data/TAP/tap_labels.json` - Contains timeline segments for each video
- **Event Logs**: Located in `data/log/[stream]/events.json` - Contains event timestamps for each stream
- **Video List**: Located in `data/videos/video_list.json` - Contains available videos

## Next Steps

To integrate the react-timeline-editor for more advanced timeline editing capabilities:

1. The package is already included in dependencies
2. Replace the ModifiableTimeline component with the react-timeline-editor implementation
3. Follow the integration notes in the specifications document