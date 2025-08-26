import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebase';

const { width, height } = Dimensions.get('window');

const regions = ["Central", "North", "South", "East", "West"];

export default function ChoirScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim() || !selectedRegion) {
      Alert.alert('Error', 'Please fill in all fields including region selection');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      Alert.alert(
        'Welcome to AFMA Choir!',
        `Hello ${user.displayName || user.email}! You have successfully signed in to the ${selectedRegion} region choir forum.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to choir interface (you can create this later)
              console.log('Navigate to Choir Interface', { 
                userEmail: user.email, 
                userName: user.displayName || user.email, 
                userId: user.uid,
                region: selectedRegion 
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
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !fullName.trim() || !selectedRegion) {
      Alert.alert('Error', 'Please fill in all fields including region selection');
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
        `Welcome to AFMA Choir, ${fullName}! Your account has been created for the ${selectedRegion} region.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to choir interface
              console.log('Navigate to Choir Interface', { 
                userEmail: user.email, 
                userName: fullName, 
                userId: user.uid,
                region: selectedRegion 
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="AFMA Choir" subtitle="Choristers Forum • Regional Access" />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <LinearGradient
            colors={['#8B1538', '#A61B46', '#C02454']}
            style={styles.headerCard}
          >
            <MaterialCommunityIcons name="music" size={48} color="#fff" />
            <Text style={styles.headerTitle}>Choristers Forum</Text>
            <Text style={styles.headerSubtitle}>Connect with choir members across all regions</Text>
          </LinearGradient>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, !isRegistering && styles.activeTab]}
                onPress={() => setIsRegistering(false)}
              >
                <Text style={[styles.tabText, !isRegistering && styles.activeTabText]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, isRegistering && styles.activeTab]}
                onPress={() => setIsRegistering(true)}
              >
                <Text style={[styles.tabText, isRegistering && styles.activeTabText]}>Register</Text>
              </TouchableOpacity>
            </View>

            {isRegistering && (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="account" size={20} color="#8B1538" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>
            )}
            
            {/* Region Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Select Your Region</Text>
              <TouchableOpacity 
                style={styles.regionSelector}
                onPress={() => setShowRegionDropdown(!showRegionDropdown)}
              >
                <MaterialCommunityIcons name="map-marker" size={20} color="#8B1538" style={styles.inputIcon} />
                <Text style={[styles.regionText, !selectedRegion && styles.placeholderText]}>
                  {selectedRegion || 'Choose Region'}
                </Text>
                <MaterialCommunityIcons 
                  name={showRegionDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#8B1538" 
                />
              </TouchableOpacity>
              
              {showRegionDropdown && (
                <View style={styles.regionDropdown}>
                  {regions.map((region) => (
                    <TouchableOpacity
                      key={region}
                      style={styles.regionOption}
                      onPress={() => {
                        setSelectedRegion(region);
                        setShowRegionDropdown(false);
                      }}
                    >
                      <Text style={styles.regionOptionText}>{region}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email" size={20} color="#8B1538" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock" size={20} color="#8B1538" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {isRegistering && (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="lock-check" size={20} color="#8B1538" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <MaterialCommunityIcons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!isRegistering && (
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]} 
              onPress={isRegistering ? handleRegister : handleSignIn}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#A5D6A7', '#C8E6C9'] : ['#4CAF50', '#66BB6A']}
                style={styles.signInGradient}
              >
                {isLoading ? (
                  <>
                    <MaterialCommunityIcons name="loading" size={20} color="#fff" />
                    <Text style={styles.signInButtonText}>
                      {isRegistering ? 'CREATING ACCOUNT...' : 'SIGNING IN...'}
                    </Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name={isRegistering ? "account-plus" : "music-note"} size={20} color="#fff" />
                    <Text style={styles.signInButtonText}>
                      {isRegistering ? 'CREATE ACCOUNT' : 'SIGN IN TO CHOIR'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Features Section */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Choir Forum Features</Text>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="forum" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Regional choir discussions</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="calendar" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Practice schedules & events</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="music-box" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Sheet music sharing</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="account-group" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Connect with other choristers</Text>
            </View>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
  },
  headerCard: {
    borderRadius: 20,
    padding: width * 0.06,
    alignItems: 'center',
    marginBottom: height * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: '800',
    color: '#fff',
    marginTop: height * 0.01,
  },
  headerSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: height * 0.005,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.05,
    marginBottom: height * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
    marginBottom: height * 0.025,
  },
  tab: {
    flex: 1,
    paddingVertical: height * 0.015,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#8B1538',
  },
  tabText: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  formTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '700',
    color: '#8B1538',
    marginBottom: height * 0.025,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: height * 0.02,
  },
  inputLabel: {
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '600',
    color: '#8B1538',
    marginBottom: height * 0.01,
  },
  regionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.018,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  regionText: {
    flex: 1,
    fontSize: Math.min(width * 0.04, 16),
    color: '#333',
    marginLeft: width * 0.02,
  },
  placeholderText: {
    color: '#999',
  },
  regionDropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: height * 0.01,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  regionOption: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  regionOptionText: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.018,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: width * 0.03,
  },
  textInput: {
    flex: 1,
    fontSize: Math.min(width * 0.04, 16),
    color: '#333',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: height * 0.02,
  },
  forgotText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#8B1538',
    fontWeight: '600',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: height * 0.02,
  },
  forgotText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#8B1538',
    fontWeight: '600',
  },
  signInButton: {
    borderRadius: 15,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.02,
    borderRadius: 15,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '700',
    marginLeft: 8,
  },
  demoContainer: {
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.03,
    borderLeftWidth: 4,
    borderLeftColor: '#8B1538',
  },
  demoTitle: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '700',
    color: '#8B1538',
    marginBottom: height * 0.01,
  },
  demoText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#8B1538',
    marginBottom: height * 0.005,
  },
  featuresContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: width * 0.05,
    marginBottom: height * 0.03,
  },
  featuresTitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#8B1538',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  featureText: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#333',
    marginLeft: width * 0.03,
    flex: 1,
  },
});
