// Utility to help find YouTube Channel ID from handle
// Run this in a browser console or Node.js environment

const getChannelIdFromHandle = async (handle, apiKey) => {
  try {
    // Remove @ if present
    const cleanHandle = handle.replace('@', '');
    
    // Try multiple approaches to get channel ID
    const urls = [
      `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${cleanHandle}&key=${apiKey}`,
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${cleanHandle}&type=channel&key=${apiKey}`
    ];
    
    for (const url of urls) {
      console.log('Trying:', url);
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Response:', data);
      
      if (data.items && data.items.length > 0) {
        const channelId = data.items[0].id?.channelId || data.items[0].id;
        console.log('Found Channel ID:', channelId);
        return channelId;
      }
    }
    
    console.log('Channel ID not found with API, try manual method:');
    console.log('1. Go to https://youtube.com/@cr7-mq7');
    console.log('2. View page source (Ctrl+U)');
    console.log('3. Search for "channelId" or "externalId"');
    console.log('4. Or use YouTube Studio → Settings → Channel → Advanced');
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage:
// getChannelIdFromHandle('cr7-mq7', 'AIzaSyCfGhZoWFJ5rNCG04o4_oLYHELRNyuB0eU');

export { getChannelIdFromHandle };