import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Dimensions, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const eventCategories = [
  'Revivals',
  'Weddings',
  'Passover',
  'Crusades',
  'Annual Campmeeting'
];

const upcomingEvents = [
  {
    id: 1,
    title: '18 - 21 September 2025',
    subtitle: 'Venda Great Revival',
    category: 'Revivals',
    featured: true,
    date: new Date('2025-09-18T00:00:00') // Event start date
  },
  {
    id: 2,
    title: 'Youth Conference 2025',
    subtitle: 'October 2025',
    category: 'Crusades',
    featured: false,
    date: new Date('2025-10-15T00:00:00')
  },
  {
    id: 3,
    title: 'Christmas Celebration',
    subtitle: 'December 2025',
    category: 'Annual Campmeeting',
    featured: false,
    date: new Date('2025-12-25T00:00:00')
  },
  {
    id: 4,
    title: 'New Year Revival',
    subtitle: 'January 2026',
    category: 'Revivals',
    featured: false,
    date: new Date('2026-01-01T00:00:00')
  },
  {
    id: 5,
    title: 'Easter Celebration',
    subtitle: 'April 2026',
    category: 'Passover',
    featured: false,
    date: new Date('2026-04-12T00:00:00')
  }
];

// Function to calculate time remaining
const calculateTimeRemaining = (targetDate) => {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, expired: false };
};

export default function EventsScreen() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(upcomingEvents[0].date));

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(upcomingEvents[0].date));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => {
    if (time.expired) {
      return "EVENT STARTED!";
    }
    
    if (time.days > 0) {
      return `${time.days}d ${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
    } else {
      return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const toggleEventSelection = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const filteredEvents = selectedCategories.length === 0 
    ? upcomingEvents 
    : upcomingEvents.filter(event => selectedCategories.includes(event.category));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header 
          title="The Apostolic Faith Mission..." 
          subtitle=""
          showBack={true}
          onBack={() => {}}
        />
        
        {/* Timer Display - Countdown to next event */}
        <View style={styles.timerContainer}>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
          <Text style={styles.timerLabel}>
            {timeRemaining.expired ? 'Venda Great Revival' : 'Until Venda Great Revival'}
          </Text>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.body}>
            {/* Forthcoming Events Title */}
            <Text style={styles.sectionTitle}>Forthcoming Events</Text>
            
            {/* Next Event Banner */}
            <View style={styles.nextEventBanner}>
              <Text style={styles.nextLabel}>NEXT</Text>
              <Text style={styles.nextEventTitle}>The Annual Campmeeting 2025 - 26</Text>
            </View>
            
            {/* Select Criteria Section */}
            <View style={styles.criteriaSection}>
              <Text style={styles.criteriaTitle}>Select Criteria</Text>
              <View style={styles.criteriaGrid}>
                {eventCategories.map((category, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[
                      styles.criteriaItem,
                      selectedCategories.includes(category) && styles.criteriaItemSelected
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <MaterialCommunityIcons 
                      name={selectedCategories.includes(category) ? "checkbox-marked" : "checkbox-blank-outline"} 
                      size={18} 
                      color={selectedCategories.includes(category) ? "#8B1538" : "#666"} 
                    />
                    <Text style={[
                      styles.criteriaText,
                      selectedCategories.includes(category) && styles.criteriaTextSelected
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Event Checkboxes */}
            <View style={styles.eventsContainer}>
              {filteredEvents.map((event, index) => (
                <View key={event.id} style={styles.eventItem}>
                  <TouchableOpacity 
                    style={[
                      styles.checkbox,
                      selectedEvents.includes(event.id) && styles.checkboxSelected
                    ]}
                    onPress={() => toggleEventSelection(event.id)}
                  >
                    {selectedEvents.includes(event.id) && (
                      <MaterialCommunityIcons name="check" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
                  </View>
                </View>
              ))}
              
              {/* Additional empty checkboxes as shown in screenshot */}
              {[...Array(6)].map((_, index) => (
                <View key={`empty-${index}`} style={styles.eventItem}>
                  <TouchableOpacity style={styles.checkbox}>
                    <View style={styles.checkboxInner} />
                  </TouchableOpacity>
                  <View style={styles.eventContent}>
                    <View style={styles.emptyLine} />
                  </View>
                </View>
              ))}
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
  timerContainer: {
    alignItems: 'center',
    paddingVertical: height * 0.02,
  },
  timerDisplay: {
    backgroundColor: '#000',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 8,
    marginBottom: height * 0.008,
  },
  timerText: {
    color: '#fff',
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: '800',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  timerLabel: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  body: { 
    padding: width * 0.04,
    paddingBottom: height * 0.03,
  },
  sectionTitle: {
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: '800',
    color: '#8B1538',
    marginBottom: height * 0.02,
  },
  nextEventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.025,
  },
  nextLabel: {
    backgroundColor: '#8B1538',
    color: '#fff',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.008,
    borderRadius: 20,
    fontSize: Math.min(width * 0.03, 12),
    fontWeight: '700',
    marginRight: width * 0.03,
  },
  nextEventTitle: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  criteriaSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  criteriaTitle: {
    backgroundColor: '#8B1538',
    color: '#fff',
    textAlign: 'center',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.04,
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '700',
    borderRadius: 6,
    marginBottom: height * 0.015,
  },
  criteriaGrid: {
    gap: height * 0.01,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.03,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  criteriaItemSelected: {
    backgroundColor: '#e8f4f8',
    borderWidth: 1,
    borderColor: '#8B1538',
  },
  criteriaText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#333',
    marginLeft: width * 0.025,
    fontWeight: '500',
  },
  criteriaTextSelected: {
    color: '#8B1538',
    fontWeight: '600',
  },
  eventsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.012,
    borderBottomWidth: 1,
    borderBottomColor: '#8B1538',
  },
  checkbox: {
    width: Math.min(width * 0.05, 20),
    height: Math.min(width * 0.05, 20),
    borderWidth: 2,
    borderColor: '#8B1538',
    borderRadius: 3,
    marginRight: width * 0.03,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#8B1538',
  },
  checkboxInner: {
    width: Math.min(width * 0.025, 10),
    height: Math.min(width * 0.025, 10),
    backgroundColor: 'transparent',
    borderRadius: 1,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: Math.min(width * 0.038, 15),
    fontWeight: '600',
    color: '#333',
    textDecorationLine: 'underline',
  },
  eventSubtitle: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#666',
    marginTop: height * 0.002,
  },
  emptyLine: {
    height: 1,
    backgroundColor: '#8B1538',
    flex: 1,
  },
});
