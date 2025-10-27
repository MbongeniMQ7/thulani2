import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { YOUTUBE_CONFIG, getYouTubeLiveCheckURL, getLiveEmbedURL } from '../config/youtube';

const { width, height } = Dimensions.get('window');

// Check YouTube live status using official YouTube Data API
const checkLiveStatusYouTube = async (channelId, apiKey) => {
  try {
    console.log('🔍 Checking live status via YouTube Data API:', channelId);
    
    const apiUrl = getYouTubeLiveCheckURL(channelId, apiKey);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log('📡 YouTube API Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 403) {
        console.error('❌ YouTube API Quota Exceeded (403) - Daily quota reached');
        return { isLive: false, videoId: null, error: 'API quota exceeded. Please try again tomorrow.' };
      }
      if (response.status === 400) {
        console.error('❌ YouTube API Bad Request (400) - Invalid parameters');
        return { isLive: false, videoId: null, error: 'Invalid API request parameters.' };
      }
      console.error('❌ YouTube API request failed:', response.status, response.statusText);
      return { isLive: false, videoId: null, error: 'API request failed' };
    }
    
    const data = await response.json();
    console.log('📊 YouTube API Response:', data);
    
    // Check if there are any live videos
    let isLive = false;
    let videoId = null;
    let title = null;
    
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      console.log('📚 Found', data.items.length, 'live video(s)');
      
      // Get the first live video
      const liveVideo = data.items[0];
      isLive = true;
      videoId = liveVideo.id.videoId;
      title = liveVideo.snippet.title;
      
      console.log('✅ Live stream detected:', {
        videoId,
        title,
        publishedAt: liveVideo.snippet.publishedAt
      });
    } else {
      console.log('❌ No live streams found');
    }
    
    return {
      isLive,
      videoId,
      title,
      error: null
    };
    
  } catch (error) {
    console.error('💥 YouTube API Error:', error);
    return {
      isLive: false,
      videoId: null,
      error: 'Network error occurred'
    };
  }
};

const YouTubeLiveStreamAPI = ({ 
  channelId, 
  channelHandle, 
  style, 
  onLiveStatusChange 
}) => {
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [liveVideoId, setLiveVideoId] = useState(null);
  const [streamTitle, setStreamTitle] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);

  // YouTube embed URL with enhanced autoplay settings
  const getLiveEmbedUrl = () => {
    if (liveVideoId && liveVideoId !== 'manual') {
      return `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=0&controls=1&rel=0&showinfo=0&fs=1&playsinline=1&enablejsapi=1`;
    }
    return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=0&controls=1&rel=0&showinfo=0&fs=1&playsinline=1&enablejsapi=1`;
  };

  // Check live status function
  const checkLiveStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await checkLiveStatusYouTube(channelId, YOUTUBE_CONFIG.API_KEY);
      
      if (result.error) {
        setError(result.error);
        setIsLive(false);
        setLiveVideoId(null);
        setStreamTitle(null);
      } else {
        setIsLive(result.isLive);
        setLiveVideoId(result.videoId);
        setStreamTitle(result.title);
        
        if (onLiveStatusChange) {
          onLiveStatusChange(result.isLive, result.videoId);
        }
      }
      
      setLastChecked(new Date());
    } catch (err) {
      console.error('Error checking live status:', err);
      setError('Failed to check live status');
      setIsLive(false);
    }
    
    setIsLoading(false);
  }, [channelId, onLiveStatusChange]);

  // Auto-refresh every 5 minutes to avoid API quota issues
  useEffect(() => {
    checkLiveStatus();
    
    const interval = setInterval(checkLiveStatus, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [checkLiveStatus]);

  const handleRefresh = () => {
    checkLiveStatus();
  };

  const formatLastChecked = () => {
    if (!lastChecked) return 'Never';
    return lastChecked.toLocaleTimeString();
  };

  // Auto-show livestream when live
  if (isLive) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.playerHeader}>
          <Text style={styles.liveIndicator}>� LIVE</Text>
          {streamTitle && <Text style={styles.streamTitle} numberOfLines={1}>{streamTitle}</Text>}
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
                video.muted = false; // Unmute for live streams
                video.play().then(() => {
                  console.log('▶️ Video auto-play successful');
                }).catch(e => {
                  console.log('⚠️ Auto-play blocked:', e.message);
                  video.muted = true; // Fallback to muted
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
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator 
                  size="small" 
                  color="white" 
                />
              ) : (
                <MaterialCommunityIcons 
                  name="refresh" 
                  size={20} 
                  color="white" 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <MaterialCommunityIcons 
              name={isLive ? "circle" : "circle-outline"} 
              size={16} 
              color={isLive ? "#ff4444" : "#999"} 
            />
            <Text style={styles.statusText}>
              {isLoading ? 'Checking...' : (isLive ? 'LIVE NOW' : 'Offline')}
            </Text>
          </View>

          {error && (
            <View style={styles.quotaWarning}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#ffaa00" />
              <Text style={styles.quotaText}>{error}</Text>
            </View>
          )}

          {lastChecked && (
            <Text style={styles.lastCheckedText}>
              Last checked: {formatLastChecked()} (YouTube Data API)
            </Text>
          )}
        </View>

        <Text style={styles.description}>
          We'll automatically detect when {YOUTUBE_CONFIG.CHANNEL_NAME} goes live and show the stream here!
        </Text>
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
    padding: height * 0.03,
    minHeight: height * 0.25,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  headerText: {
    flex: 1,
    marginLeft: width * 0.03,
  },
  cardTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: 'white',
  },
  channelName: {
    fontSize: width * 0.035,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: height * 0.005,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    marginBottom: height * 0.02,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  statusText: {
    fontSize: width * 0.04,
    color: 'white',
    marginLeft: width * 0.02,
    fontWeight: '500',
  },
  quotaWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  quotaText: {
    fontSize: width * 0.032,
    color: '#ffaa00',
    marginLeft: width * 0.02,
  },
  lastCheckedText: {
    fontSize: width * 0.03,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  description: {
    fontSize: width * 0.035,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: width * 0.05,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: height * 0.015,
    justifyContent: 'space-between',
  },
  liveIndicator: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#ff4444',
  },
  streamTitle: {
    fontSize: width * 0.035,
    color: 'white',
    flex: 1,
    marginLeft: width * 0.02,
  },
  headerControls: {
    flexDirection: 'row',
  },
  webview: {
    height: height * 0.3,
    backgroundColor: '#000',
  },
});

export default YouTubeLiveStreamAPI;