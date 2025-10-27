import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Dimensions, 
  StatusBar, 
  SafeAreaView, 
  TouchableOpacity,
  Animated,
  Image
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: "Welcome Home",
    subtitle: "Apostolic Faith Mission of Africa",
    description: "A church with an open door and a burning message",
    image: { uri: "https://imiojmzohfizckxbnfmk.supabase.co/storage/v1/object/public/AFMA/church.jpg" },
    icon: "church"
  },
  {
    id: 2,
    title: "Spiritual Growth",
    subtitle: "a church with an open door and a burning message",
    description: "Join our community in worship, prayer, and spiritual development",
    image: { uri: "https://imiojmzohfizckxbnfmk.supabase.co/storage/v1/object/public/AFMA/pst.jpg" },
    icon: "book-open-variant"
  },
  {
    id: 3,
    title: "Connect & Serve",
    subtitle: "Be Part of Something Greater",
    description: "Connect with fellow believers and serve in our community",
    image: { uri: "https://imiojmzohfizckxbnfmk.supabase.co/storage/v1/object/public/AFMA/church.jpg" },
    icon: "account-group"
  }
];

export default function WelcomeScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

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

  const handleVideoError = (error) => {
    console.log('Video loading error:', error);
    setVideoError(true);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.bg}>
        {!videoError && (
          <Video
            ref={videoRef}
            source={{ uri: 'https://imiojmzohfizckxbnfmk.supabase.co/storage/v1/object/public/AFMA/vid.mp4' }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            isMuted
            onError={handleVideoError}
          />
        )}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.7)']}
          style={styles.gradient}
        >
          <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Slide Content */}
            <View style={styles.contentSection}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: 'https://imiojmzohfizckxbnfmk.supabase.co/storage/v1/object/public/AFMA/church.jpg' }}
                  style={styles.churchImage}
                  resizeMode="cover"
                />
              </View>
              
              <Text style={styles.fullChurchName}>Apostolic Faith Mission of Africa</Text>
            </View>

            {/* Get Started Button */}
            <View style={styles.buttonSection}>
              <TouchableOpacity 
                style={styles.getStartedButton}
                onPress={() => navigation.navigate('App')}
              >
                <LinearGradient
                  colors={['#fff', '#f8f9fa']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Get Started</Text>
                  <MaterialCommunityIcons name="arrow-right" size={24} color="#8B1538" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
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
    backgroundColor: '#1a1a1a', // Fallback background color
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.08,
    paddingBottom: height * 0.03,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.01,
    flex: 0.25,
    justifyContent: 'center',
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
    fontSize: Math.min(width * 0.055, 22),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: height * 0.02,
    opacity: 1,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  contentSection: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: width * 0.04,
  },
  imageContainer: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: width * 0.14,
    overflow: 'hidden',
    marginBottom: height * 0.025,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    backgroundColor: '#fff',
  },
  churchImage: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 60,
    padding: width * 0.06,
    marginBottom: height * 0.03,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  slideTitle: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: height * 0.015,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 1,
  },
  slideSubtitle: {
    fontSize: Math.min(width * 0.048, 19),
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: height * 0.015,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  slideDescription: {
    fontSize: Math.min(width * 0.038, 15),
    color: '#fff',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.055, 22),
    paddingHorizontal: width * 0.06,
    opacity: 0.85,
    fontWeight: '500',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.15,
    paddingTop: height * 0.02,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 32,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    borderColor: '#fff',
  },
  buttonSection: {
    alignItems: 'center',
    position: 'absolute',
    bottom: height * 0.05,
    left: 0,
    right: 0,
    paddingHorizontal: width * 0.06,
  },
  getStartedButton: {
    width: width * 0.85,
    borderRadius: 35,
    marginBottom: height * 0.02,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.025,
    borderRadius: 35,
  },
  buttonText: {
    fontSize: Math.min(width * 0.052, 21),
    fontWeight: '900',
    color: '#8B1538',
    marginRight: 12,
    letterSpacing: 1,
  },
  skipButton: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
  },
  skipText: {
    fontSize: Math.min(width * 0.038, 15),
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
