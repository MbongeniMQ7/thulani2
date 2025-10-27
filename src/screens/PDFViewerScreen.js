import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from 'expo-asset';

const { width, height } = Dimensions.get('window');

export default function PDFViewerScreen({ route, navigation }) {
  const { pdfInfo, pdfKey } = route.params;
  const [loading, setLoading] = useState(true);
  const [pdfUri, setPdfUri] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPDF();
  }, []);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      if (pdfInfo.localAsset) {
        // Handle local asset
        const asset = Asset.fromModule(pdfInfo.assetModule);
        await asset.downloadAsync();
        
        const downloadDir = FileSystem.documentDirectory + 'downloads/';
        const dirInfo = await FileSystem.getInfoAsync(downloadDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
        }
        
        const localUri = downloadDir + pdfInfo.filename;
        
        // Check if already exists
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (!fileInfo.exists) {
          await FileSystem.copyAsync({
            from: asset.localUri || asset.uri,
            to: localUri
          });
        }
        
        setPdfUri(localUri);
      } else {
        // Handle remote PDF (existing download logic)
        const downloadDir = FileSystem.documentDirectory + 'downloads/';
        const localUri = downloadDir + pdfInfo.filename;
        
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (fileInfo.exists) {
          setPdfUri(localUri);
        } else {
          // Download the file
          const downloadObject = FileSystem.createDownloadResumable(
            pdfInfo.url,
            localUri
          );
          
          const result = await downloadObject.downloadAsync();
          if (result && result.uri) {
            setPdfUri(result.uri);
          }
        }
      }
    } catch (err) {
      console.error('PDF loading error:', err);
      setError('Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const sharePDF = async () => {
    try {
      if (pdfUri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          dialogTitle: `Share ${pdfInfo.title}`,
          mimeType: 'application/pdf'
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to share PDF');
    }
  };

  const openPDF = async () => {
    try {
      if (pdfUri && await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          dialogTitle: pdfInfo.title,
          mimeType: 'application/pdf'
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open PDF');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#8B1538" />
      
      {/* Header */}
      <LinearGradient
        colors={['#8B1538', '#A61B46', '#C02454']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {pdfInfo.title}
            </Text>
            <Text style={styles.headerSubtitle}>PDF Document</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={sharePDF}
            disabled={!pdfUri}
          >
            <MaterialCommunityIcons 
              name="share-variant" 
              size={24} 
              color={pdfUri ? "#fff" : "rgba(255,255,255,0.5)"} 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={['#8B1538', '#A61B46']}
              style={styles.loadingCard}
            >
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Preparing PDF...</Text>
              <Text style={styles.loadingSubtext}>
                Loading {pdfInfo.title}
              </Text>
            </LinearGradient>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <MaterialCommunityIcons name="file-alert" size={64} color="#8B1538" />
              <Text style={styles.errorTitle}>Unable to Load PDF</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadPDF}>
                <LinearGradient
                  colors={['#8B1538', '#A61B46']}
                  style={styles.retryGradient}
                >
                  <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                  <Text style={styles.retryText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.successContainer}>
            {/* PDF Preview Card */}
            <View style={styles.pdfCard}>
              <LinearGradient
                colors={['#f8f9fa', '#fff']}
                style={styles.pdfCardGradient}
              >
                <View style={styles.pdfIconContainer}>
                  <LinearGradient
                    colors={['#8B1538', '#A61B46']}
                    style={styles.pdfIconGradient}
                  >
                    <MaterialCommunityIcons name="file-pdf-box" size={48} color="#fff" />
                  </LinearGradient>
                </View>
                
                <Text style={styles.pdfTitle}>{pdfInfo.title}</Text>
                <Text style={styles.pdfFilename}>{pdfInfo.filename}</Text>
                
                <View style={styles.pdfInfo}>
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                    <Text style={styles.infoText}>Ready to View</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons name="file-document" size={16} color="#8B1538" />
                    <Text style={styles.infoText}>PDF Format</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={openPDF}>
                <LinearGradient
                  colors={['#8B1538', '#A61B46', '#C02454']}
                  style={styles.buttonGradient}
                >
                  <MaterialCommunityIcons name="file-eye" size={24} color="#fff" />
                  <Text style={styles.primaryButtonText}>Open PDF</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={sharePDF}>
                <View style={styles.secondaryButtonContent}>
                  <MaterialCommunityIcons name="share-variant" size={20} color="#8B1538" />
                  <Text style={styles.secondaryButtonText}>Share</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* About Section */}
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>About This Document</Text>
              <Text style={styles.aboutText}>
                This PDF contains important church materials from the Apostolic Faith Mission of Africa. 
                Tap "Open PDF" to view the document in your device's PDF reader.
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
  },
  backButton: {
    padding: 8,
    marginRight: width * 0.03,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: width * 0.03,
  },
  headerTitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: width * 0.04,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    padding: width * 0.08,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '600',
    color: '#fff',
    marginTop: height * 0.02,
  },
  loadingSubtext: {
    fontSize: Math.min(width * 0.035, 14),
    color: 'rgba(255,255,255,0.8)',
    marginTop: height * 0.01,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: width * 0.08,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  errorTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '700',
    color: '#8B1538',
    marginTop: height * 0.02,
  },
  errorText: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#666',
    textAlign: 'center',
    marginTop: height * 0.01,
    marginBottom: height * 0.03,
  },
  retryButton: {
    borderRadius: 12,
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.015,
    borderRadius: 12,
  },
  retryText: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  successContainer: {
    flex: 1,
  },
  pdfCard: {
    marginBottom: height * 0.03,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pdfCardGradient: {
    padding: width * 0.06,
    borderRadius: 20,
    alignItems: 'center',
  },
  pdfIconContainer: {
    marginBottom: height * 0.02,
  },
  pdfIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '700',
    color: '#8B1538',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  pdfFilename: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#666',
    marginBottom: height * 0.02,
  },
  pdfInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#666',
    marginLeft: 4,
  },
  actionButtons: {
    marginBottom: height * 0.03,
  },
  primaryButton: {
    borderRadius: 15,
    marginBottom: height * 0.015,
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.02,
    borderRadius: 15,
  },
  primaryButtonText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  secondaryButton: {
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#8B1538',
    backgroundColor: '#fff',
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.018,
  },
  secondaryButtonText: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    color: '#8B1538',
    marginLeft: 8,
  },
  aboutSection: {
    backgroundColor: '#fff',
    padding: width * 0.05,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aboutTitle: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    color: '#8B1538',
    marginBottom: height * 0.01,
  },
  aboutText: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#666',
    lineHeight: 20,
  },
});
