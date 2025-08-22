import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import EventsScreen from '../screens/EventsScreen';
import ELibraryScreen from '../screens/ELibraryScreen';
import ChatScreen from '../screens/ChatScreen';
import QueueScreen from '../screens/QueueScreen';
import MediaCentreScreen from '../screens/MediaCentreScreen';
import ChatInterface from '../screens/ChatInterface';
import BranchLocatorScreen from '../screens/BranchLocatorScreen';
import OverseerQueueScreen from '../screens/OverseerQueueScreen';
import PastorQueueScreen from '../screens/PastorQueueScreen';
import PDFViewerScreen from '../screens/PDFViewerScreen';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  const getTabBarIcon = (iconName) => ({ focused, color, size }) => (
    <MaterialCommunityIcons 
      name={iconName} 
      size={Math.min(width * 0.07, 28)} 
      color={focused ? '#8B1538' : color} 
    />
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          height: Math.min(width * 0.18, 70),
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e6edf5',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: { 
          fontSize: Math.min(width * 0.03, 12), 
          marginBottom: 4,
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#8B1538',
        tabBarInactiveTintColor: '#6c819b',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: getTabBarIcon("home-variant") }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{ tabBarIcon: getTabBarIcon("calendar-star") }}
      />
      <Tab.Screen
        name="E-Library"
        component={ELibraryScreen}
        options={{ tabBarIcon: getTabBarIcon("book-open-page-variant") }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarIcon: getTabBarIcon("chat-processing") }}
      />
      <Tab.Screen
        name="Queue"
        component={QueueScreen}
        options={{ tabBarIcon: getTabBarIcon("account-clock") }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="MediaCentre" component={MediaCentreScreen} />
      <Stack.Screen name="ChatInterface" component={ChatInterface} />
      <Stack.Screen name="BranchLocator" component={BranchLocatorScreen} />
      <Stack.Screen name="OverseerQueue" component={OverseerQueueScreen} />
      <Stack.Screen name="PastorQueue" component={PastorQueueScreen} />
      <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
    </Stack.Navigator>
  );
}
