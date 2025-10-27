import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { YOUTUBE_CONFIG } from '../config/youtube';

const { width, height } = Dimensions.get('window');

// Enhanced quota-free live detection methods
const checkLiveViaDirect = async (channelId) => {
  try {
    console.log('🔍 Direct check for channel:', channelId);
    
    // Method 1: Check YouTube live page directly
    const liveUrl = `https://www.youtube.com/channel/${channelId}/live`;
    const response = await fetch(liveUrl, { 
      method: 'GET',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    console.log('📡 Direct response status:', response.status);
    
    if (response.ok) {
      const html = await response.text();
      console.log('📄 HTML length:', html.length);
      
      // Look for live stream indicators in the page
      const liveIndicators = [
        '"isLiveContent":true',
        'hlsManifestUrl',
        '"liveBroadcastContent":"live"',
        'live_stream?channel=',
        '"isLive":true',
        'live-badge'
      ];
      
      let isLive = false;
      let foundIndicator = '';
      
      for (const indicator of liveIndicators) {
        if (html.includes(indicator)) {
          isLive = true;
          foundIndicator = indicator;
          break;
        }
      }
      
      // Extract video ID if live
      let videoId = null;
      if (isLive) {
        const videoMatch = html.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
        if (videoMatch) {
          videoId = videoMatch[1];
        } else {
          videoId = 'live'; // Use generic live identifier
        }
      }
      
      console.log('🔴 Direct live check result:', isLive, 'Found:', foundIndicator, 'Video ID:', videoId);
      return { isLive, videoId };
    }
    
    return { isLive: false, videoId: null };
  } catch (error) {
    console.error('❌ Direct live check failed:', error.message);
    return { isLive: false, videoId: null };
  }
};

const checkLiveViaRSS = async (channelId) => {
  try {
    console.log('🔍 RSS check for channel:', channelId);
    
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const response = await fetch(rssUrl);
    const xmlText = await response.text();
    
    console.log('📡 RSS response length:', xmlText.length);
    
    // More accurate live detection from RSS
    const now = new Date();
    const recent = new Date(now.getTime() - 60 * 60 * 1000); // Last 60 minutes
    
    // Look for recent videos with live indicators
    const entries = xmlText.split('<entry>');
    console.log('📚 Found', entries.length - 1, 'RSS entries');
    
    for (let i = 1; i < entries.length; i++) {
      const entry = entries[i];
      
      if (entry.includes('published')) {
        // Check if published recently
        const publishedMatch = entry.match(/<published>(.+?)<\/published>/);
        if (publishedMatch) {
          const publishedDate = new Date(publishedMatch[1]);
          const isRecent = publishedDate > recent;
          
          console.log('📅 Entry', i, 'published:', publishedDate.toISOString(), 'Recent:', isRecent);
          
          if (isRecent) {
            // Check if this recent video has live indicators
            const titleMatch = entry.match(/<title>(.+?)<\/title>/);
            const title = titleMatch ? titleMatch[1] : '';
            
            const hasLiveIndicators = entry.toLowerCase().includes('live') || 
                                    entry.toLowerCase().includes('streaming') ||
                                    entry.toLowerCase().includes('🔴') ||
                                    entry.toLowerCase().includes('stream') ||
                                    title.toLowerCase().includes('live') ||
                                    title.toLowerCase().includes('streaming');
            
            console.log('🎥 Entry title:', title, 'Has live indicators:', hasLiveIndicators);
            
            if (hasLiveIndicators) {
              const videoIdMatch = entry.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
              const videoId = videoIdMatch ? videoIdMatch[1] : 'live';
              console.log('🔴 RSS live detected:', videoId, 'Title:', title);
              return { isLive: true, videoId };
            }
          }
        }
      }
    }
    
    console.log('⚫ No live streams found in RSS');
    return { isLive: false, videoId: null };
  } catch (error) {
    console.error('❌ RSS check failed:', error.message);
    return { isLive: false, videoId: null };
  }
};

// Test with a known live channel for verification
const testWithKnownLiveChannel = async () => {
  try {
    console.log('🧪 Testing with known live channels...');
    
    // Test with channels that often have live streams
    const testChannels = [
      'UCsT0YIqwnpJCM-mx7-gSA4Q', // TEDx Talks (often live)
      'UCDkJ6eOBsGfrNNy4VCBe_bg', // Another test channel
      'UCHnyfMqiRRG1u-2MsSQLbXA' // Another active channel
    ];
    
    for (const testChannelId of testChannels) {
      console.log('🔍 Testing channel:', testChannelId);
      const result = await checkLiveViaDirect(testChannelId);
      if (result.isLive) {
        console.log('✅ Found live stream on test channel:', testChannelId);
        return result;
      }
    }
    
    console.log('⚫ No live streams found on test channels');
    return { isLive: false, videoId: null };
  } catch (error) {
    console.error('❌ Test channel check failed:', error);
    return { isLive: false, videoId: null };
  }
};

// Combined super-accurate live detection
const checkLiveStatusCombined = async (channelId) => {
  console.log('🔍 Running enhanced live detection...');
  
  try {
    // Try direct method first (most accurate)
    const directResult = await checkLiveViaDirect(channelId);
    if (directResult.isLive) {
      console.log('✅ Live detected via direct method');
      return directResult;
    }
    
    // Try RSS as backup
    const rssResult = await checkLiveViaRSS(channelId);
    if (rssResult.isLive) {
      console.log('✅ Live detected via RSS');
      return rssResult;
    }
    
    console.log('⚫ No live streams detected');
    return { isLive: false, videoId: null };
    
  } catch (error) {
    console.error('❌ Enhanced live check failed:', error);
    return { isLive: false, videoId: null };
  }
};

const YouTubeLiveStreamNew = ({ 
  channelId, 
  channelHandle, 
  style, 
  onLiveStatusChange 
}) => {
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [liveVideoId, setLiveVideoId] = useState(null);

  // YouTube embed URL with enhanced autoplay settings
  const getLiveEmbedUrl = () => {
    if (liveVideoId && liveVideoId !== 'manual') {
      return `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=0&controls=1&rel=0&showinfo=0&fs=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent('https://localhost')}`;
    }
    return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=0&controls=1&rel=0&showinfo=0&fs=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent('https://localhost')}`;
  };

  // Check if channel is live (enhanced detection - no API quotas!)
  const checkLiveStatus = async () => {
    if (!channelId) return;
    
    try {
      setIsLoading(true);
      console.log('🔍 Running enhanced live detection (quota-free):', channelId);
      
      const result = await checkLiveStatusCombined(channelId);
      
      console.log('🎯 Enhanced live status result:', result);
      
      setIsLive(result.isLive);
      setLiveVideoId(result.videoId);
      
      if (onLiveStatusChange) {
        onLiveStatusChange(result.isLive);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('💥 Error checking live status:', error);
      setIsLive(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLiveStatus();
    
    // Check every 15 seconds for real-time detection (no quota limits!)
    const interval = setInterval(checkLiveStatus, 15000);
    
    return () => clearInterval(interval);
  }, [channelId]);

  const handleRefresh = () => {
    console.log('🔄 Manual refresh');
    checkLiveStatus();
  };

  const handleTestLive = () => {
    console.log('🧪 Manual live test - Forcing live state');
    setIsLive(true);
    setLiveVideoId('dQw4w9WgXcQ'); // Test with a known video ID for auto-play testing
  };

  const handleTestOffline = () => {
    console.log('🧪 Manual offline test');
    setIsLive(false);
    setLiveVideoId(null);
  };

  const handleTestKnownLive = async () => {
    console.log('🧪 Testing with known live channels');
    setIsLoading(true);
    
    try {
      const result = await testWithKnownLiveChannel();
      if (result.isLive) {
        setIsLive(true);
        setLiveVideoId(result.videoId);
        console.log('✅ Found live stream for testing:', result.videoId);
      } else {
        console.log('⚫ No live streams found on test channels');
        // Force a test video for auto-play testing
        setIsLive(true);
        setLiveVideoId('jfKfPfyJRdk'); // Another test video
        console.log('🎬 Using test video for auto-play verification');
      }
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-show livestream when live
  if (isLive) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.playerHeader}>
          <Text style={styles.liveIndicator}>🔴 LIVE</Text>
          <View style={styles.headerControls}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <MaterialCommunityIcons 
                name="refresh" 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        <WebView
          source={{ uri: getLiveEmbedUrl() }}
          style={styles.webview}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode="compatibility"
          onLoad={() => console.log('🎬 Video loaded - auto-playing')}
          onError={(error) => console.error('WebView error:', error)}
          injectedJavaScript={`
            // Force auto-play when video loads
            setTimeout(() => {
              const video = document.querySelector('video');
              if (video) {
                video.muted = false;
                video.play().then(() => {
                  console.log('Video auto-play successful');
                }).catch(e => {
                  console.log('Auto-play failed, trying with mute');
                  video.muted = true;
                  video.play();
                });
              }
            }, 2000);
            true;
          `}
        />
      </View>
    );
  }

  // Show offline container
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#8B1538', '#A91B47']}
        style={styles.livestreamCard}
      >
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons 
            name="youtube" 
            size={32} 
            color="white" 
          />
          <View style={styles.headerText}>
            <Text style={styles.cardTitle}>YouTube Live Stream</Text>
            <Text style={styles.channelName}>{YOUTUBE_CONFIG.CHANNEL_NAME}</Text>
          </View>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <MaterialCommunityIcons 
                name="refresh" 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleTestLive}
            >
              <MaterialCommunityIcons 
                name="play" 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleTestKnownLive}
            >
              <MaterialCommunityIcons 
                name="flask" 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleTestOffline}
            >
              <MaterialCommunityIcons 
                name="stop" 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusContainer}>
          {isLoading ? (
            <View style={styles.statusRow}>
              <MaterialCommunityIcons name="loading" size={16} color="white" />
              <Text style={styles.statusText}>Checking live status...</Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <View style={styles.offlineIndicatorDot} />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>

        <View style={styles.statusMessage}>
          <Text style={styles.offlineMessage}>
            ✨ No API limits! Stream will appear here when live
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: height * 0.02,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  livestreamCard: {
    padding: height * 0.025,
    minHeight: height * 0.18,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  headerText: {
    flex: 1,
    marginLeft: width * 0.03,
  },
  cardTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: 'white',
  },
  channelName: {
    fontSize: width * 0.035,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 5,
    marginLeft: 8,
  },
  statusContainer: {
    marginBottom: height * 0.015,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginRight: width * 0.02,
  },
  offlineText: {
    fontSize: width * 0.04,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusText: {
    fontSize: width * 0.04,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: width * 0.02,
  },
  statusMessage: {
    marginTop: height * 0.01,
  },
  offlineMessage: {
    fontSize: width * 0.035,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
  },
  liveIndicator: {
    color: '#FF0000',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
    minHeight: height * 0.25,
  },
});

export default YouTubeLiveStreamNew;