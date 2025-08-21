import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Mock user database - you can replace this with real authentication
const mockUsers = {
  "overseer@afma.org": { password: "overseer123", name: "Overseer", role: "overseer" },
  "mfundisi@afma.org": { password: "mfundisi123", name: "Mfundisi Malinga", role: "mfundisi" },
  "pastor@afma.org": { password: "pastor123", name: "Pastor", role: "pastor" },
  "member@afma.org": { password: "member123", name: "Church Member", role: "member" }
};

export default function ChatScreen({ navigation }) {
  const [afmaEmail, setAfmaEmail] = useState('');
  const [afmaPassword, setAfmaPassword] = useState('');
  const [showAfmaPassword, setShowAfmaPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAfmaSignIn = async () => {
    if (!afmaEmail.trim() || !afmaPassword.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const user = mockUsers[afmaEmail.toLowerCase()];
      
      if (user && user.password === afmaPassword) {
        // Successful login - navigate to chat interface
        navigation.navigate('ChatInterface', { 
          userEmail: afmaEmail,
          userName: user.name,
          userRole: user.role 
        });
      } else {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleChoristersSignIn = () => {
    console.log('Choristers Forum Sign In');
  };

  const handleForgotPassword = () => {
    console.log('Forgot Password');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="AFMA Chat" subtitle="Community conversations • Choristers Forum" />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* AFMA Chat Section */}
          <View style={styles.chatSection}>
            <View style={styles.chatHeader}>
              <MaterialCommunityIcons name="chat" size={32} color="#8B1538" />
              <Text style={styles.chatTitle}>afma chat</Text>
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email" size={20} color="white" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email Address / Telephone"
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
                value={afmaEmail}
                onChangeText={setAfmaEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="lock" size={20} color="white" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.8)"
                value={afmaPassword}
                onChangeText={setAfmaPassword}
                secureTextEntry={!showAfmaPassword}
              />
              <TouchableOpacity onPress={() => setShowAfmaPassword(!showAfmaPassword)}>
                <MaterialCommunityIcons 
                  name={showAfmaPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="rgba(255, 255, 255, 0.8)" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]} 
              onPress={handleAfmaSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.signInButtonText}>SIGNING IN...</Text>
              ) : (
                <Text style={styles.signInButtonText}>SIGN IN</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name="google" size={24} color="#6c819b" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name="facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name="apple" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Demo Login Credentials:</Text>
            <Text style={styles.instructionsText}>Email: overseer@afma.org | Password: overseer123</Text>
            <Text style={styles.instructionsText}>Email: mfundisi@afma.org | Password: mfundisi123</Text>
            <Text style={styles.instructionsText}>Email: member@afma.org | Password: member123</Text>
          </View>

          {/* Choristers Forum Section */}
          <View style={styles.choristersSection}>
            <View style={styles.choristersHeader}>
              <MaterialCommunityIcons name="music-note" size={24} color="#8B1538" />
              <Text style={styles.choristersTitle}>Choristers Forum</Text>
            </View>

            <View style={styles.choristersInputContainer}>
              <Text style={styles.choristersInputLabel}>Select Region</Text>
            </View>

            <View style={styles.choristersInputContainer}>
              <Text style={styles.choristersInputLabel}>Username</Text>
            </View>

            <View style={styles.choristersInputContainer}>
              <Text style={styles.choristersInputLabel}>Password</Text>
            </View>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordTextChoristers}>forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.choristersSignInButton} onPress={handleChoristersSignIn}>
              <Text style={styles.signInButtonText}>SIGN IN</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
  },
  chatSection: {
    marginBottom: height * 0.04,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  chatTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#8B1538',
    marginLeft: width * 0.02,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B1538',
    borderRadius: 8,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.018,
    marginBottom: height * 0.015,
  },
  inputIcon: {
    marginRight: width * 0.03,
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: width * 0.04,
    fontWeight: '500',
  },
  forgotPasswordText: {
    textAlign: 'right',
    color: '#8B1538',
    fontSize: width * 0.035,
    marginBottom: height * 0.025,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#00C851',
    borderRadius: 25,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.025,
  },
  signInButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  signInButtonText: {
    color: 'white',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.025,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#8B1538',
  },
  dividerText: {
    marginHorizontal: width * 0.04,
    color: '#8B1538',
    fontSize: width * 0.035,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: height * 0.04,
  },
  socialButton: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: width * 0.06,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B1538',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  choristersSection: {
    paddingBottom: height * 0.03,
  },
  choristersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.03,
  },
  choristersTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#8B1538',
    marginLeft: width * 0.02,
  },
  choristersInputContainer: {
    backgroundColor: '#8B1538',
    borderRadius: 8,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    marginBottom: height * 0.015,
  },
  choristersInputLabel: {
    color: 'white',
    fontSize: width * 0.04,
    fontWeight: '500',
  },
  forgotPasswordTextChoristers: {
    textAlign: 'right',
    color: '#8B1538',
    fontSize: width * 0.035,
    marginBottom: height * 0.025,
    fontWeight: '500',
  },
  choristersSignInButton: {
    backgroundColor: '#00C851',
    borderRadius: 25,
    paddingVertical: height * 0.02,
    alignItems: 'center',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.03,
    borderLeftWidth: 4,
    borderLeftColor: '#8B1538',
  },
  instructionsTitle: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#8B1538',
    marginBottom: height * 0.01,
  },
  instructionsText: {
    fontSize: width * 0.035,
    color: '#8B1538',
    marginBottom: height * 0.005,
  },
});
