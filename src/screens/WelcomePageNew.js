import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ImageBackground, 
  Text, 
  Dimensions, 
  StatusBar, 
  SafeAreaView, 
  TouchableOpacity,
  Animated,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: "Welcome Home",
    subtitle: "Apostolic Faith Mission of Africa",
    description: "A church with an open door and a burning message",
    image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1600&auto=format&fit=crop",
    icon: "church"
  },
  {
    id: 2,
    title: "Spiritual Growth",
    subtitle: "Grow in Faith Together",
    description: "Join our community in worship, prayer, and spiritual development",
    image: "https://images.unsplash.com/photo-1438032005730-c779502df39b?q=80&w=1600&auto=format&fit=crop",
    icon: "book-open-variant"
  },
  {
    id: 3,
    title: "Connect & Serve",
    subtitle: "Be Part of Something Greater",
    description: "Connect with fellow believers and serve in our community",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1600&auto=format&fit=crop",
    icon: "account-group"
  }
];

export default function WelcomeScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prevSlide => {
        const nextSlide = (prevSlide + 1) % slides.length;
        
        // Fade out current slide
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }).start(() => {
          // Fade in new slide
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        });
        
        return nextSlide;
      });
    }, 6000); // Increased from 4000ms to 6000ms (6 seconds)

    return () => clearInterval(timer);
  }, [fadeAnim]);

  const currentSlideData = slides[currentSlide];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={{ uri: currentSlideData.image }}
        style={styles.bg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(139, 21, 56, 0.3)', 'rgba(139, 21, 56, 0.7)', 'rgba(139, 21, 56, 0.9)']}
          style={styles.gradient}
        >
          <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/img/logo.jpg')}
                  style={styles.churchLogo}
                  resizeMode="contain"
                />
                <Text style={styles.afmaTitle}>AFMA</Text>
                <Text style={styles.fullChurchName}>Apostolic Faith Mission of Africa</Text>
              </View>
            </View>

            {/* Slide Content */}
            <View style={styles.contentSection}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name={currentSlideData.icon} 
                  size={80} 
                  color="#fff" 
                />
              </View>
              
              <Text style={styles.slideTitle}>{currentSlideData.title}</Text>
              <Text style={styles.slideSubtitle}>{currentSlideData.subtitle}</Text>
              <Text style={styles.slideDescription}>{currentSlideData.description}</Text>
            </View>

            {/* Slide Indicators */}
            <View style={styles.indicatorContainer}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentSlide && styles.activeIndicator
                  ]}
                />
              ))}
            </View>

            {/* Get Started Button */}
            <View style={styles.buttonSection}>
              <TouchableOpacity 
                style={styles.getStartedButton}
                onPress={() => navigation.navigate('Login')}
              >
                <LinearGradient
                  colors={['#fff', '#f8f9fa']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                  <MaterialCommunityIcons name="arrow-right" size={24} color="#8B1538" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.skipText}>Already have an account? Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  logoContainer: {
    alignItems: 'center',
  },
  churchLogo: {
    width: Math.min(width * 0.15, 60),
    height: Math.min(width * 0.15, 60),
    marginBottom: height * 0.015,
    borderRadius: Math.min(width * 0.075, 30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  afmaTitle: {
    fontSize: Math.min(width * 0.1, 36),
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  fullChurchName: {
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: height * 0.005,
    opacity: 0.9,
    letterSpacing: 1,
  },
  contentSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: height * 0.02,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: Math.min(width * 0.08, 40),
    padding: Math.min(width * 0.04, 16),
    marginBottom: height * 0.02,
  },
  slideTitle: {
    fontSize: Math.min(width * 0.07, 28),
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: height * 0.01,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  slideSubtitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: height * 0.01,
    opacity: 0.9,
  },
  slideDescription: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#fff',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.05, 20),
    paddingHorizontal: width * 0.08,
    opacity: 0.8,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 20,
  },
  buttonSection: {
    alignItems: 'center',
  },
  getStartedButton: {
    width: width * 0.8,
    borderRadius: 25,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.02,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#8B1538',
    marginRight: 8,
  },
  skipButton: {
    paddingVertical: height * 0.015,
  },
  skipText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
});
