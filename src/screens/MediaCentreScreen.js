import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Linking, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header';
import YouTubeLiveStreamAPI from '../components/YouTubeLiveStreamAPI';
import { YOUTUBE_CONFIG } from '../config/youtube';

const { width, height } = Dimensions.get('window');

const MediaCentreScreen = ({ navigation }) => {
  const handleWatchNow = (content) => {
    if (content === 'Youth Podcast') {
      navigation.navigate('YouthPodcast');
    } else {
      console.log('Watch now:', content);
    }
  };

  const handleFacebookLink = async () => {
    const facebookUrl = 'https://www.facebook.com/share/1MrE5qZYTD/?mibextid=wwXIfr';
    
    try {
      const supported = await Linking.canOpenURL(facebookUrl);
      if (supported) {
        await Linking.openURL(facebookUrl);
      } else {
        Alert.alert('Error', 'Unable to open Facebook link. Please check if you have a web browser installed.');
      }
    } catch (error) {
      console.error('Error opening Facebook link:', error);
      Alert.alert('Error', 'Failed to open Facebook link. Please try again.');
    }
  };

  const handleWebsiteLink = async () => {
    const websiteUrl = 'https://afmademmo.netlify.app/';
    
    try {
      const supported = await Linking.canOpenURL(websiteUrl);
      if (supported) {
        await Linking.openURL(websiteUrl);
      } else {
        Alert.alert('Error', 'Unable to open website. Please check if you have a web browser installed.');
      }
    } catch (error) {
      console.error('Error opening website:', error);
      Alert.alert('Error', 'Failed to open website. Please try again.');
    }
  };

  const handleLiveStatusChange = (isLive) => {
    console.log('YouTube live status changed:', isLive);
    // You can add additional logic here when live status changes
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Media Centre" 
        subtitle="Live Services • Podcasts • Social Media" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#8B1538', '#A61B46', '#C02454']}
          style={styles.heroSection}
        >
          <MaterialCommunityIcons name="multimedia" size={64} color="#fff" />
          <Text style={styles.heroTitle}>AFMA Media Hub</Text>
          <Text style={styles.heroSubtitle}>Watch live services • Listen to podcasts • Stay connected</Text>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="youtube" size={32} color="#fff" />
              <Text style={styles.statNumber}>1.2K+</Text>
              <Text style={styles.statLabel}>Subscribers</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="podcast" size={32} color="#fff" />
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Episodes</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#A770EF', '#CF8BF3']}
              style={styles.statGradient}
            >
              <MaterialCommunityIcons name="eye" size={32} color="#fff" />
              <Text style={styles.statNumber}>10K+</Text>
              <Text style={styles.statLabel}>Views</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Live Stream Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="video-wireless" size={28} color="#8B1538" />
            <Text style={styles.sectionTitle}>Live Stream</Text>
          </View>
          
          {/* YouTube Live Stream - Using YouTube Data API */}
          <YouTubeLiveStreamAPI
            channelId={YOUTUBE_CONFIG.CHANNEL_ID}
            channelHandle={YOUTUBE_CONFIG.CHANNEL_HANDLE}
            onLiveStatusChange={handleLiveStatusChange}
          />
        </View>

        {/* Podcasts Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="podcast" size={28} color="#8B1538" />
            <Text style={styles.sectionTitle}>Podcasts</Text>
          </View>
          
          {/* Youth Podcast */}
          <TouchableOpacity 
            style={styles.podcastCard}
            onPress={() => handleWatchNow('Youth Podcast')}
          >
            <LinearGradient
              colors={['#8B1538', '#A91B47', '#C02454']}
              style={styles.podcastGradient}
            >
              <View style={styles.podcastContent}>
                <View style={styles.podcastIconContainer}>
                  <MaterialCommunityIcons name="account-group" size={40} color="white" />
                </View>
                <View style={styles.podcastInfo}>
                  <Text style={styles.podcastTitle}>Youth Podcast</Text>
                  <Text style={styles.podcastSubtitle}>Inspiring conversations for young believers</Text>
                </View>
              </View>
              
              <View style={styles.playButtonContainer}>
                <MaterialCommunityIcons name="play-circle" size={50} color="rgba(255,255,255,0.9)" />
                <Text style={styles.watchNowText}>WATCH NOW</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Social Media & Links Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="share-variant" size={28} color="#8B1538" />
            <Text style={styles.sectionTitle}>Connect With Us</Text>
          </View>

          {/* Facebook Link */}
          <TouchableOpacity style={styles.socialCard} onPress={handleFacebookLink}>
            <View style={styles.socialCardContent}>
              <View style={styles.socialIconWrapper}>
                <MaterialCommunityIcons name="facebook" size={48} color="#1877F2" />
              </View>
              <View style={styles.socialTextContainer}>
                <Text style={styles.socialLabel}>Follow us on Facebook</Text>
                <Text style={styles.socialName}>The Apostolic Faith Mission of Africa</Text>
                <View style={styles.followersBadge}>
                  <MaterialCommunityIcons name="account-multiple" size={14} color="#1877F2" />
                  <Text style={styles.followersText}>5.2K+ Followers</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={28} color="#8B1538" />
            </View>
          </TouchableOpacity>

          {/* YouTube Channel Card */}
          <TouchableOpacity style={styles.youtubeCard}>
            <View style={styles.socialCardContent}>
              <View style={styles.youtubeIconWrapper}>
                <MaterialCommunityIcons name="youtube" size={48} color="#FF0000" />
              </View>
              <View style={styles.socialTextContainer}>
                <Text style={styles.socialLabel}>Subscribe on YouTube</Text>
                <Text style={styles.socialName}>AFMA Live Services</Text>
                <View style={styles.followersBadge}>
                  <MaterialCommunityIcons name="play-circle" size={14} color="#FF0000" />
                  <Text style={styles.followersText}>1.2K+ Subscribers</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={28} color="#8B1538" />
            </View>
          </TouchableOpacity>

          {/* Website Link */}
          <TouchableOpacity style={styles.websiteCard} onPress={handleWebsiteLink}>
            <View style={styles.websiteCardContent}>
              <View style={styles.websiteIconWrapper}>
                <MaterialCommunityIcons name="web" size={48} color="#8B1538" />
              </View>
              <View style={styles.websiteTextContainer}>
                <Text style={styles.websiteLabel}>Visit Our Website</Text>
                <View style={styles.comingSoonBadge}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#fff" />
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={28} color="#8B1538" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.01,
  },
  heroSection: {
    padding: width * 0.06,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: width * 0.035,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.95,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  statGradient: {
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: width * 0.03,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  podcastCard: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  podcastGradient: {
    padding: 20,
  },
  podcastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  podcastIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 15,
    marginRight: 15,
  },
  podcastInfo: {
    flex: 1,
  },
  podcastTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  podcastSubtitle: {
    fontSize: width * 0.035,
    color: 'rgba(255,255,255,0.9)',
  },
  playButtonContainer: {
    alignItems: 'center',
  },
  watchNowText: {
    fontSize: width * 0.04,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
    letterSpacing: 1,
  },
  socialCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#1877F2',
  },
  socialCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  socialIconWrapper: {
    backgroundColor: '#E7F3FF',
    borderRadius: 50,
    padding: 12,
    marginRight: 15,
  },
  socialTextContainer: {
    flex: 1,
  },
  socialLabel: {
    fontSize: width * 0.032,
    color: '#666',
    marginBottom: 4,
  },
  socialName: {
    fontSize: width * 0.04,
    color: '#333',
    fontWeight: '600',
  },
  followersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  followersText: {
    fontSize: width * 0.03,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  youtubeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  youtubeIconWrapper: {
    backgroundColor: '#FFE5E5',
    borderRadius: 50,
    padding: 12,
    marginRight: 15,
  },
  websiteCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#8B1538',
  },
  websiteCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  websiteIconWrapper: {
    backgroundColor: '#FFF0F3',
    borderRadius: 50,
    padding: 12,
    marginRight: 15,
  },
  websiteTextContainer: {
    flex: 1,
  },
  websiteLabel: {
    fontSize: width * 0.04,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B1538',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  comingSoonText: {
    fontSize: width * 0.03,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default MediaCentreScreen;
