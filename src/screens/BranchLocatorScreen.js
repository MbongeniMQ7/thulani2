import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, SafeAreaView, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import branchData from '../data/branchLocations.json';

const { width, height } = Dimensions.get('window');

export default function BranchLocatorScreen({ navigation }) {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const handleCountryChange = (countryId) => {
    setSelectedCountry(countryId);
    setSelectedCity('');
    setShowCountryPicker(false);
    
    const country = branchData.countries.find(c => c.id === countryId);
    if (country) {
      setFilteredCities(country.cities || []);
    } else {
      setFilteredCities([]);
    }
  };

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    setShowCityPicker(false);
  };

  const getSelectedCountryName = () => {
    const country = branchData.countries.find(c => c.id === selectedCountry);
    return country ? country.name : 'Select a country...';
  };

  const getBranchesForCity = (cityName) => {
    const country = branchData.countries.find(c => c.id === selectedCountry);
    if (country) {
      const city = country.cities.find(c => c.name === cityName);
      return city ? city.branches : [];
    }
    return [];
  };

  const selectedCityData = filteredCities.find(c => c.name === selectedCity);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header 
          title="Branch Locator" 
          subtitle="Find AFMA branches worldwide"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Country Selector */}
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>Choose your country</Text>
            <TouchableOpacity 
              style={styles.pickerContainer}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={styles.pickerText}>{getSelectedCountryName()}</Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* City Selector */}
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>City / Town</Text>
            <TouchableOpacity 
              style={[styles.pickerContainer, filteredCities.length === 0 && styles.pickerDisabled]}
              onPress={() => filteredCities.length > 0 && setShowCityPicker(true)}
            >
              <Text style={styles.pickerText}>
                {selectedCity || 'Select a city...'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Map Section */}
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <MaterialCommunityIcons name="map" size={width * 0.15} color="#8B1538" />
              <Text style={styles.mapText}>Interactive Map</Text>
              <Text style={styles.mapSubtext}>
                {selectedCountry && selectedCity 
                  ? `Showing location for ${selectedCity}` 
                  : 'Select a country and city to view location'}
              </Text>
              
              {/* Map markers representation */}
              {selectedCity && (
                <View style={styles.markersContainer}>
                  <View style={[styles.marker, { left: '20%', top: '30%' }]}>
                    <MaterialCommunityIcons name="map-marker" size={24} color="#8B1538" />
                  </View>
                  <View style={[styles.marker, { right: '25%', top: '50%' }]}>
                    <MaterialCommunityIcons name="map-marker" size={24} color="#8B1538" />
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Branch Details */}
          {selectedCityData && (
            <View style={styles.branchDetailsContainer}>
              <Text style={styles.branchDetailsTitle}>
                Branches in {selectedCity}
              </Text>
              
              {selectedCityData.branches && selectedCityData.branches.length > 0 ? (
                selectedCityData.branches.map((branch, index) => (
                  <View key={index} style={styles.branchCard}>
                    <View style={styles.branchHeader}>
                      <MaterialCommunityIcons name="church" size={24} color="#8B1538" />
                      <Text style={styles.branchName}>{branch.name}</Text>
                    </View>
                    {branch.address && (
                      <Text style={styles.branchAddress}>{branch.address}</Text>
                    )}
                    <View style={styles.branchActions}>
                      <TouchableOpacity style={styles.actionButton}>
                        <MaterialCommunityIcons name="directions" size={20} color="#8B1538" />
                        <Text style={styles.actionButtonText}>Directions</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <MaterialCommunityIcons name="phone" size={20} color="#8B1538" />
                        <Text style={styles.actionButtonText}>Call</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.branchCard}>
                  <View style={styles.branchHeader}>
                    <MaterialCommunityIcons name="church" size={24} color="#8B1538" />
                    <Text style={styles.branchName}>Main Branch - {selectedCity}</Text>
                  </View>
                  <Text style={styles.branchAddress}>Contact local representatives for exact location</Text>
                  <View style={styles.branchActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <MaterialCommunityIcons name="email" size={20} color="#8B1538" />
                      <Text style={styles.actionButtonText}>Contact</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Country Picker Modal */}
        <Modal
          visible={showCountryPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCountryPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Country</Text>
                <TouchableOpacity 
                  onPress={() => setShowCountryPicker(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#8B1538" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={branchData.countries}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleCountryChange(item.id)}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* City Picker Modal */}
        <Modal
          visible={showCityPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCityPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select City</Text>
                <TouchableOpacity 
                  onPress={() => setShowCityPicker(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#8B1538" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={filteredCities}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleCityChange(item.name)}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
  },
  selectorContainer: {
    marginBottom: height * 0.02,
  },
  selectorLabel: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: height * 0.01,
  },
  pickerContainer: {
    backgroundColor: '#8B1538',
    borderRadius: 8,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  pickerText: {
    color: 'white',
    fontSize: width * 0.04,
    flex: 1,
  },
  mapContainer: {
    marginBottom: height * 0.03,
  },
  mapPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: width * 0.06,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
  },
  mapText: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#8B1538',
    marginTop: height * 0.01,
  },
  mapSubtext: {
    fontSize: width * 0.035,
    color: '#666',
    textAlign: 'center',
    marginTop: height * 0.01,
  },
  markersContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
  },
  branchDetailsContainer: {
    marginBottom: height * 0.03,
  },
  branchDetailsTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#8B1538',
    marginBottom: height * 0.02,
  },
  branchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.015,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  branchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  branchName: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: width * 0.02,
  },
  branchAddress: {
    fontSize: width * 0.035,
    color: '#666',
    marginBottom: height * 0.02,
    lineHeight: width * 0.05,
  },
  branchActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.03,
    backgroundColor: 'rgba(139, 21, 56, 0.1)',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: width * 0.035,
    color: '#8B1538',
    marginLeft: width * 0.01,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: width * 0.9,
    maxHeight: height * 0.7,
    paddingVertical: height * 0.02,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingBottom: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#e6edf5',
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#8B1538',
  },
  closeButton: {
    padding: width * 0.02,
  },
  modalItem: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: width * 0.04,
    color: '#333',
  },
});
