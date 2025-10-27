import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Dimensions, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebase';

const { width, height } = Dimensions.get('window');

export default function ChatScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      Alert.alert(
        'Welcome to AFMA Chat!',
        `Hello ${user.displayName || user.email}! You have successfully signed in.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.navigate('ChatInterface', { 
                userEmail: user.email,
                userName: user.displayName || user.email,
                userId: user.uid 
              });
            }
          }
        ]
      );
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please register first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !fullName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await user.updateProfile({
        displayName: fullName
      });
      
      Alert.alert(
        'Registration Successful!',
        `Welcome to AFMA Chat, ${fullName}! Your account has been created successfully.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.navigate('ChatInterface', { 
                userEmail: user.email,
                userName: fullName,
                userId: user.uid 
              });
            }
          }
        ]
      );
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please sign in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      await auth.sendPasswordResetEmail(email);
      Alert.alert('Password Reset', 'Password reset email sent! Please check your inbox.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email. Please check your email address.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#8B1538', '#A61B46', '#C02454', '#1e3c72', '#2a5298']}
        style={styles.backgroundGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        {/* Church Logo Area */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="church" size={48} color="#fff" />
          </View>
          <Text style={styles.logoText}>AFMA</Text>
          <Text style={styles.logoSubtext}>CONNECT</Text>
        </View>
      </LinearGradient>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Tab Header */}
          <View style={styles.tabHeader}>
            <TouchableOpacity 
              style={[styles.tabButton, !isRegistering && styles.activeTab]}
              onPress={() => setIsRegistering(false)}
            >
              <Text style={[styles.tabText, !isRegistering && styles.activeTabText]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, isRegistering && styles.activeTab]}
              onPress={() => setIsRegistering(true)}
            >
              <Text style={[styles.tabText, isRegistering && styles.activeTabText]}>
                Join Now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>
              {isRegistering ? 'Join our community!' : 'Welcome back!'}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {isRegistering ? 'Create your account below' : 'Please sign in below'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Full Name Field (Register Only) */}
            {isRegistering && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Email address</Text>
                <Text style={styles.requiredText}>Required</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="john@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field (Register Only) */}
            {isRegistering && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <MaterialCommunityIcons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#999" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.disabledButton]}
              onPress={isRegistering ? handleRegister : handleSignIn}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#8B1538', '#A61B46']}
                style={styles.buttonGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                {isLoading ? (
                  <MaterialCommunityIcons name="loading" size={20} color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isRegistering ? 'Join Now' : 'Sign In'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Forgot Password */}
            {!isRegistering && (
              <TouchableOpacity 
                style={styles.forgotButton}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {/* Switch Auth Mode */}
            <View style={styles.switchSection}>
              <Text style={styles.switchText}>
                {isRegistering ? 'Already have an account? ' : 'Not a member? '}
              </Text>
              <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                <Text style={styles.switchLink}>
                  {isRegistering ? 'Sign In' : 'Join now'}
                </Text>
              </TouchableOpacity>
            {/* Full Name Field (Register Only) */}
            {isRegistering && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Email address</Text>
                <Text style={styles.requiredText}>Required</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="john@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field (Register Only) */}
            {isRegistering && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <MaterialCommunityIcons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#999" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.disabledButton]}
              onPress={isRegistering ? handleRegister : handleSignIn}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#8B1538', '#A61B46']}
                style={styles.buttonGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                {isLoading ? (
                  <MaterialCommunityIcons name="loading" size={20} color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isRegistering ? 'Join Now' : 'Sign In'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Forgot Password */}
            {!isRegistering && (
              <TouchableOpacity 
                style={styles.forgotButton}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {/* Switch Auth Mode */}
            <View style={styles.switchSection}>
              <Text style={styles.switchText}>
                {isRegistering ? 'Already have an account? ' : 'Not a member? '}
              </Text>
              <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                <Text style={styles.switchLink}>
                  {isRegistering ? 'Sign In' : 'Join now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 
