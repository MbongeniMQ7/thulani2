import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');

const MediaCentreScreen = ({ navigation }) => {
  const handleWatchNow = (content) => {
    // Handle watch now functionality
    console.log('Watch now:', content);
  };

  const handleFacebookLink = () => {
    // Handle Facebook link
    console.log('Open Facebook page');
  };

  const handleWebsiteLink = () => {
    // Handle website link
    console.log('Website coming soon');
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
        {/* Sunday Morning Service */}
        <View style={styles.serviceCard}>
          <LinearGradient
            colors={['#8B1538', '#A91B47']}
            style={styles.serviceGradient}
          >
            <Text style={styles.serviceTitle}>Sunday Morning Service</Text>
            <Text style={styles.serviceLiveText}>Live from HQ</Text>
            
            <TouchableOpacity 
              style={styles.watchButton}
              onPress={() => handleWatchNow('Sunday Morning Service')}
            >
              <MaterialCommunityIcons name="play-circle" size={24} color="white" />
              <Text style={styles.watchButtonText}>watch now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Youth Podcast */}
        <View style={styles.serviceCard}>
          <LinearGradient
            colors={['#8B1538', '#A91B47']}
            style={styles.serviceGradient}
          >
            <View style={styles.podcastHeader}>
              <MaterialCommunityIcons name="account-group" size={32} color="white" />
              <Text style={styles.podcastTitle}>Youth Podcast</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.watchButton}
              onPress={() => handleWatchNow('Youth Podcast')}
            >
              <MaterialCommunityIcons name="play-circle" size={24} color="white" />
              <Text style={styles.watchButtonText}>watch now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Facebook Link */}
        <TouchableOpacity style={styles.socialCard} onPress={handleFacebookLink}>
          <BlurView intensity={20} style={styles.socialCardBlur}>
            <MaterialCommunityIcons name="facebook" size={40} color="#1877F2" />
            <Text style={styles.socialCardText}>The Apostolic Faith Mission of Africa</Text>
          </BlurView>
        </TouchableOpacity>

        {/* Website Link */}
        <TouchableOpacity style={styles.websiteCard} onPress={handleWebsiteLink}>
          <BlurView intensity={20} style={styles.websiteCardBlur}>
            <Text style={styles.websiteLinkText}>website link</Text>
            <Text style={styles.comingSoonText}>coming soon</Text>
          </BlurView>
        </TouchableOpacity>
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
    paddingTop: height * 0.02,
  },
  serviceCard: {
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
  serviceGradient: {
    padding: height * 0.03,
    minHeight: height * 0.15,
    justifyContent: 'space-between',
  },
  serviceTitle: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: height * 0.01,
  },
  serviceLiveText: {
    fontSize: width * 0.04,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: height * 0.02,
  },
  podcastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  podcastTitle: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: width * 0.03,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  watchButtonText: {
    fontSize: width * 0.04,
    color: 'white',
    marginLeft: width * 0.02,
    fontWeight: '500',
  },
  socialCard: {
    marginBottom: height * 0.02,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B1538',
  },
  socialCardBlur: {
    padding: height * 0.025,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  socialCardText: {
    fontSize: width * 0.04,
    color: '#8B1538',
    marginLeft: width * 0.03,
    flex: 1,
    fontWeight: '500',
  },
  websiteCard: {
    marginBottom: height * 0.02,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B1538',
  },
  websiteCardBlur: {
    padding: height * 0.025,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
  },
  websiteLinkText: {
    fontSize: width * 0.04,
    color: '#8B1538',
    fontWeight: '500',
    marginBottom: height * 0.005,
  },
  comingSoonText: {
    fontSize: width * 0.05,
    color: '#8B1538',
    fontWeight: 'bold',
  },
});

export default MediaCentreScreen;
