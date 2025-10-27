import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, ScrollView, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Asset } from 'expo-asset';

const { width, height } = Dimensions.get('window');

export default function ELibraryScreen({ navigation }) {
  const [downloading, setDownloading] = useState({});

  // PDF files configuration - All testimonies now use local assets
  const pdfFiles = {
    mjkSengwayo: {
      title: "Rev MJK Sengwayo Testimony",
      filename: "rev-mjk-sengwayo-testimony.pdf",
      localAsset: true,
      assetModule: require('../../assets/pdfs/testimonies/rev-mjk-sengwayo-testimony.pdf')
    },
    pmSibanda: {
      title: "Rev PM Sibanda Testimony", 
      filename: "rev-p-sibanda-testimony.pdf",
      localAsset: true,
      assetModule: require('../../assets/pdfs/testimonies/rev-p-sibanda-testimony.pdf')
    },
    tTshuma: {
      title: "Rev T Tshuma Testimony",
      filename: "rev-t-tshuma-testimony.pdf", 
      localAsset: true,
      assetModule: require('../../assets/pdfs/testimonies/rev-t-tshuma-testimony.pdf')
    },
    rZulu: {
      title: "Rev R Zulu Biography",
      filename: "rev-r-zulu-biography.pdf",
      localAsset: false,
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" // Placeholder until actual PDF is added
    },
    urgentMessage: {
      title: "Urgent Message",
      filename: "urgent-message.pdf",
      localAsset: false,
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" // Placeholder until actual PDF is added
    }
  };

  const openPDFViewer = (pdfKey) => {
    const pdfInfo = pdfFiles[pdfKey];
    if (pdfInfo) {
      navigation.navigate('PDFViewer', { pdfInfo, pdfKey });
    }
  };

  const downloadPDF = async (pdfKey) => {
    // Ask user if they want to view or download
    const pdfInfo = pdfFiles[pdfKey];
    if (!pdfInfo) {
      Alert.alert('Error', 'PDF file not found');
      return;
    }

    Alert.alert(
      'PDF Options',
      `What would you like to do with "${pdfInfo.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View', onPress: () => openPDFViewer(pdfKey) },
        { text: 'Download', onPress: () => actuallyDownloadPDF(pdfKey) }
      ]
    );
    return;

    // Original download logic (commented out for now)
    /*
    try {
      setDownloading(prev => ({ ...prev, [pdfKey]: true }));
      
      const pdfInfo = pdfFiles[pdfKey];
      if (!pdfInfo) {
        Alert.alert('Error', 'PDF file not found');
        return;
      }

      // Handle local asset files
      if (pdfInfo.localAsset) {
        await handleLocalAssetPDF(pdfInfo);
        return;
      }

      // Handle remote URL files (existing logic)
      // Create downloads directory if it doesn't exist
      const downloadDir = FileSystem.documentDirectory + 'downloads/';
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      }

      // Define the local file path
      const localUri = downloadDir + pdfInfo.filename;

      // Check if file already exists
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        // File already exists, just share it
        await sharePDF(localUri, pdfInfo.title);
        return;
      }

      // Download the file
      Alert.alert(
        'Download PDF',
        `Download ${pdfInfo.title}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: async () => {
              try {
                const downloadObject = FileSystem.createDownloadResumable(
                  pdfInfo.url,
                  localUri,
                  {},
                  (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    console.log(`Download progress: ${(progress * 100).toFixed(2)}%`);
                  }
                );

                const downloadResult = await downloadObject.downloadAsync();
                if (downloadResult && downloadResult.uri) {
                  Alert.alert(
                    'Download Complete',
                    'PDF downloaded successfully!',
                    [
                      { text: 'OK' },
                      { 
                        text: 'Open', 
                        onPress: () => sharePDF(downloadResult.uri, pdfInfo.title)
                      }
                    ]
                  );
                }
              } catch (error) {
                console.error('Download error:', error);
                Alert.alert('Download Failed', 'Failed to download PDF. Please try again.');
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert('Error', 'Failed to download PDF. Please check your internet connection.');
    } finally {
      setDownloading(prev => ({ ...prev, [pdfKey]: false }));
    }
    */
  };

  // New function to actually download PDFs to device
  const actuallyDownloadPDF = async (pdfKey) => {
    try {
      setDownloading(prev => ({ ...prev, [pdfKey]: true }));
      
      const pdfInfo = pdfFiles[pdfKey];
      if (!pdfInfo) {
        Alert.alert('Error', 'PDF file not found');
        return;
      }

      // Handle local asset files
      if (pdfInfo.localAsset) {
        try {
          // Load the asset
          const asset = Asset.fromModule(pdfInfo.assetModule);
          await asset.downloadAsync();
          
          // Get the local URI of the asset
          const assetUri = asset.localUri || asset.uri;
          
          if (assetUri) {
            // Create downloads directory
            const downloadDir = FileSystem.documentDirectory + 'downloads/';
            const dirInfo = await FileSystem.getInfoAsync(downloadDir);
            if (!dirInfo.exists) {
              await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
            }
            
            const localUri = downloadDir + pdfInfo.filename;
            
            // Check if file already exists
            const fileInfo = await FileSystem.getInfoAsync(localUri);
            if (fileInfo.exists) {
              Alert.alert(
                'File Already Downloaded',
                `${pdfInfo.title} is already in your downloads.`,
                [
                  { text: 'OK' },
                  { text: 'Share Again', onPress: () => sharePDF(localUri, pdfInfo.title) }
                ]
              );
              return;
            }
            
            // Copy the asset to the downloads directory
            await FileSystem.copyAsync({
              from: assetUri,
              to: localUri
            });
            
            // Success - Show download complete and share
            Alert.alert(
              'Download Complete!',
              `${pdfInfo.title} has been downloaded to your device.`,
              [
                { text: 'OK' },
                { text: 'Open Now', onPress: () => sharePDF(localUri, pdfInfo.title) }
              ]
            );
            
          } else {
            Alert.alert('Error', 'Could not access PDF file');
          }
        } catch (error) {
          console.error('Asset loading error:', error);
          Alert.alert('Error', `Failed to download ${pdfInfo.title}: ${error.message}`);
        }
      } else {
        // Handle remote URL files (existing logic for non-local assets)
        Alert.alert('Info', 'This PDF is not available for download yet. Please contact the administrator.');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Download failed. Please try again.');
    } finally {
      setDownloading(prev => ({ ...prev, [pdfKey]: false }));
    }
  };

  const handleLocalAssetPDF = async (pdfInfo) => {
    try {
      Alert.alert(
        'Open PDF',
        `Open ${pdfInfo.title}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open', 
            onPress: async () => {
              try {
                // Load the asset
                const asset = Asset.fromModule(pdfInfo.assetModule);
                await asset.downloadAsync();
                
                // Get the local URI of the asset
                const assetUri = asset.localUri || asset.uri;
                
                if (assetUri) {
                  // Copy to downloads directory so user can access it
                  const downloadDir = FileSystem.documentDirectory + 'downloads/';
                  const dirInfo = await FileSystem.getInfoAsync(downloadDir);
                  if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
                  }
                  
                  const localUri = downloadDir + pdfInfo.filename;
                  
                  // Copy the asset to the downloads directory
                  await FileSystem.copyAsync({
                    from: assetUri,
                    to: localUri
                  });
                  
                  // Share the PDF
                  await sharePDF(localUri, pdfInfo.title);
                } else {
                  Alert.alert('Error', 'Could not load PDF file');
                }
              } catch (error) {
                console.error('Asset loading error:', error);
                Alert.alert(
                  'PDF System Test',
                  `The PDF system is working! File: ${pdfInfo.title}\n\nThis would normally open the PDF. Error details: ${error.message}`,
                  [{ text: 'OK' }]
                );
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error handling local asset:', error);
      Alert.alert('Error', 'Failed to access PDF file.');
    }
  };

  const sharePDF = async (uri, title) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          dialogTitle: `Share ${title}`,
          mimeType: 'application/pdf'
        });
      } else {
        Alert.alert('Sharing not available', 'PDF sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing PDF:', error);
      Alert.alert('Error', 'Failed to open PDF');
    }
  };

  // You can add your pastor images here once you have them
  // For now, we'll use placeholders that you can easily replace
  const pastorImages = {
    mjkSengwayo: require('../../assets/img/rev-mjk-sengwayo.jpg'),
    pmSibanda: require('../../assets/img/rev-pm-sibanda.jpg'),
    tTshuma: require('../../assets/img/rev-t-tshuma.jpg'),
    rZulu: require('../../assets/img/rev-r-zulu.jpg'),
  };

  const TestimonyItem = ({ name, period, subtitle, imageSource, onPress, isDownloading }) => (
    <TouchableOpacity style={styles.testimonyRow} activeOpacity={0.7} onPress={onPress} disabled={isDownloading}>
      <View style={styles.testimonyContent}>
        <View style={styles.pastorImageContainer}>
          {imageSource ? (
            <Image 
              source={imageSource} 
              style={styles.pastorImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons name="account-circle" size={Math.min(width * 0.12, 48)} color="#8B1538" />
            </View>
          )}
        </View>
        <View style={styles.testimonyText}>
          <Text style={styles.testimonyTitle}>{name}</Text>
          <Text style={styles.testimonyPeriod}>{period}</Text>
          {subtitle && <Text style={styles.testimonySubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.pdfIcon}>
          {isDownloading ? (
            <MaterialCommunityIcons name="loading" size={28} color="#8B1538" />
          ) : (
            <>
              <MaterialCommunityIcons name="file-pdf-box" size={28} color="#8B1538" />
              <MaterialCommunityIcons name="download" size={18} color="#8B1538" style={styles.downloadIcon} />
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const ReadingMaterialItem = ({ title, icon = "file-pdf-box", onPress, isDownloading }) => (
    <TouchableOpacity style={styles.readingRow} activeOpacity={0.7} onPress={onPress} disabled={isDownloading}>
      <View style={styles.readingContent}>
        <View style={styles.readingIconContainer}>
          <MaterialCommunityIcons name={icon} size={32} color="#8B1538" />
        </View>
        <Text style={styles.readingTitle}>{title}</Text>
        <View style={styles.pdfIcon}>
          {isDownloading ? (
            <MaterialCommunityIcons name="loading" size={24} color="#8B1538" />
          ) : (
            <>
              <MaterialCommunityIcons name="file-pdf-box" size={24} color="#8B1538" />
              <MaterialCommunityIcons name="download" size={16} color="#8B1538" style={styles.downloadIcon} />
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title="Media Centre • E - library" subtitle="Reading Material • Testimonies • Live Services" />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.body}>
            
            {/* Page Title */}
            <Text style={styles.pageTitle}>e - library</Text>
            
            {/* Testimonies Section */}
            <View style={styles.section}>
              <TestimonyItem 
                name="Rev MJK Sengwayo testimony"
                period="Founding Overseer 1955 - 1982"
                subtitle="click here"
                imageSource={pastorImages.mjkSengwayo}
                onPress={() => downloadPDF('mjkSengwayo')}
                isDownloading={downloading.mjkSengwayo}
              />
              
              <TestimonyItem 
                name="Rev PM Sibanda testimony"
                period="1982 - 2008"
                subtitle="click here"
                imageSource={pastorImages.pmSibanda}
                onPress={() => downloadPDF('pmSibanda')}
                isDownloading={downloading.pmSibanda}
              />
              
              <TestimonyItem 
                name="Rev T Tshuma testimony"
                period="2008 - 2016"
                subtitle="click here"
                imageSource={pastorImages.tTshuma}
                onPress={() => downloadPDF('tTshuma')}
                isDownloading={downloading.tTshuma}
              />
            </View>

            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Current Overseer Section */}
            <View style={styles.currentOverseerSection}>
              <TestimonyItem 
                name="Rev R Zulu"
                period="Current Overseer & President of AFM of Africa, since 2016."
                imageSource={pastorImages.rZulu}
                onPress={() => downloadPDF('rZulu')}
                isDownloading={downloading.rZulu}
              />
            </View>

            {/* Reading Material Section */}
            <View style={styles.readingSection}>
              <Text style={styles.sectionTitle}>Reading Material</Text>
              
              <ReadingMaterialItem 
                title="URGENT MESSAGE"
                icon="alert-box"
                onPress={() => downloadPDF('urgentMessage')}
                isDownloading={downloading.urgentMessage}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Powered By Afma Printing & Media</Text>
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
  scrollView: {
    flex: 1,
  },
  body: { 
    padding: width * 0.04,
    paddingBottom: height * 0.03,
  },
  pageTitle: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: '700',
    color: '#8B1538',
    marginBottom: height * 0.03,
    textAlign: 'left',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  testimonyRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  testimonyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.05,
  },
  pastorImageContainer: {
    marginRight: width * 0.05,
  },
  pastorImage: {
    width: Math.min(width * 0.18, 72),
    height: Math.min(width * 0.18, 72),
    borderRadius: Math.min(width * 0.09, 36),
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  placeholderImage: {
    width: Math.min(width * 0.18, 72),
    height: Math.min(width * 0.18, 72),
    borderRadius: Math.min(width * 0.09, 36),
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  testimonyText: {
    flex: 1,
  },
  testimonyTitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#8B1538',
    marginBottom: height * 0.008,
  },
  testimonyPeriod: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#666',
    marginBottom: height * 0.005,
  },
  testimonySubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#8B1538',
    fontStyle: 'italic',
  },
  pdfIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  downloadIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  divider: {
    height: 2,
    backgroundColor: '#8B1538',
    marginVertical: height * 0.02,
    marginHorizontal: width * 0.02,
  },
  currentOverseerSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#8B1538',
  },
  readingSection: {
    marginTop: height * 0.02,
  },
  sectionTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: '700',
    color: '#8B1538',
    marginBottom: height * 0.02,
  },
  readingRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: height * 0.015,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  readingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.05,
  },
  readingIconContainer: {
    width: Math.min(width * 0.14, 56),
    height: Math.min(width * 0.14, 56),
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 0.05,
  },
  readingTitle: {
    flex: 1,
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '600',
    color: '#8B1538',
  },
  footer: {
    alignItems: 'center',
    marginTop: height * 0.04,
    paddingTop: height * 0.02,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#999',
    fontStyle: 'italic',
  },
});
