// YouTube channel configuration
export const YOUTUBE_CONFIG = {
  // Your YouTube channel ID
  CHANNEL_ID: 'UCueZNkCd2FXGWY7CNrmzT-w',
  
  // Your YouTube channel handle
  CHANNEL_HANDLE: '@cr7-mq7',
  
  // YouTube Data API Key for accurate live detection
  API_KEY: 'AIzaSyCfGhZoWFJ5rNCG04o4_oLYHELRNyuB0eU',
  
  // Channel display name
  CHANNEL_NAME: 'CR7-MQ7',
  
  // Default check interval in milliseconds (30 seconds to avoid quota limits)
  CHECK_INTERVAL: 30 * 1000,
};

// Helper function to get YouTube Data API URL for checking live streams
export const getYouTubeLiveCheckURL = (channelId, apiKey) => {
  return `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
};

// Helper function to get YouTube channel URL
export const getChannelURL = (channelId) => {
  return `https://www.youtube.com/channel/${channelId}`;
};

// Helper function to get YouTube live embed URL
export const getLiveEmbedURL = (channelId, videoId = null) => {
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1`;
  }
  return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1&controls=1`;
};