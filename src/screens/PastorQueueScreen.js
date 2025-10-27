import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Dimensions, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Image,
  Alert
} from 'react-native';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { QueueService } from '../services/supabaseService';

const { width, height } = Dimensions.get('window');

export default function PastorQueueScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [currentQueue, setCurrentQueue] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial queue count
  useEffect(() => {
    loadQueueCount();
    
    // Subscribe to real-time updates
    const subscription = QueueService.subscribeToQueueUpdates('pastor', (payload) => {
      console.log('Queue update:', payload);
      loadQueueCount(); // Reload count when queue changes
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadQueueCount = async () => {
    try {
      const count = await QueueService.getQueueCount('pastor');
      setCurrentQueue(count);
    } catch (error) {
      console.error('Error loading queue count:', error);
      // Set default count if database not ready
      setCurrentQueue(0);
    }
  };

  const handleJoinQueue = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !reason.trim()) {
      Alert.alert('Required Fields', 'Please enter your first name, last name, email, and reason for consultation to join the queue.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    Alert.alert(
      'Join Queue',
      `${firstName} ${lastName}, you will be added to the Pastor's consultation queue.\n\nEmail: ${email}\nReason: ${reason}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join Queue', 
          onPress: async () => {
            setIsLoading(true);
            try {
              await QueueService.addToQueue({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                reason: reason.trim(),
                queueType: 'pastor'
              });
              
              setIsJoined(true);
              Alert.alert('Success', 'You have been added to the queue. You will receive an email notification about your consultation status.');
              
              // Clear form
              setFirstName('');
              setLastName('');
              setEmail('');
              setReason('');
            } catch (error) {
              console.error('Error joining queue:', error);
              Alert.alert('Error', 'Failed to join queue. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header 
          title="The Apostolic Faith Mission..." 
          subtitle="8 of 9"
          showBack={true}
          onBack={() => navigation.goBack()}
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.body}>
            {/* Header Card */}
            <View style={styles.headerCard}>
              <View style={styles.headerIconContainer}>
                <MaterialCommunityIcons name="account-heart" size={40} color="#8B1538" />
              </View>
              <Text style={styles.queueTitle}>Pastor's Office</Text>
              <Text style={styles.queueSubtitle}>
                Consultation available Mon-Fri between 09:00 - 12:00
              </Text>
              <View style={styles.queueBadgeContainer}>
                <View style={styles.queueBadge}>
                  <MaterialCommunityIcons name="account-group" size={18} color="#8B1538" />
                  <Text style={styles.queueBadgeText}>{currentQueue} in queue</Text>
                </View>
                <View style={styles.sessionBadge}>
                  <MaterialCommunityIcons name="clock-outline" size={18} color="#22C55E" />
                  <Text style={styles.sessionBadgeText}>10 min sessions</Text>
                </View>
              </View>
            </View>

            {/* Pastor Images - Placeholder */}
            <View style={styles.imageContainer}>
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons name="account-tie" size={50} color="#8B1538" />
                <Text style={styles.placeholderText}>Pastor 1</Text>
              </View>
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons name="account-tie" size={50} color="#8B1538" />
                <Text style={styles.placeholderText}>Pastor 2</Text>
              </View>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Consultation Request</Text>
              <Text style={styles.formSubtitle}>Please fill in your details to join the queue</Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <View style={styles.inputFieldContainer}>
                      <MaterialCommunityIcons name="account" size={20} color="#8B1538" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter first name"
                        placeholderTextColor="#94A3B8"
                        value={firstName}
                        onChangeText={setFirstName}
                      />
                    </View>
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <View style={styles.inputFieldContainer}>
                      <MaterialCommunityIcons name="account" size={20} color="#8B1538" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter last name"
                        placeholderTextColor="#94A3B8"
                        value={lastName}
                        onChangeText={setLastName}
                      />
                    </View>
                  </View>
                </View>
                
                <View style={styles.fullInputWrapper}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputFieldContainer}>
                    <MaterialCommunityIcons name="email-outline" size={20} color="#8B1538" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="your.email@example.com"
                      placeholderTextColor="#94A3B8"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
                
                <View style={styles.fullInputWrapper}>
                  <Text style={styles.inputLabel}>Reason for Consultation</Text>
                  <View style={[styles.inputFieldContainer, styles.textAreaContainer]}>
                    <MaterialCommunityIcons name="text" size={20} color="#8B1538" style={[styles.inputIcon, styles.textAreaIcon]} />
                    <TextInput
                      style={[styles.input, styles.textAreaInput]}
                      placeholder="E.g., spiritual guidance, prayer request, counseling..."
                      placeholderTextColor="#94A3B8"
                      value={reason}
                      onChangeText={setReason}
                      multiline={true}
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[styles.joinButton, (isJoined || isLoading) && styles.joinButtonDisabled]} 
                  onPress={handleJoinQueue}
                  disabled={isJoined || isLoading}
                >
                  <MaterialCommunityIcons 
                    name={isJoined ? "check-circle" : "account-plus"} 
                    size={22} 
                    color="#fff" 
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.joinButtonText}>
                    {isLoading ? 'JOINING...' : isJoined ? 'YOU ARE IN QUEUE' : 'JOIN QUEUE'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Forthcoming Events Section */}
            <View style={styles.eventsSection}>
              <View style={styles.eventsSectionHeader}>
                <MaterialCommunityIcons name="calendar-star" size={28} color="#8B1538" />
                <Text style={styles.eventsTitle}>Forthcoming Events</Text>
              </View>
              <View style={styles.eventsCard}>
                <MaterialCommunityIcons 
                  name="calendar-clock" 
                  size={32} 
                  color="#8B1538" 
                  style={styles.eventsIcon}
                />
                <View style={styles.eventsContent}>
                  <Text style={styles.eventsText}>
                    Check the Events section for upcoming church activities and special services.
                  </Text>
                  <TouchableOpacity style={styles.eventsButton} onPress={() => navigation.navigate('Events')}>
                    <Text style={styles.eventsButtonText}>View Events</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color="#8B1538" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            {/* Info Section */}
            <View style={styles.infoCard}>
              <MaterialCommunityIcons 
                name="information-outline" 
                size={24} 
                color="#8B1538" 
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Pastor's Consultation</Text>
                <Text style={styles.infoText}>
                  • Available Monday through Friday{'\n'}
                  • Morning hours: 9:00 AM - 12:00 PM{'\n'}
                  • 10-minute consultations{'\n'}
                  • Spiritual guidance and counseling
                </Text>
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
  scrollView: {
    flex: 1,
  },
  body: {
    padding: width * 0.04,
    paddingBottom: height * 0.03,
  },
  // Header Card
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: width * 0.06,
    marginBottom: height * 0.02,
    alignItems: 'center',
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  headerIconContainer: {
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.02,
    borderWidth: 3,
    borderColor: 'rgba(139, 21, 56, 0.2)',
  },
  queueTitle: {
    fontSize: Math.min(width * 0.065, 26),
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: height * 0.008,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  queueSubtitle: {
    fontSize: Math.min(width * 0.036, 14),
    color: '#64748b',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.05, 20),
    marginBottom: height * 0.015,
    paddingHorizontal: width * 0.04,
    fontWeight: '500',
  },
  queueBadgeContainer: {
    flexDirection: 'row',
    gap: width * 0.03,
    marginTop: height * 0.01,
  },
  queueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 21, 56, 0.2)',
  },
  queueBadgeText: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#8B1538',
    fontWeight: '700',
    marginLeft: 6,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  sessionBadgeText: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#22C55E',
    fontWeight: '700',
    marginLeft: 6,
  },
  // Images
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
    gap: width * 0.03,
  },
  placeholderImage: {
    flex: 1,
    height: height * 0.18,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 21, 56, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(139, 21, 56, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholderText: {
    fontSize: Math.min(width * 0.038, 15),
    color: '#8B1538',
    fontWeight: '700',
    marginTop: height * 0.01,
  },
  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: width * 0.06,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: height * 0.02,
  },
  formTitle: {
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: height * 0.005,
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: Math.min(width * 0.034, 14),
    color: '#64748b',
    marginBottom: height * 0.025,
    fontWeight: '500',
  },
  inputContainer: {
    gap: height * 0.018,
  },
  inputRow: {
    flexDirection: 'row',
    gap: width * 0.03,
  },
  inputWrapper: {
    flex: 1,
  },
  fullInputWrapper: {
    width: '100%',
  },
  inputLabel: {
    fontSize: Math.min(width * 0.034, 14),
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: height * 0.008,
    marginLeft: width * 0.01,
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: height * 0.015,
  },
  inputIcon: {
    marginRight: width * 0.03,
  },
  textAreaIcon: {
    marginTop: height * 0.005,
  },
  input: {
    flex: 1,
    fontSize: Math.min(width * 0.038, 15),
    color: '#1e293b',
    fontWeight: '500',
  },
  textAreaInput: {
    minHeight: height * 0.12,
    textAlignVertical: 'top',
  },
  joinButton: {
    backgroundColor: '#8B1538',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.02,
    borderRadius: 16,
    marginTop: height * 0.01,
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  joinButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0.1,
  },
  buttonIcon: {
    marginRight: width * 0.02,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Events Section
  eventsSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: width * 0.06,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  eventsTitle: {
    fontSize: Math.min(width * 0.048, 19),
    fontWeight: '800',
    color: '#1e293b',
    marginLeft: width * 0.03,
    letterSpacing: -0.3,
  },
  eventsCard: {
    backgroundColor: 'rgba(139, 21, 56, 0.05)',
    borderRadius: 20,
    padding: width * 0.05,
    borderWidth: 2,
    borderColor: 'rgba(139, 21, 56, 0.1)',
    alignItems: 'center',
  },
  eventsIcon: {
    marginBottom: height * 0.015,
  },
  eventsContent: {
    width: '100%',
    alignItems: 'center',
  },
  eventsText: {
    fontSize: Math.min(width * 0.036, 14),
    color: '#64748b',
    lineHeight: Math.min(width * 0.048, 19),
    textAlign: 'center',
    marginBottom: height * 0.015,
    fontWeight: '500',
  },
  eventsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B1538',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.05,
    borderRadius: 20,
    gap: width * 0.02,
  },
  eventsButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.034, 14),
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: width * 0.04,
    borderWidth: 1,
    borderColor: '#b3e5fc',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: width * 0.03,
    marginTop: height * 0.002,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '700',
    color: '#8B1538',
    marginBottom: height * 0.008,
  },
  infoText: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#2e5266',
    lineHeight: Math.min(width * 0.04, 16),
  },
});
