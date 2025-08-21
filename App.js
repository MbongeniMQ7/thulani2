import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AuthNavigator from './src/navigation/AuthNavigator';

export default function App() {
  return (
    <PaperProvider>
      <AuthNavigator />
    </PaperProvider>
  );
}
