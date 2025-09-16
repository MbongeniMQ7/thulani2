import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAdminCodes, storeAdminCodes } from '../config/adminCodes';

const { width, height } = Dimensions.get('window');

export default function AdminCodeManagement({ navigation }) {
  const [currentCodes, setCurrentCodes] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCurrentCodes();
  }, []);

  const loadCurrentCodes = async () => {
    try {
      const codes = await getAdminCodes();
      setCurrentCodes(codes);
    } catch (error) {
      Alert.alert('Error', 'Failed to load admin codes');
    }
  };

  const generateNewCodes = async () => {
    Alert.alert(
      'Generate New Admin Codes',
      'This will replace the current admin verification codes. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const newCodes = await storeAdminCodes();
              setCurrentCodes(newCodes);
              Alert.alert(
                'New Codes Generated',
                `New admin verification codes have been created:\n\nOverseer: ${newCodes.overseer}\nPastor: ${newCodes.pastor}\n\nPlease share these codes securely with authorized personnel.`
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to generate new codes');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const copyToClipboard = (code, role) => {
    // In a real app, you'd use Clipboard from expo-clipboard
    Alert.alert('Code Copied', `${role} code: ${code}\n\nNote: In a real app, this would be copied to clipboard.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="Admin Code Management" subtitle="Manage verification codes for admin access" />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#8B1538', '#A61B46']}
            style={styles.headerGradient}
          >
            <MaterialCommunityIcons name="shield-key" size={40} color="#fff" />
            <Text style={styles.headerTitle}>Current Admin Codes</Text>
            <Text style={styles.headerSubtitle}>Last updated: {currentCodes.lastUpdated ? new Date(currentCodes.lastUpdated).toLocaleString() : 'Unknown'}</Text>
          </LinearGradient>

          <View style={styles.codesContainer}>
            {/* Overseer Code */}
            <View style={styles.codeCard}>
              <View style={styles.codeHeader}>
                <MaterialCommunityIcons name="account-star" size={24} color="#8B1538" />
                <Text style={styles.codeRole}>Overseer Code</Text>
              </View>
              <View style={styles.codeContent}>
                <Text style={styles.codeText}>{currentCodes.overseer || 'Loading...'}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(currentCodes.overseer, 'Overseer')}
                >
                  <MaterialCommunityIcons name="content-copy" size={20} color="#8B1538" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Pastor Code */}
            <View style={styles.codeCard}>
              <View style={styles.codeHeader}>
                <MaterialCommunityIcons name="account-tie" size={24} color="#8B1538" />
                <Text style={styles.codeRole}>Pastor Code</Text>
              </View>
              <View style={styles.codeContent}>
                <Text style={styles.codeText}>{currentCodes.pastor || 'Loading...'}</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(currentCodes.pastor, 'Pastor')}
                >
                  <MaterialCommunityIcons name="content-copy" size={20} color="#8B1538" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={generateNewCodes}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#8B1538', '#A61B46']}
                style={styles.generateGradient}
              >
                <MaterialCommunityIcons 
                  name={isLoading ? "loading" : "refresh"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.generateText}>
                  {isLoading ? 'Generating...' : 'Generate New Codes'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={20} color="#8B1538" />
              <Text style={styles.backText}>Back to Admin</Text>
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
    backgroundColor: '#f4f6f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  content: {
    flex: 1,
    padding: width * 0.04,
  },
  headerGradient: {
    borderRadius: 15,
    padding: width * 0.06,
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: height * 0.01,
  },
  headerSubtitle: {
    fontSize: width * 0.035,
    color: '#fff',
    opacity: 0.9,
    marginTop: height * 0.005,
  },
  codesContainer: {
    marginBottom: height * 0.03,
  },
  codeCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  codeRole: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333',
    marginLeft: width * 0.02,
  },
  codeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: width * 0.03,
  },
  codeText: {
    fontSize: width * 0.035,
    fontFamily: 'monospace',
    color: '#333',
    flex: 1,
  },
  copyButton: {
    padding: width * 0.02,
  },
  actionsContainer: {
    gap: height * 0.02,
  },
  generateButton: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.018,
    borderRadius: 12,
  },
  generateText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
    marginLeft: width * 0.02,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: height * 0.018,
    borderWidth: 2,
    borderColor: '#8B1538',
  },
  backText: {
    color: '#8B1538',
    fontSize: width * 0.04,
    fontWeight: '600',
    marginLeft: width * 0.02,
  },
});