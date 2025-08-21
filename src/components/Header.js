import React from 'react';
import { View, StyleSheet, Image, Text, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function Header({ title, subtitle, showBack = false, onBack }) {
  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#4CAF50', '#2196F3', '#1976D2']}
            style={styles.logoGlobe}
          >
            <Text style={styles.globeEmoji}>🌍</Text>
          </LinearGradient>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.025,
    backgroundColor: '#8B1538',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    marginRight: width * 0.03,
    padding: 4,
  },
  logoContainer: {
    marginRight: width * 0.03,
  },
  logoGlobe: {
    width: Math.min(width * 0.08, 32), 
    height: Math.min(width * 0.08, 32), 
    borderRadius: Math.min(width * 0.04, 16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  globeEmoji: {
    fontSize: Math.min(width * 0.045, 18),
  },
  title: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: Math.min(width * 0.045, 18),
    lineHeight: Math.min(width * 0.055, 22),
  },
  subtitle: { 
    color: '#c7d3e0', 
    fontSize: Math.min(width * 0.03, 12), 
    marginTop: height * 0.003,
    lineHeight: Math.min(width * 0.04, 16),
  }
});
