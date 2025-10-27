import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');

const YouthPodcastScreen = ({ navigation }) => {
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: 'Youth Podcast Episode 1',
      description: 'Inspiring message for young believers and spiritual growth',
      url: 'https://www.youtube.com/watch?v=clGZG8q89zQ',
      thumbnail: 'https://img.youtube.com/vi/clGZG8q89zQ/maxresdefault.jpg'
    },
    {
      id: 2,
      title: 'Youth Podcast Episode 2',
      description: 'Building faith and finding purpose in challenging times',
      url: 'https://www.youtube.com/watch?v=Aw29mlB9u0Y',
      thumbnail: 'https://img.youtube.com/vi/Aw29mlB9u0Y/maxresdefault.jpg'
    },
    {
      id: 3,
      title: 'Youth Podcast Episode 3',
      description: 'Walking in God\'s will and discovering your calling',
      url: 'https://www.youtube.com/watch?v=FGTRforwkeM',
      thumbnail: 'https://img.youtube.com/vi/FGTRforwkeM/maxresdefault.jpg'
    },
    {
      id: 4,
      title: 'Youth Podcast Episode 4',
      description: 'Strengthening your relationship with Christ',
      url: 'https://www.youtube.com/watch?v=EZIfh7NDvp0',
      thumbnail: 'https://img.youtube.com/vi/EZIfh7NDvp0/maxresdefault.jpg'
    },
    {
      id: 5,
      title: 'Youth Podcast Episode 5',
      description: 'Living as a witness in today\'s world',
      url: 'https://www.youtube.com/watch?v=N131jX0sxpw',
      thumbnail: 'https://img.youtube.com/vi/N131jX0sxpw/maxresdefault.jpg'
    }
  ]);

  const openYouTubeVideo = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open YouTube video. Please check if you have YouTube app or browser installed.');
      }
    } catch (error) {
      console.error('Error opening YouTube video:', error);
      Alert.alert('Error', 'Failed to open video. Please try again.');
    }
  };

  const renderVideoCard = (video) => (
    <TouchableOpacity 
      key={video.id} 
      style={styles.videoCard}
      onPress={() => openYouTubeVideo(video.url)}
    >
      <View style={styles.videoCardContent}>
        {/* Video Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image 
            source={{ uri: video.thumbnail }} 
            style={styles.videoThumbnail}
            resizeMode="cover"
          />
          <View style={styles.playOverlay}>
            <MaterialCommunityIcons name="play-circle" size={64} color="rgba(255,255,255,0.95)" />
          </View>
          <View style={styles.youtubeBadge}>
            <MaterialCommunityIcons name="youtube" size={20} color="#FF0000" />
          </View>
        </View>
        
        {/* Video Info */}
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <Text style={styles.videoDescription}>{video.description}</Text>
          
          <View style={styles.watchButton}>
            <MaterialCommunityIcons name="play" size={18} color="#8B1538" />
            <Text style={styles.watchButtonText}>Watch Now</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header 
          title="Youth Podcast" 
          subtitle="Inspiring Messages • Youth Content • Spiritual Growth" 
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <LinearGradient
            colors={['#8B1538', '#A61B46', '#C02454']}
            style={styles.headerCard}
          >
            <MaterialCommunityIcons name="account-group" size={64} color="#fff" />
            <Text style={styles.headerTitle}>AFMA Youth Podcast</Text>
            <Text style={styles.headerSubtitle}>Empowering young hearts with faith and purpose</Text>
          </LinearGradient>

          {/* Videos Section */}
          <View style={styles.videosSection}>
            <Text style={styles.sectionTitle}>Latest Episodes</Text>
            
            {videos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="youtube" size={64} color="#8B1538" />
                <Text style={styles.emptyTitle}>Coming Soon!</Text>
                <Text style={styles.emptyDescription}>
                  We're preparing exciting youth podcast episodes for you. 
                  Check back soon for inspiring content.
                </Text>
                <View style={styles.comingSoonFeatures}>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="heart" size={20} color="#8B1538" />
                    <Text style={styles.featureText}>Inspirational Messages</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="account-group" size={20} color="#8B1538" />
                    <Text style={styles.featureText}>Youth Testimonies</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="book-open" size={20} color="#8B1538" />
                    <Text style={styles.featureText}>Bible Study</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialCommunityIcons name="music" size={20} color="#8B1538" />
                    <Text style={styles.featureText}>Worship & Praise</Text>
                  </View>
                </View>
              </View>
            ) : (
              videos.map(renderVideoCard)
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
  },
  headerCard: {
    borderRadius: 24,
    padding: width * 0.08,
    alignItems: 'center',
    marginBottom: height * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  headerTitle: {
    fontSize: Math.min(width * 0.065, 26),
    fontWeight: '800',
    color: '#fff',
    marginTop: height * 0.02,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Math.min(width * 0.038, 15),
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginTop: height * 0.01,
    fontWeight: '500',
  },
  videosSection: {
    marginBottom: height * 0.03,
  },
  sectionTitle: {
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: height * 0.025,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: height * 0.025,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  videoCardContent: {
    flex: 1,
  },
  thumbnailContainer: {
    position: 'relative',
    height: height * 0.25,
    backgroundColor: '#f0f0f0',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  youtubeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  videoInfo: {
    padding: width * 0.04,
  },
  videoTitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: height * 0.008,
    letterSpacing: -0.3,
  },
  videoDescription: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#64748b',
    lineHeight: Math.min(width * 0.05, 20),
    fontWeight: '500',
    marginBottom: height * 0.015,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(139, 21, 56, 0.2)',
  },
  watchButtonText: {
    color: '#8B1538',
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '700',
    marginLeft: width * 0.015,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: width * 0.08,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: '800',
    color: '#1e293b',
    marginTop: height * 0.02,
    marginBottom: height * 0.015,
    letterSpacing: -0.3,
  },
  emptyDescription: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#64748b',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.055, 22),
    marginBottom: height * 0.03,
    fontWeight: '500',
  },
  comingSoonFeatures: {
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 21, 56, 0.05)',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    borderRadius: 12,
    marginBottom: height * 0.012,
    borderWidth: 1,
    borderColor: 'rgba(139, 21, 56, 0.1)',
  },
  featureText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#8B1538',
    fontWeight: '600',
    marginLeft: width * 0.03,
    flex: 1,
  },
});

export default YouthPodcastScreen;