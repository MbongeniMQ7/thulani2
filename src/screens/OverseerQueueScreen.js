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

const { width, height } = Dimensions.get('window');

export default function OverseerQueueScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentQueue, setCurrentQueue] = useState(5);
  const [timeLeft, setTimeLeft] = useState('01:00:00');
  const [isJoined, setIsJoined] = useState(false);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const [hours, minutes, seconds] = prevTime.split(':').map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return '00:00:00';
        }
        
        const newTotalSeconds = totalSeconds - 1;
        const newHours = Math.floor(newTotalSeconds / 3600);
        const newMinutes = Math.floor((newTotalSeconds % 3600) / 60);
        const newSeconds = newTotalSeconds % 60;
        
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleJoinQueue = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Required Fields', 'Please enter both first name and last name to join the queue.');
      return;
    }
    
    Alert.alert(
      'Join Queue',
      `${firstName} ${lastName}, you will be added to the Overseer's consultation queue.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join Queue', 
          onPress: () => {
            setIsJoined(true);
            setCurrentQueue(currentQueue + 1);
            Alert.alert('Success', 'You have been added to the queue. You will receive a notification when it\'s your turn.');
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
          subtitle=""
          showBack={true}
          onBack={() => navigation.goBack()}
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.body}>
            <View style={styles.queueCard}>
              <Text style={styles.queueTitle}>Overseer's Office</Text>
              <Text style={styles.queueSubtitle}>
                Consultation available on Mondays between 14h00 - 16h00
              </Text>
              <Text style={styles.queueRestriction}>
                This service is restricted to 10min to 12 queued persons.
              </Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Last Name"
                      placeholderTextColor="#999"
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="First Name"
                      placeholderTextColor="#999"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>
                </View>
                
                <View style={styles.queueActions}>
                  <TouchableOpacity 
                    style={[styles.joinButton, isJoined && styles.joinButtonDisabled]} 
                    onPress={handleJoinQueue}
                    disabled={isJoined}
                  >
                    <Text style={styles.joinButtonText}>
                      {isJoined ? 'IN QUEUE' : 'JOIN QUEUE'}
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={styles.queueNumber}>
                    <Text style={styles.queueNumberText}>{currentQueue}</Text>
                  </View>
                </View>
              </View>
              
              {/* Overseer Images */}
              <View style={styles.imageContainer}>
                <Image 
                  source={require('../../assets/img/rev-mjk-sengwayo.jpg')}
                  style={styles.clergImage}
                  resizeMode="cover"
                />
                <Image 
                  source={require('../../assets/img/rev-pm-sibanda.jpg')}
                  style={styles.clergImage}
                  resizeMode="cover"
                />
              </View>
              
              {/* Timer */}
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{timeLeft}</Text>
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
                <Text style={styles.infoTitle}>Consultation Guidelines</Text>
                <Text style={styles.infoText}>
                  • Arrive 5 minutes before your scheduled time{'\n'}
                  • Bring any relevant documents{'\n'}
                  • Be prepared with your questions{'\n'}
                  • Respect the time limit for others waiting
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
    backgroundColor: '#f4f6f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  scrollView: {
    flex: 1,
  },
  body: {
    padding: width * 0.04,
    paddingBottom: height * 0.03,
  },
  queueCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: width * 0.05,
    marginBottom: height * 0.02,
    borderWidth: 1,
    borderColor: '#e6edf5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  queueTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: '800',
    color: '#8B1538',
    marginBottom: height * 0.01,
  },
  queueSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#5D4E75',
    marginBottom: height * 0.005,
    lineHeight: Math.min(width * 0.045, 18),
  },
  queueRestriction: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#666',
    marginBottom: height * 0.02,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: height * 0.02,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.015,
  },
  inputWrapper: {
    flex: 0.48,
  },
  input: {
    backgroundColor: '#8B1538',
    color: '#fff',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: 8,
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '600',
    textAlign: 'center',
  },
  queueActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  joinButton: {
    backgroundColor: '#22C55E',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 25,
    flex: 0.7,
  },
  joinButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '700',
    textAlign: 'center',
  },
  queueNumber: {
    backgroundColor: '#EF4444',
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueNumberText: {
    color: '#fff',
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '800',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: height * 0.02,
    backgroundColor: '#000',
    borderRadius: 12,
    padding: width * 0.02,
  },
  clergImage: {
    width: width * 0.35,
    height: height * 0.15,
    borderRadius: 8,
  },
  timerContainer: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  timerText: {
    color: '#fff',
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: '800',
    fontFamily: 'monospace',
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
