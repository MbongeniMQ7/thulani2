// Alternative live detection methods without API quotas
import { YOUTUBE_CONFIG } from './youtube';

// Method 1: YouTube RSS Feed (No API key needed, no quotas)
export const checkLiveViaRSS = async (channelId) => {
  try {
    console.log('🔍 Checking live status via RSS feed...');
    
    // YouTube RSS feed URL for channel
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    
    const response = await fetch(rssUrl);
    const xmlText = await response.text();
    
    // Parse XML to check for live videos
    // Look for "live" or "streaming" in recent video titles/descriptions
    const isLive = xmlText.toLowerCase().includes('live') || 
                   xmlText.toLowerCase().includes('streaming') ||
                   xmlText.toLowerCase().includes('🔴');
    
    // Extract video ID from the first entry if live
    let videoId = null;
    if (isLive) {
      const videoIdMatch = xmlText.match(/watch\?v=([^&"<\s]+)/);
      if (videoIdMatch) {
        videoId = videoIdMatch[1];
      }
    }
    
    console.log('📡 RSS Live check result:', isLive, 'Video ID:', videoId);
    return { isLive, videoId };
    
  } catch (error) {
    console.error('❌ RSS live check failed:', error);
    return { isLive: false, videoId: null };
  }
};

// Method 2: Direct iframe embed check (No API needed)
export const checkLiveViaEmbed = async (channelId) => {
  try {
    console.log('🔍 Checking live status via embed...');
    
    // Try to access the live stream embed
    const embedUrl = `https://www.youtube.com/embed/live_stream?channel=${channelId}`;
    
    const response = await fetch(embedUrl, { method: 'HEAD' });
    const isLive = response.status === 200;
    
    console.log('📺 Embed live check result:', isLive);
    return { isLive, videoId: null };
    
  } catch (error) {
    console.error('❌ Embed live check failed:', error);
    return { isLive: false, videoId: null };
  }
};

// Method 3: Manual Firebase control (Admin sets live status)
export const manualLiveControl = {
  setLive: (videoId = 'live') => {
    console.log('🔴 Manually setting live status');
    return { isLive: true, videoId };
  },
  
  setOffline: () => {
    console.log('⚫ Manually setting offline status');
    return { isLive: false, videoId: null };
  }
};

// Method 4: Combined detection (tries multiple methods)
export const checkLiveStatusCombined = async (channelId) => {
  console.log('🔍 Running combined live detection...');
  
  try {
    // Try RSS first (fastest, most reliable)
    const rssResult = await checkLiveViaRSS(channelId);
    if (rssResult.isLive) {
      console.log('✅ Live detected via RSS');
      return rssResult;
    }
    
    // Try embed method as backup
    const embedResult = await checkLiveViaEmbed(channelId);
    if (embedResult.isLive) {
      console.log('✅ Live detected via embed');
      return embedResult;
    }
    
    console.log('⚫ No live streams detected');
    return { isLive: false, videoId: null };
    
  } catch (error) {
    console.error('❌ Combined live check failed:', error);
    return { isLive: false, videoId: null };
  }
};

// Method 5: Simple URL parsing method
export const checkLiveViaChannelPage = async (channelId) => {
  try {
    console.log('🔍 Checking live status via channel page...');
    
    const channelUrl = `https://www.youtube.com/channel/${channelId}/live`;
    
    // This method checks if the live page exists
    const response = await fetch(channelUrl, { method: 'HEAD' });
    const isLive = response.status === 200;
    
    console.log('📺 Channel page live check result:', isLive);
    return { isLive, videoId: null };
    
  } catch (error) {
    console.error('❌ Channel page live check failed:', error);
    return { isLive: false, videoId: null };
  }
};