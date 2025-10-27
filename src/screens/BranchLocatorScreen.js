import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import branchLocations from '../data/branchLocations.json';

const { width, height } = Dimensions.get('window');

// Optional: local fallback so the UI still works if the fetch fails
const sampleData = {
  countries: [
    {
      id: 'za',
      name: 'South Africa',
      cities: [
        {
          name: 'Johannesburg',
          branches: [
            {
              name: 'AFMA Sandton',
              address: '123 Rivonia Rd, Sandton, Johannesburg',
              phone: '+27115550000',
              coords: { lat: -26.1076, lng: 28.0567 },
            },
          ],
        },
        {
          name: 'Pretoria',
          branches: [
            {
              name: 'AFMA Pretoria Central',
              address: '456 Church St, Pretoria',
              phone: '+27123450000',
              coords: { lat: -25.7479, lng: 28.2293 },
            },
          ],
        },
      ],
    },
    {
      id: 'bw',
      name: 'Botswana',
      cities: [
        {
          name: 'Gaborone',
          branches: [
            {
              name: 'AFMA Gaborone',
              address: 'Plot 101 Independence Ave, Gaborone',
              phone: '+2673900000',
              coords: { lat: -24.657, lng: 25.9089 },
            },
          ],
        },
      ],
    },
  ],
};

export default function BranchLocatorScreen({ navigation }) {
  const [branchData, setBranchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  
  const mapRef = useRef(null);

  useEffect(() => {
  let isMounted = true;

  const fetchData = () => {
    try {
      const data = branchLocations; // Simulated fetch
      if (isMounted)
      setBranchData(data);
    } catch (error) {
      if (isMounted) {
        setFetchError(String(error?.message || 'Unknown error'));
        setBranchData(sampleData); // Fallback
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);
  const countries = branchData?.countries || [];

  const filteredCities = useMemo(() => {
    const country = countries.find((c) => c.id === selectedCountry);
    return country?.cities || [];
  }, [countries, selectedCountry]);

  const selectedCityData = useMemo(
    () => filteredCities.find((c) => c.name === selectedCity),
    [filteredCities, selectedCity]
  );

  // Get all markers for the map
  const allMarkers = useMemo(() => {
    const markers = [];
    
    countries.forEach(country => {
      country.cities?.forEach(city => {
        if (city.branches && city.branches.length > 0) {
          // Add markers for each branch
          city.branches.forEach(branch => {
            if (branch.coords) {
              markers.push({
                id: `${country.id}-${city.name}-${branch.name}`,
                coordinate: {
                  latitude: branch.coords.lat,
                  longitude: branch.coords.lng,
                },
                title: branch.name,
                description: `${city.name}, ${country.name}`,
                address: branch.address,
                phone: branch.phone,
                type: 'branch',
                countryId: country.id,
                cityName: city.name,
              });
            }
          });
        } else if (city.coords) {
          // Add marker for city if no branches
          markers.push({
            id: `${country.id}-${city.name}`,
            coordinate: {
              latitude: city.coords.lat,
              longitude: city.coords.lng,
            },
            title: city.name,
            description: `${country.name}`,
            type: 'city',
            countryId: country.id,
            cityName: city.name,
          });
        }
      });
    });
    
    return markers;
  }, [countries]);

  // Filter markers based on selection
  const visibleMarkers = useMemo(() => {
    if (!selectedCountry) return allMarkers;
    
    let filtered = allMarkers.filter(m => m.countryId === selectedCountry);
    
    if (selectedCity) {
      filtered = filtered.filter(m => m.cityName === selectedCity);
    }
    
    return filtered;
  }, [allMarkers, selectedCountry, selectedCity]);

  // Calculate map region
  const mapRegion = useMemo(() => {
    if (visibleMarkers.length === 0) {
      // Default to Africa view
      return {
        latitude: -15.0,
        longitude: 25.0,
        latitudeDelta: 50,
        longitudeDelta: 50,
      };
    }

    if (visibleMarkers.length === 1) {
      return {
        latitude: visibleMarkers[0].coordinate.latitude,
        longitude: visibleMarkers[0].coordinate.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }

    // Calculate bounds for multiple markers
    const lats = visibleMarkers.map(m => m.coordinate.latitude);
    const lngs = visibleMarkers.map(m => m.coordinate.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.5; // Add padding
    const deltaLng = (maxLng - minLng) * 1.5;
    
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.5),
      longitudeDelta: Math.max(deltaLng, 0.5),
    };
  }, [visibleMarkers]);

  // Update map when region changes
  useEffect(() => {
    if (mapRef.current && visibleMarkers.length > 0) {
      setTimeout(() => {
        mapRef.current?.animateToRegion(mapRegion, 1000);
      }, 100);
    }
  }, [mapRegion]);

  const getSelectedCountryName = () => {
    const country = countries.find((c) => c.id === selectedCountry);
    return country ? country.name : 'Select a country...';
  };

  const handleCountryChange = (countryId) => {
    setSelectedCountry(countryId);
    setSelectedCity('');
    setShowCountryPicker(false);
  };

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    setShowCityPicker(false);
  };

  const openCall = (phone) => {
    if (!phone) {
      Alert.alert('No phone number', 'This branch does not have a phone number listed.');
      return;
    }
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Unable to open dialer');
    });
  };

  const openDirections = (coords, address, label) => {
    if (!coords?.lat || !coords?.lng) {
      if (address) {
        const q = encodeURIComponent(address);
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() =>
          Alert.alert('Unable to open maps')
        );
      } else {
        Alert.alert('No location available', 'This branch does not have coordinates or an address.');
      }
      return;
    }
    const q = encodeURIComponent(label || address || 'AFMA Branch');
    const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}(${q})`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open maps');
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#8B1538" />
          <Text style={styles.loaderText}>Loading branches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!branchData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>Failed to load branch data</Text>
          {fetchError ? <Text style={styles.errorSubtext}>{fetchError}</Text> : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header
          title="Branch Locator"
          subtitle="Find AFMA branches worldwide"
          showBackButton={true}
          onBackPress={() => navigation?.goBack?.()}
        />

        {fetchError ? (
          <View style={styles.bannerWarning}>
            <MaterialCommunityIcons name="cloud-alert" size={18} color="#8B1538" />
            <Text style={styles.bannerWarningText}>
              Showing fallback data while we reconnect…
            </Text>
          </View>
        ) : null}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Country Selector */}
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>Choose your country</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => setShowCountryPicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.pickerText}>{getSelectedCountryName()}</Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* City Selector */}
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>City / Town</Text>
            <TouchableOpacity
              style={[
                styles.pickerContainer,
                filteredCities.length === 0 && styles.pickerDisabled,
              ]}
              onPress={() => filteredCities.length > 0 && setShowCityPicker(true)}
              activeOpacity={filteredCities.length > 0 ? 0.8 : 1}
            >
              <Text style={styles.pickerText}>
                {selectedCity || (filteredCities.length > 0 ? 'Select a city...' : 'No cities')}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Map Section */}
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={mapRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              toolbarEnabled={true}
            >
              {visibleMarkers.map((marker) => (
                <Marker
                  key={marker.id}
                  coordinate={marker.coordinate}
                  title={marker.title}
                  description={marker.description}
                  pinColor={marker.type === 'branch' ? '#8B1538' : '#22C55E'}
                  onPress={() => setSelectedBranch(marker)}
                >
                  <View style={styles.markerContainer}>
                    <MaterialCommunityIcons 
                      name={marker.type === 'branch' ? 'church' : 'map-marker'} 
                      size={30} 
                      color="#8B1538" 
                    />
                  </View>
                </Marker>
              ))}
            </MapView>
            
            {/* Map overlay info */}
            <View style={styles.mapOverlay}>
              <View style={styles.mapInfoCard}>
                <MaterialCommunityIcons name="map-marker-radius" size={20} color="#8B1538" />
                <Text style={styles.mapInfoText}>
                  {visibleMarkers.length} location{visibleMarkers.length !== 1 ? 's' : ''} shown
                </Text>
              </View>
            </View>
          </View>

          {/* Branch Details */}
          {selectedCityData && (
            <View style={styles.branchDetailsContainer}>
              <Text style={styles.branchDetailsTitle}>Branches in {selectedCity}</Text>

              {(selectedCityData.branches || []).length > 0 ? (
                selectedCityData.branches.map((branch, index) => (
                  <View key={`${branch.name}-${index}`} style={styles.branchCard}>
                    <View style={styles.branchHeader}>
                      <MaterialCommunityIcons name="church" size={22} color="#8B1538" />
                      <Text style={styles.branchName}>{branch.name}</Text>
                    </View>

                    {branch.address ? (
                      <Text style={styles.branchAddress}>{branch.address}</Text>
                    ) : null}

                    <View style={styles.branchActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          openDirections(branch.coords, branch.address, branch.name)
                        }
                      >
                        <MaterialCommunityIcons name="directions" size={20} color="#8B1538" />
                        <Text style={styles.actionButtonText}>Directions</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openCall(branch.phone)}
                      >
                        <MaterialCommunityIcons name="phone" size={20} color="#8B1538" />
                        <Text style={styles.actionButtonText}>Call</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.branchCard}>
                  <View style={styles.branchHeader}>
                    <MaterialCommunityIcons name="church" size={22} color="#8B1538" />
                    <Text style={styles.branchName}>Main Branch — {selectedCity}</Text>
                  </View>
                  <Text style={styles.branchAddress}>
                    Contact local representatives for exact location.
                  </Text>
                  <View style={styles.branchActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => Alert.alert('Contact', 'Email: info@afma.org')}
                    >
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
                <Text style={styles.modalTitle}>Select country</Text>
                <TouchableOpacity
                  onPress={() => setShowCountryPicker(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={22} color="#8B1538" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={countries}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
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
                <Text style={styles.modalTitle}>Select city</Text>
                <TouchableOpacity
                  onPress={() => setShowCityPicker(false)}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={22} color="#8B1538" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={filteredCities}
                keyExtractor={(item, idx) => `${item.name}-${idx}`}
                ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleCityChange(item.name)}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No cities available</Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loaderText: { marginTop: 10, color: '#333' },
  errorText: { color: '#8B1538', fontWeight: '700', fontSize: 16, textAlign: 'center' },
  errorSubtext: { color: '#666', marginTop: 6, textAlign: 'center' },

  bannerWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDECEF',
    borderColor: '#F5C8D1',
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bannerWarningText: { color: '#8B1538' },

  selectorContainer: { marginTop: 16 },
  selectorLabel: { color: '#333', marginBottom: 8, fontWeight: '600' },
  pickerContainer: {
    height: 48,
    backgroundColor: '#8B1538',
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#8B1538',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pickerDisabled: { opacity: 0.5 },
  pickerText: { color: 'white', fontWeight: '600' },

  mapContainer: { 
    marginTop: 20,
    height: height * 0.45,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B1538',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
  },
  mapInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  mapInfoText: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: 14,
  },
  markerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#8B1538',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  branchDetailsContainer: { marginTop: 24, marginBottom: 32 },
  branchDetailsTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 12 },
  branchCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 12,
  },
  branchHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  branchName: { fontSize: 16, fontWeight: '700', color: '#222' },
  branchAddress: { color: '#555', marginBottom: 10 },
  branchActions: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FBE9EE',
    borderColor: '#F3C9D4',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: { color: '#8B1538', fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  closeButton: {
    height: 34,
    width: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8EDEF',
  },
  modalItem: { paddingHorizontal: 16, paddingVertical: 14 },
  modalItemText: { fontSize: 16, color: '#333' },
  modalSeparator: { height: 1, backgroundColor: '#F2F2F2' },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#666' },
});