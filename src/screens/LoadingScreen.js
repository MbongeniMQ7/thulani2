import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  return (
    <LinearGradient
      colors={['#8B1538', '#A61B46', '#8B1538']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={require('../../assets/img/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>AFMA</Text>
        <Text style={styles.subtitle}>Apostolic Faith Mission of Africa</Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
    marginBottom: height * 0.02,
    borderWidth: 3,
    borderColor: '#fff',
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: height * 0.01,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: width * 0.035,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: height * 0.05,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: width * 0.04,
    marginTop: height * 0.02,
    opacity: 0.8,
  },
});