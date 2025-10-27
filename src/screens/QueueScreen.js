import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QueueService } from '../services/supabaseService';

const { width, height } = Dimensions.get('window');

function Block({ title, subtitle, icon, available = true, onPress, queueCount, isOverseer = false }) {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={icon} 
              size={40} 
              color="#8B1538" 
            />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.h1}>{title}</Text>
            <Text style={styles.meta}>{subtitle}</Text>
          </View>
        </View>

        {queueCount !== undefined && (
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <MaterialCommunityIcons name="account-group" size={18} color="#8B1538" />
              <Text style={styles.statBadgeText}>{queueCount} in queue</Text>
            </View>
            <View style={styles.timeBadge}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#22C55E" />
              <Text style={styles.timeBadgeText}>10 min sessions</Text>
            </View>
          </View>
        )}
        
        <View style={styles.cardContent}>
          <TouchableOpacity 
            style={[styles.btn, !available && styles.btnDisabled]} 
            activeOpacity={available ? 0.7 : 1}
            onPress={available ? onPress : null}
            disabled={!available}
          >
            <MaterialCommunityIcons 
              name={available ? "calendar-check" : "calendar-remove"} 
              size={22} 
              color="#fff" 
              style={styles.btnIcon}
            />
            <Text style={styles.btnText}>
              {available ? "JOIN CONSULTATION" : "NOT AVAILABLE"}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#22C55E" />
              <Text style={styles.featureText}>Confidential</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="heart" size={16} color="#EF4444" />
              <Text style={styles.featureText}>Professional</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function QueueScreen({ navigation }) {
  const [queueStats, setQueueStats] = useState({
    overseerQueue: 0,
    pastorQueue: 0,
    todayCompleted: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQueueStats();
    
    // Subscribe to real-time updates for both queues
    const overseerSubscription = QueueService.subscribeToQueueUpdates('overseer', () => {
      loadQueueStats();
    });
    
    const pastorSubscription = QueueService.subscribeToQueueUpdates('pastor', () => {
      loadQueueStats();
    });

    return () => {
      overseerSubscription.unsubscribe();
      pastorSubscription.unsubscribe();
    };
  }, []);

  const loadQueueStats = async () => {
    try {
      const stats = await QueueService.getQueueStats();
      setQueueStats(stats);
    } catch (error) {
      console.error('Error loading queue stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Header title="Spiritual Consultations" subtitle="Connect with our spiritual leaders" />
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <LinearGradient
                colors={['#8B1538', '#A61B46']}
                style={styles.loadingIconGradient}
              >
                <MaterialCommunityIcons name="church" size={40} color="#fff" />
              </LinearGradient>
              <Text style={styles.loadingTitle}>Preparing Your Consultations</Text>
              <Text style={styles.loadingSubtitle}>Connecting to our spiritual guidance system...</Text>
              <ActivityIndicator size="large" color="#8B1538" style={styles.loadingSpinner} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="Spiritual Consultations" subtitle="Connect with our spiritual leaders" />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.backgroundGradient}>
            <View style={styles.body}>
              {/* Hero Section */}
              <View style={styles.heroSection}>
                <View style={styles.heroIconContainer}>
                  <MaterialCommunityIcons name="church" size={50} color="#8B1538" />
                </View>
                <Text style={styles.heroTitle}>Spiritual Guidance</Text>
                <Text style={styles.heroSubtitle}>
                  Connect with our spiritual leaders for personalized guidance, prayer, and pastoral care
                </Text>
                <View style={styles.heroBadge}>
                  <MaterialCommunityIcons name="shield-check" size={18} color="#8B1538" />
                  <Text style={styles.heroBadgeText}>Confidential & Professional</Text>
                </View>
              </View>

              {/* Consultation Cards */}
              <Block 
                title="Overseer's Office" 
                subtitle="Senior spiritual guidance • Mondays 14:00 - 16:00"
                icon="account-tie"
                available={true}
                onPress={() => navigation.navigate('OverseerQueue')}
                queueCount={queueStats.overseerQueue}
                isOverseer={true}
              />
              
              <Block 
                title="Pastor's Office" 
                subtitle="Pastoral care & counseling • Mon-Fri 09:00 - 12:00"
                icon="account-heart"
                available={true}
                onPress={() => navigation.navigate('PastorQueue')}
                queueCount={queueStats.pastorQueue}
                isOverseer={false}
              />
              
              {/* Stats Section */}
              <View style={styles.statsSection}>
                <View style={styles.statsTitleContainer}>
                  <MaterialCommunityIcons name="chart-line" size={30} color="#8B1538" />
                  <Text style={styles.statsTitle}>Today's Activity</Text>
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#22C55E' }]}>
                      <MaterialCommunityIcons name="check-circle" size={32} color="#fff" />
                    </View>
                    <Text style={styles.statNumber}>{queueStats.todayCompleted}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                  </View>
                  <View style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#3B82F6' }]}>
                      <MaterialCommunityIcons name="clock-outline" size={32} color="#fff" />
                    </View>
                    <Text style={styles.statNumber}>{queueStats.overseerQueue + queueStats.pastorQueue}</Text>
                    <Text style={styles.statLabel}>Waiting</Text>
                  </View>
                  <View style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: '#8B1538' }]}>
                      <MaterialCommunityIcons name="heart" size={32} color="#fff" />
                    </View>
                    <Text style={styles.statNumber}>98%</Text>
                    <Text style={styles.statLabel}>Satisfaction</Text>
                  </View>
                </View>
              </View>
              
            
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <View style={styles.infoIconContainer}>
                    <MaterialCommunityIcons 
                      name="information" 
                      size={24} 
                      color="#fff" 
                    />
                  </View>
                  <Text style={styles.infoTitle}>Consultation Guidelines</Text>
                </View>
                <View style={styles.guidelinesList}>
                  {[
                    { text: "Arrive 5 minutes early for your session", icon: "clock-check-outline" },
                    { text: "Prepare your questions in advance", icon: "clipboard-text-outline" },
                    { text: "Maintain confidentiality and respect", icon: "shield-check-outline" },
                    { text: "Sessions are limited to 10 minutes each", icon: "timer-outline" }
                  ].map((guideline, index) => (
                    <View key={index} style={styles.guidelineItem}>
                      <View style={styles.guidelineIconContainer}>
                        <MaterialCommunityIcons name={guideline.icon} size={18} color="#22C55E" />
                      </View>
                      <Text style={styles.guidelineText}>{guideline.text}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Contact Section */}
              <View style={styles.contactSection}>
                <View style={styles.contactHeader}>
                  <View style={styles.contactIconContainer}>
                    <MaterialCommunityIcons name="phone-alert" size={28} color="#fff" />
                  </View>
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactTitle}>Need Immediate Help?</Text>
                    <Text style={styles.contactSubtitle}>
                      For urgent spiritual matters, contact our 24/7 prayer line
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.contactButton}>
                  <LinearGradient
                    colors={['#8B1538', '#A61B46', '#C1224C']}
                    style={styles.contactGradient}
                  >
                    <MaterialCommunityIcons name="phone" size={22} color="#fff" />
                    <Text style={styles.contactButtonText}>Call Prayer Line</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#f0f4f8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  backgroundGradient: {
    flex: 1,
    minHeight: height,
  },
  scrollView: {
    flex: 1,
  },
  body: {
    padding: width * 0.04,
    paddingBottom: height * 0.05,
  },
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: height * 0.04,
    marginBottom: height * 0.025,
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: width * 0.01,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  heroIconContainer: {
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.02,
    borderWidth: 3,
    borderColor: 'rgba(139, 21, 56, 0.2)',
  },
  heroTitle: {
    fontSize: Math.min(width * 0.075, 30),
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: height * 0.01,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: Math.min(width * 0.038, 15),
    color: '#64748b',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.055, 22),
    marginBottom: height * 0.015,
    paddingHorizontal: width * 0.08,
    fontWeight: '500',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 21, 56, 0.08)',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 21, 56, 0.15)',
  },
  heroBadgeText: {
    fontSize: Math.min(width * 0.034, 14),
    color: '#8B1538',
    fontWeight: '700',
    marginLeft: 8,
  },
  // Card Styles
  cardContainer: {
    marginBottom: height * 0.025,
    marginHorizontal: width * 0.01,
  },
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: 24, 
    padding: width * 0.06,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 21, 56, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  iconContainer: {
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 0.04,
    borderWidth: 2,
    borderColor: 'rgba(139, 21, 56, 0.2)',
  },
  cardTitleContainer: {
    flex: 1,
  },
  h1: { 
    fontSize: Math.min(width * 0.05, 20), 
    fontWeight: '900', 
    color: '#1e293b',
    lineHeight: Math.min(width * 0.06, 24),
    marginBottom: height * 0.005,
  },
  meta: { 
    color: '#64748b', 
    fontSize: Math.min(width * 0.034, 14),
    lineHeight: Math.min(width * 0.045, 18),
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: width * 0.025,
    marginBottom: height * 0.015,
  },
  statBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 21, 56, 0.2)',
    justifyContent: 'center',
  },
  statBadgeText: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#8B1538',
    fontWeight: '700',
    marginLeft: 6,
  },
  timeBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
  },
  timeBadgeText: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#22C55E',
    fontWeight: '700',
    marginLeft: 6,
  },
  cardContent: {
    paddingTop: height * 0.005,
  },
  btn: {
    backgroundColor: '#8B1538',
    borderRadius: 16, 
    marginBottom: height * 0.015,
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0.1,
  },
  btnIcon: {
    marginRight: width * 0.025,
  },
  btnText: { 
    color: '#fff', 
    fontWeight: '800',
    fontSize: Math.min(width * 0.04, 16),
    letterSpacing: 0.5,
  },
  featuresList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: width * 0.025,
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.012,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
  },
  featureText: {
    color: '#1e293b',
    fontSize: Math.min(width * 0.033, 13),
    fontWeight: '700',
    marginLeft: 6,
  },
  // Stats Section
  statsSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: width * 0.06,
    marginVertical: height * 0.02,
    marginHorizontal: width * 0.01,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 21, 56, 0.08)',
  },
  statsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.025,
  },
  statsTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '900',
    color: '#1e293b',
    marginLeft: width * 0.03,
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: width * 0.025,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: width * 0.04,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.012,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  statNumber: {
    fontSize: Math.min(width * 0.07, 28),
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: height * 0.005,
  },
  statLabel: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#64748b',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.04, 16),
  },
  // Info Card
  infoCard: {
    marginVertical: height * 0.025,
    marginHorizontal: width * 0.01,
    borderRadius: 24,
    backgroundColor: '#fff',
    padding: width * 0.06,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  infoIconContainer: {
    backgroundColor: '#3B82F6',
    padding: width * 0.025,
    borderRadius: 16,
    marginRight: width * 0.035,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  guidelinesList: {
    gap: height * 0.015,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    padding: width * 0.035,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
  },
  guidelineIconContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    padding: width * 0.02,
    borderRadius: 12,
    marginRight: width * 0.03,
  },
  guidelineText: {
    fontSize: Math.min(width * 0.034, 14),
    color: '#1e293b',
    flex: 1,
    lineHeight: Math.min(width * 0.048, 19),
    fontWeight: '500',
  },
  // Contact Section
  contactSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: width * 0.06,
    marginTop: height * 0.025,
    marginHorizontal: width * 0.01,
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 21, 56, 0.1)',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.025,
  },
  contactIconContainer: {
    backgroundColor: '#EF4444',
    padding: width * 0.03,
    borderRadius: 20,
    marginRight: width * 0.04,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: Math.min(width * 0.048, 19),
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: height * 0.005,
    letterSpacing: -0.3,
  },
  contactSubtitle: {
    fontSize: Math.min(width * 0.034, 14),
    color: '#64748b',
    lineHeight: Math.min(width * 0.045, 18),
    fontWeight: '500',
  },
  contactButton: {
    borderRadius: 20,
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: 'stretch',
  },
  contactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.06,
    borderRadius: 20,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.038, 15),
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.08,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: width * 0.08,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
    maxWidth: 320,
  },
  loadingIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.025,
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: height * 0.01,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  loadingSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#64748b',
    textAlign: 'center',
    marginBottom: height * 0.03,
    lineHeight: Math.min(width * 0.045, 18),
    fontWeight: '500',
  },
  loadingSpinner: {
    marginTop: height * 0.01,
  },
});
