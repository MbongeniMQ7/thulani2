import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function Tile({ icon, label, onPress, color = '#8B1538' }) {
  return (
    <TouchableOpacity style={[styles.card, { borderColor: color }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconWrap, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={Math.min(width * 0.09, 36)} color="#fff" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: height * 0.16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.04,
    margin: width * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    minWidth: width * 0.4, // Ensures good proportions
  },
  iconWrap: {
    width: Math.min(width * 0.14, 56),
    height: Math.min(width * 0.14, 56),
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.015,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  label: { 
    fontSize: Math.min(width * 0.035, 14), 
    fontWeight: '700', 
    color: '#8B1538',
    lineHeight: Math.min(width * 0.045, 18),
    flexWrap: 'wrap',
    textAlign: 'center',
  }
});
