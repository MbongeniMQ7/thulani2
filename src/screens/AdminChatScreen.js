import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { auth, database } from '../config/firebase';
import { ref, set } from 'firebase/database';
import { getAdminCodes, storeAdminCodes } from '../config/adminCodes';

const { width, height } = Dimensions.get('window');

const adminRoles = [
  { id: 'overseer', name: 'Overseer', icon: 'account-star' },
  { id: 'pastor', name: 'Pastor', icon: 'account-tie' }
];

export default function AdminChatScreen({ navigation }) {
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
  const [currentAdminCodes, setCurrentAdminCodes] = useState({});

  // Load current admin codes when component mounts
  useEffect(() => {
    loadAdminCodes();
  }, []);

  const loadAdminCodes = async () => {
    try {
      const codes = await getAdminCodes();
      setCurrentAdminCodes(codes);
    } catch (error) {
      console.error('Failed to load admin codes:', error);
      // Fallback to default codes
      setCurrentAdminCodes({
        overseer: 'AFMA2024OVERSEER',
        pastor: 'AFMA2024PASTOR'
      });
    }
  };

  const showCurrentAdminCodes = () => {
    Alert.alert(
      'Current Admin Verification Codes',
      `Overseer Code: ${currentAdminCodes.overseer || 'Loading...'}\n\nPastor Code: ${currentAdminCodes.pastor || 'Loading...'}\n\nNote: These codes are required for admin registration.`,
      [{ text: 'OK' }]
    );
  };

  const handleAdminSignIn = async () => {
    if (!email.trim() || !password.trim() || !selectedRole) {
      Alert.alert('Error', 'Please fill in all fields and select your role');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Navigate to admin chat interface
      navigation.navigate('AdminChatInterface', {
        userEmail: user.email,
        userName: user.displayName || user.email,
        userId: user.uid,
        role: selectedRole,
        isAdmin: true
      });
      
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No admin account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
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

    // Verify admin code
    if (adminCode !== currentAdminCodes[selectedRole]) {
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

      // Generate new admin codes after successful registration
      const newCodes = await storeAdminCodes();
      setCurrentAdminCodes(newCodes);
      
      Alert.alert(
        'Admin Registration Successful!',
        `Welcome ${fullName}!\n\nYour ${selectedRole} account has been created.\n\nNEW ADMIN CODES:\nOverseer: ${newCodes.overseer}\nPastor: ${newCodes.pastor}\n\nPlease save these codes securely for future admin registrations.`,
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

          {/* Role Selection */}
          <View style={styles.roleSelectionContainer}>
            <View style={styles.roleHeaderContainer}>
              <Text style={styles.roleSelectionTitle}>Select Your Role</Text>
              <TouchableOpacity 
                style={styles.viewCodesButton}
                onPress={showCurrentAdminCodes}
              >
                <MaterialCommunityIcons name="eye" size={16} color="#8B1538" />
                <Text style={styles.viewCodesText}>View Codes</Text>
              </TouchableOpacity>
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
              onPress={isRegistering ? handleAdminRegister : handleAdminSignIn}
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
  viewCodesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B1538',
  },
  viewCodesText: {
    fontSize: width * 0.03,
    color: '#8B1538',
    marginLeft: 4,
    fontWeight: '600',
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
});