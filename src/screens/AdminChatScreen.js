import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, database } from '../config/firebase';
import { ref, set } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

// Fixed admin code - never changes
const ADMIN_CODE = 'AFMA2025';

const adminRoles = [
  { id: 'overseer', name: 'Overseer', icon: 'account-star' },
  { id: 'pastor', name: 'Pastor', icon: 'account-tie' }
];

export default function AdminChatScreen({ navigation }) {
  const { isUserAuthenticated, getUserEmail, getUserName, getUserId } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Check if user is already authenticated and redirect to role selection
  useEffect(() => {
    if (isUserAuthenticated()) {
      // Skip login form and go directly to role selection
      setEmail(getUserEmail() || '');
      setFullName(getUserName() || '');
    }
  }, []);

  // Handle admin access for already authenticated users
  const handleAuthenticatedAdminAccess = async () => {
    if (!selectedRole || !adminCode.trim()) {
      Alert.alert('Error', 'Please select your role and enter the admin code');
      return;
    }

    setIsLoading(true);

    try {
      // Verify admin code (fixed AFMA2025)
      if (adminCode !== ADMIN_CODE) {
        Alert.alert('Invalid Admin Code', 'The admin code you entered is incorrect.');
        setIsLoading(false);
        return;
      }

      // Navigate directly to admin chat interface
      navigation.navigate('AdminChatInterface', {
        userEmail: getUserEmail(),
        userName: getUserName(),
        userId: getUserId(),
        role: selectedRole,
        isAdmin: true
      });
      
    } catch (error) {
      console.error('Admin access error:', error);
      Alert.alert('Error', 'Failed to access admin interface. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim() || !selectedRole || !adminCode.trim()) {
      Alert.alert('Error', 'Please fill in all fields including admin verification code');
      return;
    }

    // Verify admin code (fixed AFMA2025)
    if (adminCode !== ADMIN_CODE) {
      Alert.alert('Error', 'Invalid admin verification code');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Store admin role in database
      await set(ref(database, `admins/${user.uid}`), {
        email: user.email,
        displayName: user.displayName || fullName || email,
        role: selectedRole,
        lastLogin: new Date().toISOString(),
        isAdmin: true
      });
      
      navigation.navigate('AdminChatInterface', {
        userEmail: user.email,
        userName: user.displayName || fullName || email,
        userId: user.uid,
        role: selectedRole,
        isAdmin: true
      });
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Admin Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !fullName.trim() || !selectedRole || !adminCode.trim()) {
      Alert.alert('Error', 'Please fill in all fields including admin verification code');
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

    // Verify admin code (fixed AFMA2025)
    if (adminCode !== ADMIN_CODE) {
      Alert.alert('Error', 'Invalid admin verification code for selected role');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update user profile
      await user.updateProfile({
        displayName: fullName
      });

      // Store admin role in database
      await set(ref(database, `admins/${user.uid}`), {
        email: user.email,
        displayName: fullName,
        role: selectedRole,
        createdAt: new Date().toISOString(),
        isAdmin: true
      });
      
      Alert.alert(
        'Admin Registration Successful!',
        `Welcome ${fullName}!\n\nYour ${selectedRole} account has been created successfully.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              navigation.navigate('AdminChatInterface', {
                userEmail: user.email,
                userName: fullName,
                userId: user.uid,
                role: selectedRole,
                isAdmin: true
              });
            }
          }
        ]
      );
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="Admin Access" subtitle="Overseer & Pastor Login • Church Leadership" />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Section */}
          <LinearGradient
            colors={['#8B1538', '#A61B46', '#C02454']}
            style={styles.headerCard}
          >
            <MaterialCommunityIcons name="shield-account" size={48} color="#fff" />
            <Text style={styles.headerTitle}>Admin Portal</Text>
            <Text style={styles.headerSubtitle}>Authorized access for church leadership</Text>
          </LinearGradient>

          {/* Admin Code Information */}
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information" size={24} color="#8B1538" />
            <Text style={styles.infoText}>
              Admin Code Required: <Text style={styles.codeText}>AFMA2025</Text>
            </Text>
          </View>

          {/* Role Selection */}
          <View style={styles.roleSelectionContainer}>
            <View style={styles.roleHeaderContainer}>
              <Text style={styles.roleSelectionTitle}>Select Your Role</Text>
            </View>
            {adminRoles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  selectedRole === role.id && styles.selectedRoleCard
                ]}
                onPress={() => setSelectedRole(role.id)}
              >
                <View style={styles.roleCardContent}>
                  <MaterialCommunityIcons 
                    name={role.icon} 
                    size={32} 
                    color={selectedRole === role.id ? "#fff" : "#8B1538"} 
                  />
                  <Text style={[
                    styles.roleName,
                    selectedRole === role.id && styles.selectedRoleText
                  ]}>
                    {role.name}
                  </Text>
                  <MaterialCommunityIcons 
                    name={selectedRole === role.id ? "check-circle" : "circle-outline"} 
                    size={24} 
                    color={selectedRole === role.id ? "#fff" : "#8B1538"} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Admin Code Section - Always Visible */}
          <View style={styles.adminCodeContainer}>
            <Text style={styles.adminCodeTitle}>Admin Verification Code</Text>
            <Text style={styles.adminCodeSubtitle}>Enter AFMA2025 to continue</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="key" size={20} color="#8B1538" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter admin code (AFMA2025)"
                placeholderTextColor="#999"
                value={adminCode}
                onChangeText={setAdminCode}
                autoCapitalize="characters"
                secureTextEntry
              />
            </View>
          </View>

          {/* User Status Display for Already Authenticated Users */}
          {isUserAuthenticated() && (
            <View style={styles.authenticatedUserContainer}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.authenticatedBadge}
              >
                <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
                <Text style={styles.authenticatedText}>Already Signed In</Text>
              </LinearGradient>
              <Text style={styles.authenticatedEmail}>{getUserEmail()}</Text>
              <Text style={styles.authenticatedNote}>Please select your role and admin code to continue</Text>
            </View>
          )}

          {/* Login Form - Hidden if already authenticated */}
          {!isUserAuthenticated() && (
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
                  placeholder="your.email@afma.org"
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
              <>
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

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Admin Verification Code</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="shield-key" size={20} color="#8B1538" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter admin verification code"
                      placeholderTextColor="#999"
                      value={adminCode}
                      onChangeText={setAdminCode}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
              </>
            )}

            {/* Sign In Button */}
            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.signInButtonDisabled]} 
              onPress={isRegistering ? handleAdminRegister : handleSignIn}
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
                    <MaterialCommunityIcons name={isRegistering ? "shield-plus" : "shield-account"} size={20} color="#fff" />
                    <Text style={styles.signInButtonText}>
                      {isRegistering ? 'CREATE ADMIN ACCOUNT' : 'ADMIN SIGN IN'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          )}

          {/* Action Button for Already Authenticated Users */}
          {isUserAuthenticated() && (
            <View style={styles.formContainer}>
              <TouchableOpacity 
                style={[styles.signInButton, (!selectedRole || !adminCode.trim() || isLoading) && styles.disabledButton]}
                onPress={handleAuthenticatedAdminAccess}
                disabled={!selectedRole || !adminCode.trim() || isLoading}
              >
                <LinearGradient
                  colors={(!selectedRole || !adminCode.trim() || isLoading) ? ['#94a3b8', '#64748b'] : ['#8B1538', '#A61B46', '#C02454']}
                  style={styles.signInGradient}
                >
                  {isLoading ? (
                    <>
                      <MaterialCommunityIcons name="loading" size={20} color="#fff" />
                      <Text style={styles.signInButtonText}>VERIFYING ACCESS...</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="shield-check" size={20} color="#fff" />
                      <Text style={styles.signInButtonText}>ACCESS ADMIN PORTAL</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Security Notice */}
          <View style={styles.securityContainer}>
            <MaterialCommunityIcons name="security" size={24} color="#8B1538" />
            <Text style={styles.securityText}>
              This is a secure admin portal. Only authorized church leadership can access this area.
            </Text>
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
  roleSelectionContainer: {
    marginBottom: height * 0.03,
  },
  roleHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  roleSelectionTitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#8B1538',
  },

  roleCard: {
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
  selectedRoleCard: {
    backgroundColor: '#8B1538',
    borderColor: '#8B1538',
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleName: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#8B1538',
    flex: 1,
    marginLeft: width * 0.03,
  },
  selectedRoleText: {
    color: '#fff',
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
  securityContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.03,
    borderLeftWidth: 4,
    borderLeftColor: '#8B1538',
    alignItems: 'center',
  },
  securityText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#8B1538',
    marginLeft: width * 0.03,
    flex: 1,
  },
  // Authenticated User Styles
  authenticatedUserContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authenticatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
    borderRadius: 12,
    marginBottom: height * 0.01,
  },
  authenticatedText: {
    color: '#fff',
    fontSize: Math.min(width * 0.035, 14),
    fontWeight: '700',
    marginLeft: width * 0.02,
  },
  authenticatedEmail: {
    fontSize: Math.min(width * 0.038, 15),
    fontWeight: '600',
    color: '#8B1538',
    textAlign: 'center',
    marginBottom: height * 0.005,
  },
  authenticatedNote: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#64748b',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.04, 16),
  },
  adminCodeContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminCodeTitle: {
    fontSize: Math.min(width * 0.042, 17),
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: height * 0.005,
    textAlign: 'center',
  },
  adminCodeSubtitle: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#64748b',
    textAlign: 'center',
    marginBottom: height * 0.015,
    lineHeight: Math.min(width * 0.04, 16),
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f3ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#8B1538',
  },
  codeText: {
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});