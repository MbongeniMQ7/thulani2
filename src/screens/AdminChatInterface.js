import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, FlatList, Alert, Dimensions, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { database, auth } from '../config/firebase';
import { ref, push, onValue, off, orderByChild, query } from 'firebase/database';
import { QueueService } from '../services/supabaseService';
import { EmailNotificationService } from '../services/emailService';

const { width, height } = Dimensions.get('window');

export default function AdminChatInterface({ route, navigation }) {
  const { userName, userId, role, isAdmin } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  
  // Applicant list modal states
  const [showApplicantList, setShowApplicantList] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    // Listen for messages
    const messagesRef = ref(database, 'adminChat');
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesList);
      }
    });

    return () => off(messagesRef, 'value', unsubscribe);
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const messagesRef = ref(database, 'adminChat');
      await push(messagesRef, {
        text: message.trim(),
        userId: userId,
        userName: userName,
        userRole: role,
        isAdmin: true,
        timestamp: Date.now(),
        createdAt: new Date().toISOString()
      });
      
      setMessage('');
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplicants = async () => {
    setLoadingApplicants(true);
    try {
      const allEntries = await QueueService.getAllQueueEntries();
      setApplicants(allEntries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error('Error loading applicants:', error);
      Alert.alert('Error', 'Failed to load applicants list');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleShowApplicants = () => {
    setShowApplicantList(true);
    loadApplicants();
  };

  const handleResendInvitation = async (applicant) => {
    try {
      const emailType = applicant.status === 'approved' ? 'approval' : 
                       applicant.status === 'declined' ? 'decline' : 'confirmation';
      
      await EmailNotificationService.sendEmail(
        applicant.email,
        applicant.first_name,
        applicant.last_name,
        emailType,
        {
          queueType: applicant.queue_type,
          position: applicant.position,
          reason: applicant.reason
        }
      );
      
      Alert.alert('Success', `Invitation email resent to ${applicant.first_name} ${applicant.last_name}`);
    } catch (error) {
      console.error('Error resending invitation:', error);
      Alert.alert('Error', 'Failed to resend invitation email');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await auth.signOut();
              navigation.navigate('AdminChat');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return '#F59E0B';
      case 'approved': return '#10B981';
      case 'declined': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.userId === userId;
    const messageTime = new Date(item.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {!isMyMessage && (
            <View style={styles.senderInfo}>
              <MaterialCommunityIcons 
                name={item.isAdmin ? (item.userRole === 'overseer' ? 'account-star' : 'account-tie') : 'account'} 
                size={16} 
                color={item.isAdmin ? '#8B1538' : '#666'} 
              />
              <Text style={styles.senderName}>
                {item.userName} {item.isAdmin && `(${item.userRole})`}
              </Text>
            </View>
          )}
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B1538', '#A61B46']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Admin Chat</Text>
          <Text style={styles.headerSubtitle}>
            {userName} ({role})
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('AdminQueueManagement')} 
            style={styles.menuButton}
          >
            <MaterialCommunityIcons name="clipboard-list" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleShowApplicants}
            style={styles.menuButton}
          >
            <MaterialCommunityIcons name="account-multiple" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message to church members..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!message.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim() || isLoading}
          >
            <MaterialCommunityIcons
              name={isLoading ? "loading" : "send"}
              size={24}
              color={(!message.trim() || isLoading) ? "#ccc" : "#8B1538"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Applicant List Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showApplicantList}
        onRequestClose={() => setShowApplicantList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.applicantModal}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="account-multiple" size={28} color="#8B1538" />
              <Text style={styles.modalTitle}>Meeting Applicants</Text>
              <TouchableOpacity 
                onPress={() => setShowApplicantList(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.applicantList} showsVerticalScrollIndicator={false}>
              {loadingApplicants ? (
                <View style={styles.loadingContainer}>
                  <MaterialCommunityIcons name="loading" size={32} color="#8B1538" />
                  <Text style={styles.loadingText}>Loading applicants...</Text>
                </View>
              ) : applicants.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="account-off" size={48} color="#64748b" />
                  <Text style={styles.emptyText}>No applicants found</Text>
                  <Text style={styles.emptySubtext}>Meeting requests will appear here</Text>
                </View>
              ) : (
                applicants.map((applicant, index) => (
                  <View key={applicant.id || index} style={styles.applicantCard}>
                    <View style={styles.applicantInfo}>
                      <View style={styles.applicantHeader}>
                        <Text style={styles.applicantName}>
                          {applicant.first_name} {applicant.last_name}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(applicant.status) }]}>
                          <Text style={styles.statusText}>{applicant.status}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.applicantEmail}>{applicant.email}</Text>
                      <Text style={styles.applicantQueue}>
                        Queue: {applicant.queue_type} • Position: {applicant.position || 'Pending'}
                      </Text>
                      <Text style={styles.applicantDate}>
                        Applied: {new Date(applicant.created_at).toLocaleDateString()}
                      </Text>
                      
                      {applicant.reason && (
                        <Text style={styles.applicantReason} numberOfLines={2}>
                          Reason: {applicant.reason}
                        </Text>
                      )}
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.resendButton}
                      onPress={() => handleResendInvitation(applicant)}
                    >
                      <MaterialCommunityIcons name="email-send" size={20} color="#fff" />
                      <Text style={styles.resendButtonText}>Resend</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    paddingTop: height * 0.05,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: width * 0.03,
  },
  headerTitle: {
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: Math.min(width * 0.035, 14),
    color: 'rgba(255,255,255,0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  signOutButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContent: {
    padding: width * 0.04,
    paddingBottom: height * 0.02,
  },
  messageContainer: {
    marginBottom: height * 0.015,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: width * 0.03,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#8B1538',
  },
  otherMessageBubble: {
    backgroundColor: '#f0f0f0',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: Math.min(width * 0.03, 12),
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  messageText: {
    fontSize: Math.min(width * 0.04, 16),
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: Math.min(width * 0.028, 11),
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    maxHeight: height * 0.15,
  },
  textInput: {
    flex: 1,
    fontSize: Math.min(width * 0.04, 16),
    color: '#333',
    paddingVertical: height * 0.01,
    maxHeight: height * 0.12,
  },
  sendButton: {
    marginLeft: width * 0.02,
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  
  // Applicant Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicantModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: width * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
    marginLeft: width * 0.03,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  applicantList: {
    flex: 1,
    padding: width * 0.04,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.1,
  },
  loadingText: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#64748b',
    marginTop: height * 0.02,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.1,
  },
  emptyText: {
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: '700',
    color: '#64748b',
    marginTop: height * 0.02,
  },
  emptySubtext: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#94a3b8',
    marginTop: height * 0.01,
    textAlign: 'center',
  },
  applicantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantInfo: {
    flex: 1,
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: height * 0.008,
  },
  applicantName: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: width * 0.025,
    paddingVertical: height * 0.005,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Math.min(width * 0.03, 12),
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  applicantEmail: {
    fontSize: Math.min(width * 0.035, 14),
    color: '#64748b',
    marginBottom: height * 0.005,
  },
  applicantQueue: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#8B1538',
    fontWeight: '600',
    marginBottom: height * 0.005,
  },
  applicantDate: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#94a3b8',
    marginBottom: height * 0.008,
  },
  applicantReason: {
    fontSize: Math.min(width * 0.032, 13),
    color: '#475569',
    fontStyle: 'italic',
  },
  resendButton: {
    backgroundColor: '#8B1538',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.01,
    borderRadius: 8,
    marginLeft: width * 0.02,
  },
  resendButtonText: {
    color: '#fff',
    fontSize: Math.min(width * 0.03, 12),
    fontWeight: '600',
    marginLeft: 4,
  },
});