import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Dimensions, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, database } from '../config/firebase';
import { ref, set } from 'firebase/database';

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
      
      // Navigate directly to chat interface
      navigation.navigate('ChatInterface', { 
        userEmail: user.email,
        userName: user.displayName || user.email,
        userId: user.uid,
        isAdmin: false
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

      // Store user data in database
      await set(ref(database, `users/${user.uid}`), {
        email: user.email,
        displayName: fullName,
        createdAt: new Date().toISOString(),
        isAdmin: false
      });
      
      Alert.alert(
        'Registration Successful!',
        `Welcome to AFMA Chat, ${fullName}! Please sign in to continue.`,
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="AFMA Chat" subtitle="Community Conversations • Church Fellowship" />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <LinearGradient
            colors={['#8B1538', '#A61B46', '#C02454']}
            style={styles.headerCard}
          >
            <MaterialCommunityIcons name="chat" size={48} color="#fff" />
            <Text style={styles.headerTitle}>AFMA Chat Community</Text>
            <Text style={styles.headerSubtitle}>Connect with fellow believers and church members</Text>
          </LinearGradient>

          {/* Auth Form */}
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

            <TouchableOpacity 
              style={[styles.actionButton, isLoading && styles.actionButtonDisabled]} 
              onPress={isRegistering ? handleRegister : handleSignIn}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#A5D6A7', '#C8E6C9'] : ['#4CAF50', '#66BB6A']}
                style={styles.actionGradient}
              >
                {isLoading ? (
                  <>
                    <MaterialCommunityIcons name="loading" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      {isRegistering ? 'CREATING ACCOUNT...' : 'SIGNING IN...'}
                    </Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name={isRegistering ? "account-plus" : "chat"} size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>
                      {isRegistering ? 'CREATE ACCOUNT' : 'SIGN IN TO CHAT'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Features Section */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Chat Features</Text>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="forum" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Community discussions</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="account-group" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Connect with church members</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="bell" size={24} color="#8B1538" />
              <Text style={styles.featureText}>Real-time notifications</Text>
            </View>
            
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#8B1538" />
              <Text style={styles.featureText}>End to End Encryption</Text>
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
  actionButton: {
    borderRadius: 15,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.02,
    borderRadius: 15,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '700',
    marginLeft: 8,
  },
  featuresContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: width * 0.05,
    marginBottom: height * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
