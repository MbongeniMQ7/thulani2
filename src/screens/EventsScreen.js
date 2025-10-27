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
import { LinearGradient } from 'expo-linear-gradient';
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
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Section with Gradient */}
          <LinearGradient
            colors={['#8B1538', '#A61B46', '#C02454']}
            style={styles.heroSection}
          >
            <MaterialCommunityIcons name="calendar-star" size={64} color="#fff" />
            <Text style={styles.heroTitle}>AFMA Events</Text>
            <Text style={styles.heroSubtitle}>Experience faith-filled gatherings and celebrations</Text>
          </LinearGradient>

          {/* Next Event Card with Countdown */}
          <View style={styles.featuredEventCard}>
            <View style={styles.featuredBadge}>
              <MaterialCommunityIcons name="star" size={16} color="#fff" />
              <Text style={styles.featuredText}>FEATURED EVENT</Text>
            </View>
            <Text style={styles.featuredEventTitle}>Venda Great Revival</Text>
            <Text style={styles.featuredEventDate}>18 - 21 September 2025</Text>
            
            {/* Countdown Timer */}
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>Countdown</Text>
              <View style={styles.timerDisplay}>
                <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.learnMoreButton}>
              <Text style={styles.learnMoreText}>Learn More</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#8B1538" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Upcoming Events Section */}
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="calendar-clock" size={28} color="#8B1538" />
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
            </View>
            
            {/* Next Event Banner */}
            <View style={styles.nextEventBanner}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#8B1538" />
              <View style={styles.nextEventContent}>
                <Text style={styles.nextLabel}>NEXT</Text>
                <Text style={styles.nextEventTitle}>The Annual Campmeeting 2025 - 26</Text>
              </View>
            </View>
            
            {/* Select Criteria Section */}
            <View style={styles.criteriaSection}>
              <View style={styles.criteriaTitleRow}>
                <MaterialCommunityIcons name="filter-variant" size={24} color="#8B1538" />
                <Text style={styles.criteriaTitle}>Filter by Category</Text>
              </View>
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
              <View style={styles.eventsHeader}>
                <MaterialCommunityIcons name="format-list-checks" size={24} color="#8B1538" />
                <Text style={styles.eventsHeaderText}>Select Events to Attend</Text>
              </View>
              {filteredEvents.map((event, index) => (
                <TouchableOpacity 
                  key={event.id} 
                  style={styles.eventCard}
                  onPress={() => toggleEventSelection(event.id)}
                >
                  <View style={styles.eventCardLeft}>
                    <View style={[
                      styles.checkbox,
                      selectedEvents.includes(event.id) && styles.checkboxSelected
                    ]}>
                      {selectedEvents.includes(event.id) && (
                        <MaterialCommunityIcons name="check" size={18} color="#fff" />
                      )}
                    </View>
                    <View style={styles.eventContent}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
                      <View style={styles.categoryBadge}>
                        <MaterialCommunityIcons name="tag" size={14} color="#8B1538" />
                        <Text style={styles.categoryBadgeText}>{event.category}</Text>
                      </View>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                </TouchableOpacity>
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
  heroSection: {
    margin: width * 0.04,
    marginTop: width * 0.02,
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
  featuredEventCard: {
    backgroundColor: '#fff',
    margin: width * 0.04,
    marginTop: 0,
    padding: width * 0.05,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#8B1538',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B1538',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 12,
  },
  featuredText: {
    color: '#fff',
    fontSize: width * 0.03,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  featuredEventTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featuredEventDate: {
    fontSize: width * 0.04,
    color: '#666',
    marginBottom: 15,
  },
  countdownContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
  },
  countdownLabel: {
    fontSize: width * 0.035,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  timerDisplay: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  timerText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: '800',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B1538',
  },
  learnMoreText: {
    color: '#8B1538',
    fontSize: width * 0.04,
    fontWeight: '600',
    marginRight: 5,
  },
  body: { 
    padding: width * 0.04,
    paddingTop: 0,
    paddingBottom: height * 0.03,
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
  nextEventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: width * 0.04,
    borderRadius: 15,
    marginBottom: height * 0.025,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextEventContent: {
    flex: 1,
    marginLeft: 12,
  },
  nextLabel: {
    backgroundColor: '#8B1538',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: width * 0.028,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  nextEventTitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333',
  },
  criteriaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  eventsHeaderText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#8B1538',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: '#8B1538',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  eventSubtitle: {
    fontSize: width * 0.035,
    color: '#666',
    marginBottom: 5,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: width * 0.03,
    color: '#8B1538',
    marginLeft: 4,
    fontWeight: '500',
  },
});
