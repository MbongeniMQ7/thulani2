import 'react-native-url-polyfill/auto';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import { LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: ...', // Add specific warnings to ignore
  'Require cycle:', // Common React Native warning
]);

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <AuthNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
