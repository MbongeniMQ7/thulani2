import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { YOUTUBE_CONFIG } from '../config/youtube';
import { checkLiveStatusCombined, manualLiveControl } from '../services/alternativeLiveDetection';

const { width, height } = Dimensions.get('window');

const YouTubeLiveStream = ({ 
  channelId, 
  channelHandle, 
  style, 
  onLiveStatusChange 
}) => {
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [liveVideoId, setLiveVideoId] = useState(null);

  
  const getLiveEmbedUrl = () => {
    if (liveVideoId) {
      return `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=0&controls=1&rel=0&showinfo=0&fs=1&cc_load_policy=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`;
    }
    // fallback to channel live stream
    return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=0&controls=1&rel=0&showinfo=0&fs=1&cc_load_policy=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1`;
  };

  
  const checkLiveStatus = async () => {
    try {
      setIsLoading(true);
      console.log(' Checking live status (quota-free method):', channelId || channelHandle);
      
      // Use channel ID directly if available
      let channelIdToUse = channelId;
      
      if (!channelIdToUse) {
        console.warn('⚠️ No channel ID available for live check');
        setIsLive(false);
        setIsLoading(false);
        return;
      }
      
      // Use combined detection method (RSS + embed + backup methods)
      const result = await checkLiveStatusCombined(channelIdToUse);
      
      console.log('🎯 Live status result:', result);
      
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
    try {
      setIsLoading(true);
      console.log('🔍 Checking live status for channel:', channelId || channelHandle);
      
      // Get channel ID from channel handle if not provided
      let channelIdToUse = channelId;
      
      if (!channelIdToUse && channelHandle) {
        console.log('📡 Getting channel ID from handle:', channelHandle);
        // First, get channel ID from handle
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${channelHandle.replace('@', '')}&key=${YOUTUBE_CONFIG.API_KEY}`
        );
        
        console.log('📡 Channel API response status:', channelResponse.status);
        
        if (channelResponse.ok) {
          const channelData = await channelResponse.json();
          console.log('📡 Channel API response:', channelData);
          if (channelData.items && channelData.items.length > 0) {
            channelIdToUse = channelData.items[0].id;
            console.log('✅ Found channel ID:', channelIdToUse);
          }
        } else {
          const errorText = await channelResponse.text();
          console.error('❌ Channel API error:', errorText);
        }
      }
      
      if (!channelIdToUse) {
        console.warn('⚠️ No channel ID available for live check');
        setIsLive(false);
        setIsLoading(false);
        return;
      }
      
      console.log('🔴 Checking for live streams on channel:', channelIdToUse);
      
      // Check for live streams using YouTube Data API
      const liveResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelIdToUse}&eventType=live&type=video&key=${YOUTUBE_CONFIG.API_KEY}`
      );
      
      console.log('🔴 Live API response status:', liveResponse.status);
      
      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        console.log('🔴 Live API response:', liveData);
        const hasLiveStreams = liveData.items && liveData.items.length > 0;
        
        console.log('🎯 Live streams found:', hasLiveStreams);
        console.log('🎯 Number of live streams:', liveData.items?.length || 0);
        
        setIsLive(hasLiveStreams);
        
        if (hasLiveStreams) {
          // Store the live video ID for better embed
          setLiveVideoId(liveData.items[0].id.videoId);
          console.log('📺 Live video ID:', liveData.items[0].id.videoId);
        } else {
          setLiveVideoId(null);
        }
        
        if (onLiveStatusChange) {
          onLiveStatusChange(hasLiveStreams);
        }
      } else {
        const errorText = await liveResponse.text();
        console.error('❌ Live API error:', liveResponse.status, errorText);
        
        // If quota exceeded, stop frequent checks
        if (liveResponse.status === 403) {
          console.warn('⚠️ API quota exceeded. Use manual controls below.');
        }
        setIsLive(false);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('💥 Error checking live status:', error);
      setIsLive(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkLiveStatus();
    
    // Check live status every 30 seconds to avoid quota limits
    const interval = setInterval(checkLiveStatus, YOUTUBE_CONFIG.CHECK_INTERVAL);
    
    return () => clearInterval(interval);
  }, [channelId]);

  const handleWatchLive = () => {
    if (isLive) {
      setShowPlayer(true);
    } else {
      Alert.alert(
        'Not Live',
        'The channel is not currently live streaming. Please check back later.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    checkLiveStatus();
  };

  const handleTestLive = () => {
    console.log('🧪 Testing live status - forcing live state');
    const result = manualLiveControl.setLive();
    setIsLive(result.isLive);
    setLiveVideoId(result.videoId);
  };

  const handleTestOffline = () => {
    console.log('🧪 Testing offline status');
    const result = manualLiveControl.setOffline();
    setIsLive(result.isLive);
    setLiveVideoId(result.videoId);
  };

  // Auto-show livestream when live (no need to click "Watch Live")
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
          scalesPageToFit={true}
          mixedContentMode="compatibility"
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
          ) : isLive ? (
            <View style={styles.statusRow}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.liveText}>Live Now</Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <View style={styles.offlineIndicatorDot} />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
        </View>

        <View style={styles.statusMessage}>
          {isLive ? (
            <Text style={styles.autoplayText}>
              🔴 Live stream will appear above automatically
            </Text>
          ) : (
            <Text style={styles.offlineMessage}>
              Stream will appear here when live
            </Text>
          )}
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  refreshButton: {
    padding: 5,
    marginLeft: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    marginBottom: height * 0.015,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
    marginRight: width * 0.02,
  },
  offlineIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginRight: width * 0.02,
  },
  liveText: {
    fontSize: width * 0.04,
    color: '#FF6B6B',
    fontWeight: '600',
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
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.03,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  watchButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  watchButtonText: {
    fontSize: width * 0.04,
    color: 'white',
    marginLeft: width * 0.02,
    fontWeight: '500',
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
  statusMessage: {
    marginTop: height * 0.01,
  },
  autoplayText: {
    fontSize: width * 0.035,
    color: '#FF6B6B',
    fontWeight: '500',
    textAlign: 'center',
  },
  offlineMessage: {
    fontSize: width * 0.035,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  closeButton: {
    padding: 5,
  },
  webview: {
    flex: 1,
    minHeight: height * 0.25,
  },
});

export default YouTubeLiveStream;