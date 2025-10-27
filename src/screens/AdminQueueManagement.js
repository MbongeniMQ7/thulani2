import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Dimensions, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput
} from 'react-native';
import Header from '../components/Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { QueueService } from '../services/supabaseService';
import QueuePositionMonitor from '../services/queuePositionMonitor';
import { EmailNotificationService } from '../services/emailService';

const { width, height } = Dimensions.get('window');

function QueueEntryCard({ entry, onApprove, onDecline, onResendEmail, onUpdatePosition, onCallUser }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return '#F59E0B';
      case 'approved': return '#10B981';
      case 'declined': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getQueueTypeColor = (queueType) => {
    return queueType === 'overseer' ? '#8B1538' : '#3B82F6';
  };

  return (
    <View style={styles.entryCard}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.entryGradient}
      >
        <TouchableOpacity 
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.entryHeader}
        >
          <View style={styles.entryInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.entryName}>
                {entry.first_name} {entry.last_name}
              </Text>
              <View style={[styles.queueTypeBadge, { backgroundColor: getQueueTypeColor(entry.queue_type) }]}>
                <Text style={styles.queueTypeText}>
                  {entry.queue_type === 'overseer' ? 'Overseer' : 'Pastor'}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(entry.status) }]}>
                <Text style={styles.statusText}>{entry.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.entryDate}>
                {formatDate(entry.created_at)}
              </Text>
            </View>
            
            <Text style={styles.entryEmail}>{entry.email}</Text>
          </View>
          
          <MaterialCommunityIcons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#6B7280" 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.entryDetails}>
            <View style={styles.reasonSection}>
              <Text style={styles.reasonLabel}>Reason for Consultation:</Text>
              <Text style={styles.reasonText}>{entry.reason}</Text>
            </View>

            {entry.status === 'waiting' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => onApprove(entry)}
                >
                  <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => onDecline(entry)}
                >
                  <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Email Management Actions */}
            {(entry.status === 'approved' || entry.status === 'declined') && (
              <View style={styles.emailActions}>
                <TouchableOpacity 
                  style={[styles.emailButton, styles.resendButton]}
                  onPress={() => onResendEmail(entry)}
                >
                  <MaterialCommunityIcons name="email-send" size={16} color="#fff" />
                  <Text style={styles.emailButtonText}>Resend Email</Text>
                </TouchableOpacity>
                
                {entry.status === 'approved' && (
                  <>
                    <TouchableOpacity 
                      style={[styles.emailButton, styles.positionButton]}
                      onPress={() => onUpdatePosition(entry)}
                    >
                      <MaterialCommunityIcons name="swap-vertical" size={16} color="#fff" />
                      <Text style={styles.emailButtonText}>Update Position</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.emailButton, styles.callButton]}
                      onPress={() => onCallUser(entry)}
                    >
                      <MaterialCommunityIcons name="bell-ring" size={16} color="#fff" />
                      <Text style={styles.emailButtonText}>Your Turn</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {entry.admin_notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Admin Notes:</Text>
                <Text style={styles.notesText}>{entry.admin_notes}</Text>
              </View>
            )}

            {entry.decline_reason && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Decline Reason:</Text>
                <Text style={styles.notesText}>{entry.decline_reason}</Text>
              </View>
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

export default function AdminQueueManagement({ navigation }) {
  const [queueEntries, setQueueEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'approve' or 'decline'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalText, setModalText] = useState('');
  const [monitoringStatus, setMonitoringStatus] = useState(QueuePositionMonitor.getMonitoringStatus());
  
  // Position selection modal states
  const [positionModalVisible, setPositionModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(1);

  useEffect(() => {
    loadQueueEntries();
    
    // Start position monitoring
    QueuePositionMonitor.startMonitoring();
    
    // Update monitoring status
    setMonitoringStatus(QueuePositionMonitor.getMonitoringStatus());
    
    return () => {
      // Clean up monitoring when component unmounts
      QueuePositionMonitor.stopMonitoring();
    };
  }, []);

  const loadQueueEntries = async () => {
    try {
      setIsLoading(true);
      const entries = await QueueService.getPendingQueueEntries();
      setQueueEntries(entries);
    } catch (error) {
      console.error('Error loading queue entries:', error);
      Alert.alert('Error', 'Failed to load queue entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadQueueEntries();
    setIsRefreshing(false);
  };

  const handleApprove = (entry) => {
    setSelectedEntry(entry);
    setModalType('approve');
    setModalText('');
    
    // Calculate available positions
    const approvedCount = queueEntries
      .filter(e => e.queue_type === entry.queue_type && e.status === 'approved')
      .length;
    setSelectedPosition(approvedCount + 1); // Default to next available position
    
    setPositionModalVisible(true);
  };

  const handleDecline = (entry) => {
    setSelectedEntry(entry);
    setModalType('decline');
    setModalText('');
    setModalVisible(true);
  };

  const confirmPositionAndApprove = () => {
    setPositionModalVisible(false);
    setModalVisible(true);
  };

  const confirmAction = async () => {
    if (!selectedEntry) return;

    try {
      setIsLoading(true);
      
      if (modalType === 'approve') {
        await QueueService.approveQueueEntry(selectedEntry.id, modalText);
        
        // Send approval email automatically with selected position
        try {
          await EmailNotificationService.sendEmail(
            selectedEntry.email,
            selectedEntry.first_name,
            selectedEntry.last_name,
            'approval',
            {
              queueType: selectedEntry.queue_type,
              position: selectedPosition,
              notes: modalText
            }
          );
          console.log(`✅ Approval email sent successfully with position ${selectedPosition}`);
        } catch (emailError) {
          console.error('❌ Error sending approval email:', emailError);
          // Don't fail the approval for email errors
        }
        
        // Trigger position recalculation and notifications
        try {
          const result = await QueuePositionMonitor.triggerPositionUpdate(selectedEntry.queue_type);
          if (result.success) {
            console.log(`Position update successful: ${result.message}`);
          } else {
            console.warn(`Position update had issues: ${result.error}`);
          }
        } catch (positionError) {
          console.error('Error triggering position update:', positionError);
          // Don't fail the approval for position update errors
        }
        
        Alert.alert('Success', `${selectedEntry.first_name} ${selectedEntry.last_name}'s consultation has been approved and email sent.`);
      } else {
        if (!modalText.trim()) {
          Alert.alert('Required', 'Please provide a reason for declining.');
          return;
        }
        await QueueService.declineQueueEntry(selectedEntry.id, modalText);
        Alert.alert('Success', `${selectedEntry.first_name} ${selectedEntry.last_name}'s consultation has been declined.`);
      }
      
      // Reload entries
      await loadQueueEntries();
      setModalVisible(false);
      setPositionModalVisible(false);
      setSelectedEntry(null);
      setModalText('');
      setSelectedPosition(1);
      
    } catch (error) {
      console.error('Error updating queue entry:', error);
      Alert.alert('Error', 'Failed to update consultation status');
    } finally {
      setIsLoading(false);
    }
  };

  // Email handler functions
  const handleResendEmail = async (entry) => {
    try {
      const emailType = entry.status === 'approved' ? 'approval' : 'decline';
      await EmailNotificationService.sendEmail(
        entry.email,
        entry.first_name,
        entry.last_name,
        emailType,
        {
          queueType: entry.queue_type,
          position: entry.position,
          reason: entry.reason
        }
      );
      Alert.alert('Success', `Email resent to ${entry.first_name} ${entry.last_name}`);
    } catch (error) {
      console.error('Error resending email:', error);
      Alert.alert('Error', 'Failed to resend email');
    }
  };

  const handleUpdatePosition = async (entry) => {
    try {
      // Calculate current position
      const currentPosition = queueEntries
        .filter(e => e.queue_type === entry.queue_type && e.status === 'approved')
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .findIndex(e => e.id === entry.id) + 1;

      await EmailNotificationService.sendEmail(
        entry.email,
        entry.first_name,
        entry.last_name,
        'position_update',
        {
          queueType: entry.queue_type,
          position: currentPosition
        }
      );
      Alert.alert('Success', `Position update sent to ${entry.first_name} ${entry.last_name}`);
    } catch (error) {
      console.error('Error sending position update:', error);
      Alert.alert('Error', 'Failed to send position update');
    }
  };

  const handleCallUser = async (entry) => {
    try {
      await EmailNotificationService.sendEmail(
        entry.email,
        entry.first_name,
        entry.last_name,
        'your_turn',
        {
          queueType: entry.queue_type
        }
      );
      Alert.alert('Success', `"Your turn" notification sent to ${entry.first_name} ${entry.last_name}`);
    } catch (error) {
      console.error('Error sending your turn notification:', error);
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const filteredEntries = queueEntries.filter(entry => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'overseer') return entry.queue_type === 'overseer';
    if (selectedFilter === 'pastor') return entry.queue_type === 'pastor';
    return true;
  });

  const getStats = () => {
    const total = queueEntries.length;
    const overseer = queueEntries.filter(e => e.queue_type === 'overseer').length;
    const pastor = queueEntries.filter(e => e.queue_type === 'pastor').length;
    return { total, overseer, pastor };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header 
          title="Queue Management"
          subtitle="Approve or decline consultations"
          showBack={true}
          onBack={() => navigation.goBack()}
        />
        
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="account-group" size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Pending</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="account-star" size={24} color="#8B1538" />
              <Text style={styles.statNumber}>{stats.overseer}</Text>
              <Text style={styles.statLabel}>Overseer</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="account-tie" size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>{stats.pastor}</Text>
              <Text style={styles.statLabel}>Pastor</Text>
            </View>
          </View>

          {/* Monitoring Status */}
          <View style={styles.monitoringContainer}>
            <MaterialCommunityIcons 
              name={monitoringStatus.isMonitoring ? "radar" : "radar-off"} 
              size={20} 
              color={monitoringStatus.isMonitoring ? "#10B981" : "#6B7280"} 
            />
            <Text style={[
              styles.monitoringText,
              { color: monitoringStatus.isMonitoring ? "#10B981" : "#6B7280" }
            ]}>
              Position Monitoring: {monitoringStatus.isMonitoring ? "Active" : "Inactive"}
            </Text>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            {[
              { key: 'all', label: 'All' },
              { key: 'overseer', label: 'Overseer' },
              { key: 'pastor', label: 'Pastor' }
            ].map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter.key && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Queue Entries */}
          <View style={styles.entriesContainer}>
            {filteredEntries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="clipboard-check" size={64} color="#6B7280" />
                <Text style={styles.emptyText}>No pending consultations</Text>
                <Text style={styles.emptySubtext}>All consultations have been reviewed</Text>
              </View>
            ) : (
              filteredEntries.map(entry => (
                <QueueEntryCard
                  key={entry.id}
                  entry={entry}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  onResendEmail={handleResendEmail}
                  onUpdatePosition={handleUpdatePosition}
                  onCallUser={handleCallUser}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Action Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {modalType === 'approve' ? 'Approve Consultation' : 'Decline Consultation'}
              </Text>
              
              {selectedEntry && (
                <Text style={styles.modalSubtitle}>
                  {selectedEntry.first_name} {selectedEntry.last_name} - {selectedEntry.queue_type}
                </Text>
              )}

              <TextInput
                style={styles.modalInput}
                placeholder={modalType === 'approve' ? 'Optional notes...' : 'Reason for declining (required)...'}
                placeholderTextColor="#999"
                value={modalText}
                onChangeText={setModalText}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.modalButton, 
                    modalType === 'approve' ? styles.modalApproveButton : styles.modalDeclineButton
                  ]}
                  onPress={confirmAction}
                >
                  <Text style={styles.modalConfirmText}>
                    {modalType === 'approve' ? 'Approve' : 'Decline'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Position Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={positionModalVisible}
          onRequestClose={() => setPositionModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <MaterialCommunityIcons name="format-list-numbered" size={28} color="#8B1538" />
                <Text style={styles.modalTitle}>Select Queue Position</Text>
              </View>
              
              <View style={styles.positionInfo}>
                <Text style={styles.positionInfoText}>
                  {selectedEntry ? `Setting position for: ${selectedEntry.first_name} ${selectedEntry.last_name}` : ''}
                </Text>
                <Text style={styles.positionInfoSubtext}>
                  Choose where to place them in the {selectedEntry?.queue_type} queue
                </Text>
              </View>

              <View style={styles.positionSelector}>
                <Text style={styles.positionLabel}>Queue Position:</Text>
                <View style={styles.positionControls}>
                  <TouchableOpacity 
                    style={[styles.positionButton, selectedPosition <= 1 && styles.positionButtonDisabled]}
                    onPress={() => setSelectedPosition(Math.max(1, selectedPosition - 1))}
                    disabled={selectedPosition <= 1}
                  >
                    <MaterialCommunityIcons name="minus" size={24} color={selectedPosition <= 1 ? "#ccc" : "#8B1538"} />
                  </TouchableOpacity>
                  
                  <View style={styles.positionDisplay}>
                    <Text style={styles.positionNumber}>{selectedPosition}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.positionButton}
                    onPress={() => setSelectedPosition(selectedPosition + 1)}
                  >
                    <MaterialCommunityIcons name="plus" size={24} color="#8B1538" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.positionHint}>
                  Position 1 = Next in line • Higher numbers = Further back
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setPositionModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalApproveButton]}
                  onPress={confirmPositionAndApprove}
                >
                  <Text style={styles.modalConfirmText}>Continue to Approve</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#f4f6f9',
  },
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.04,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: width * 0.01,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,
  },
  filterButton: {
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    marginRight: width * 0.02,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterButtonActive: {
    backgroundColor: '#8B1538',
    borderColor: '#8B1538',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  entriesContainer: {
    paddingHorizontal: width * 0.04,
    paddingBottom: height * 0.03,
  },
  entryCard: {
    marginBottom: height * 0.015,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryGradient: {
    borderRadius: 12,
    padding: width * 0.04,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  entryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  queueTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  queueTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  entryDate: {
    fontSize: 12,
    color: '#64748b',
  },
  entryEmail: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  entryDetails: {
    marginTop: height * 0.015,
    paddingTop: height * 0.015,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  reasonSection: {
    marginBottom: height * 0.015,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.01,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  notesSection: {
    marginTop: height * 0.01,
    padding: width * 0.03,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#1e293b',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: height * 0.08,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: height * 0.02,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: width * 0.06,
    width: width * 0.9,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: width * 0.04,
    fontSize: 14,
    color: '#1e293b',
    minHeight: height * 0.1,
    textAlignVertical: 'top',
    marginBottom: height * 0.02,
  },
  monitoringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: width * 0.03,
    marginHorizontal: width * 0.04,
    marginBottom: height * 0.02,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  monitoringText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.015,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f1f5f9',
  },
  modalApproveButton: {
    backgroundColor: '#10B981',
  },
  modalDeclineButton: {
    backgroundColor: '#EF4444',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Email Action Styles
  emailActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: height * 0.015,
    paddingTop: height * 0.015,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
    borderRadius: 6,
    justifyContent: 'center',
  },
  resendButton: {
    backgroundColor: '#3B82F6',
  },
  positionButton: {
    backgroundColor: '#8B5CF6',
  },
  callButton: {
    backgroundColor: '#F59E0B',
  },
  
  // Position Selection Modal Styles
  positionInfo: {
    backgroundColor: '#f8fafc',
    padding: width * 0.04,
    borderRadius: 12,
    marginBottom: height * 0.02,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  positionInfoText: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: height * 0.005,
  },
  positionInfoSubtext: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#64748b',
    fontWeight: '500',
  },
  positionSelector: {
    marginBottom: height * 0.03,
  },
  positionLabel: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '700',
    color: '#8B1538',
    marginBottom: height * 0.015,
    textAlign: 'center',
  },
  positionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.015,
  },
  positionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  positionButtonDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  positionDisplay: {
    backgroundColor: '#8B1538',
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.015,
    borderRadius: 12,
    marginHorizontal: width * 0.04,
    shadowColor: '#8B1538',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  positionNumber: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    minWidth: 40,
  },
  positionHint: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
});