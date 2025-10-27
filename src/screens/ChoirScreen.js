import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const forums = [
  {
    id: 'chorister',
    name: 'Choristers Forum',
    description: 'forum for updates on all matters of music.',
    icon: 'music'
  },
  {
    id: 'cyc',
    name: 'CYC Committee',
    description: 'Christian Youth Committee discussions and activities',
    icon: 'account-group'
  }
];

export default function ChoirScreen({ navigation, route }) {
  const { isUserAuthenticated, getUserEmail, getUserName, getUserId } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedForum, setSelectedForum] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Check if user is already authenticated and get forum from navigation
  useEffect(() => {
    if (isUserAuthenticated()) {
      // Pre-fill user information
      setEmail(getUserEmail() || '');
      setFullName(getUserName() || '');
    }
    
    // Pre-select forum from navigation params
    if (route?.params?.forumId) {
      setSelectedForum(route.params.forumId);
    }
  }, [route?.params?.forumId]);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim() || !selectedForum) {
      Alert.alert('Error', 'Please fill in all fields and select a forum');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      const selectedForumData = forums.find(f => f.id === selectedForum);
      
      // Navigate directly to chat
      navigation.navigate('ForumChat', {
        userEmail: user.email,
        userName: user.displayName || user.email,
        userId: user.uid,
        forum: selectedForum,
        forumName: selectedForumData.name
      });
      
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
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !fullName.trim() || !selectedForum) {
      Alert.alert('Error', 'Please fill in all fields and select a forum');
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
      
      const selectedForumData = forums.find(f => f.id === selectedForum);
      
      Alert.alert(
        'Registration Successful!',
        `Welcome to ${selectedForumData.name}, ${fullName}! Please sign in to continue.`,
        [
          {
            text: 'Sign In',
            onPress: () => {
              setIsRegistering(false);
              setPassword('');
              setConfirmPassword('');
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

  // Function for already authenticated users to join forum directly
  const handleAuthenticatedForumAccess = () => {
    if (!selectedForum) {
      Alert.alert('Error', 'Please select a forum to continue');
      return;
    }

    const selectedForumData = forums.find(f => f.id === selectedForum);
    
    // Navigate directly to chat
    navigation.navigate('ForumChat', {
      userEmail: getUserEmail(),
      userName: getUserName(),
      userId: getUserId(),
      forum: selectedForum,
      forumName: selectedForumData.name
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="AFMA Forums" subtitle="Community Discussion Boards • Member Access" />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <LinearGradient
            colors={['#8B1538', '#A61B46', '#C02454']}
            style={styles.headerCard}
          >
            <MaterialCommunityIcons name="forum" size={48} color="#fff" />
            <Text style={styles.headerTitle}>AFMA Forums</Text>
            <Text style={styles.headerSubtitle}>Join our community discussion boards</Text>
          </LinearGradient>

          {/* Forum Selection - Only show if not pre-selected */}
          {!route?.params?.forumId && (
            <View style={styles.forumSelectionContainer}>
              <Text style={styles.forumSelectionTitle}>Choose Your Forum</Text>
              {forums.map((forum) => (
                <TouchableOpacity
                  key={forum.id}
                  style={[
                    styles.forumCard,
                    selectedForum === forum.id && styles.selectedForumCard
                  ]}
                  onPress={() => setSelectedForum(forum.id)}
                >
                  <View style={styles.forumCardContent}>
                    <MaterialCommunityIcons 
                      name={forum.icon} 
                      size={32} 
                      color={selectedForum === forum.id ? "#fff" : "#8B1538"} 
                    />
                    <View style={styles.forumTextContainer}>
                      <Text style={[
                        styles.forumName,
                        selectedForum === forum.id && styles.selectedForumText
                      ]}>
                        {forum.name}
                      </Text>
                      <Text style={[
                        styles.forumDescription,
                        selectedForum === forum.id && styles.selectedForumDescText
                      ]}>
                        {forum.description}
                      </Text>
                    </View>
                    <MaterialCommunityIcons 
                      name={selectedForum === forum.id ? "check-circle" : "circle-outline"} 
                      size={24} 
                      color={selectedForum === forum.id ? "#fff" : "#8B1538"} 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

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
                    <MaterialCommunityIcons name={isRegistering ? "account-plus" : "forum"} size={20} color="#fff" />
                    <Text style={styles.signInButtonText}>
                      {isRegistering ? 'JOIN FORUM' : 'SIGN IN TO FORUM'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Features Section */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Forum Features</Text>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="forum" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Community discussions</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="calendar" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Events & announcements</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="file-document" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Document sharing</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="account-group" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Connect with members</Text>
            </View>

            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="chat" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Real-time messaging</Text>
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
  forumSelectionContainer: {
    marginBottom: height * 0.03,
  },
  forumSelectionTitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#8B1538',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  forumCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: width * 0.04,
    marginBottom: height * 0.015,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedForumCard: {
    backgroundColor: '#8B1538',
    borderColor: '#8B1538',
  },
  forumCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forumTextContainer: {
    flex: 1,
    marginLeft: width * 0.03,
  },
  forumName: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#8B1538',
    marginBottom: height * 0.005,
  },
  selectedForumText: {
    color: '#fff',
  },
  forumDescription: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#666',
  },
  selectedForumDescText: {
    color: 'rgba(255,255,255,0.9)',
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
