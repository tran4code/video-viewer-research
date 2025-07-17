export const loadVideoList = async () => {
  try {
    const response = await fetch('/data/videos/video_list.json');
    const data = await response.json();
    return data.videos;
  } catch (error) {
    console.error('Error loading video list:', error);
    return [];
  }
};

export const loadTAPLabels = async () => {
  try {
    const response = await fetch('/data/TAP/tap_labels.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading TAP labels:', error);
    return {};
  }
};

export const loadEventLogs = async () => {
  try {
    const streams = ['stream1', 'stream2', 'stream3'];
    const eventLogs = {};
    
    for (const stream of streams) {
      const response = await fetch(`/data/log/${stream}/events.json`);
      const data = await response.json();
      eventLogs[stream] = data;
    }
    
    return eventLogs;
  } catch (error) {
    console.error('Error loading event logs:', error);
    return {};
  }
};