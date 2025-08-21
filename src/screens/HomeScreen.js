import React from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import Tile from '../components/Tile';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Header title="The Apostolic Faith Mission of Africa" subtitle="a church with an open door and a burning message" />
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient
              colors={['#8B1538', '#A61B46']}
              style={styles.logoutGradient}
            >
              <MaterialCommunityIcons name="logout" size={20} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <ScrollView 
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          <Tile icon="play-circle" label="Media Centre" color="#8B1538" onPress={() => navigation.navigate('MediaCentre')} />
          <Tile icon="book" label="E - Library" color="#8B1538" onPress={() => navigation.navigate('E-Library')} />
          <Tile icon="chat" label="AFMA Chat" color="#8B1538" onPress={() => navigation.navigate('Chat')} />
          <Tile icon="map-marker-radius" label="Branch Locator" color="#8B1538" onPress={() => navigation.navigate('BranchLocator')} />
          <Tile icon="account-tie" label="Overseer E - Office" color="#8B1538" onPress={() => navigation.navigate('Queue')} />
          <Tile icon="account" label="Pastor's E - Office" color="#8B1538" onPress={() => navigation.navigate('Queue')} />
          <Tile icon="calendar" label="Events Calendar" color="#8B1538" onPress={() => navigation.navigate('Events')} />
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
  headerContainer: {
    position: 'relative',
  },
  logoutButton: {
    position: 'absolute',
    top: height * 0.015,
    right: width * 0.04,
    zIndex: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.03,
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: Math.min(width * 0.03, 12),
    fontWeight: '600',
    marginLeft: 4,
  },
  grid: {
    padding: width * 0.03,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: height * 0.03,
  }
});
