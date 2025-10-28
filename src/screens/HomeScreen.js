import React from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '../components/Header';
import Tile from '../components/Tile';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const handleAdminAccess = () => {
    Alert.alert(
      "Admin Access",
      "Access admin portal for church leadership?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Continue", 
          onPress: () => navigation.navigate('AdminChat')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="The Apostolic Faith Mission of Africa" subtitle="a church with an open door and a burning message" />
        <ScrollView 
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          <Tile icon="play-circle" label="Media" color="#8B1538" onPress={() => navigation.navigate('MediaCentre')} />
          <Tile icon="book" label="Library" color="#8B1538" onPress={() => navigation.navigate('E-Library')} />
          <Tile icon="chat" label="AFMA Chat" color="#8B1538" onPress={() => navigation.navigate('Chat')} />
          <Tile icon="forum" label="Forums" color="#8B1538" onPress={() => navigation.navigate('Forums')} />
          <Tile icon="map-marker-radius" label="Branch Locator" color="#8B1538" onPress={() => navigation.navigate('BranchLocator')} />
          <Tile icon="account-tie" label="Overseer Office" color="#8B1538" onPress={() => navigation.navigate('OverseerQueue')} />
          <Tile icon="account" label="Pastor Office" color="#8B1538" onPress={() => navigation.navigate('PastorQueue')} />
          <Tile icon="calendar" label="Events Calendar" color="#8B1538" onPress={() => navigation.navigate('Events')} />
          <Tile icon="shield-account" label="Admin" color="#8B1538" onPress={handleAdminAccess} />
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
  grid: {
    padding: width * 0.03,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: height * 0.03,
  },
});
