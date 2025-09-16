import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

import WelcomeScreen from '../screens/WelcomePageNew';
import LoginScreen from '../auth/LoginScreenNew';
import SignUpScreen from '../auth/SignUpScreenNew';
import ForgotPassword from '../auth/ForgotPassword';
import LoadingScreen from '../screens/LoadingScreen';
import AppNavigator from './AppNavigator';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, false = not authenticated, true = authenticated

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Convert user object to boolean
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  // Show loading screen while checking authentication state
  if (isAuthenticated === null) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading" component={LoadingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ headerShown: false }} 
        initialRouteName={isAuthenticated ? "App" : "Welcome"}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="App" component={AppNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
