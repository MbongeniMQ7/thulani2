import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ImageBackground, 
  StatusBar, 
  Dimensions, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Text,
  Alert,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      Alert.alert('Registration Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1600&auto=format&fit=crop' }}
        style={styles.bg}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(139, 21, 56, 0.4)', 'rgba(139, 21, 56, 0.8)', 'rgba(139, 21, 56, 0.95)']}
          style={styles.gradient}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header Section */}
              <View style={styles.headerSection}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../assets/img/logo.jpg')}
                    style={styles.churchLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.logoText}>AFMA</Text>
                  <Text style={styles.logoSubtext}>Apostolic Faith Mission of Africa</Text>
                  <Text style={styles.logoWelcome}>Join Our Community</Text>
                </View>
              </View>

              {/* Sign Up Form */}
              <View style={styles.formSection}>
                <View style={styles.formContainer}>
                  <Text style={styles.formTitle}>Create Account</Text>
                  <Text style={styles.formSubtitle}>Begin your spiritual journey with us</Text>
                  
                  {/* Full Name Input */}
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="account-outline" size={20} color="#8B1538" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#999"
                      value={fullName}
                      onChangeText={setFullName}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                  
                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="email-outline" size={20} color="#8B1538" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  
                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color="#8B1538" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <MaterialCommunityIcons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Confirm Password Input */}
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-check-outline" size={20} color="#8B1538" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#999"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <MaterialCommunityIcons 
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#666" 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Password Requirements */}
                  <View style={styles.passwordRequirements}>
                    <Text style={styles.requirementText}>• Password must be at least 6 characters</Text>
                    <Text style={styles.requirementText}>• Include letters and numbers for security</Text>
                  </View>
                  
                  {/* Sign Up Button */}
                  <TouchableOpacity 
                    style={styles.signupButton}
                    onPress={handleSignUp}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={['#8B1538', '#A61B46', '#C02454']}
                      style={styles.signupGradient}
                    >
                      {loading ? (
                        <MaterialCommunityIcons name="loading" size={20} color="#fff" />
                      ) : (
                        <>
                          <Text style={styles.signupButtonText}>Create Account</Text>
                          <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  {/* Terms of Service */}
                  <Text style={styles.termsText}>
                    By creating an account, you agree to our{' '}
                    <Text style={styles.termsLinkText}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLinkText}>Privacy Policy</Text>
                  </Text>
                  
                  {/* Divider */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>
                  
                  {/* Login Link */}
                  <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={styles.loginText}>
                      Already have an account? <Text style={styles.loginLinkText}>Sign In</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.015,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: height * 0.015,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    marginBottom: height * 0.01,
  },
  logoContainer: {
    alignItems: 'center',
  },
  churchLogo: {
    width: Math.min(width * 0.2, 80),
    height: Math.min(width * 0.2, 80),
    marginBottom: height * 0.015,
    borderRadius: Math.min(width * 0.1, 40),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtext: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  logoWelcome: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#fff',
    opacity: 0.8,
    marginTop: 3,
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: height * 0.015,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: width * 0.06,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  formTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: '800',
    color: '#8B1538',
    textAlign: 'center',
    marginBottom: height * 0.005,
  },
  formSubtitle: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#666',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    marginBottom: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: width * 0.03,
  },
  input: {
    flex: 1,
    paddingVertical: height * 0.018,
    fontSize: Math.min(width * 0.04, 16),
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  passwordRequirements: {
    marginBottom: height * 0.02,
  },
  requirementText: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#666',
    marginBottom: 2,
  },
  signupButton: {
    borderRadius: 15,
    marginBottom: height * 0.02,
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signupGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.02,
    borderRadius: 15,
  },
  signupButtonText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  termsText: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: height * 0.02,
  },
  termsLinkText: {
    color: '#8B1538',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.02,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    paddingHorizontal: width * 0.04,
    fontSize: Math.min(width * 0.035, 14),
    color: '#666',
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: height * 0.015,
  },
  loginText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#666',
  },
  loginLinkText: {
    color: '#8B1538',
    fontWeight: '600',
  },
});
