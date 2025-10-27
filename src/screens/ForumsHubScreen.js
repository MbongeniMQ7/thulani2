import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header';
import Tile from '../components/Tile';

const { width, height } = Dimensions.get('window');

const forums = [
  {
    id: 'chorister',
    name: 'Choristers Forum',
    description: 'Forum for updates on all matters of music',
    icon: 'music',
    requiresAuth: true
  },
  {
    id: 'cyc',
    name: 'CYC Committee',
    description: 'Christian Youth Committee discussions and activities',
    icon: 'account-group',
    requiresAuth: true
  }
];

export default function ForumsHubScreen({ navigation }) {
  const handleForumPress = (forum) => {
    // Navigate to the original ChoirScreen for authentication
    navigation.navigate('ChoirAuth', {
      forumId: forum.id,
      forumName: forum.name
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header 
          title="Community Forums" 
          subtitle="Connect, share, and grow together in faith" 
        />
        <ScrollView 
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <LinearGradient
            colors={['#8B1538', '#A61B46', '#C02454']}
            style={styles.heroSection}
          >
            <MaterialCommunityIcons name="forum" size={64} color="#fff" />
            <Text style={styles.heroTitle}>AFMA Community Forums</Text>
            <Text style={styles.heroSubtitle}>Join the conversation • Share your insights • Grow together</Text>
          </LinearGradient>

          {/* Forums Grid */}
          <View style={styles.forumsSection}>
            <Text style={styles.sectionTitle}>Available Forums</Text>
            <Text style={styles.sectionSubtitle}>Select a forum to join the discussion</Text>
            
            <View style={styles.grid}>
              {forums.map((forum) => (
                <Tile
                  key={forum.id}
                  icon={forum.icon}
                  label={forum.name}
                  color="#8B1538"
                  onPress={() => handleForumPress(forum)}
                />
              ))}
            </View>
          </View>

          {/* Community Guidelines Card */}
          <View style={styles.guidelinesCard}>
            <View style={styles.guidelinesHeader}>
              <MaterialCommunityIcons name="shield-check" size={28} color="#8B1538" />
              <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
            </View>
            <View style={styles.guidelineItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.guidelineText}>Respect all members and their opinions</Text>
            </View>
            <View style={styles.guidelineItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.guidelineText}>Stay on topic and contribute meaningfully</Text>
            </View>
            <View style={styles.guidelineItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.guidelineText}>Share knowledge and grow together in faith</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  heroSection: {
    margin: width * 0.04,
    padding: width * 0.06,
    borderRadius: 20,
    alignItems: 'center',
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
  forumsSection: {
    paddingHorizontal: width * 0.04,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: width * 0.035,
    color: '#666',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  guidelinesCard: {
    backgroundColor: '#fff',
    margin: width * 0.04,
    marginTop: 10,
    padding: width * 0.05,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#8B1538',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  guidelinesTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  guidelineText: {
    fontSize: width * 0.038,
    color: '#555',
    marginLeft: 12,
    flex: 1,
  },
});
