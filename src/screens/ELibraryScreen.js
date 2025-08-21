import React from 'react';
import { View, StyleSheet, Text, Dimensions, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ELibraryScreen() {
  // You can add your pastor images here once you have them
  // For now, we'll use placeholders that you can easily replace
  const pastorImages = {
    mjkSengwayo: require('../../assets/img/rev-mjk-sengwayo.jpg'),
    pmSibanda: require('../../assets/img/rev-pm-sibanda.jpg'),
    tTshuma: require('../../assets/img/rev-t-tshuma.jpg'),
    rZulu: require('../../assets/img/rev-r-zulu.jpg'),
  };

  const TestimonyItem = ({ name, period, subtitle, imageSource, onPress }) => (
    <TouchableOpacity style={styles.testimonyRow} activeOpacity={0.7} onPress={onPress}>
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
          <MaterialCommunityIcons name="file-pdf-box" size={28} color="#8B1538" />
          <MaterialCommunityIcons name="download" size={18} color="#8B1538" style={styles.downloadIcon} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const ReadingMaterialItem = ({ title, icon = "file-pdf-box", onPress }) => (
    <TouchableOpacity style={styles.readingRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.readingContent}>
        <View style={styles.readingIconContainer}>
          <MaterialCommunityIcons name={icon} size={32} color="#8B1538" />
        </View>
        <Text style={styles.readingTitle}>{title}</Text>
        <View style={styles.pdfIcon}>
          <MaterialCommunityIcons name="file-pdf-box" size={24} color="#8B1538" />
          <MaterialCommunityIcons name="download" size={16} color="#8B1538" style={styles.downloadIcon} />
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
                onPress={() => console.log('Download Rev MJK Sengwayo testimony')}
              />
              
              <TestimonyItem 
                name="Rev PM Sibanda testimony"
                period="1982 - 2008"
                subtitle="click here"
                imageSource={pastorImages.pmSibanda}
                onPress={() => console.log('Download Rev PM Sibanda testimony')}
              />
              
              <TestimonyItem 
                name="Rev T Tshuma testimony"
                period="2008 - 2016"
                subtitle="click here"
                imageSource={pastorImages.tTshuma}
                onPress={() => console.log('Download Rev T Tshuma testimony')}
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
                onPress={() => console.log('Download Rev R Zulu information')}
              />
            </View>

            {/* Reading Material Section */}
            <View style={styles.readingSection}>
              <Text style={styles.sectionTitle}>Reading Material</Text>
              
              <ReadingMaterialItem 
                title="URGENT MESSAGE"
                icon="alert-box"
                onPress={() => console.log('Download Urgent Message')}
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
