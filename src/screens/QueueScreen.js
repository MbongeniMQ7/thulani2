import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, SafeAreaView, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

function Block({ title, subtitle, icon, available = true, onPress, queueCount, isOverseer = false }) {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const cardColors = isOverseer 
    ? ['#8B1538', '#8B1538', '#8B1538']
    : ['#8B1538', '#8B1538', '#8B1538'];

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}>
      <LinearGradient
        colors={cardColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons 
                name={icon} 
                size={Math.min(width * 0.1, 40)} 
                color="#fff" 
              />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.h1}>{title}</Text>
              <Text style={styles.meta}>{subtitle}</Text>
              {queueCount && (
                <View style={styles.queueBadge}>
                  <MaterialCommunityIcons name="account-group" size={14} color="#fff" />
                  <Text style={styles.queueBadgeText}>{queueCount} in queue</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <TouchableOpacity 
              style={[styles.btn, !available && styles.btnDisabled]} 
              activeOpacity={available ? 0.8 : 1}
              onPress={available ? onPress : null}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <LinearGradient
                colors={available ? ['#8B1538', '#8B1538', '#8B1538'] : ['#6B7280', '#4B5563']}
                style={styles.btnGradient}
              >
                <MaterialCommunityIcons 
                  name={available ? "clock-check" : "clock-outline"} 
                  size={Math.min(width * 0.05, 20)} 
                  color="#fff" 
                  style={styles.btnIcon}
                />
                <Text style={styles.btnText}>
                  {available ? "JOIN CONSULTATION" : "NOT AVAILABLE"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="clock" size={16} color="#fff" />
                <Text style={styles.featureText}>10 min sessions</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialCommunityIcons name="shield-check" size={16} color="#fff" />
                <Text style={styles.featureText}>Confidential</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export default function QueueScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="Spiritual Consultations" subtitle="Connect with our spiritual leaders" />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#f8fafc', '#e2e8f0', '#cbd5e1']}
            style={styles.backgroundGradient}
          >
            <View style={styles.body}>
              {/* Hero Section */}
              <View style={styles.heroSection}>
                <MaterialCommunityIcons name="church" size={48} color="#8B1538" />
                <Text style={styles.heroTitle}>Guidance & Counseling</Text>
                <Text style={styles.heroSubtitle}>
                  Schedule a private consultation with our spiritual leaders for guidance, 
                  prayer, and pastoral care.
                </Text>
              </View>

              {/* Consultation Cards */}
              <Block 
                title="Overseer's Office" 
                subtitle="Senior spiritual guidance • Mondays 14:00 - 16:00"
                icon="account-tie"
                available={true}
                onPress={() => navigation.navigate('OverseerQueue')}
                queueCount={5}
                isOverseer={true}
              />
              
              <Block 
                title="Pastor's Office" 
                subtitle="Pastoral care & counseling • Mon-Fri 09:00 - 12:00"
                icon="account-heart"
                available={true}
                onPress={() => navigation.navigate('PastorQueue')}
                queueCount={20}
                isOverseer={false}
              />
              
              {/* Stats Section */}
              <View style={styles.statsSection}>
                <Text style={styles.statsTitle}>This Week</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <MaterialCommunityIcons name="account-group" size={24} color="#22C55E" />
                    <Text style={styles.statNumber}>47</Text>
                    <Text style={styles.statLabel}>Consultations</Text>
                  </View>
                  <View style={styles.statCard}>
                    <MaterialCommunityIcons name="clock-check" size={24} color="#3B82F6" />
                    <Text style={styles.statNumber}>8.5</Text>
                    <Text style={styles.statLabel}>Avg. Minutes</Text>
                  </View>
                  <View style={styles.statCard}>
                    <MaterialCommunityIcons name="heart" size={24} color="#EF4444" />
                    <Text style={styles.statNumber}>98%</Text>
                    <Text style={styles.statLabel}>Satisfaction</Text>
                  </View>
                </View>
              </View>
              
              {/* Enhanced Info Section */}
              <View style={styles.infoCard}>
                <LinearGradient
                  colors={['#f0f9ff', '#e0f2fe']}
                  style={styles.infoGradient}
                >
                  <MaterialCommunityIcons 
                    name="information" 
                    size={28} 
                    color="#0ea5e9" 
                    style={styles.infoIcon}
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Consultation Guidelines</Text>
                    <View style={styles.guidelinesList}>
                      {[
                        "Arrive 5 minutes early for your session",
                        "Prepare your questions in advance",
                        "Maintain confidentiality and respect",
                        "Sessions are limited to 10 minutes each"
                      ].map((guideline, index) => (
                        <View key={index} style={styles.guidelineItem}>
                          <MaterialCommunityIcons name="check-circle" size={16} color="#22C55E" />
                          <Text style={styles.guidelineText}>{guideline}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </LinearGradient>
              </View>

              {/* Contact Section */}
              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>Need Immediate Help?</Text>
                <Text style={styles.contactSubtitle}>
                  For urgent spiritual matters, contact our 24/7 prayer line
                </Text>
                <TouchableOpacity style={styles.contactButton}>
                  <LinearGradient
                    colors={['#8B1538', '#A61B46']}
                    style={styles.contactGradient}
                  >
                    <MaterialCommunityIcons name="phone" size={20} color="#fff" />
                    <Text style={styles.contactButtonText}>Call Prayer Line</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
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
    paddingVertical: height * 0.03,
    marginBottom: height * 0.02,
  },
  heroTitle: {
    fontSize: Math.min(width * 0.07, 28),
    fontWeight: '800',
    color: '#1e293b',
    marginTop: height * 0.01,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#64748b',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.05, 20),
    marginTop: height * 0.01,
    paddingHorizontal: width * 0.05,
  },
  // Card Styles
  cardContainer: {
    marginBottom: height * 0.025,
  },
  cardGradient: {
    borderRadius: 24,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  card: { 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderRadius: 22, 
    padding: width * 0.05, 
    backdropFilter: 'blur(10px)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: height * 0.02,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: width * 0.03,
    borderRadius: 16,
    marginRight: width * 0.04,
  },
  cardTitleContainer: {
    flex: 1,
  },
  h1: { 
    fontSize: Math.min(width * 0.05, 20), 
    fontWeight: '800', 
    color: '#1e293b',
    lineHeight: Math.min(width * 0.06, 24),
  },
  meta: { 
    color: '#64748b', 
    marginTop: height * 0.005,
    fontSize: Math.min(width * 0.035, 14),
    lineHeight: Math.min(width * 0.045, 18),
  },
  queueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 21, 56, 0.2)',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.005,
    borderRadius: 12,
    marginTop: height * 0.01,
    alignSelf: 'flex-start',
  },
  queueBadgeText: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#8B1538',
    fontWeight: '600',
    marginLeft: 4,
  },
  cardContent: {
    paddingTop: height * 0.01,
  },
  btn: {
    borderRadius: 16, 
    marginBottom: height * 0.015,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnGradient: {
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.04,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnIcon: {
    marginRight: width * 0.025,
  },
  btnText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: Math.min(width * 0.035, 14),
  },
  featuresList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: height * 0.01,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
    borderRadius: 12,
  },
  featureText: {
    color: '#8B1538',
    fontSize: Math.min(width * 0.03, 12),
    fontWeight: '600',
    marginLeft: 6,
  },
  // Stats Section
  statsSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.05,
    marginVertical: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statsTitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: height * 0.015,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: '800',
    color: '#1e293b',
    marginTop: height * 0.005,
  },
  statLabel: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#64748b',
    fontWeight: '500',
    marginTop: height * 0.002,
  },
  // Info Card
  infoCard: {
    marginVertical: height * 0.02,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  infoGradient: {
    padding: width * 0.05,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: width * 0.04,
    marginTop: height * 0.002,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: height * 0.01,
  },
  guidelinesList: {
    gap: height * 0.008,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guidelineText: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#334155',
    marginLeft: width * 0.02,
    flex: 1,
    lineHeight: Math.min(width * 0.045, 18),
  },
  // Contact Section
  contactSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.05,
    alignItems: 'center',
    marginTop: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  contactTitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: height * 0.008,
  },
  contactSubtitle: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#64748b',
    textAlign: 'center',
    marginBottom: height * 0.02,
    lineHeight: Math.min(width * 0.04, 16),
  },
  contactButton: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  contactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    borderRadius: 16,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '700',
    marginLeft: width * 0.02,
  },
});
